/* ============================================
   Retro Runner - Side-Scrolling Platformer
   Canvas-based game engine
   ============================================ */

const GAME_CONFIG = {
  WIDTH: 800,
  HEIGHT: 400,
  GRAVITY: 0.5,
  PLAYER_SPEED: 3.5,
  JUMP_FORCE: -10,
  GROUND_Y: 340,
  GROUND_HEIGHT: 60,
  MAX_LIVES: 3,
  COLORS: {
    sky: '#0a0a1a',
    ground: '#2d5016',
    groundDark: '#1a3a0a',
    groundGrass: '#39ff14',
    player: '#ff1744',
    playerHat: '#0060a8',
    playerSkin: '#ffcc99',
    coin: '#ffe600',
    mushroom: '#ff0090',
    ring: '#ffd700',
    star: '#39ff14',
    enemy: '#bf00ff',
    enemyEyes: '#ffffff',
    platform: '#4a4a6a',
    platformTop: '#6a6a8a',
    cloud: '#222244',
    mountain: '#1a1a3a',
    mountainFar: '#111128',
  }
};

// ============================================
// INPUT HANDLER
// ============================================
class InputHandler {
  constructor() {
    this.keys = { left: false, right: false, jump: false };
    this._jumpPressed = false;

    this._onKeyDown = this._onKeyDown.bind(this);
    this._onKeyUp = this._onKeyUp.bind(this);
    window.addEventListener('keydown', this._onKeyDown);
    window.addEventListener('keyup', this._onKeyUp);
  }

  _onKeyDown(e) {
    switch (e.code) {
      case 'ArrowLeft': case 'KeyA':
        this.keys.left = true; e.preventDefault(); break;
      case 'ArrowRight': case 'KeyD':
        this.keys.right = true; e.preventDefault(); break;
      case 'ArrowUp': case 'KeyW': case 'Space':
        if (!this._jumpPressed) {
          this.keys.jump = true;
          this._jumpPressed = true;
        }
        e.preventDefault(); break;
    }
  }

  _onKeyUp(e) {
    switch (e.code) {
      case 'ArrowLeft': case 'KeyA':
        this.keys.left = false; break;
      case 'ArrowRight': case 'KeyD':
        this.keys.right = false; break;
      case 'ArrowUp': case 'KeyW': case 'Space':
        this.keys.jump = false;
        this._jumpPressed = false;
        break;
    }
  }

  setupTouch() {
    const addTouch = (selector, key) => {
      const btn = document.querySelector(selector);
      if (!btn) return;
      btn.addEventListener('touchstart', (e) => {
        e.preventDefault();
        this.keys[key] = true;
        if (key === 'jump') this._jumpPressed = true;
      });
      btn.addEventListener('touchend', (e) => {
        e.preventDefault();
        this.keys[key] = false;
        if (key === 'jump') this._jumpPressed = false;
      });
      btn.addEventListener('mousedown', () => {
        this.keys[key] = true;
        if (key === 'jump') this._jumpPressed = true;
      });
      btn.addEventListener('mouseup', () => {
        this.keys[key] = false;
        if (key === 'jump') this._jumpPressed = false;
      });
    };
    addTouch('.touch-left', 'left');
    addTouch('.touch-right', 'right');
    addTouch('.touch-jump', 'jump');
  }

  consumeJump() {
    this.keys.jump = false;
  }
}

// ============================================
// PLAYER
// ============================================
class Player {
  constructor() {
    this.reset();
  }

  reset() {
    this.x = 100;
    this.y = GAME_CONFIG.GROUND_Y - 32;
    this.width = 24;
    this.height = 32;
    this.vx = 0;
    this.vy = 0;
    this.grounded = false;
    this.direction = 1;
    this.animFrame = 0;
    this.animTimer = 0;
    this.invincible = false;
    this.invincibleTimer = 0;
  }

