/* Breakout */
"use strict";
Arcade.register({
  id: "breakout", title: "Breakout", touch: true,
  init(cv) { this.cv = cv; this.ctx = cv.getContext("2d"); },
  start() {
    this.W = 640, this.H = 480;
    this.pw = 96, this.ph = 12, this.px = this.W / 2 - this.pw / 2;
    this.ball = null; this.bricks = []; this.score = 0; this.lives = 3; this.over = false;
    // brick field: 10 x 5
    for (let r = 0; r < 5; r++) for (let c = 0; c < 10; c++)
      this.bricks.push({ x: 22 + c * 60, y: 30 + r * 24, w: 56, h: 18, hp: r < 1 ? 2 : 1, alive: true });
    this.colors = ["#ff4d5e", "#ff8c2e", "#ffd23d", "#a6ff3d", "#00f0ff"];
    this.serve();
    Arcade.setScoreUI(this.score);
    this.raf = requestAnimationFrame(() => this.loop());
  },
  stop() { cancelAnimationFrame(this.raf); },
  pause() { this.paused = true; },
  resume() { this.paused = false; },
  restart() { this.stop(); this.start(); },
  serve() {
    this.ball = { x: this.px + this.pw / 2, y: this.H - 40, vx: 3 * (Math.random() < 0.5 ? -1 : 1), vy: -4.2, stuck: true };
  },
  touch(d) {
    if (d === "L") this.px = Math.max(4, this.px - 26);
    if (d === "R") this.px = Math.min(this.W - this.pw - 4, this.px + 26);
    if (d === "FIRE" && this.ball && this.ball.stuck) { this.ball.stuck = false; Arcade.SFX.start(); }
  },
  loop() {
    if (!this.paused) this.step();
    this.draw();
    this.raf = requestAnimationFrame(() => this.loop());
  },
  step() {
    const b = this.ball;
    if (b.stuck) { b.x = this.px + this.pw / 2; b.y = this.H - 40; return; }
    b.x += b.vx; b.y += b.vy;
    if (b.x < 6 || b.x > this.W - 6) { b.vx *= -1; Arcade.SFX.wall(); }
    if (b.y < 6) { b.vy *= -1; Arcade.SFX.wall(); }
    // paddle
    if (b.vy > 0 && b.y > this.H - 52 && b.y < this.H - 30 && b.x > this.px - 6 && b.x < this.px + this.pw + 6) {
      b.vy = -Math.abs(b.vy) * 1.02;
      b.vx = (b.x - (this.px + this.pw / 2)) / (this.pw / 2) * 4.5;
      Arcade.SFX.move();
    }
    // bricks
    for (const br of this.bricks) {
      if (!br.alive) continue;
      if (b.x > br.x - 4 && b.x < br.x + br.w + 4 && b.y > br.y - 4 && b.y < br.y + br.h + 4) {
        br.hp--; b.vy *= -1;
        if (br.hp <= 0) { br.alive = false; this.score += 10; Arcade.SFX.clear(); Arcade.setScoreUI(this.score); }
        else Arcade.SFX.wall();
        break;
      }
    }
    // miss
    if (b.y > this.H + 10) {
      this.lives--; Arcade.SFX.over();
      if (this.lives <= 0) {
        this.over = true; Arcade.setScore("breakout", this.score);
        Arcade.showOverlay("GAME OVER", `Score ${this.score} · press R to retry`);
      } else this.serve();
    }
    if (this.bricks.every(br => !br.alive) && !this.over) {
      this.over = true; Arcade.SFX.score(); Arcade.setScore("breakout", this.score);
      Arcade.showOverlay("YOU CLEARED IT!", `Score ${this.score} · press R to replay`);
    }
  },
  draw() {
    const c = this.ctx;
    c.fillStyle = "#0e0e1c"; c.fillRect(0, 0, this.W, this.H);
    for (const br of this.bricks) {
      if (!br.alive) continue;
      c.fillStyle = this.colors[(br.y - 30) / 24 | 0];
      c.shadowColor = this.colors[(br.y - 30) / 24 | 0]; c.shadowBlur = br.hp > 1 ? 10 : 4;
      c.fillRect(br.x, br.y, br.w, br.h);
    }
    c.shadowBlur = 0;
    c.fillStyle = "#00f0ff"; c.shadowColor = "#00f0ff"; c.shadowBlur = 10;
    c.fillRect(this.px, this.H - 26, this.pw, this.ph);
    if (this.ball) {
      c.fillStyle = "#eef2ff"; c.shadowColor = "#eef2ff";
      c.beginPath(); c.arc(this.ball.x, this.ball.y, 6, 0, 7); c.fill();
    }
    c.shadowBlur = 0;
    c.fillStyle = "#8b92b8"; c.font = "13px monospace";
    c.fillText("♥".repeat(Math.max(0, this.lives)), 14, 18);
    if (this.ball && this.ball.stuck) {
      c.fillStyle = "#ffd23d"; c.textAlign = "center";
      c.fillText("PRESS SPACE TO LAUNCH", this.W / 2, this.H / 2 + 40);
      c.textAlign = "left";
    }
  }
});
