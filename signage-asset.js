const params = new URLSearchParams(window.location.search);
const type = String(params.get('type') || '').toLowerCase();
const src = params.get('src') || '';

const image = document.getElementById('signageImage');
const pdf = document.getElementById('signagePdf');
const video = document.getElementById('signageVideo');

function hideAll() {
  image.hidden = true;
  pdf.hidden = true;
  video.hidden = true;
}

if (!src) {
  hideAll();
  document.body.style.background = '#111';
} else if (type === 'video') {
  hideAll();
  video.hidden = false;
  video.src = src;
  video.loop = true;
  video.play().catch(() => {});
} else if (type === 'pdf') {
  hideAll();
  pdf.hidden = false;
  pdf.src = `${src}#view=FitH&toolbar=0&navpanes=0`;
} else {
  hideAll();
  image.hidden = false;
  image.src = src;
}