  update(input, platforms, dt) {
    // Horizontal movement
    this.vx = 0;
    if (input.keys.left) {
      this.vx = -GAME_CONFIG.PLAYER_SPEED;
      this.direction = -1;
    }
    if (input.keys.right) {
      this.vx = GAME_CONFIG.PLAYER_SPEED;
      this.direction = 1;
    }

    // Jump
    if (input.keys.jump && this.grounded) {
      this.vy = GAME_CONFIG.JUMP_FORCE;
      this.grounded = false;
      input.consumeJump();
      chiptuneAudio.sfxJump();
    }

    // Gravity
    this.vy += GAME_CONFIG.GRAVITY * dt;
    if (this.vy > 12) this.vy = 12;

    // Move
    this.x += this.vx * dt;
    this.y += this.vy * dt;

    // Clamp to world left
    if (this.x < 0) this.x = 0;

    // Ground collision
    this.grounded = false;
    if (this.y + this.height >= GAME_CONFIG.GROUND_Y) {
      this.y = GAME_CONFIG.GROUND_Y - this.height;
      this.vy = 0;
      this.grounded = true;
    }

    // Platform collision
    for (const p of platforms) {
      const px = p.type === 'moving' ? p.x + p.moveOffset : p.x;
      if (this.x + this.width > px && this.x < px + p.width) {
        // Falling onto platform top
        if (this.vy >= 0 &&
            this.y + this.height >= p.y &&
            this.y + this.height <= p.y + p.height + this.vy * dt + 4) {
          this.y = p.y - this.height;
          this.vy = 0;
          this.grounded = true;
          // Ride moving platforms
          if (p.type === 'moving') {
            this.x += p.moveDelta || 0;
          }
        }
      }
    }

    // Animation
    if (Math.abs(this.vx) > 0 && this.grounded) {
      this.animTimer += dt;
      if (this.animTimer > 6) {
        this.animTimer = 0;
        this.animFrame = (this.animFrame + 1) % 4;
      }
    } else if (!this.grounded) {
      this.animFrame = 1;
    } else {
      this.animFrame = 0;
    }

    // Invincibility timer
    if (this.invincible) {
      this.invincibleTimer -= dt;
      if (this.invincibleTimer <= 0) {
        this.invincible = false;
      }
    }
  }

  draw(ctx, cam) {
    if (this.invincible && Math.floor(this.invincibleTimer) % 3 === 0) return;

    const x = Math.floor(this.x - cam);
    const y = Math.floor(this.y);
    const C = GAME_CONFIG.COLORS;
    const d = this.direction;

    // Pixel art character (24x32)
    const px = (ox, oy, w, h, color) => {
      ctx.fillStyle = color;
      ctx.fillRect(x + (d === 1 ? ox : this.width - ox - w), y + oy, w, h);
    };

    // Hat
    px(4, 0, 16, 4, C.playerHat);
    px(2, 4, 20, 4, C.playerHat);

    // Face
    px(4, 8, 16, 8, C.playerSkin);
    // Eyes
    px(d === 1 ? 12 : 8, 10, 3, 3, '#000');

    // Body
    px(4, 16, 16, 10, C.player);
    px(2, 18, 4, 6, C.player); // arm

    // Legs (animated)
    const legOffset = this.animFrame === 1 ? 2 : this.animFrame === 3 ? -2 : 0;
    px(4 + legOffset, 26, 6, 6, C.playerHat);
    px(14 - legOffset, 26, 6, 6, C.playerHat);
  }
}

// ============================================
// COLLECTIBLE
// ============================================
class Collectible {
  constructor(x, y, type) {
    this.x = x;
    this.y = y;
    this.type = type;
    this.width = 16;
    this.height = 16;
    this.collected = false;
    this.floatTimer = Math.random() * Math.PI * 2;
    this.baseY = y;

    const values = { coin: 10, mushroom: 25, ring: 50, star: 100 };
    this.points = values[type] || 10;
  }

  update(dt) {
    this.floatTimer += 0.05 * dt;
    this.y = this.baseY + Math.sin(this.floatTimer) * 3;
  }

  draw(ctx, cam) {
    if (this.collected) return;
    const x = Math.floor(this.x - cam);
    const y = Math.floor(this.y);
    const C = GAME_CONFIG.COLORS;

    ctx.save();
    switch (this.type) {
      case 'coin':
        ctx.fillStyle = C.coin;
        ctx.fillRect(x + 4, y + 2, 8, 12);
        ctx.fillRect(x + 2, y + 4, 12, 8);
        ctx.fillStyle = '#ffff88';
        ctx.fillRect(x + 6, y + 4, 2, 2);
        break;
      case 'mushroom':
        ctx.fillStyle = C.mushroom;
        ctx.fillRect(x + 2, y, 12, 8);
        ctx.fillRect(x, y + 2, 16, 4);
        ctx.fillStyle = '#fff';
        ctx.fillRect(x + 6, y + 2, 4, 4);
        ctx.fillRect(x + 4, y + 8, 8, 8);
        break;
      case 'ring':
        ctx.fillStyle = C.ring;
        ctx.fillRect(x + 4, y, 8, 2);
        ctx.fillRect(x + 2, y + 2, 4, 12);
        ctx.fillRect(x + 10, y + 2, 4, 12);
        ctx.fillRect(x + 4, y + 14, 8, 2);
        break;
      case 'star':
        ctx.fillStyle = C.star;
        ctx.fillRect(x + 6, y, 4, 4);
        ctx.fillRect(x, y + 4, 16, 4);
        ctx.fillRect(x + 2, y + 8, 12, 4);
        ctx.fillRect(x + 4, y + 12, 4, 4);
        ctx.fillRect(x + 8, y + 12, 4, 4);
        break;
    }
    ctx.restore();
  }
}

