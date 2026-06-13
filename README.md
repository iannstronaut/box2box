# Box2Box

​
**A calm, fast, local-first annotation studio for computer vision.**
​
Draw bounding boxes, tag images, and export straight to YOLO, COCO, Pascal VOC, JSON, CSV, or JSON Lines — all in your browser. Nothing is uploaded.

​

## Highlights

​

- 🔒 **Local-first & private** — images and labels are read directly from your device and never leave it. No account, no server, no upload.
- 📦 **Two annotation modes** — object **detection** (bounding boxes) and image **classification** (whole-image tags).
- 🎨 **Class management** — custom colors and number hotkeys (1–9) for instant switching.
- ⚡ **Keyboard-first canvas** — smooth zoom, pan, resize handles, fit-to-screen, and a minimap.
- 📤 **Open export formats** — YOLO, COCO, Pascal VOC, JSON for detection; CSV, JSON Lines, JSON for classification.
- 🌐 **Bilingual UI** — English (US) and Bahasa Indonesia, with the choice persisted across sessions.
- 🌙 **Light & dark themes** that follow your preference.
- 📖 **Built-in documentation** at the `/docs` route, explaining every feature and format.
  ​

## Tech stack

​

- **React 19** + **TypeScript**
- **Vite 6** for dev server and builds
- **Tailwind CSS 3.4** for styling
- **React Router 7** for routing
- Browser **File System Access API** for reading and writing local files
  ​

## Getting started

​

### Prerequisites

​

- **Node.js 18+**
- A **Chromium-based browser** (Chrome or Edge) for full File System Access API support.
  ​

### Installation

​

```bash
# install dependencies
npm install
​
# start the dev server
npm run dev
​
# build for production
npm run build
​
# preview the production build
npm run preview
```

​
Then open the URL printed in your terminal (typically `http://localhost:5173`).
​

## Usage

​

1. Click **Open studio** / **Open folder** and choose a directory of images.
2. Grant the browser permission to read (and optionally write) the folder.
3. Pick an image and start labeling — draw boxes in detection mode, or toggle class tags in classification mode.
4. Export from the top bar in the format your training pipeline expects.
   ​
   Not ready to use your own files? Use **Try detection demo** or **Try classification demo** to explore a sample dataset instantly.
   ​

### Expected folder layout

​
Box2Box looks for an `images` folder and a matching `labels` folder. Each label file shares the file name of its image.
​

```
root/
├── images/
│   ├── img_001.jpg
│   ├── img_002.jpg
│   └── ...
└── labels/
    ├── img_001.txt
    ├── img_002.txt
    └── ...
```

​

> Nothing is uploaded. Files are read directly from disk, and exports are written back to the same folder (or downloaded) only when you choose to save.
> ​

## Export formats

​
| Task | Formats |
| -------------- | -------------------------------- |
| Detection | YOLO, COCO, Pascal VOC, JSON |
| Classification | CSV, JSON Lines, JSON |
​
See the in-app **Docs** page (`/docs`) for a full description and examples of each format.
​

## Keyboard shortcuts

​
| Keys | Action |
| -------------------------- | ----------------------- |
| Scroll / Ctrl·Cmd + / − | Zoom in / out |
| Shift-drag / Space-drag | Pan around |
| Drag | Draw a box |
| Delete | Remove selected box |
| F / 0 | Fit to screen |
| 1 | Reset to 100% |
| [ / P | Previous image |
| ] / N | Next image |
| 1 – 9 | Pick class by number |
| Ctrl·Cmd + S | Export everything |
| Esc | Close dialog |
| ? | Open the shortcut list |
​

## Internationalization

​
The UI ships with **English (US)** and **Bahasa Indonesia**. The default follows the browser language; switch any time with the **EN / ID** toggle in the top bar and on the landing page. Your choice is saved to `localStorage` (`box2box.locale`).
​
Translations live in `src/i18n/translations.ts` (short UI strings) and `src/i18n/docs.ts` (long-form documentation content).
​

## Project structure

​

```
src/
├── components/
│   ├── common/      # icons, primitives, theme & locale toggles
│   ├── landing/     # landing-page sections
│   ├── layout/      # top nav, top bar, footer
│   └── workspace/   # annotation canvas, lists, panels
├── context/         # theme, workspace, and locale providers
├── i18n/            # translations + docs content
├── pages/           # Landing, Workspace, Docs
├── utils/           # annotations, filesystem, ids
└── main.tsx
```

​

## Privacy

​
Box2Box is private by design. Your files stay on your machine, exports are written locally or downloaded by you, and closing the tab clears the in-memory session. There is no account and no analytics tied to your files.
​

## Contributing & support

​
Found a bug or have a feature request? Please **open an issue on the GitHub repository** — it is the best way to reach the team and track progress. Since Box2Box is local-first, we cannot see your files or data, so please include enough detail (expected behavior, what happened, steps to reproduce, and screenshots) for us to understand the problem.
​

## License

​
Released under the MIT License.
