# OnSwitch Tools

A lightweight static site that hosts independent creator utilities under a shared brand system. Each tool lives inside `tools/<tool-name>` and reuses the assets in `assets/` for consistent styling.

## Structure

- `index.html` – landing page that lists tools and roadmap
- `assets/css/main.css` – global styling, layout primitives, and tool shell styles
- `assets/js/main.js` – shared behaviors (navigation toggle)
- `tools/remove_watermarker` – brush-based watermark removal UI
- `tools/image_splitter` – grid-based image slicer (2×2, 2×3, 3×3)

## Local development

Because the project is 100% static HTML/CSS/JS you can open any page directly in a browser or serve the folder via any HTTP server:

```bash
# from the repo root
python3 -m http.server 3000
```

Visit `http://localhost:3000` to browse the landing page and tool folders.

## Usage

### Remove Watermarker
1. Open `tools/remove_watermarker/`.
2. Drag in an image or browse for one.
3. Adjust the brush slider, paint the area to fix, and click **Remove watermark**.
4. Download the cleaned PNG.

The removal step runs an in-browser sampling blend across the masked area; no files leave your machine.

### Image Grid Splitter
1. Open `tools/image_splitter/`.
2. Upload an image, pick a grid size (2×2, 2×3, or 3×3), and optional filename prefix.
3. Click **Split image** to generate tiles.
4. Download tiles individually or use **Download all** (zipped when JSZip is available).

## Language support

Use the language toggle in the site header to switch between English and Simplified Chinese. Your preference is stored in `localStorage` and automatically applied across every tool.

## Adding more tools

1. Duplicate any folder inside `tools/` as a starting point.
2. Update the HTML to reference `../../assets/css/main.css` and your own `tool.css`/`tool.js`.
3. Link the new tool from `index.html` (and other tool navs as needed).

This structure keeps each utility independent while sharing a cohesive brand layer.