// ============================================
// ENEMY
// ============================================
class Enemy {
  constructor(x, y, type) {
    this.x = x;
    this.y = y;
    this.type = type;
    this.width = 20;
    this.height = 20;
    this.alive = true;
    this.startX = x;
    this.vx = -1;
    this.patrolRange = 80;
    this.animFrame = 0;
    this.animTimer = 0;
    this.baseY = y;

    if (type === 'spike') {
      this.vx = 0;
      this.height = 16;
    }
    if (type === 'flying') {
      this.floatTimer = Math.random() * Math.PI * 2;
    }
  }

  update(dt) {
    if (!this.alive) return;

    this.animTimer += dt;
    if (this.animTimer > 10) {
      this.animTimer = 0;
      this.animFrame = (this.animFrame + 1) % 2;
    }

    if (this.type === 'goomba') {
      this.x += this.vx * dt;
      if (this.x < this.startX - this.patrolRange || this.x > this.startX + this.patrolRange) {
        this.vx *= -1;
      }
    } else if (this.type === 'flying') {
      this.x += this.vx * dt;
      this.floatTimer += 0.04 * dt;
      this.y = this.baseY + Math.sin(this.floatTimer) * 30;
      if (this.x < this.startX - this.patrolRange || this.x > this.startX + this.patrolRange) {
        this.vx *= -1;
      }
    }
  }

  draw(ctx, cam) {
    if (!this.alive) return;
    const x = Math.floor(this.x - cam);
    const y = Math.floor(this.y);
    const C = GAME_CONFIG.COLORS;

    ctx.save();
    switch (this.type) {
      case 'goomba':
        // Body
        ctx.fillStyle = C.enemy;
        ctx.fillRect(x + 2, y + 4, 16, 12);
        ctx.fillRect(x, y + 8, 20, 8);
        // Head
        ctx.fillRect(x + 4, y, 12, 8);
        // Eyes
        ctx.fillStyle = C.enemyEyes;
        ctx.fillRect(x + 5, y + 4, 4, 4);
        ctx.fillRect(x + 11, y + 4, 4, 4);
        ctx.fillStyle = '#000';
        ctx.fillRect(x + 6, y + 5, 2, 2);
        ctx.fillRect(x + 12, y + 5, 2, 2);
        // Feet
        ctx.fillStyle = C.enemy;
        const footOffset = this.animFrame === 0 ? 0 : 2;
        ctx.fillRect(x + 2 - footOffset, y + 16, 6, 4);
        ctx.fillRect(x + 12 + footOffset, y + 16, 6, 4);
        break;

      case 'spike':
        ctx.fillStyle = '#888';
        ctx.fillRect(x, y + 12, 20, 4);
        ctx.fillStyle = '#aaa';
        for (let i = 0; i < 4; i++) {
          ctx.fillRect(x + i * 5 + 1, y + 8, 3, 4);
          ctx.fillRect(x + i * 5 + 2, y + 4, 1, 4);
        }
        break;

      case 'flying':
        ctx.fillStyle = C.enemy;
        ctx.fillRect(x + 4, y + 4, 12, 12);
        // Wings
        const wingUp = this.animFrame === 0;
        ctx.fillRect(x, y + (wingUp ? 2 : 8), 6, 6);
        ctx.fillRect(x + 14, y + (wingUp ? 2 : 8), 6, 6);
        // Eyes
        ctx.fillStyle = C.enemyEyes;
        ctx.fillRect(x + 6, y + 6, 3, 3);
        ctx.fillRect(x + 11, y + 6, 3, 3);
        ctx.fillStyle = '#000';
        ctx.fillRect(x + 7, y + 7, 1, 1);
        ctx.fillRect(x + 12, y + 7, 1, 1);
        break;
    }
    ctx.restore();
  }
}

