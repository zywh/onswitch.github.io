const fileInput = document.getElementById('fileInput');
const dropZone = document.getElementById('dropZone');
const brushSizeInput = document.getElementById('brushSize');
const maskOpacityInput = document.getElementById('maskOpacity');
const brushPreview = document.getElementById('brushPreview');
const canvas = document.getElementById('imageCanvas');
const overlayCanvas = document.createElement('canvas');
overlayCanvas.id = 'overlayCanvas';
overlayCanvas.setAttribute('aria-hidden', 'true');
overlayCanvas.style.position = 'absolute';
overlayCanvas.style.top = '0';
overlayCanvas.style.left = '0';
overlayCanvas.style.pointerEvents = 'none';
const canvasWrap = document.querySelector('.canvas-wrap');
canvasWrap.appendChild(overlayCanvas);

const ctx = canvas.getContext('2d');
const overlayCtx = overlayCanvas.getContext('2d');
const maskCanvas = document.createElement('canvas');
const maskCtx = maskCanvas.getContext('2d');

let imageLoaded = false;
let isDrawing = false;
let lastPoint = null;
let maskOpacity = parseFloat(maskOpacityInput.value);

function resizeCanvases(width, height) {
  canvas.width = width;
  canvas.height = height;
  overlayCanvas.width = width;
  overlayCanvas.height = height;
  maskCanvas.width = width;
  maskCanvas.height = height;
  canvas.style.width = '100%';
  overlayCanvas.style.width = '100%';
  overlayCanvas.style.height = 'auto';
}

function updateBrushPreview() {
  const size = parseInt(brushSizeInput.value, 10);
  const previewCtx = brushPreview.getContext('2d');
  previewCtx.clearRect(0, 0, brushPreview.width, brushPreview.height);
  previewCtx.fillStyle = '#ff5f5d';
  previewCtx.beginPath();
  previewCtx.arc(40, 40, size / 2.5, 0, Math.PI * 2);
  previewCtx.fill();
}

function loadImage(file) {
  if (!file) return;
  const reader = new FileReader();
  reader.onload = (event) => {
    const image = new Image();
    image.onload = () => {
      resizeCanvases(image.width, image.height);
      ctx.drawImage(image, 0, 0);
      overlayCtx.clearRect(0, 0, overlayCanvas.width, overlayCanvas.height);
      maskCtx.clearRect(0, 0, maskCanvas.width, maskCanvas.height);
      imageLoaded = true;
    };
    image.src = event.target.result;
  };
  reader.readAsDataURL(file);
}

function getCanvasCoordinates(event) {
  const rect = canvas.getBoundingClientRect();
  const scaleX = canvas.width / rect.width;
  const scaleY = canvas.height / rect.height;
  return {
    x: (event.clientX - rect.left) * scaleX,
    y: (event.clientY - rect.top) * scaleY,
  };
}

function drawStroke(from, to) {
  const size = parseInt(brushSizeInput.value, 10);
  maskCtx.strokeStyle = '#ffffff';
  maskCtx.lineWidth = size;
  maskCtx.lineCap = 'round';
  maskCtx.lineJoin = 'round';
  maskCtx.beginPath();
  maskCtx.moveTo(from.x, from.y);
  maskCtx.lineTo(to.x, to.y);
  maskCtx.stroke();
  renderOverlay();
}

function renderOverlay() {
  overlayCtx.clearRect(0, 0, overlayCanvas.width, overlayCanvas.height);
  overlayCtx.globalAlpha = maskOpacity;
  overlayCtx.drawImage(maskCanvas, 0, 0);
  overlayCtx.globalCompositeOperation = 'source-in';
  overlayCtx.fillStyle = '#ff5f5d';
  overlayCtx.fillRect(0, 0, overlayCanvas.width, overlayCanvas.height);
  overlayCtx.globalCompositeOperation = 'source-over';
  overlayCtx.globalAlpha = 1;
}

function applyBlend() {
  if (!imageLoaded) return;
  const width = canvas.width;
  const height = canvas.height;
  const imageData = ctx.getImageData(0, 0, width, height);
  const data = imageData.data;
  const maskData = maskCtx.getImageData(0, 0, width, height).data;
  const result = new Uint8ClampedArray(data);
  const radius = Math.ceil(parseInt(brushSizeInput.value, 10) / 2);

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = (y * width + x) * 4;
      if (maskData[idx + 3] < 10) continue;
      let r = 0;
      let g = 0;
      let b = 0;
      let count = 0;
      for (let ny = -radius; ny <= radius; ny++) {
        for (let nx = -radius; nx <= radius; nx++) {
          if (nx === 0 && ny === 0) continue;
          const px = x + nx;
          const py = y + ny;
          if (px < 0 || py < 0 || px >= width || py >= height) continue;
          const nIdx = (py * width + px) * 4;
          if (maskData[nIdx + 3] > 10) continue;
          r += data[nIdx];
          g += data[nIdx + 1];
          b += data[nIdx + 2];
          count++;
        }
      }
      if (count > 0) {
        result[idx] = r / count;
        result[idx + 1] = g / count;
        result[idx + 2] = b / count;
      }
    }
  }

  for (let i = 0; i < data.length; i++) {
    data[i] = result[i];
  }

  ctx.putImageData(imageData, 0, 0);
  clearMask();
}

function clearMask() {
  maskCtx.clearRect(0, 0, maskCanvas.width, maskCanvas.height);
  renderOverlay();
}

function downloadImage() {
  if (!imageLoaded) return;
  const link = document.createElement('a');
  link.href = canvas.toDataURL('image/png');
  link.download = `onswitch-cleaned-${Date.now()}.png`;
  link.click();
}

function handlePointerDown(event) {
  if (!imageLoaded) return;
  isDrawing = true;
  lastPoint = getCanvasCoordinates(event);
  drawStroke(lastPoint, lastPoint);
}

function handlePointerMove(event) {
  if (!isDrawing) return;
  const point = getCanvasCoordinates(event);
  drawStroke(lastPoint, point);
  lastPoint = point;
}

function handlePointerUp() {
  isDrawing = false;
  lastPoint = null;
}

canvas.addEventListener('pointerdown', handlePointerDown);
window.addEventListener('pointermove', handlePointerMove);
window.addEventListener('pointerup', handlePointerUp);

fileInput.addEventListener('change', (event) => {
  const [file] = event.target.files;
  loadImage(file);
});

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

maskOpacityInput.addEventListener('input', (event) => {
  maskOpacity = parseFloat(event.target.value);
  renderOverlay();
});

brushSizeInput.addEventListener('input', updateBrushPreview);

document.getElementById('clearMask').addEventListener('click', clearMask);
document.getElementById('applyBlend').addEventListener('click', applyBlend);
document.getElementById('downloadImage').addEventListener('click', downloadImage);

updateBrushPreview();
