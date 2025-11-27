const fileInput = document.getElementById('fileInput');
const dropZone = document.getElementById('dropZone');
const gridMode = document.getElementById('gridMode');
const filePrefixInput = document.getElementById('filePrefix');
const splitBtn = document.getElementById('splitBtn');
const downloadAllBtn = document.getElementById('downloadAll');
const previewCanvas = document.getElementById('previewCanvas');
const gridOutput = document.getElementById('gridOutput');
const previewCtx = previewCanvas.getContext('2d');

const GRID_MAP = {
  '2x2': { rows: 2, cols: 2 },
  '2x3': { rows: 2, cols: 3 },
  '3x3': { rows: 3, cols: 3 },
};

let imageElement = null;
let tiles = [];

function getDownloadLabel() {
  return window.OnswitchI18n?.t('grid.tileDownload') || 'Download';
}

function loadImage(file) {
  if (!file) return;
  const reader = new FileReader();
  reader.onload = (event) => {
    const img = new Image();
    img.onload = () => {
      imageElement = img;
      previewCanvas.width = img.width;
      previewCanvas.height = img.height;
      previewCtx.drawImage(img, 0, 0);
      gridOutput.innerHTML = '';
      tiles = [];
    };
    img.src = event.target.result;
  };
  reader.readAsDataURL(file);
}

function splitImage() {
  if (!imageElement) return;
  const preset = GRID_MAP[gridMode.value];
  const { rows, cols } = preset;
  const tileWidth = imageElement.width / cols;
  const tileHeight = imageElement.height / rows;
  const prefix = filePrefixInput.value.trim() || 'onswitch-grid';

  tiles = [];

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const sx = c * tileWidth;
      const sy = r * tileHeight;
      const sw = Math.min(tileWidth, imageElement.width - sx);
      const sh = Math.min(tileHeight, imageElement.height - sy);
      const tileCanvas = document.createElement('canvas');
      tileCanvas.width = Math.round(sw);
      tileCanvas.height = Math.round(sh);
      const ctx = tileCanvas.getContext('2d');
      ctx.drawImage(imageElement, sx, sy, sw, sh, 0, 0, tileCanvas.width, tileCanvas.height);
      const dataUrl = tileCanvas.toDataURL('image/png');
      tiles.push({
        url: dataUrl,
        label: `r${r + 1}c${c + 1}`,
        name: `${prefix}-${r + 1}-${c + 1}.png`,
      });
    }
  }

  renderTiles();
}

function renderTiles() {
  gridOutput.innerHTML = '';
  tiles.forEach((tile, index) => {
    const figure = document.createElement('figure');
    const img = document.createElement('img');
    img.src = tile.url;
    img.alt = `Tile ${index + 1}`;
    const caption = document.createElement('figcaption');
    caption.textContent = tile.name;
    const actionRow = document.createElement('div');
    actionRow.className = 'tile-actions';
    const button = document.createElement('button');
    button.textContent = getDownloadLabel();
    button.addEventListener('click', () => downloadTile(tile));
    actionRow.appendChild(button);
    figure.appendChild(img);
    figure.appendChild(caption);
    figure.appendChild(actionRow);
    gridOutput.appendChild(figure);
  });
}

function downloadTile(tile) {
  const link = document.createElement('a');
  link.href = tile.url;
  link.download = tile.name;
  link.click();
}

async function downloadAll() {
  if (!tiles.length) return;
  const prefix = filePrefixInput.value.trim() || 'onswitch-grid';

  if (window.JSZip) {
    const zip = new window.JSZip();
    tiles.forEach((tile) => {
      const base64 = tile.url.split(',')[1];
      zip.file(tile.name, base64, { base64: true });
    });
    const blob = await zip.generateAsync({ type: 'blob' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${prefix}-tiles.zip`;
    link.click();
    setTimeout(() => URL.revokeObjectURL(url), 2000);
  } else {
    tiles.forEach((tile, index) => {
      setTimeout(() => downloadTile(tile), index * 150);
    });
  }
}

fileInput.addEventListener('change', (event) => {
  const [file] = event.target.files;
  loadImage(file);
});

splitBtn.addEventListener('click', splitImage);
downloadAllBtn.addEventListener('click', downloadAll);

;['dragenter', 'dragover'].forEach((eventName) => {
  dropZone.addEventListener(eventName, (event) => {
    event.preventDefault();
    dropZone.classList.add('dragover');
  });
});

;['dragleave', 'drop'].forEach((eventName) => {
  dropZone.addEventListener(eventName, (event) => {
    event.preventDefault();
    if (eventName === 'drop') {
      const file = event.dataTransfer?.files?.[0];
      loadImage(file);
    }
    dropZone.classList.remove('dragover');
  });
});

document.addEventListener('onswitch:languagechange', () => {
  if (!tiles.length) return;
  renderTiles();
});