// ============================================
// PLATFORM
// ============================================
class Platform {
  constructor(x, y, width, height, type) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height || 16;
    this.type = type || 'solid';
    this.moveRange = 0;
    this.moveSpeed = 0;
    this.moveTimer = 0;
    this.moveOffset = 0;
    this.moveDelta = 0;
  }

  update(dt) {
    if (this.type === 'moving') {
      const prevOffset = this.moveOffset;
      this.moveTimer += this.moveSpeed * dt;
      this.moveOffset = Math.sin(this.moveTimer) * this.moveRange;
      this.moveDelta = this.moveOffset - prevOffset;
    }
  }

  draw(ctx, cam) {
    const px = this.type === 'moving' ? this.x + this.moveOffset : this.x;
    const x = Math.floor(px - cam);
    const y = Math.floor(this.y);

    // Platform top
    ctx.fillStyle = GAME_CONFIG.COLORS.platformTop;
    ctx.fillRect(x, y, this.width, 4);

    // Platform body with brick pattern
    ctx.fillStyle = GAME_CONFIG.COLORS.platform;
    ctx.fillRect(x, y + 4, this.width, this.height - 4);

    // Brick lines
    ctx.fillStyle = 'rgba(0,0,0,0.2)';
    for (let bx = 0; bx < this.width; bx += 16) {
      ctx.fillRect(x + bx, y + 4, 1, this.height - 4);
    }
    ctx.fillRect(x, y + Math.floor(this.height / 2), this.width, 1);

    if (this.type === 'moving') {
      ctx.fillStyle = GAME_CONFIG.COLORS.platformTop;
      ctx.fillRect(x + this.width / 2 - 3, y + 2, 2, 2);
      ctx.fillRect(x + this.width / 2 + 1, y + 2, 2, 2);
    }
  }
}

// ============================================
// PARTICLE
// ============================================
class Particle {
  constructor(x, y, vx, vy, color, life) {
    this.x = x;
    this.y = y;
    this.vx = vx;
    this.vy = vy;
    this.color = color;
    this.life = life;
    this.maxLife = life;
    this.size = 2 + Math.random() * 2;
  }

  update(dt) {
    this.x += this.vx * dt;
    this.y += this.vy * dt;
    this.vy += 0.1 * dt;
    this.life -= dt;
  }

  draw(ctx, cam) {
    if (this.life <= 0) return;
    const alpha = this.life / this.maxLife;
    ctx.globalAlpha = alpha;
    ctx.fillStyle = this.color;
    ctx.fillRect(Math.floor(this.x - cam), Math.floor(this.y), this.size, this.size);
    ctx.globalAlpha = 1;
  }
}

class ParticleSystem {
  constructor() {
    this.particles = [];
  }

  emit(x, y, count, color) {
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 1 + Math.random() * 3;
      this.particles.push(new Particle(
        x, y,
        Math.cos(angle) * speed,
        Math.sin(angle) * speed - 2,
        color,
        20 + Math.random() * 20
      ));
    }
  }

  update(dt) {
    this.particles = this.particles.filter(p => {
      p.update(dt);
      return p.life > 0;
    });
  }

  draw(ctx, cam) {
    this.particles.forEach(p => p.draw(ctx, cam));
  }
}

// ============================================
// BACKGROUND
// ============================================
class Background {
  constructor() {
    this.stars = [];
    this.mountains = [];
    this.nearMountains = [];
    this.clouds = [];

    for (let i = 0; i < 100; i++) {
      this.stars.push({
        x: Math.random() * 2000,
        y: Math.random() * 250,
        size: Math.random() < 0.3 ? 2 : 1,
        twinkle: Math.random() * Math.PI * 2
      });
    }

    for (let i = 0; i < 20; i++) {
      this.mountains.push({
        x: i * 200 + Math.random() * 100,
        height: 60 + Math.random() * 80,
        width: 120 + Math.random() * 80
      });
    }

    for (let i = 0; i < 15; i++) {
      this.nearMountains.push({
        x: i * 300 + Math.random() * 150,
        height: 40 + Math.random() * 60,
        width: 80 + Math.random() * 60
      });
    }

    for (let i = 0; i < 10; i++) {
      this.clouds.push({
        x: i * 400 + Math.random() * 200,
        y: 30 + Math.random() * 100,
        width: 40 + Math.random() * 40,
        height: 12 + Math.random() * 8
      });
    }
  }

  draw(ctx, cam, frame) {
    const W = GAME_CONFIG.WIDTH;
    const H = GAME_CONFIG.HEIGHT;
    const C = GAME_CONFIG.COLORS;

    // Sky gradient
    const grad = ctx.createLinearGradient(0, 0, 0, H);
    grad.addColorStop(0, '#050510');
    grad.addColorStop(0.6, '#0a0a1a');
    grad.addColorStop(1, '#121230');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, W, H);

