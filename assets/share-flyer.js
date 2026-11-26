/* Live Countdown Share Flyer Generator (1080x1350 PNG) for nscheabu.org */
(function () {
  function loadImg(src) {
    return new Promise((resolve) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => resolve(img);
      img.onerror = () => resolve(null);
      img.src = src;
    });
  }

  function roundRect(ctx, x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r);
    ctx.arcTo(x, y, x + w, y, r);
    ctx.closePath();
  }

  window.generateCountdownFlyer = async function (countdownValues) {
    if (document.fonts && document.fonts.ready) {
      await document.fonts.ready;
    }

    const W = 1080;
    const H = 1350;
    const canvas = document.createElement('canvas');
    canvas.width = W;
    canvas.height = H;
    const ctx = canvas.getContext('2d');

    // Deep emerald gradient background
    const bg = ctx.createLinearGradient(0, 0, W, H);
    bg.addColorStop(0, '#052b1f');
    bg.addColorStop(0.55, '#073e2d');
    bg.addColorStop(1, '#0b4f39');
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, W, H);

    // Subtle geometric engineering rings
    ctx.strokeStyle = 'rgba(212, 237, 139, 0.09)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(960, 140, 320, 0, Math.PI * 2);
    ctx.stroke();

    ctx.setLineDash([10, 12]);
    ctx.beginPath();
    ctx.arc(100, 1240, 290, 0, Math.PI * 2);
    ctx.stroke();
    ctx.setLineDash([]);

    // Top warm ivory header strip
    roundRect(ctx, 56, 52, W - 112, 118, 22);
    ctx.fillStyle = '#f8f9f3';
    ctx.fill();

    const [parliamentImg, nscheImg, abuImg] = await Promise.all([
      loadImg('assets/parliament.jpg'),
      loadImg('assets/nsche.png'),
      loadImg('assets/abu.png')
    ]);

    // Draw logos in header strip
    if (parliamentImg) {
      ctx.save();
      ctx.beginPath();
      ctx.arc(124, 111, 38, 0, Math.PI * 2);
      ctx.clip();
      ctx.drawImage(parliamentImg, 86, 73, 76, 76);
      ctx.restore();
    }

    ctx.fillStyle = '#073e2d';
    ctx.font = '700 30px "Space Grotesk", Arial, sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText('NSChE ABU', 178, 106);

    ctx.fillStyle = '#42544b';
    ctx.font = '700 17px "Manrope", Arial, sans-serif';
    ctx.fillText('STUDENT CHAPTER · 4TH SENATE', 178, 134);

    // Draw right-side logos dynamically from right to left so they never overlap
    let rightCursor = W - 84;
    const maxLogoH = 48;

    if (abuImg && abuImg.width && abuImg.height) {
      const h = maxLogoH;
      const w = Math.min(200, (abuImg.width / abuImg.height) * h);
      const drawH = (abuImg.height / abuImg.width) * w;
      const x = rightCursor - w;
      const y = 111 - drawH / 2;
      ctx.drawImage(abuImg, x, y, w, drawH);
      rightCursor = x - 20;

      // Subtle vertical divider
      ctx.strokeStyle = '#d4ddd0';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(rightCursor, 87);
      ctx.lineTo(rightCursor, 135);
      ctx.stroke();
      rightCursor -= 20;
    }

    if (nscheImg && nscheImg.width && nscheImg.height) {
      const h = maxLogoH;
      const w = Math.min(160, (nscheImg.width / nscheImg.height) * h);
      const drawH = (nscheImg.height / nscheImg.width) * w;
      const x = rightCursor - w;
      const y = 111 - drawH / 2;
      ctx.drawImage(nscheImg, x, y, w, drawH);
    }

    // Eyebrow
    ctx.fillStyle = '#d4ed8b';
    ctx.font = '700 22px "Space Grotesk", Arial, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('THE OFFICIAL DIGITAL HUB · 2025/2026 SESSION', W / 2, 240);

    // Big Headline
    ctx.fillStyle = '#ffffff';
    ctx.font = '700 112px "Space Grotesk", Arial, sans-serif';
    ctx.fillText('COMING SOON', W / 2 - 14, 348);

    // Orange accent dot
    ctx.fillStyle = '#df6936';
    ctx.beginPath();
    ctx.arc(W / 2 + 372, 336, 12, 0, Math.PI * 2);
    ctx.fill();

    // Live countdown card
    const cardX = 56;
    const cardY = 394;
    const cardW = W - 112;
    const cardH = 264;
    roundRect(ctx, cardX, cardY, cardW, cardH, 28);
    ctx.fillStyle = 'rgba(255, 255, 255, 0.08)';
    ctx.fill();
    ctx.strokeStyle = 'rgba(212, 237, 139, 0.28)';
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.fillStyle = '#d4ed8b';
    ctx.font = '700 20px "Space Grotesk", Arial, sans-serif';
    ctx.fillText('LIVE COUNTDOWN TO LAUNCH', W / 2, cardY + 44);

    const units = [
      { label: 'DAYS', value: countdownValues.days },
      { label: 'HOURS', value: countdownValues.hours },
      { label: 'MINUTES', value: countdownValues.minutes },
      { label: 'SECONDS', value: countdownValues.seconds }
    ];

    const boxW = 204;
    const boxH = 148;
    const gap = 22;
    const startX = (W - (boxW * 4 + gap * 3)) / 2;
    const boxY = cardY + 68;

    units.forEach((u, i) => {
      const bx = startX + i * (boxW + gap);
      roundRect(ctx, bx, boxY, boxW, boxH, 20);
      ctx.fillStyle = i === 3 ? 'rgba(212, 237, 139, 0.16)' : 'rgba(5, 36, 26, 0.55)';
      ctx.fill();
      ctx.strokeStyle = i === 3 ? 'rgba(212, 237, 139, 0.5)' : 'rgba(255, 255, 255, 0.14)';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      ctx.fillStyle = i === 3 ? '#d4ed8b' : '#ffffff';
      ctx.font = '700 76px "Space Grotesk", Arial, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(String(u.value).padStart(2, '0'), bx + boxW / 2, boxY + 92);

      ctx.fillStyle = '#c8e0d2';
      ctx.font = '700 18px "Space Grotesk", Arial, sans-serif';
      ctx.fillText(u.label, bx + boxW / 2, boxY + 128);
    });

    // Launch Date Subtext
    ctx.fillStyle = '#e3f0e8';
    ctx.font = '600 24px "Manrope", Arial, sans-serif';
    ctx.fillText('Going Live: Tuesday, 1 December 2026 · 12:00 Noon WAT', W / 2, 706);

    // Features List Card
    const listX = 56;
    const listY = 744;
    const listW = W - 112;
    const listH = 408;
    roundRect(ctx, listX, listY, listW, listH, 28);
    ctx.fillStyle = '#f8f9f3';
    ctx.fill();

    ctx.fillStyle = '#df6936';
    ctx.font = '700 19px "Space Grotesk", Arial, sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText("WHAT'S COMING TO THE PLATFORM", listX + 44, listY + 52);

    const items = [
      'E-Magazine — The Reactor 2026 (Interactive + PDF)',
      'On-Demand Aspen Plus Simulation Training',
      'Study Materials & Lecture Archives',
      'Past Questions (100L – 500L)',
      'Feedback & Complaints Portal — and more'
    ];

    items.forEach((text, idx) => {
      const iy = listY + 106 + idx * 60;
      // Check circle
      ctx.fillStyle = '#073e2d';
      ctx.beginPath();
      ctx.arc(listX + 60, iy - 8, 16, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#d4ed8b';
      ctx.font = '700 18px Arial, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('✓', listX + 60, iy - 2);

      ctx.fillStyle = '#073e2d';
      ctx.font = '700 26px "Manrope", Arial, sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText(text, listX + 94, iy);
    });

    // Bottom CTA Pill: Launching at nscheabu.org
    roundRect(ctx, 180, 1192, W - 360, 86, 43);
    ctx.fillStyle = '#d4ed8b';
    ctx.fill();

    ctx.fillStyle = '#073e2d';
    ctx.font = '700 32px "Space Grotesk", Arial, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('LAUNCHING AT  NSCHEABU.ORG', W / 2, 1246);

    ctx.fillStyle = '#b9d4c4';
    ctx.font = '500 18px "Manrope", Arial, sans-serif';
    ctx.fillText('Department of Chemical Engineering · Ahmadu Bello University, Zaria', W / 2, 1316);

    return new Promise((resolve) => {
      canvas.toBlob((blob) => {
        resolve({
          blob,
          dataUrl: canvas.toDataURL('image/png')
        });
      }, 'image/png');
    });
  };
})();
