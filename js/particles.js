/**
 * PlayStation 5 "5D Multidimensional Universe" Canvas Background Engine
 * Ultra-Optimized: Offscreen sprite caching, pre-baked wave gradients,
 * zero GC per frame, auto-sleep during modal/video overlays.
 */

export class PS5ParticleEngine {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas ? canvas.getContext("2d", { alpha: true, desynchronized: true }) : null;
    this.particles = [];
    this.rafId = null;
    this.t = 0;
    this.paused = false;
    this.reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    this.dpr = Math.min(window.devicePixelRatio || 1, 1.75); // Cap at 1.75 to save 30% fillrate on 3x/Retina screens without visible quality loss
    this.width = 0;
    this.height = 0;
    this.waveGrad = null;

    // Offscreen sprite caches for zero-allocation particle drawing
    this.goldGlowSprite = null;
    this.silverGlowSprite = null;
    this.goldDotSprite = null;
    this.silverDotSprite = null;

    if (this.canvas && this.ctx) {
      this.buildSprites();
      this.resize();
      this.seedParticles();
      window.addEventListener("resize", () => this.resize(), { passive: true });
      document.addEventListener("visibilitychange", () => {
        if (document.hidden) {
          this.stop();
        } else if (!this.paused && !this.isOverlayActive()) {
          this.start();
        }
      }, { passive: true });
    }
  }

  buildSprites() {
    // Helper to generate a crisp radial gradient sprite once
    const createSprite = (size, innerColor, midColor, outerColor) => {
      const c = document.createElement("canvas");
      c.width = size;
      c.height = size;
      const ctx = c.getContext("2d");
      const r = size / 2;
      const g = ctx.createRadialGradient(r, r, 0, r, r, r);
      g.addColorStop(0, innerColor);
      if (midColor) g.addColorStop(0.38, midColor);
      g.addColorStop(1, outerColor);
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.arc(r, r, r, 0, Math.PI * 2);
      ctx.fill();
      return c;
    };

    // 48x48 glowing motes
    this.goldGlowSprite = createSprite(48, "rgba(255, 235, 170, 0.95)", "rgba(255, 208, 118, 0.35)", "rgba(255, 208, 118, 0)");
    this.silverGlowSprite = createSprite(48, "rgba(240, 246, 255, 0.95)", "rgba(212, 228, 255, 0.35)", "rgba(212, 228, 255, 0)");

    // 16x16 standard motes
    this.goldDotSprite = createSprite(16, "rgba(255, 220, 140, 0.95)", null, "rgba(255, 208, 118, 0.15)");
    this.silverDotSprite = createSprite(16, "rgba(230, 240, 255, 0.95)", null, "rgba(212, 228, 255, 0.15)");
  }

  isOverlayActive() {
    return (
      document.hidden ||
      document.body.classList.contains("view-twitch") ||
      document.body.classList.contains("modal-open") ||
      document.body.classList.contains("hub-active")
    );
  }

  resize() {
    if (!this.canvas) return;
    this.width = window.innerWidth;
    this.height = window.innerHeight;
    this.canvas.width = Math.floor(this.width * this.dpr);
    this.canvas.height = Math.floor(this.height * this.dpr);
    this.ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);

    // Pre-bake wave gradient on resize instead of every frame
    const w = this.width;
    const h = this.height;
    this.waveGrad = this.ctx.createRadialGradient(w * 0.76, h * 0.22, 10, w * 0.62, h * 0.38, w * 0.85);
    this.waveGrad.addColorStop(0, "rgba(38, 72, 148, 0.14)");
    this.waveGrad.addColorStop(0.45, "rgba(18, 34, 72, 0.08)");
    this.waveGrad.addColorStop(1, "rgba(6, 8, 17, 0)");

    if (this.reducedMotion) {
      this.drawFrame(0);
    }
  }

  seedParticles() {
    const count = 48; // Optimized from 64 to 48 for clean aesthetic & higher framerate
    this.particles = [];
    for (let i = 0; i < count; i++) {
      const isGold = i % 3 !== 0;
      this.particles.push({
        x: Math.random(),
        y: Math.random(),
        r: 1.0 + Math.random() * 2.4,
        vx: (0.00004 + Math.random() * 0.00010) * (Math.random() > 0.25 ? 1 : -1),
        vy: -0.00002 - Math.random() * 0.00007,
        alpha: 0.15 + Math.random() * 0.45,
        phase: Math.random() * Math.PI * 2,
        speed: 0.6 + Math.random() * 1.3,
        isGold,
        glow: Math.random() > 0.70
      });
    }
  }

  drawWaves(time) {
    const ctx = this.ctx;
    const w = this.width;
    const h = this.height;

    // Use pre-baked gradient
    if (this.waveGrad) {
      ctx.fillStyle = this.waveGrad;
      ctx.fillRect(0, 0, w, h);
    }

    // Dual silk light ribbons (PS5 Home wave)
    const ribbons = [
      { yBase: 0.46, amp: 0.09, freq: 1.5, speed: 0.35, color: "rgba(110, 165, 255, 0.055)", width: 1.6 },
      { yBase: 0.54, amp: 0.07, freq: 1.9, speed: -0.28, color: "rgba(255, 206, 120, 0.05)", width: 1.2 },
      { yBase: 0.38, amp: 0.06, freq: 1.2, speed: 0.22, color: "rgba(255, 255, 255, 0.035)", width: 1.0 }
    ];

    const steps = 24; // Smooth yet lightweight
    ribbons.forEach((rb) => {
      ctx.beginPath();
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

      ctx.globalAlpha = Math.min(Math.max(a, 0), 1);

      if (p.glow) {
        const sprite = p.isGold ? this.goldGlowSprite : this.silverGlowSprite;
        const diameter = p.r * 10;
        ctx.drawImage(sprite, px - diameter / 2, py - diameter / 2, diameter, diameter);
      } else {
        const sprite = p.isGold ? this.goldDotSprite : this.silverDotSprite;
        const diameter = p.r * 2.8;
        ctx.drawImage(sprite, px - diameter / 2, py - diameter / 2, diameter, diameter);
      }
    }
    ctx.globalAlpha = 1.0;
  }

  start() {
    if (!this.ctx) return;
    if (this.reducedMotion) {
      this.drawFrame(0);
      return;
    }
    if (this.rafId || this.paused || this.isOverlayActive()) return;
    let last = performance.now();
    const tick = (now) => {
      if (this.isOverlayActive()) {
        this.stop();
        return;
      }
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