    // Stars
    this.stars.forEach(s => {
      const sx = ((s.x - cam * 0.05) % 2000 + 2000) % 2000;
      if (sx < W) {
        const twinkle = Math.sin(frame * 0.02 + s.twinkle);
        ctx.globalAlpha = 0.4 + twinkle * 0.4;
        ctx.fillStyle = '#fff';
        ctx.fillRect(Math.floor(sx), s.y, s.size, s.size);
      }
    });
    ctx.globalAlpha = 1;

    // Far mountains
    ctx.fillStyle = C.mountainFar;
    this.mountains.forEach(m => {
      const mx = ((m.x - cam * 0.1) % 4000 + 4000) % 4000 - 200;
      if (mx > -m.width && mx < W) {
        this.drawMountain(ctx, mx, GAME_CONFIG.GROUND_Y, m.width, m.height);
      }
    });

    // Near mountains
    ctx.fillStyle = C.mountain;
    this.nearMountains.forEach(m => {
      const mx = ((m.x - cam * 0.25) % 4500 + 4500) % 4500 - 200;
      if (mx > -m.width && mx < W) {
        this.drawMountain(ctx, mx, GAME_CONFIG.GROUND_Y, m.width, m.height);
      }
    });

    // Clouds
    ctx.fillStyle = C.cloud;
    this.clouds.forEach(c => {
      const cx = ((c.x - cam * 0.15) % 4000 + 4000) % 4000 - 100;
      if (cx > -c.width && cx < W) {
        ctx.fillRect(Math.floor(cx), c.y, c.width, c.height);
        ctx.fillRect(Math.floor(cx) + 8, c.y - 6, c.width - 16, 6);
      }
    });
  }

  drawMountain(ctx, x, baseY, w, h) {
    const halfW = w / 2;
    for (let row = 0; row < h; row += 4) {
      const ratio = row / h;
      const rowWidth = halfW * ratio;
      ctx.fillRect(
        Math.floor(x + halfW - rowWidth),
        Math.floor(baseY - h + row),
        Math.floor(rowWidth * 2),
        4
      );
    }
  }
}

