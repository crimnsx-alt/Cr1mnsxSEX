/**
 * PlayStation 5 "5D Multidimensional Universe" Canvas Background Engine
 * Renders flowing translucent silk ribbons & warm golden / silver bokeh motes
 * matching the official PS5 System Software ambient backdrop.
 */

export class PS5ParticleEngine {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas ? canvas.getContext("2d") : null;
    this.particles = [];
    this.rafId = null;
    this.t = 0;
    this.paused = false;
    this.reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    this.dpr = Math.min(window.devicePixelRatio || 1, 2);
    this.width = 0;
    this.height = 0;

    if (this.canvas && this.ctx) {
      this.resize();
      this.seedParticles();
      window.addEventListener("resize", () => this.resize());
      document.addEventListener("visibilitychange", () => {
        if (document.hidden) {
          this.stop();
        } else if (!this.paused) {
          this.start();
        }
      });
    }
  }

  resize() {
    if (!this.canvas) return;
    this.width = window.innerWidth;
    this.height = window.innerHeight;
    this.canvas.width = Math.floor(this.width * this.dpr);
    this.canvas.height = Math.floor(this.height * this.dpr);
    this.ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
    if (this.reducedMotion) {
      this.drawFrame(0);
    }
  }

  seedParticles() {
    const count = 64;
    this.particles = [];
    for (let i = 0; i < count; i++) {
      const isGold = i % 3 !== 0; // Warm golden PS5 motes + crisp silver-white highlights
      this.particles.push({
        x: Math.random(),
        y: Math.random(),
        r: 0.9 + Math.random() * 2.6,
        vx: (0.00004 + Math.random() * 0.00011) * (Math.random() > 0.2 ? 1 : -1),
        vy: -0.00002 - Math.random() * 0.00008,
        alpha: 0.14 + Math.random() * 0.45,
        phase: Math.random() * Math.PI * 2,
        speed: 0.6 + Math.random() * 1.4,
        color: isGold ? "255, 208, 118" : "212, 228, 255",
        glow: Math.random() > 0.72
      });
    }
  }

  drawWaves(time) {
    const ctx = this.ctx;
    const w = this.width;
    const h = this.height;

    // Subtle deep PS5 diagonal ambient sheen
    const grad = ctx.createRadialGradient(w * 0.76, h * 0.22, 10, w * 0.62, h * 0.38, w * 0.85);
    grad.addColorStop(0, "rgba(38, 72, 148, 0.14)");
    grad.addColorStop(0.45, "rgba(18, 34, 72, 0.08)");
    grad.addColorStop(1, "rgba(6, 8, 17, 0)");
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, w, h);

    // Dual silk light ribbons (PS5 Home wave)
    const ribbons = [
      { yBase: 0.46, amp: 0.09, freq: 1.5, speed: 0.35, color: "rgba(110, 165, 255, 0.055)", width: 1.6 },
      { yBase: 0.54, amp: 0.07, freq: 1.9, speed: -0.28, color: "rgba(255, 206, 120, 0.05)", width: 1.2 },
      { yBase: 0.38, amp: 0.06, freq: 1.2, speed: 0.22, color: "rgba(255, 255, 255, 0.035)", width: 1.0 }
    ];

    ribbons.forEach((rb) => {
      ctx.beginPath();
      const steps = 36;
      for (let i = 0; i <= steps; i++) {
        const nx = i / steps;
        const px = nx * w;
        const py =
          h * rb.yBase +
          Math.sin(nx * Math.PI * rb.freq + time * rb.speed) * (h * rb.amp) +
          Math.cos(nx * Math.PI * 0.8 - time * 0.2) * (h * 0.03);
        if (i === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      }
      ctx.strokeStyle = rb.color;
      ctx.lineWidth = rb.width;
      ctx.stroke();
    });
  }

  drawFrame(dt = 0.016) {
    if (!this.ctx) return;
    this.t += dt;
    const ctx = this.ctx;
    const w = this.width;
    const h = this.height;

    ctx.clearRect(0, 0, w, h);
    this.drawWaves(this.t);

    for (let i = 0; i < this.particles.length; i++) {
      const p = this.particles[i];
      if (!this.reducedMotion) {
        p.x += p.vx;
        p.y += p.vy;
        if (p.x > 1.05) p.x = -0.05;
        if (p.x < -0.05) p.x = 1.05;
        if (p.y < -0.05) p.y = 1.05;
        if (p.y > 1.05) p.y = -0.05;
      }

      const px = p.x * w;
      const py = p.y * h;
      const pulse = 0.68 + 0.32 * Math.sin(this.t * p.speed + p.phase);
      const a = p.alpha * pulse;

      if (p.glow) {
        const rg = ctx.createRadialGradient(px, py, 0, px, py, p.r * 5.2);
        rg.addColorStop(0, `rgba(${p.color}, ${a * 0.85})`);
        rg.addColorStop(0.4, `rgba(${p.color}, ${a * 0.25})`);
        rg.addColorStop(1, `rgba(${p.color}, 0)`);
        ctx.fillStyle = rg;
        ctx.beginPath();
        ctx.arc(px, py, p.r * 5.2, 0, Math.PI * 2);
        ctx.fill();
      } else {
        ctx.fillStyle = `rgba(${p.color}, ${a})`;
        ctx.beginPath();
        ctx.arc(px, py, p.r, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  }

  start() {
    if (!this.ctx) return;
    if (this.reducedMotion) {
      this.drawFrame(0);
      return;
    }
    if (this.rafId) return;
    let last = performance.now();
    const tick = (now) => {
      const dt = Math.min((now - last) / 1000, 0.05);
      last = now;
      this.drawFrame(dt);
      this.rafId = requestAnimationFrame(tick);
    };
    this.rafId = requestAnimationFrame(tick);
  }

  stop() {
    if (this.rafId) {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }
  }

  setPaused(flag) {
    this.paused = !!flag;
    if (this.paused) this.stop();
    else this.start();
  }
}
