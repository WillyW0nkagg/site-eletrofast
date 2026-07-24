(function () {
  const wrapper = document.getElementById('oven-scroll');
  const canvas = document.getElementById('oven-canvas');
  if (!wrapper || !canvas || typeof gsap === 'undefined') return;

  const FRAME_COUNT = 152;
  const FRAME_PATH = (i) => `img/frames/oven-explosion/frame_${String(i).padStart(4, '0')}.webp`;

  const ctx = canvas.getContext('2d');
  const frames = new Array(FRAME_COUNT);
  let currentFrame = 0;
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function resizeCanvas() {
    const rect = canvas.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    canvas.width = Math.round(rect.width * dpr);
    canvas.height = Math.round(rect.height * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    drawFrame(currentFrame);
  }

  function drawFrame(index) {
    const img = frames[index];
    const cw = canvas.width / (window.devicePixelRatio || 1);
    const ch = canvas.height / (window.devicePixelRatio || 1);
    ctx.clearRect(0, 0, cw, ch);
    if (!img || !img.complete || !img.naturalWidth) return;
    const scale = Math.min(cw / img.naturalWidth, ch / img.naturalHeight);
    const dw = img.naturalWidth * scale;
    const dh = img.naturalHeight * scale;
    const dx = (cw - dw) / 2;
    const dy = (ch - dh) / 2;
    ctx.drawImage(img, dx, dy, dw, dh);
  }

  function loadFrames() {
    let loaded = 0;
    for (let i = 1; i <= FRAME_COUNT; i++) {
      const img = new Image();
      img.onload = () => {
        loaded++;
        if (i === 1) drawFrame(0);
      };
      img.src = FRAME_PATH(i);
      frames[i - 1] = img;
    }
  }

  loadFrames();
  resizeCanvas();
  window.addEventListener('resize', resizeCanvas);

  if (reducedMotion) return;

  gsap.registerPlugin(ScrollTrigger);
  ScrollTrigger.create({
    trigger: wrapper,
    start: 'top top',
    end: '+=3200',
    pin: true,
    scrub: 0.3,
    onUpdate: (self) => {
      const index = Math.min(FRAME_COUNT - 1, Math.floor(self.progress * FRAME_COUNT));
      if (index !== currentFrame) {
        currentFrame = index;
        drawFrame(currentFrame);
      }
    }
  });
})();