// ============================================
// LEVEL GENERATOR
// ============================================
class LevelGenerator {
  static generate(levelNum) {
    const platforms = [];
    const collectibles = [];
    const enemies = [];
    const length = 3000 + levelNum * 1500;
    const segmentWidth = 400;
    const segments = Math.floor(length / segmentWidth);

    // Ground gaps
    const groundGaps = [];

    for (let s = 1; s < segments - 1; s++) {
      const sx = s * segmentWidth;
      const difficulty = levelNum;
      const pattern = Math.floor(Math.random() * 5);

      switch (pattern) {
        case 0: // Gap jump
          {
            const gapWidth = 60 + difficulty * 20;
            const gapStart = sx + 150;
            groundGaps.push({ start: gapStart, end: gapStart + gapWidth });
            // Coins above gap
            for (let c = 0; c < 3; c++) {
              collectibles.push(new Collectible(
                gapStart + c * 20,
                GAME_CONFIG.GROUND_Y - 80 - c * 15,
                'coin'
              ));
            }
          }
          break;

        case 1: // Staircase
          {
            for (let step = 0; step < 3; step++) {
              platforms.push(new Platform(
                sx + step * 80 + 50,
                GAME_CONFIG.GROUND_Y - 50 - step * 40,
                60, 16, 'solid'
              ));
              collectibles.push(new Collectible(
                sx + step * 80 + 65,
                GAME_CONFIG.GROUND_Y - 70 - step * 40,
                step === 2 ? 'mushroom' : 'coin'
              ));
            }
          }
          break;

        case 2: // Enemy gauntlet
          {
            const enemyCount = 1 + difficulty;
            for (let e = 0; e < enemyCount; e++) {
              const et = e === 0 && difficulty >= 2 ? 'flying' : 'goomba';
              enemies.push(new Enemy(
                sx + 100 + e * 100,
                et === 'flying' ? GAME_CONFIG.GROUND_Y - 80 : GAME_CONFIG.GROUND_Y - 20,
                et
              ));
            }
            collectibles.push(new Collectible(
              sx + 200, GAME_CONFIG.GROUND_Y - 50,
              difficulty >= 2 ? 'ring' : 'coin'
            ));
          }
          break;

        case 3: // Vertical challenge
          {
            platforms.push(new Platform(sx + 50, GAME_CONFIG.GROUND_Y - 60, 50, 16, 'solid'));
            platforms.push(new Platform(sx + 150, GAME_CONFIG.GROUND_Y - 120, 50, 16, 'solid'));
            platforms.push(new Platform(sx + 250, GAME_CONFIG.GROUND_Y - 170, 50, 16, 'solid'));
            collectibles.push(new Collectible(
              sx + 265, GAME_CONFIG.GROUND_Y - 195,
              difficulty >= 2 ? 'star' : 'mushroom'
            ));
            if (difficulty >= 2) {
              enemies.push(new Enemy(sx + 160, GAME_CONFIG.GROUND_Y - 140, 'goomba'));
            }
          }
          break;

        case 4: // Moving platforms
          {
            if (levelNum >= 2) {
              const mp = new Platform(sx + 100, GAME_CONFIG.GROUND_Y - 80, 60, 16, 'moving');
              mp.moveRange = 50;
              mp.moveSpeed = 0.03;
              platforms.push(mp);
              collectibles.push(new Collectible(sx + 115, GAME_CONFIG.GROUND_Y - 110, 'ring'));

              const gapWidth = 80;
              groundGaps.push({ start: sx + 80, end: sx + 80 + gapWidth });
            } else {
              // Simpler version for level 1
              platforms.push(new Platform(sx + 80, GAME_CONFIG.GROUND_Y - 50, 70, 16, 'solid'));
              platforms.push(new Platform(sx + 200, GAME_CONFIG.GROUND_Y - 80, 70, 16, 'solid'));
              collectibles.push(new Collectible(sx + 220, GAME_CONFIG.GROUND_Y - 105, 'coin'));
            }
            // Add spike hazard
            if (difficulty >= 2) {
              enemies.push(new Enemy(sx + 250, GAME_CONFIG.GROUND_Y - 16, 'spike'));
            }
          }
          break;
      }
    }

    // Sprinkle extra coins along safe ground
    for (let cx = 200; cx < length - 200; cx += 80 + Math.random() * 120) {
      const inGap = groundGaps.some(g => cx >= g.start && cx <= g.end);
      if (!inGap && Math.random() < 0.4) {
        collectibles.push(new Collectible(cx, GAME_CONFIG.GROUND_Y - 30, 'coin'));
      }
    }

    // Level-end star
    collectibles.push(new Collectible(length - 80, GAME_CONFIG.GROUND_Y - 60, 'star'));

    return { platforms, collectibles, enemies, length, groundGaps };
  }
}

// ============================================
// HUD
// ============================================
class HUD {
  draw(ctx, score, lives, level) {
    ctx.font = '16px "Press Start 2P", monospace';

    // Score
    ctx.fillStyle = GAME_CONFIG.COLORS.coin;
    ctx.textAlign = 'left';
    ctx.fillText('Score: ' + score, 16, 30);

    // Level
    ctx.fillStyle = '#fff';
    ctx.textAlign = 'center';
    ctx.fillText('Level ' + level, GAME_CONFIG.WIDTH / 2, 30);

    // Lives as hearts
    ctx.fillStyle = GAME_CONFIG.COLORS.player;
    ctx.textAlign = 'right';
    for (let i = 0; i < lives; i++) {
      const hx = GAME_CONFIG.WIDTH - 20 - i * 24;
      ctx.fillRect(hx - 6, 18, 4, 4);
      ctx.fillRect(hx, 18, 4, 4);
      ctx.fillRect(hx - 8, 22, 12, 4);
      ctx.fillRect(hx - 6, 26, 8, 4);
      ctx.fillRect(hx - 4, 30, 4, 2);
    }
  }
}

// ============================================
// MAIN GAME CLASS
// ============================================
class Game {
  constructor(canvasId) {
    this.canvas = document.getElementById(canvasId);
    if (!this.canvas) return;
    this.ctx = this.canvas.getContext('2d');

    this.canvas.width = GAME_CONFIG.WIDTH;
    this.canvas.height = GAME_CONFIG.HEIGHT;
    this.ctx.imageSmoothingEnabled = false;

    this.player = new Player();
    this.input = new InputHandler();
    this.input.setupTouch();
    this.background = new Background();
    this.particles = new ParticleSystem();
    this.hud = new HUD();

    this.score = 0;
    this.lives = GAME_CONFIG.MAX_LIVES;
    this.level = 1;
    this.cameraX = 0;
    this.frame = 0;
    this.running = false;
    this.gameOver = false;
    this.lastTime = 0;

    this.platforms = [];
    this.collectibles = [];
    this.enemies = [];
    this.groundGaps = [];
    this.levelLength = 0;

    this.overlay = document.getElementById('game-overlay');
    this.overlayTitle = document.getElementById('game-overlay-title');
    this.overlayMessage = document.getElementById('game-overlay-message');
    this.startBtn = document.getElementById('game-start-btn');
    this.scoreDisplay = document.getElementById('score-display');
    this.livesDisplay = document.getElementById('lives-display');

    this.startBtn.addEventListener('click', () => this.startGame());

    window.addEventListener('keydown', (e) => {
      if (e.code === 'Enter' && !this.running) {
        this.startGame();
      }
      if (e.code === 'KeyP' && this.running) {
        this.running = false;
        this.showOverlay('Paused', 'Press Enter to continue', 'Resume');
        this.startBtn.onclick = () => this.resumeGame();
      }
    });
  }

