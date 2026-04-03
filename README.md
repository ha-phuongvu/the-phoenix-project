# The Phoenix Project - Interactive Book Review

A 3D interactive flipbook presenting a review of **"The Phoenix Project"** by Gene Kim, Kevin Behr, and George Spafford. Built with pure HTML, CSS, and JavaScript — no libraries or frameworks.

## Live Demo

Open `index.html` in any modern browser. 
  Deploy URL: https://the-phoenix-project-two.vercel.app/

## Features

### Realistic 3D Flipbook
- Page curl animation with segmented 3D transforms
- Visible page stack layers that grow/shrink as you flip
- Page flip sound effect (Web Audio API — no external files)
- Corner curl hint on hover
- Spine shadow and leather-textured cover

### Bilingual Support (EN / VI)
- Toggle between English and Vietnamese with the language switcher
- All text content supports both languages via `data-en` / `data-vi` attributes

### Animated Content Pages

| Page | Content | Animation |
|------|---------|-----------|
| Cover | Book title, authors, year | Gold-framed leather cover |
| Introduction | Book overview, core message | Animated manufacturing conveyor line (5 stations with flowing dots) |
| The Story | Bill Palmer's journey | Walking person figure with footprints along a vertical timeline |
| Characters | Org chart tree | Interactive org chart matching the book's hierarchy |
| Characters | Meeting scene | People walk in from sides, speech bubbles pop up |
| Voices I-III | Character quotes | Person figures with chat bubbles above them |
| Technical Debt | Dev-Ops cycle | Code block and bug bouncing between DEV and OPS stations |
| WIP | Kanban overflow | Animated kanban board with tasks stacking up |
| Bottleneck | Brent as the constraint | SVG bottle with task dots pouring in and slow drip out |
| Communication | Department conflicts | Tug-of-war animation pulling a product apart |
| Flow (Way 1) | Left-to-right principle | Animated conveyor: DEV → OPS → Customer with flowing dots |
| Feedback (Way 2) | Feedback loops | SVG diagram with forward/backward animated paths |
| Learning (Way 3) | Continual improvement | Ascending bar chart with climbing person figure |
| Conclusion | 5 key lessons | Animated icon cards (eye scan, shield pulse, box split, lightbulb rays, people link) |

### Navigation
- Click left/right half of the book
- Arrow keys (Left / Right)
- Spacebar (next page)
- Previous / Next buttons

## Project Structure

```
the-phoenix-project/
  index.html          # Main HTML — all book pages
  css/
    variables.css     # Design tokens, colors, dimensions
    book.css          # 3D book layout, covers, page stacks
    pages.css         # Page content styles, all animations
    lang-toggle.css   # Language switcher styles
  js/
    flipbook.js       # 3D flip engine, sound, stack management
    lang.js           # EN/VI language toggle logic
```

## Book Content Summary

**The Phoenix Project** tells the story of Bill Palmer, promoted to VP of IT Operations at Parts Unlimited — a company on the verge of bankruptcy. Through his journey, the book demonstrates that IT management follows the same principles as manufacturing:

- **Technical Debt** — Legacy code creates a vicious Dev/Ops cycle
- **WIP Overflow** — 117 unfinished projects with no prioritization
- **Bottleneck** — One person (Brent) becomes the single point of failure
- **Communication** — Departments pull in conflicting directions

The solutions are built on **The Three Ways**:
1. **Flow** — Work moves left to right, from Dev to Ops to Customer
2. **Feedback** — Fast feedback loops catch problems early
3. **Continual Learning** — Experiment, fail, learn, improve

## Technologies

- HTML5 / CSS3 (animations, 3D transforms, flexbox)
- Vanilla JavaScript (no dependencies)
- Web Audio API (synthesized page flip sound)
- SVG (inline icons and diagrams)
- Google Fonts (Playfair Display, Lora, EB Garamond)

## Browser Support

Works in all modern browsers (Chrome, Firefox, Edge, Safari).

## Credits

- Book: *The Phoenix Project* by Gene Kim, Kevin Behr, George Spafford (2013)
- Org chart reference: [TechTarget](https://www.techtarget.com/whatis/reference/Characters-and-quotes-from-The-Phoenix-Project)
- Built with assistance from Claude Code
