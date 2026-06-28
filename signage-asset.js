const params = new URLSearchParams(window.location.search);
const type = String(params.get('type') || '').toLowerCase();
const src = params.get('src') || '';

const image = document.getElementById('signageImage');
const video = document.getElementById('signageVideo');

if (!src) {
  document.body.style.background = '#111';
} else if (type === 'video') {
  video.hidden = false;
  video.src = src;
  video.loop = true;
  video.play().catch(() => {});
} else {
  image.hidden = false;
  image.src = src;
}
