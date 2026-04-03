/* ===================================
   Realistic 3D FlipBook Engine v5
   Directional page curl — free edge
   always leads regardless of direction
   =================================== */

(function () {
  'use strict';

  var book = document.getElementById('book');
  var leaves = Array.from(document.querySelectorAll('.leaf'));
  var btnPrev = document.getElementById('btnPrev');
  var btnNext = document.getElementById('btnNext');
  var indicator = document.getElementById('pageIndicator');
  var staticLeft = document.querySelector('.static-left');
  var total = leaves.length;

  var stackLeft = document.getElementById('stackLeft');
  var stackRight = document.getElementById('stackRight');

  var current = 0;
  var animating = false;

  var DURATION = 1400;

  // --- Page flip sound (synthesized via Web Audio API) ---
  var audioCtx = null;
  function playFlipSound() {
    try {
      if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      var duration = 0.35;
      var bufferSize = audioCtx.sampleRate * duration;
      var buffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
      var data = buffer.getChannelData(0);

      // Generate a short "paper swoosh" — filtered noise with fast attack/decay
      for (var i = 0; i < bufferSize; i++) {
        var t = i / audioCtx.sampleRate;
        // Envelope: quick rise, slow fall
        var env = Math.exp(-t * 12) * (1 - Math.exp(-t * 200));
        // Noise with some low-freq rumble
        var noise = (Math.random() * 2 - 1);
        var rumble = Math.sin(t * 180) * 0.3;
        data[i] = (noise * 0.6 + rumble) * env * 0.15;
      }

      var source = audioCtx.createBufferSource();
      source.buffer = buffer;

      // Bandpass filter for papery sound
      var filter = audioCtx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.value = 2500;
      filter.Q.value = 0.8;

      source.connect(filter);
      filter.connect(audioCtx.destination);
      source.start();
    } catch (e) { /* audio not supported, silently ignore */ }
  }
  var NUM_SEGS = 16;
  var CURL_DEGREES = 50;       // max curl spread in degrees at peak bend
  var LABELS = {
    en: ['Cover', 'Introduction', 'Characters', 'Voices', 'Technical Debt', 'Bottleneck', 'Flow', 'Learning', 'Closing', 'Back Cover'],
    vi: ['B\u00eca', 'Gi\u1edbi Thi\u1ec7u', 'Nh\u00e2n V\u1eadt', 'Ti\u1ebfng N\u00f3i', 'N\u1ee3 C\u00f4ng Ngh\u1ec7', 'T\u1eafc Ngh\u1ebd\u006e', 'L\u01b0u L\u01b0\u1ee3ng', 'H\u1ecdc H\u1ecfi', '\u0110\u00f3ng', 'B\u00eca Sau']
  };

  // --- Corner curl hints ---
  leaves.forEach(function (leaf) {
    var front = leaf.querySelector('.leaf-front');
    if (front && !front.querySelector('.corner-curl')) {
      var curl = document.createElement('div');
      curl.className = 'corner-curl';
      front.appendChild(curl);
    }
  });

  // --- Z-index & visibility ---
  function setZ(animatingIndex) {
    var topFlipped = -1;
    leaves.forEach(function (leaf, i) {
      if (i !== animatingIndex && leaf.classList.contains('flipped')) {
        topFlipped = i;
      }
    });
    leaves.forEach(function (leaf, i) {
      if (i === animatingIndex) {
        leaf.style.zIndex = total + 50;
        leaf.style.visibility = 'visible';
        return;
      }
      if (leaf.classList.contains('flipped')) {
        leaf.style.zIndex = i + 1;
        leaf.style.visibility = (i === topFlipped) ? 'visible' : 'hidden';
      } else {
        leaf.style.zIndex = total - i;
        leaf.style.visibility = 'visible';
      }
    });
    if (staticLeft) {
      staticLeft.style.visibility = (topFlipped >= 0 || animatingIndex >= 0)
        ? 'hidden' : 'visible';
    }
  }
  function setZIdle() { setZ(-1); }

  function getLang() {
    return document.documentElement.getAttribute('data-lang') || 'en';
  }

  function updateUI() {
    btnPrev.disabled = current === 0 || animating;
    btnNext.disabled = current === total || animating;
    var lang = getLang();
    var labels = LABELS[lang] || LABELS.en;
    indicator.textContent = labels[current] || '';
  }

  // --- Easing ---
  function ease(t) {
    return 0.5 - 0.5 * Math.cos(Math.PI * t);
  }
  function bend(t) {
    return Math.sin(Math.PI * t);
  }

  // --- Build flat-sibling segments ---
  function buildSegments(leafIndex) {
    var leaf = leaves[leafIndex];
    var pageW = leaf.offsetWidth;
    var pageH = leaf.offsetHeight;
    var segW = pageW / NUM_SEGS;

    var frontEl = leaf.querySelector('.leaf-front');
    var backEl = leaf.querySelector('.leaf-back');
    var frontHTML = frontEl.innerHTML;
    var backHTML = backEl.innerHTML;
    var frontBg = window.getComputedStyle(frontEl).background;
    var backBg = window.getComputedStyle(backEl).background;

    var root = document.createElement('div');
    root.className = 'curl-root';
    root.style.cssText =
      'position:absolute;top:0;left:' + pageW + 'px;' +
      'width:0;height:' + pageH + 'px;' +
      'transform-style:preserve-3d;' +
      'z-index:' + (total + 100) + ';' +
      'pointer-events:none;';

    var segEls = [];
    var overlap = 1;

    for (var i = 0; i < NUM_SEGS; i++) {
      var clipW = (i < NUM_SEGS - 1) ? segW + overlap : segW;

      var seg = document.createElement('div');
      seg.style.cssText =
        'position:absolute;top:0;left:0;' +
        'width:0;height:100%;' +
        'transform-style:preserve-3d;' +
        'transform-origin:left center;';

      // Front face
      var ff = document.createElement('div');
      ff.style.cssText =
        'position:absolute;top:0;left:0;' +
        'width:' + clipW + 'px;height:100%;' +
        'overflow:hidden;backface-visibility:hidden;' +
        'background:' + frontBg + ';';
      var fInner = document.createElement('div');
      fInner.style.cssText =
        'position:absolute;top:0;left:-' + (i * segW) + 'px;' +
        'width:' + pageW + 'px;height:100%;';
      fInner.innerHTML = frontHTML;
      ff.appendChild(fInner);
      var fOv = document.createElement('div');
      fOv.style.cssText = 'position:absolute;inset:0;pointer-events:none;z-index:60;';
      ff.appendChild(fOv);
      seg.appendChild(ff);

      // Back face
      var bf = document.createElement('div');
      bf.style.cssText =
        'position:absolute;top:0;left:0;' +
        'width:' + clipW + 'px;height:100%;' +
        'overflow:hidden;backface-visibility:hidden;' +
        'transform:rotateY(180deg);' +
        'background:' + backBg + ';';
      var bInner = document.createElement('div');
      bInner.style.cssText =
        'position:absolute;top:0;left:-' + ((NUM_SEGS - 1 - i) * segW) + 'px;' +
        'width:' + pageW + 'px;height:100%;';
      bInner.innerHTML = backHTML;
      bf.appendChild(bInner);
      var bOv = document.createElement('div');
      bOv.style.cssText = 'position:absolute;inset:0;pointer-events:none;z-index:60;';
      bf.appendChild(bOv);
      seg.appendChild(bf);

      root.appendChild(seg);
      segEls.push({ el: seg, frontOv: fOv, backOv: bOv });
    }

    book.appendChild(root);
    return { root: root, segs: segEls, segW: segW };
  }

  // --- Core animation ---
  function animateFlip(index, forward, done) {
    var leaf = leaves[index];
    animating = true;
    setZ(index);

    var curl = buildSegments(index);
    leaf.style.visibility = 'hidden';

    var segW = curl.segW;
    var start = performance.now();

    function frame(now) {
      var elapsed = now - start;
      var rawT = Math.min(elapsed / DURATION, 1);
      var t = ease(rawT);
      var b = bend(rawT); // 0 → 1 → 0

      // Base "flat" angle at this moment
      var baseAngle = forward ? -180 * t : (-180 + 180 * t);

      // Curl: the free edge deviates from baseAngle, leading the flip.
      // Forward: free edge is MORE negative (ahead toward -180)
      // Backward: free edge is MORE positive (ahead toward 0)
      var flipDir = forward ? -1 : 1;
      var curlAmount = CURL_DEGREES * b; // peaks at mid-flip, 0 at start/end

      // Chain kinematics
      var posX = 0, posZ = 0;

      for (var i = 0; i < NUM_SEGS; i++) {
        // x: 0 at spine, 1 at free edge
        var x = (i + 0.5) / NUM_SEGS;

        // Smooth ease-in curve: spine stays near baseAngle,
        // free edge deviates the most
        var deviation = flipDir * curlAmount * (1 - Math.cos(x * Math.PI / 2));

        var cumAngle = baseAngle + deviation;
        var rad = cumAngle * Math.PI / 180;

        // Position & rotate this segment
        curl.segs[i].el.style.transform =
          'translate3d(' + posX.toFixed(2) + 'px,0,' + posZ.toFixed(2) + 'px) ' +
          'rotateY(' + cumAngle.toFixed(3) + 'deg)';

        // Next segment starts at this segment's right edge
        posX += segW * Math.cos(rad);
        posZ -= segW * Math.sin(rad);

        // Per-segment shading
        var segProgress = Math.abs(cumAngle) / 180;
        curl.segs[i].frontOv.style.cssText =
          'position:absolute;inset:0;pointer-events:none;z-index:60;' +
          'background:rgba(0,0,0,' + (segProgress * 0.2).toFixed(3) + ')';
        curl.segs[i].backOv.style.cssText =
          'position:absolute;inset:0;pointer-events:none;z-index:60;' +
          'background:rgba(0,0,0,' + ((1 - segProgress) * 0.2).toFixed(3) + ')';
      }

      if (rawT < 1) {
        requestAnimationFrame(frame);
      } else {
        curl.root.remove();
        if (forward) {
          leaf.style.transform = 'rotateY(-180deg)';
          leaf.classList.add('flipped');
        } else {
          leaf.style.transform = 'rotateY(0deg)';
          leaf.classList.remove('flipped');
        }
        animating = false;
        setZIdle();
        updateUI();
        if (done) done();
      }
    }

    requestAnimationFrame(frame);
  }

  // --- Controls ---
  // --- Update page stack visibility based on how many pages are flipped ---
  function updateStacks() {
    var flippedCount = current;
    var unflippedCount = total - current;

    // Left stack: show when pages have been flipped (but not on cover)
    if (stackLeft) {
      stackLeft.style.visibility = flippedCount > 0 ? 'visible' : 'hidden';
      // Scale stack thickness based on flipped count
      var leftPages = stackLeft.querySelectorAll('.stack-page');
      for (var i = 0; i < leftPages.length; i++) {
        leftPages[i].style.visibility = i < Math.min(flippedCount, 5) ? 'visible' : 'hidden';
      }
    }

    // Right stack: show when there are unflipped pages
    if (stackRight) {
      stackRight.style.visibility = unflippedCount > 0 ? 'visible' : 'hidden';
      var rightPages = stackRight.querySelectorAll('.stack-page');
      for (var j = 0; j < rightPages.length; j++) {
        rightPages[j].style.visibility = j < Math.min(unflippedCount, 5) ? 'visible' : 'hidden';
      }
    }
  }

  function flipNext() {
    if (current >= total || animating) return;
    playFlipSound();
    var idx = current;
    current++;
    updateUI();
    updateStacks();
    animateFlip(idx, true);
  }
  function flipPrev() {
    if (current <= 0 || animating) return;
    playFlipSound();
    current--;
    updateUI();
    updateStacks();
    animateFlip(current, false);
  }

  btnPrev.addEventListener('click', flipPrev);
  btnNext.addEventListener('click', flipNext);

  book.addEventListener('click', function (e) {
    if (animating) return;
    var rect = book.getBoundingClientRect();
    if (e.clientX - rect.left > rect.width / 2) flipNext();
    else flipPrev();
  });

  document.addEventListener('keydown', function (e) {
    if (e.key === 'ArrowRight' || e.key === ' ') { e.preventDefault(); flipNext(); }
    else if (e.key === 'ArrowLeft') { e.preventDefault(); flipPrev(); }
  });

  setZIdle();
  updateUI();
  updateStacks();

  // Expose so lang.js can refresh the indicator
  window.updateBookUI = updateUI;
})();