  showOverlay(title, message, btnText) {
    this.overlay.classList.remove('hidden');
    this.overlayTitle.textContent = title;
    this.overlayMessage.textContent = message;
    this.startBtn.textContent = btnText || 'Start Game';
  }

  hideOverlay() {
    this.overlay.classList.add('hidden');
  }

  startGame() {
    this.score = 0;
    this.lives = GAME_CONFIG.MAX_LIVES;
    this.level = 1;
    this.gameOver = false;
    this.updateUI();
    this.loadLevel(this.level);
    this.hideOverlay();
    this.running = true;
    this.lastTime = performance.now();
    this.startBtn.onclick = () => this.startGame();
    requestAnimationFrame((t) => this.gameLoop(t));
  }

  resumeGame() {
    this.hideOverlay();
    this.running = true;
    this.lastTime = performance.now();
    this.startBtn.onclick = () => this.startGame();
    requestAnimationFrame((t) => this.gameLoop(t));
  }

  loadLevel(num) {
    const level = LevelGenerator.generate(num);
    this.platforms = level.platforms;
    this.collectibles = level.collectibles;
    this.enemies = level.enemies;
    this.groundGaps = level.groundGaps;
    this.levelLength = level.length;
    this.player.reset();
    this.cameraX = 0;
    this.particles = new ParticleSystem();
  }

  updateUI() {
    if (this.scoreDisplay) this.scoreDisplay.textContent = this.score;
    if (this.livesDisplay) this.livesDisplay.textContent = this.lives;
  }

  gameLoop(timestamp) {
    if (!this.running) return;

    const delta = (timestamp - this.lastTime) / 16.67;
    this.lastTime = timestamp;
    const dt = Math.min(delta, 3);

    this.update(dt);
    this.render();
    this.frame++;

    requestAnimationFrame((t) => this.gameLoop(t));
  }

  update(dt) {
    // Player
    this.player.update(this.input, this.platforms, dt);

    // Camera
    this.cameraX = this.player.x - GAME_CONFIG.WIDTH * 0.3;
    this.cameraX = Math.max(0, Math.min(this.cameraX, this.levelLength - GAME_CONFIG.WIDTH));

    // Platforms
    this.platforms.forEach(p => p.update(dt));

    // Enemies
    this.enemies.forEach(e => e.update(dt));

    // Collectibles
    this.collectibles.forEach(c => c.update(dt));

    // Particles
    this.particles.update(dt);

    // Collectible collision
    this.collectibles.forEach(c => {
      if (!c.collected && this.checkAABB(this.player, c)) {
        c.collected = true;
        this.score += c.points;
        this.particles.emit(c.x + 8, c.y + 8, 8, GAME_CONFIG.COLORS[c.type]);
        chiptuneAudio.sfxCoin();
        if (c.type === 'star') {
          this.player.invincible = true;
          this.player.invincibleTimer = 180;
          chiptuneAudio.sfxPowerup();
        }
        this.updateUI();
      }
    });

    // Enemy collision
    this.enemies.forEach(e => {
      if (!e.alive || this.player.invincible) return;
      if (e.type === 'spike') {
        if (this.checkAABB(this.player, e)) {
          this.playerHit();
        }
        return;
      }
      if (this.checkAABB(this.player, e)) {
        // Check if stomping from above
        if (this.player.vy > 0 && this.player.y + this.player.height - 8 < e.y + e.height / 2) {
          e.alive = false;
          this.player.vy = -6;
          this.score += 50;
          this.particles.emit(e.x + 10, e.y + 10, 6, GAME_CONFIG.COLORS.enemy);
          chiptuneAudio.sfxStomp();
          this.updateUI();
        } else {
          this.playerHit();
        }
      }
    });

    // Fall into ground gap
    if (this.player.y + this.player.height >= GAME_CONFIG.GROUND_Y) {
      const inGap = this.groundGaps.some(g =>
        this.player.x + this.player.width > g.start && this.player.x < g.end
      );
      if (inGap) {
        this.player.grounded = false;
        this.player.y += 2;
      }
    }

    // Fall death
    if (this.player.y > GAME_CONFIG.HEIGHT + 50) {
      this.loseLife();
    }

    // Level complete
    if (this.player.x >= this.levelLength - 40) {
      this.completeLevel();
    }
  }

