# Studio Thirty6 · Cinema OS

A filmmaking operating system disguised as a website.

Built for **Studio Thirty6 Films** — a New Delhi-based visual production house specialising in fashion, jewellery, brand and documentary filmmaking.

---

## Experience

The visitor never navigates between pages. They change **camera modes** on a single cinema instrument.

| Mode | Experience |
|------|-----------|
| **Shoot** | Live View — reactive HUD, scrollable ISO/aperture/WB, focus lock |
| **Playback** | Review footage — lazy-loaded clips, waveforms, fullscreen player |
| **Archive** | Production desk — film negatives, contact sheets, director notes |
| **Edit** | Timeline suite — draggable playhead, live colour grading sliders |
| **Lenses** | Service cabinet — each service mapped to a lens with hover physics |
| **Transmit** | Contact — monitor powers on when you type, submission renders like an export |

---

## File Structure

```
thirty6/
├── index.html          # Shell — all 6 mode pages live here
├── css/
│   ├── main.css        # Tokens, cursor, boot, shell, Shoot mode
│   └── modes.css       # Playback, Archive, Edit, Lenses, Transmit + stills
├── js/
│   └── app.js          # All interaction logic — reads from content layer
└── data/
    └── content.js      # ← EDIT THIS FILE to update all site content
```

---

## Content Management

**To add a new project**, edit only `data/content.js` — no logic changes needed:

```js
{
  id: 9,
  slug: 'new-project',
  title: 'Project Name',
  subtitle: 'Fashion Film',
  client: 'Client Name',
  category: 'fashion',        // fashion | jewellery | campaign | film | social
  still: 's1',                // CSS gradient class — or set video/poster below
  video: '/assets/clip.mp4', // set when real footage is ready
  poster: '/assets/clip.jpg',
  lens: '50mm',
  camera: 'Thirty6 OS · FX-1',
  fps: '24p',
  duration: '03:24',
  codec: 'Log-C 4K',
  format: '4K',
  year: 2025,
  featured: true,
}
```

All projects, services, stats, process stages, archive frames, and boot messages live in `data/content.js`. The rest of the site renders automatically.

---

## Adding Real Footage

Set the `video` and `poster` fields in `data/content.js`:

```js
video: '/assets/goldmine.mp4',
poster: '/assets/goldmine-poster.jpg',
```

Videos are **lazy-loaded** — only the hovered clip loads. Never more than one active simultaneously.

---

## Keyboard Shortcuts

| Key | Action |
|-----|--------|
| `1–6` | Switch camera mode |
| `Space` | Play / Pause |
| `J K L` | Transport (reverse, stop, forward) |
| `← →` | Previous / Next clip |
| `F` | Fullscreen |
| `ESC` | Exit / Back |
| `R` | REC toggle |
| `H` | Hide / Show UI |
| `G` | Grain mode |
| `L` | Light leak overlay |
| `D` | Director note |
| `?` | Shortcuts overlay |
| `Ctrl+S` | Save project animation |

### Easter Eggs
- **Konami Code** → Night Shoot Mode  
- Type **`cinema`** → Anamorphic 2.39:1  
- `G` → Film Grain  
- `L` → Light Leak  

---

## Design System

```css
--bg:       #080808   /* dominant background */
--panel:    #101010   /* UI panels */
--red:      #A61E22   /* REC · recording · selected — ONLY use */
--green-hi: #22C55E   /* focus peaking · waveforms · histogram */
--blue-hi:  #3B82F6   /* timeline · selection */
```

Red appears in fewer than 5 places per screen. The films provide all other colour.

---

## Launch Checklist

- [ ] Replace gradient stills with real cinematography in `css/modes.css`
- [ ] Add video paths to `data/content.js`
- [ ] Update email and social links in `T36.STUDIO`
- [ ] Update project metadata in `T36.PROJECTS`
- [ ] Set up form submission handler in `js/app.js` (search `tx-sub`)
- [ ] Deploy — static site, no server required

---

*"Every frame is a decision, not an accident." — Studio Thirty6*
