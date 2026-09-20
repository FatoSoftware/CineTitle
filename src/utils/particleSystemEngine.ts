import {
  AdvancedParticlesSettings,
  ParticleEmitterType,
  ParticleShapeType,
  ExplosionFragmentStyle,
  ConfettiShape,
  ConfettiPalette,
  TrailType,
  MagicTheme,
} from '../types';

// Deterministic pseudo-random hash based on index
function pseudoRandom(seed: number): number {
  const x = Math.sin(seed * 12.9898 + 78.233) * 43758.5453;
  return x - Math.floor(x);
}

// ----------------------------------------------------
// 1. COMPLEX PARTICLE SYSTEMS (Emisores, Fuerzas, Colisiones)
// ----------------------------------------------------
export function renderComplexParticleSystem(
  ctx: CanvasRenderingContext2D,
  settings: AdvancedParticlesSettings['system'],
  centerX: number,
  centerY: number,
  textWidth: number,
  textHeight: number,
  scale: number,
  currentTime: number,
  canvasWidth: number,
  canvasHeight: number
): void {
  if (!settings.enabled) return;

  const totalParticles = Math.min(300, Math.max(10, Math.floor(settings.rate * settings.lifetime)));
  const lifetime = Math.max(0.3, settings.lifetime);
  const floorY = (settings.floorHeightPercent / 100) * canvasHeight;

  ctx.save();
  ctx.globalCompositeOperation = settings.blendMode || 'screen';

  for (let i = 0; i < totalParticles; i++) {
    const cycleTime = lifetime;
    const timeOffset = (i / totalParticles) * cycleTime;
    const particleAge = (currentTime + timeOffset) % cycleTime;
    const progress = particleAge / lifetime; // 0 to 1

    // Skip if very young or dead
    if (progress < 0.01 || progress > 0.99) continue;

    // Seed per particle
    const r1 = pseudoRandom(i * 1.618);
    const r2 = pseudoRandom(i * 2.718);
    const r3 = pseudoRandom(i * 3.141);

    // Initial position based on emitter
    let startX = centerX;
    let startY = centerY;
    let initAngle = r1 * Math.PI * 2;
    let initSpeed = settings.speed * (0.6 + 0.8 * r2) * scale;

    switch (settings.emitterType) {
      case 'text-outline': {
        // Emit along the perimeter/contour of the text box
        const perimeter = 2 * (textWidth + textHeight);
        const pLoc = r1 * perimeter;
        if (pLoc < textWidth) {
          startX = centerX - textWidth / 2 + pLoc;
          startY = centerY - textHeight / 2;
          initAngle = -Math.PI / 2 + (r2 - 0.5) * 0.8;
        } else if (pLoc < textWidth + textHeight) {
          startX = centerX + textWidth / 2;
          startY = centerY - textHeight / 2 + (pLoc - textWidth);
          initAngle = 0 + (r2 - 0.5) * 0.8;
        } else if (pLoc < 2 * textWidth + textHeight) {
          startX = centerX + textWidth / 2 - (pLoc - (textWidth + textHeight));
          startY = centerY + textHeight / 2;
          initAngle = Math.PI / 2 + (r2 - 0.5) * 0.8;
        } else {
          startX = centerX - textWidth / 2;
          startY = centerY + textHeight / 2 - (pLoc - (2 * textWidth + textHeight));
          initAngle = Math.PI + (r2 - 0.5) * 0.8;
        }
        break;
      }
      case 'point-center': {
        startX = centerX;
        startY = centerY;
        break;
      }
      case 'bounding-box': {
        startX = centerX + (r1 - 0.5) * textWidth;
        startY = centerY + (r2 - 0.5) * textHeight;
        initAngle = Math.atan2(startY - centerY, startX - centerX) + (r3 - 0.5) * 0.5;
        break;
      }
      case 'ring': {
        const ringRad = Math.max(textWidth, textHeight) * 0.65;
        startX = centerX + Math.cos(initAngle) * ringRad;
        startY = centerY + Math.sin(initAngle) * ringRad;
        break;
      }
      case 'bottom-fountain': {
        startX = centerX + (r1 - 0.5) * textWidth * 0.8;
        startY = centerY + textHeight / 2;
        // Shoot upwards with conical spread
        initAngle = -Math.PI / 2 + (r2 - 0.5) * 0.9;
        initSpeed *= 1.4;
        break;
      }
      case 'top-rain': {
        startX = centerX + (r1 - 0.5) * (textWidth * 1.5);
        startY = centerY - textHeight * 1.2;
        initAngle = Math.PI / 2 + (r2 - 0.5) * 0.2;
        break;
      }
    }

    // Kinematics with forces
    const vx0 = Math.cos(initAngle) * initSpeed;
    const vy0 = Math.sin(initAngle) * initSpeed;

    // Turbulence: harmonic sine waves
    const turbFreq = 4.0;
    const turbX = Math.sin(particleAge * turbFreq + i * 2.0) * settings.turbulence * scale;
    const turbY = Math.cos(particleAge * turbFreq + i * 1.5) * (settings.turbulence * 0.5) * scale;

    // Vortex rotation force
    let vortexOffsetX = 0;
    let vortexOffsetY = 0;
    if (Math.abs(settings.vortexSpeed) > 0.1) {
      const vAngle = particleAge * settings.vortexSpeed + i * 0.2;
      const vRadius = (30 + 70 * progress) * scale;
      vortexOffsetX = Math.cos(vAngle) * vRadius - Math.cos(i * 0.2) * 30 * scale;
      vortexOffsetY = Math.sin(vAngle) * vRadius - Math.sin(i * 0.2) * 30 * scale;
    }

    let posX = startX + vx0 * particleAge + 0.5 * settings.wind * scale * particleAge * particleAge + turbX + vortexOffsetX;
    let posY = startY + vy0 * particleAge + 0.5 * settings.gravity * scale * particleAge * particleAge + turbY + vortexOffsetY;

    // Collision with Floor
    if (settings.collisionFloor && posY > floorY) {
      const overDepth = posY - floorY;
      const bounceCount = 1 + Math.floor(overDepth / (50 * scale));
      const elasticity = Math.pow(settings.bounceElasticity, bounceCount);
      posY = floorY - Math.abs(Math.sin(particleAge * 8 + i)) * (overDepth * elasticity * 0.5);
    }

    // Alpha curve: fade in, sustain, fade out
    const alpha = Math.sin(progress * Math.PI) * (0.4 + 0.6 * r3);
    const pSize = Math.max(1, settings.size * scale * (1 - progress * 0.4));

    // Color gradient across lifetime
    ctx.save();
    ctx.globalAlpha = Math.max(0, Math.min(1, alpha));

    // Interpolate color
    const useSecondary = progress > 0.5;
    const drawColor = useSecondary ? settings.secondaryColor : settings.color;
    ctx.fillStyle = drawColor;
    ctx.strokeStyle = drawColor;
    ctx.shadowColor = drawColor;
    ctx.shadowBlur = pSize * 2;

    ctx.translate(posX, posY);

    drawParticleShape(ctx, settings.shape, pSize, particleAge * 3 + i);

    ctx.restore();
  }

  ctx.restore();
}