  checkAABB(a, b) {
    const bx = b.type === 'moving' ? b.x + (b.moveOffset || 0) : b.x;
    return (
      a.x < bx + b.width &&
      a.x + a.width > bx &&
      a.y < b.y + b.height &&
      a.y + a.height > b.y
    );
  }

  playerHit() {
    if (this.player.invincible) return;
    this.player.invincible = true;
    this.player.invincibleTimer = 90;
    this.loseLife();
  }

  loseLife() {
    this.lives--;
    this.updateUI();
    chiptuneAudio.sfxHit();

    if (this.lives <= 0) {
      this.doGameOver();
    } else {
      this.player.x = Math.max(100, this.player.x - 200);
      this.player.y = GAME_CONFIG.GROUND_Y - 100;
      this.player.vy = 0;
      this.player.invincible = true;
      this.player.invincibleTimer = 120;
    }
  }

  completeLevel() {
    chiptuneAudio.sfxLevelComplete();
    this.level++;
    if (this.level > 3) {
      this.running = false;
      this.showOverlay(
        'You Win!',
        'Final Score: ' + this.score,
        'Play Again'
      );
    } else {
      this.loadLevel(this.level);
    }
  }

  doGameOver() {
    this.running = false;
    this.gameOver = true;
    chiptuneAudio.sfxGameOver();
    this.showOverlay(
      'Game Over',
      'Score: ' + this.score,
      'Try Again'
    );
  }

  render() {
    const ctx = this.ctx;
    const cam = this.cameraX;

    // Background
    this.background.draw(ctx, cam, this.frame);

    // Ground
    this.drawGround(ctx, cam);

    // Platforms
    this.platforms.forEach(p => p.draw(ctx, cam));

    // Collectibles
    this.collectibles.forEach(c => c.draw(ctx, cam));

    // Enemies
    this.enemies.forEach(e => e.draw(ctx, cam));

    // Player
    this.player.draw(ctx, cam);

    // Particles
    this.particles.draw(ctx, cam);

    // HUD
    this.hud.draw(ctx, this.score, this.lives, this.level);
  }

  drawGround(ctx, cam) {
    const C = GAME_CONFIG.COLORS;
    const groundY = GAME_CONFIG.GROUND_Y;
    const W = GAME_CONFIG.WIDTH;
    const H = GAME_CONFIG.HEIGHT;

    // Draw ground segments (skipping gaps)
    ctx.fillStyle = C.ground;

    const startX = Math.floor(cam);
    const endX = startX + W;

    // Build visible ground segments
    let segments = [{ start: startX, end: endX }];

    for (const gap of this.groundGaps) {
      const newSegments = [];
      for (const seg of segments) {
        if (gap.start >= seg.end || gap.end <= seg.start) {
          newSegments.push(seg);
        } else {
          if (seg.start < gap.start) {
            newSegments.push({ start: seg.start, end: gap.start });
          }
          if (seg.end > gap.end) {
            newSegments.push({ start: gap.end, end: seg.end });
          }
        }
      }
      segments = newSegments;
    }

    for (const seg of segments) {
      const drawX = Math.floor(seg.start - cam);
      const drawW = Math.floor(seg.end - seg.start);

      // Main ground
      ctx.fillStyle = C.ground;
      ctx.fillRect(drawX, groundY, drawW, H - groundY);

      // Dark bottom
      ctx.fillStyle = C.groundDark;
      ctx.fillRect(drawX, groundY + 20, drawW, H - groundY - 20);

      // Grass top
      ctx.fillStyle = C.groundGrass;
      for (let gx = seg.start; gx < seg.end; gx += 8) {
        const screenGx = Math.floor(gx - cam);
        ctx.fillRect(screenGx, groundY - 2, 4, 4);
      }
    }
  }
}

// ============================================
// INIT
// ============================================
document.addEventListener('DOMContentLoaded', () => {
  window.retroGame = new Game('game-canvas');
});