function drawParticleShape(
  ctx: CanvasRenderingContext2D,
  shape: ParticleShapeType,
  size: number,
  rot: number
): void {
  ctx.rotate(rot);
  switch (shape) {
    case 'circle': {
      ctx.beginPath();
      ctx.arc(0, 0, size, 0, Math.PI * 2);
      ctx.fill();
      break;
    }
    case 'star': {
      ctx.beginPath();
      const points = 5;
      const outerR = size * 1.5;
      const innerR = size * 0.6;
      for (let p = 0; p < points * 2; p++) {
        const rad = (p * Math.PI) / points;
        const r = p % 2 === 0 ? outerR : innerR;
        const px = Math.cos(rad) * r;
        const py = Math.sin(rad) * r;
        if (p === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      }
      ctx.closePath();
      ctx.fill();
      break;
    }
    case 'diamond': {
      ctx.beginPath();
      ctx.moveTo(0, -size * 1.3);
      ctx.lineTo(size, 0);
      ctx.lineTo(0, size * 1.3);
      ctx.lineTo(-size, 0);
      ctx.closePath();
      ctx.fill();
      break;
    }
    case 'spark': {
      // 4-point cross spark
      ctx.lineWidth = Math.max(1, size * 0.4);
      ctx.beginPath();
      ctx.moveTo(-size * 2, 0);
      ctx.lineTo(size * 2, 0);
      ctx.moveTo(0, -size * 2);
      ctx.lineTo(0, size * 2);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(0, 0, size * 0.5, 0, Math.PI * 2);
      ctx.fill();
      break;
    }
  }
}

// ----------------------------------------------------
// 2. EXPLOSION EFFECTS (Fragmentos, Debris y Shockwave)
// ----------------------------------------------------
export function renderExplosionEffect(
  ctx: CanvasRenderingContext2D,
  settings: AdvancedParticlesSettings['explosion'],
  centerX: number,
  centerY: number,
  scale: number,
  currentTime: number
): void {
  if (!settings.enabled) return;

  const explosionDuration = 2.0; // seconds of visible effect
  let dt = currentTime - settings.triggerTime;

  if (settings.loop && settings.loopInterval > 0 && currentTime >= settings.triggerTime) {
    dt = (currentTime - settings.triggerTime) % settings.loopInterval;
  }

  // Not triggered yet or already completed
  if (dt < 0 || dt > explosionDuration) return;

  const progress = dt / explosionDuration; // 0 to 1

  ctx.save();

  // A. Expanding Shockwave Ring
  if (settings.shockwave && progress < 0.8) {
    const shockProgress = dt / 1.4;
    const shockRadius = settings.explosionForce * shockProgress * 2.6 * scale;
    const shockAlpha = (1 - shockProgress) * 0.9;

    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    ctx.globalAlpha = Math.max(0, shockAlpha);

    const shockGrad = ctx.createRadialGradient(
      centerX,
      centerY,
      Math.max(0, shockRadius - 25 * scale),
      centerX,
      centerY,
      shockRadius + 15 * scale
    );
    shockGrad.addColorStop(0, 'rgba(255, 255, 255, 0)');
    shockGrad.addColorStop(0.65, settings.color);
    shockGrad.addColorStop(0.85, '#ffffff');
    shockGrad.addColorStop(1, 'rgba(255, 255, 255, 0)');

    ctx.lineWidth = Math.max(2, (15 - shockProgress * 12) * scale);
    ctx.strokeStyle = shockGrad;
    ctx.beginPath();
    ctx.arc(centerX, centerY, shockRadius, 0, Math.PI * 2);
    ctx.stroke();

    // Central flash at instant of detonation
    if (dt < 0.2) {
      const flashAlpha = (1 - dt / 0.2) * 0.9;
      ctx.fillStyle = `rgba(255, 255, 255, ${flashAlpha})`;
      ctx.beginPath();
      ctx.arc(centerX, centerY, (40 + dt * 200) * scale, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  }

  // B. Debris Smoke Clouds
  if (settings.debrisSmoke && progress < 0.9) {
    const smokeCount = 14;
    ctx.save();
    ctx.globalCompositeOperation = 'screen';
    for (let s = 0; s < smokeCount; s++) {
      const sAngle = (s / smokeCount) * Math.PI * 2 + pseudoRandom(s * 7.1);
      const sDist = dt * (settings.explosionForce * 0.45) * scale * (0.7 + 0.6 * pseudoRandom(s * 2.3));
      const sX = centerX + Math.cos(sAngle) * sDist;
      const sY = centerY + Math.sin(sAngle) * sDist - dt * 20 * scale; // rises slightly
      const sRadius = (15 + dt * 45) * scale;
      const sAlpha = (1 - progress) * 0.35 * (0.8 + 0.4 * pseudoRandom(s * 4.9));

      const smokeGrad = ctx.createRadialGradient(sX, sY, 0, sX, sY, sRadius);
      smokeGrad.addColorStop(0, `rgba(253, 186, 116, ${sAlpha})`);
      smokeGrad.addColorStop(0.4, `rgba(148, 163, 184, ${sAlpha * 0.7})`);
      smokeGrad.addColorStop(1, 'rgba(100, 116, 139, 0)');

      ctx.fillStyle = smokeGrad;
      ctx.beginPath();
      ctx.arc(sX, sY, sRadius, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  }

  // C. Sharp Fragments & Flying Debris
  const fragmentCount = Math.min(120, Math.max(15, settings.fragmentCount));
  ctx.globalCompositeOperation = 'lighter';

  for (let f = 0; f < fragmentCount; f++) {
    const rA = pseudoRandom(f * 3.456);
    const rS = pseudoRandom(f * 5.789);
    const rSz = pseudoRandom(f * 7.123);

    const angle = (f / fragmentCount) * Math.PI * 2 + (rA - 0.5) * 0.5;
    const speed = settings.explosionForce * (0.7 + 0.9 * rS) * scale;

    // Drag deceleration: air resistance slows radial travel
    const drag = 1.3;
    const dist = (speed / drag) * (1 - Math.exp(-drag * dt));

    const fragX = centerX + Math.cos(angle) * dist;
    // Add gravity pull
    const fragY = centerY + Math.sin(angle) * dist + 0.5 * settings.gravity * scale * dt * dt;

    const fragSize = Math.max(2, settings.fragmentSize * (0.6 + 0.8 * rSz) * scale);
    const fragAlpha = Math.max(0, 1 - Math.pow(progress, 1.4));
    const rot = angle + dt * (5 + 15 * (rS - 0.5));

    ctx.save();
    ctx.globalAlpha = fragAlpha;
    ctx.translate(fragX, fragY);
    ctx.rotate(rot);

    const isSecondary = f % 3 === 0;
    const fragColor = isSecondary ? settings.secondaryColor : settings.color;
    ctx.fillStyle = fragColor;
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 1;

    switch (settings.fragmentStyle) {
      case 'geometric-shards': {
        // Jagged sharp polygon
        ctx.beginPath();
        ctx.moveTo(-fragSize, -fragSize * 0.6);
        ctx.lineTo(fragSize * 1.2, 0);
        ctx.lineTo(-fragSize * 0.4, fragSize * 1.1);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
        break;
      }
      case 'glass-splinters': {
        // Long needle-sharp shards
        ctx.beginPath();
        ctx.moveTo(0, -fragSize * 2.2);
        ctx.lineTo(fragSize * 0.4, 0);
        ctx.lineTo(0, fragSize * 2.2);
        ctx.lineTo(-fragSize * 0.4, 0);
        ctx.closePath();
        ctx.fill();
        break;
      }
      case 'voxel-cubes': {
        // 3D Isometric micro cube fragment
        ctx.fillRect(-fragSize / 2, -fragSize / 2, fragSize, fragSize);
        ctx.strokeRect(-fragSize / 2, -fragSize / 2, fragSize, fragSize);
        break;
      }
      case 'fire-debris':
      default: {
        // Glowing ember spark with motion streak
        ctx.shadowColor = fragColor;
        ctx.shadowBlur = fragSize * 2;
        ctx.beginPath();
        ctx.arc(0, 0, fragSize * 0.8, 0, Math.PI * 2);
        ctx.fill();
        break;
      }
    }

    ctx.restore();
  }

  ctx.restore();
}

// ----------------------------------------------------
// 3. REALISTIC PHYSICS CONFETTI RAIN (3D Tumbling & Fluttering)
// ----------------------------------------------------
const CONFETTI_PALETTES: Record<ConfettiPalette, string[]> = {
  festive: ['#ef4444', '#f59e0b', '#10b981', '#3b82f6', '#8b5cf6', '#ec4899'],
  'gold-silver': ['#fbbf24', '#fef08a', '#d97706', '#e2e8f0', '#94a3b8', '#ffffff'],
  neon: ['#00f5d4', '#7b2cbf', '#f72585', '#4cc9f0', '#fee440', '#39ff14'],
  pastel: ['#fbcfe8', '#fed7aa', '#bbf7d0', '#bfdbfe', '#e9d5ff', '#fef3c7'],
  cyberpunk: ['#ff007f', '#00ffff', '#ffe600', '#7928ca', '#ffffff'],
};

export function renderConfettiRain(
  ctx: CanvasRenderingContext2D,
  settings: AdvancedParticlesSettings['confetti'],
  canvasWidth: number,
  canvasHeight: number,
  scale: number,
  currentTime: number
): void {
  if (!settings.enabled) return;

  const count = Math.min(250, Math.max(20, settings.density));
  const palette = CONFETTI_PALETTES[settings.palette] || CONFETTI_PALETTES.festive;

  ctx.save();

  for (let i = 0; i < count; i++) {
    const rX = pseudoRandom(i * 4.123);
    const rSpeed = pseudoRandom(i * 7.456);
    const rColor = pseudoRandom(i * 9.789);
    const rShape = pseudoRandom(i * 11.321);
    const rSize = pseudoRandom(i * 13.654);

    // Fall velocity with air drag
    const fallSpeed = (settings.speed * (0.65 + 0.7 * rSpeed) * (1 - settings.airResistance * 0.5)) * scale;
    const totalHeight = canvasHeight + 120 * scale;

    // Height offset cycle
    const cycleOffset = (rX * totalHeight);
    const curY = ((currentTime * fallSpeed + cycleOffset) % totalHeight) - 60 * scale;

    // 3D Fluttering & lateral oscillation
    const flutterPeriod = settings.flutterSpeed * (0.8 + 0.4 * rSpeed);
    const oscillation = Math.sin(currentTime * flutterPeriod + i * 1.5);
    const driftX = (settings.windDrift * scale * (currentTime % 20)) + (rX * canvasWidth);
    const curX = (driftX + oscillation * (30 * scale)) % canvasWidth;

    // 3D Euler Angles for realistic tumbling in air
    const rotX = currentTime * flutterPeriod * 1.8 + i * 2.0;
    const rotY = currentTime * flutterPeriod * 2.4 + i * 3.0;
    const rotZ = oscillation * 0.5;

    // 3D projection aspect ratios: scaleX and scaleY simulate rotating card in 3D
    const cosX = Math.cos(rotX);
    const cosY = Math.cos(rotY);

    // Skip almost edge-on for depth illusion
    if (Math.abs(cosX) < 0.05 && Math.abs(cosY) < 0.05) continue;

    const baseSize = (10 + 10 * rSize) * scale;
    const color = palette[Math.floor(rColor * palette.length)];

    ctx.save();
    ctx.translate(curX, curY);
    ctx.rotate(rotZ);
    // 3D perspective squish
    ctx.scale(cosX, cosY);

    // Specular shine flash when facing front
    const faceLight = Math.abs(cosX * cosY);
    ctx.fillStyle = color;
    ctx.globalAlpha = 0.85 + 0.15 * faceLight;

    const shapeMode = settings.shapes;
    const shapePick =
      shapeMode === 'mixed'
        ? (rShape < 0.35 ? 'rectangles' : rShape < 0.65 ? 'ribbons' : rShape < 0.85 ? 'circles' : 'stars')
        : shapeMode;

    switch (shapePick) {
      case 'rectangles': {
        ctx.fillRect(-baseSize / 2, -baseSize * 0.35, baseSize, baseSize * 0.7);
        break;
      }
      case 'ribbons': {
        // Wavy curved streamer
        ctx.beginPath();
        ctx.moveTo(-baseSize * 0.8, -baseSize * 0.3);
        ctx.bezierCurveTo(-baseSize * 0.2, baseSize * 0.5, baseSize * 0.2, -baseSize * 0.5, baseSize * 0.8, baseSize * 0.3);
        ctx.lineWidth = Math.max(2, baseSize * 0.25);
        ctx.strokeStyle = color;
        ctx.stroke();
        break;
      }
      case 'circles': {
        ctx.beginPath();
        ctx.arc(0, 0, baseSize * 0.4, 0, Math.PI * 2);
        ctx.fill();
        break;
      }
      case 'stars': {
        ctx.beginPath();
        const pts = 5;
        for (let p = 0; p < pts * 2; p++) {
          const a = (p * Math.PI) / pts;
          const r = p % 2 === 0 ? baseSize * 0.6 : baseSize * 0.25;
          const px = Math.cos(a) * r;
          const py = Math.sin(a) * r;
          if (p === 0) ctx.moveTo(px, py);
          else ctx.lineTo(px, py);
        }
        ctx.closePath();
        ctx.fill();
        break;
      }
    }

    ctx.restore();
  }

  ctx.restore();
}

// ----------------------------------------------------
// 4. LIGHT TRAILS & ORBITS (Rastros de Luz Siguiendo el Texto)
// ----------------------------------------------------
export function renderLightTrails(
  ctx: CanvasRenderingContext2D,
  settings: AdvancedParticlesSettings['trails'],
  centerX: number,
  centerY: number,
  boxWidth: number,
  boxHeight: number,
  scale: number,
  currentTime: number
): void {
  if (!settings.enabled) return;

  const t = currentTime * settings.speed;
  const trailLen = Math.min(60, Math.max(5, settings.trailLength));
  const baseWidth = settings.trailWidth * scale;

  ctx.save();
  ctx.globalCompositeOperation = 'lighter';

  // Compute position at time step tau
  const getOrbitPos = (timeOffset: number) => {
    switch (settings.type) {
      case 'comet-orbit': {
        // 3D Figure-8 / Lemniscate orbit weaving in front and behind
        const rx = (boxWidth / 2 + 50 * scale);
        const ry = (boxHeight / 2 + 35 * scale);
        const a = timeOffset * 2.2;
        const x = centerX + Math.sin(a) * rx;
        const y = centerY + Math.sin(a * 2) * (ry * 0.7);
        const z = Math.cos(a); // depth factor
        return { x, y, z };
      }
      case 'motion-ghost': {
        // Orbital ellipse around box
        const rx = (boxWidth / 2 + 40 * scale);
        const ry = (boxHeight / 2 + 40 * scale);
        const a = timeOffset * 3.0;
        return {
          x: centerX + Math.cos(a) * rx,
          y: centerY + Math.sin(a) * ry,
          z: 1,
        };
      }
      case 'sparkle-ribbon': {
        // Undulating wave along the top and bottom of text
        const rx = (boxWidth / 2 + 30 * scale);
        const a = timeOffset * 2.5;
        const x = centerX + Math.sin(a) * rx;
        const y = centerY + Math.cos(a * 3) * (boxHeight * 0.6) + Math.sin(timeOffset * 5) * 15 * scale;
        return { x, y, z: 1 };
      }
      case 'plasma-stream':
      case 'laser-contour':
      default: {
        // Perimeter path tracker
        const perimeter = 2 * (boxWidth + boxHeight + 60 * scale);
        const pos = ((timeOffset * 350 * scale) % perimeter);
        let x = centerX - boxWidth / 2;
        let y = centerY - boxHeight / 2;
        const w = boxWidth + 40 * scale;
        const h = boxHeight + 40 * scale;
        if (pos < w) {
          x = centerX - w / 2 + pos;
          y = centerY - h / 2;
        } else if (pos < w + h) {
          x = centerX + w / 2;
          y = centerY - h / 2 + (pos - w);
        } else if (pos < 2 * w + h) {
          x = centerX + w / 2 - (pos - (w + h));
          y = centerY + h / 2;
        } else {
          x = centerX - w / 2;
          y = centerY + h / 2 - (pos - (2 * w + h));
        }
        return { x, y, z: 1 };
      }
    }
  };

  // Draw smooth tapered ribbon trail
  const head = getOrbitPos(t);
  const timeStep = 0.025;

  ctx.beginPath();
  ctx.moveTo(head.x, head.y);

  for (let step = 1; step <= trailLen; step++) {
    const pt = getOrbitPos(t - step * timeStep);
    const alpha = (1 - step / trailLen);
    const w = baseWidth * alpha;

    ctx.strokeStyle = settings.glowColor;
    ctx.lineWidth = Math.max(1, w);
    ctx.shadowColor = settings.glowColor;
    ctx.shadowBlur = w * 3;
    ctx.globalAlpha = Math.max(0, alpha * 0.9);

    ctx.beginPath();
    const prev = getOrbitPos(t - (step - 1) * timeStep);
    ctx.moveTo(prev.x, prev.y);
    ctx.lineTo(pt.x, pt.y);
    ctx.stroke();

    // Sparkles shed by the trail
    if (settings.sparkles && step % 3 === 0) {
      const sparkAlpha = alpha * (settings.sparkleIntensity / 100);
      const sparkRadius = (1.5 + pseudoRandom(step * 3.7) * 2.5) * scale;
      const sX = pt.x + (pseudoRandom(step * 5.1) - 0.5) * 15 * scale;
      const sY = pt.y + (pseudoRandom(step * 8.3) - 0.5) * 15 * scale;

      ctx.save();
      ctx.globalAlpha = sparkAlpha;
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(sX, sY, sparkRadius, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
  }

  // Brilliant Head Orb
  ctx.save();
  ctx.globalAlpha = 1.0;
  ctx.fillStyle = '#ffffff';
  ctx.shadowColor = settings.glowColor;
  ctx.shadowBlur = 20 * scale;
  ctx.beginPath();
  ctx.arc(head.x, head.y, baseWidth * 1.5, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  ctx.restore();
}

// ----------------------------------------------------
// 5. MAGIC EFFECTS (Destellos, Chispas y Runas Místicas)
// ----------------------------------------------------
const ARCANE_RUNES = ['ᚠ', 'ᚢ', 'ᚦ', 'ᚨ', 'ᚱ', 'ᚲ', 'ᚷ', 'ᚹ', 'ᚺ', 'ᛝ', 'ᛟ', 'ᛞ'];
const ALCHEMICAL_GLYPHS = ['🜁', '🜂', '🜃', '🜄', '🝢', '🜚', '🜛', '🜜', '🜞', '🝞'];
const CELESTIAL_SYMBOLS = ['✦', '✧', '★', '☆', '✵', '✹', '✸', '✶'];
const SAKURA_GLYPHS = ['🌸', '✿', '❀', '❃', '🪷'];
const CYBER_HEX_SYMBOLS = ['⬡', '⬢', '◈', '◇', '⎔', '⌬'];

export function renderMagicEffects(
  ctx: CanvasRenderingContext2D,
  settings: AdvancedParticlesSettings['magic'],
  centerX: number,
  centerY: number,
  boxWidth: number,
  boxHeight: number,
  scale: number,
  currentTime: number
): void {
  if (!settings.enabled) return;

  ctx.save();
  const intensity = Math.max(0.2, settings.intensity);

  // A. Pulsing Arcane Sacred Geometry / Aura Glow in background
  if (settings.auraGlow) {
    ctx.save();
    ctx.globalCompositeOperation = 'screen';
    const pulse = 1 + Math.sin(currentTime * 2.5) * 0.12;
    const auraRad = (settings.orbitRadius * 1.1 * pulse) * scale;

    const auraGrad = ctx.createRadialGradient(
      centerX,
      centerY,
      auraRad * 0.2,
      centerX,
      centerY,
      auraRad * 1.2
    );
    auraGrad.addColorStop(0, 'rgba(0, 0, 0, 0)');
    auraGrad.addColorStop(0.5, `${settings.color}33`);
    auraGrad.addColorStop(0.85, `${settings.secondaryColor}66`);
    auraGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');

    ctx.fillStyle = auraGrad;
    ctx.beginPath();
    ctx.arc(centerX, centerY, auraRad * 1.2, 0, Math.PI * 2);
    ctx.fill();

    // Sacred Geometry concentric thin orbital rings
    ctx.strokeStyle = settings.secondaryColor;
    ctx.lineWidth = 1.2 * scale;
    ctx.globalAlpha = 0.45 * intensity;
    ctx.beginPath();
    ctx.arc(centerX, centerY, auraRad, 0, Math.PI * 2);
    ctx.stroke();

    ctx.setLineDash([6 * scale, 6 * scale]);
    ctx.beginPath();
    ctx.arc(centerX, centerY, auraRad * 0.75, 0, Math.PI * 2);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.restore();
  }

  // B. Floating Orbiting Mystic Runes
  const runeCount = Math.min(12, Math.max(3, settings.runeCount));
  let glyphSet = ARCANE_RUNES;
  if (settings.theme === 'alchemical-glyphs') glyphSet = ALCHEMICAL_GLYPHS;
  else if (settings.theme === 'celestial-stars') glyphSet = CELESTIAL_SYMBOLS;
  else if (settings.theme === 'sakura-petals') glyphSet = SAKURA_GLYPHS;
  else if (settings.theme === 'cyber-hex') glyphSet = CYBER_HEX_SYMBOLS;

  ctx.save();
  ctx.globalCompositeOperation = 'lighter';

  for (let r = 0; r < runeCount; r++) {
    const baseAngle = (r / runeCount) * Math.PI * 2;
    const currentAngle = baseAngle + currentTime * settings.orbitSpeed * 0.6;
    const orbitR = settings.orbitRadius * scale;

    const runeX = centerX + Math.cos(currentAngle) * orbitR;
    const runeY = centerY + Math.sin(currentAngle) * (orbitR * 0.55); // tilted 3D orbit

    // Floating vertical gentle bobbing
    const bob = Math.sin(currentTime * 3 + r * 1.2) * 6 * scale;
    const runeGlyph = glyphSet[r % glyphSet.length];

    // Pulsing brightness & scale
    const runePulse = 0.8 + Math.sin(currentTime * 4 + r * 2.1) * 0.25;
    const runeFontSize = Math.floor(22 * scale * runePulse);

    ctx.font = `bold ${runeFontSize}px serif, "Apple Color Emoji", sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    ctx.shadowColor = settings.color;
    ctx.shadowBlur = 18 * scale * intensity;
    ctx.fillStyle = '#ffffff';
    ctx.globalAlpha = Math.min(1, 0.75 * intensity * runePulse);

    ctx.save();
    ctx.translate(runeX, runeY + bob);
    // Subtle rotation
    ctx.rotate(Math.sin(currentTime * 1.5 + r) * 0.25);
    ctx.fillText(runeGlyph, 0, 0);

    // Inner bright glyph
    ctx.fillStyle = settings.secondaryColor;
    ctx.fillText(runeGlyph, 0, 0);
    ctx.restore();
  }

  // C. Celestial Twinkles & Rising Magic Sparks
  const sparkleCount = Math.min(80, Math.max(10, settings.sparkleCount));
  for (let s = 0; s < sparkleCount; s++) {
    const r1 = pseudoRandom(s * 2.345);
    const r2 = pseudoRandom(s * 4.567);
    const r3 = pseudoRandom(s * 6.789);

    // Spiraling upward trajectory
    const lifetime = 2.5;
    const age = (currentTime + (s / sparkleCount) * lifetime) % lifetime;
    const sProgress = age / lifetime;

    const spiralRadius = (30 + 90 * r1) * scale;
    const spiralAngle = age * 3.5 + s * 1.2;
    const spX = centerX + Math.cos(spiralAngle) * spiralRadius + (r2 - 0.5) * boxWidth;
    const spY = (centerY + boxHeight / 2) - age * (60 * scale) + (r3 - 0.5) * 30 * scale;

    const spAlpha = Math.sin(sProgress * Math.PI) * intensity;
    const spSize = (2 + 3 * r2) * scale;

    ctx.save();
    ctx.globalAlpha = Math.max(0, Math.min(1, spAlpha));
    ctx.fillStyle = s % 2 === 0 ? settings.color : settings.secondaryColor;
    ctx.shadowColor = '#ffffff';
    ctx.shadowBlur = 8 * scale;

    ctx.translate(spX, spY);

    // 4-point star sparkle
    ctx.beginPath();
    ctx.moveTo(-spSize * 2, 0);
    ctx.lineTo(spSize * 2, 0);
    ctx.moveTo(0, -spSize * 2);
    ctx.lineTo(0, spSize * 2);
    ctx.lineWidth = 1.2 * scale;
    ctx.strokeStyle = '#ffffff';
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(0, 0, spSize * 0.6, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }

  ctx.restore();
  ctx.restore();
}
