import React from 'react';
import {
  Sparkles,
  Bomb,
  PartyPopper,
  Flame,
  Wand2,
  Atom,
  RotateCcw,
  Zap,
  Check,
  Play,
} from 'lucide-react';
import {
  TextLayer,
  AdvancedParticlesSettings,
  getDefaultAdvancedParticles,
  ParticleEmitterType,
  ParticleShapeType,
  ExplosionFragmentStyle,
  ConfettiShape,
  ConfettiPalette,
  TrailType,
  MagicTheme,
} from '../../types';
import { NumberSliderControl } from '../common/NumberSliderControl';

interface ParticleInspectorProps {
  layer: TextLayer;
  updateLayer: (updates: Partial<TextLayer>) => void;
  currentTime?: number;
}

export const ParticleInspector: React.FC<ParticleInspectorProps> = ({
  layer,
  updateLayer,
  currentTime = 0,
}) => {
  const particles: AdvancedParticlesSettings =
    layer.particles || getDefaultAdvancedParticles();

  const updateParticleSection = (
    section: keyof AdvancedParticlesSettings,
    updates: any
  ) => {
    const newParticles: AdvancedParticlesSettings = {
      ...particles,
      [section]: {
        ...(particles[section] as any),
        ...updates,
      },
    };
    updateLayer({ particles: newParticles });
  };

  // 1-Click Particle Presets
  const applyPreset = (presetName: string) => {
    const base = getDefaultAdvancedParticles();

    switch (presetName) {
      case 'explosion':
        base.explosion = {
          enabled: true,
          triggerTime: Math.max(0.5, Math.min(2.0, currentTime || 1.0)),
          loop: true,
          loopInterval: 3.0,
          fragmentCount: 65,
          explosionForce: 260,
          fragmentSize: 10,
          fragmentStyle: 'geometric-shards',
          shockwave: true,
          debrisSmoke: true,
          gravity: 220,
          color: '#f97316',
          secondaryColor: '#facc15',
        };
        break;

      case 'confetti':
        base.confetti = {
          enabled: true,
          density: 120,
          speed: 140,
          flutterSpeed: 4.2,
          airResistance: 0.35,
          windDrift: 20,
          shapes: 'mixed',
          palette: 'festive',
          floorBounce: true,
        };
        break;

      case 'magic':
        base.magic = {
          enabled: true,
          theme: 'arcane-runes',
          intensity: 1.4,
          orbitRadius: 125,
          orbitSpeed: 1.2,
          runeCount: 8,
          sparkleCount: 45,
          auraGlow: true,
          color: '#a855f7',
          secondaryColor: '#38bdf8',
        };
        break;

      case 'trails':
        base.trails = {
          enabled: true,
          type: 'comet-orbit',
          trailLength: 35,
          trailWidth: 5,
          glowColor: '#38bdf8',
          speed: 1.8,
          sparkles: true,
          sparkleIntensity: 75,
        };
        break;

      case 'fountain':
        base.system = {
          enabled: true,
          emitterType: 'bottom-fountain',
          rate: 110,
          lifetime: 2.2,
          speed: 120,
          size: 5,
          shape: 'spark',
          color: '#f59e0b',
          secondaryColor: '#ef4444',
          blendMode: 'lighter',
          gravity: 140,
          wind: 10,
          turbulence: 35,
          vortexSpeed: 0,
          collisionFloor: true,
          floorHeightPercent: 92,
          bounceElasticity: 0.65,
        };
        break;

      case 'celestial':
        base.magic = {
          enabled: true,
          theme: 'celestial-stars',
          intensity: 1.6,
          orbitRadius: 110,
          orbitSpeed: 0.9,
          runeCount: 6,
          sparkleCount: 60,
          auraGlow: true,
          color: '#38bdf8',
          secondaryColor: '#fef08a',
        };
        base.trails = {
          enabled: true,
          type: 'sparkle-ribbon',
          trailLength: 25,
          trailWidth: 3,
          glowColor: '#fef08a',
          speed: 1.4,
          sparkles: true,
          sparkleIntensity: 80,
        };
        break;

      case 'clear':
        // All disabled
        break;
    }

    updateLayer({ particles: base });
  };

  return (
    <div id="particle-inspector" className="p-4 space-y-6 text-slate-200">
      {/* Header Presets Bar */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-3 shadow-lg">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[11px] font-semibold tracking-wider uppercase text-slate-400 flex items-center gap-1.5">
            <Atom className="w-3.5 h-3.5 text-amber-400 animate-spin-slow" />
            Presets de Partículas (1 Clic)
          </span>
          <button
            onClick={() => applyPreset('clear')}
            title="Limpiar partículas"
            className="text-[10px] text-slate-400 hover:text-rose-400 flex items-center gap-1 transition-colors"
          >
            <RotateCcw className="w-2.5 h-2.5" />
            Limpiar
          </button>
        </div>

        <div className="grid grid-cols-3 gap-1.5">
          <button
            onClick={() => applyPreset('explosion')}
            className="px-2 py-1.5 bg-gradient-to-r from-amber-950/70 to-orange-950/70 border border-amber-800/60 hover:border-amber-500 rounded text-[11px] font-medium text-amber-200 flex items-center justify-center gap-1 transition-all shadow-sm"
          >
            <Bomb className="w-3 h-3 text-orange-400" />
            Explosión
          </button>

          <button
            onClick={() => applyPreset('confetti')}
            className="px-2 py-1.5 bg-gradient-to-r from-pink-950/70 to-purple-950/70 border border-pink-800/60 hover:border-pink-500 rounded text-[11px] font-medium text-pink-200 flex items-center justify-center gap-1 transition-all shadow-sm"
          >
            <PartyPopper className="w-3 h-3 text-pink-400" />
            Confeti 3D
          </button>

          <button
            onClick={() => applyPreset('magic')}
            className="px-2 py-1.5 bg-gradient-to-r from-purple-950/70 to-indigo-950/70 border border-purple-800/60 hover:border-purple-500 rounded text-[11px] font-medium text-purple-200 flex items-center justify-center gap-1 transition-all shadow-sm"
          >
            <Wand2 className="w-3 h-3 text-purple-400" />
            Runas Magia
          </button>

          <button
            onClick={() => applyPreset('trails')}
            className="px-2 py-1.5 bg-gradient-to-r from-sky-950/70 to-cyan-950/70 border border-sky-800/60 hover:border-sky-500 rounded text-[11px] font-medium text-sky-200 flex items-center justify-center gap-1 transition-all shadow-sm"
          >
            <Sparkles className="w-3 h-3 text-sky-400" />
            Estela Neón
          </button>

          <button
            onClick={() => applyPreset('fountain')}
            className="px-2 py-1.5 bg-gradient-to-r from-yellow-950/70 to-amber-950/70 border border-yellow-800/60 hover:border-yellow-500 rounded text-[11px] font-medium text-yellow-200 flex items-center justify-center gap-1 transition-all shadow-sm"
          >
            <Flame className="w-3 h-3 text-yellow-400" />
            Fuente Fuego
          </button>

          <button
            onClick={() => applyPreset('celestial')}
            className="px-2 py-1.5 bg-gradient-to-r from-cyan-950/70 to-blue-950/70 border border-cyan-800/60 hover:border-cyan-500 rounded text-[11px] font-medium text-cyan-200 flex items-center justify-center gap-1 transition-all shadow-sm"
          >
            <Zap className="w-3 h-3 text-cyan-400" />
            Celestial
          </button>
        </div>
      </div>

      {/* ---------------------------------------------------- */}
      {/* 1. SISTEMAS DE PARTÍCULAS COMPLEJOS */}
      {/* ---------------------------------------------------- */}
      <div className="bg-slate-900/60 border border-slate-800/80 rounded-xl p-3.5 space-y-3.5">
        <div className="flex items-center justify-between pb-2 border-b border-slate-800/70">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-amber-500/10 border border-amber-500/30 rounded-lg text-amber-400">
              <Atom className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-xs font-semibold text-slate-100">
                1. Sistema de Partículas Complejo
              </h4>
              <p className="text-[10px] text-slate-400">
                Emisores perimetrales, fuerzas y colisiones con suelo
              </p>
            </div>
          </div>
          <input
            type="checkbox"
            checked={particles.system.enabled}
            onChange={(e) => updateParticleSection('system', { enabled: e.target.checked })}
            className="w-4 h-4 rounded border-slate-700 bg-slate-950 text-amber-500 focus:ring-amber-500"
          />
        </div>

        {particles.system.enabled && (
          <div className="space-y-3 pt-1">
            {/* Emitter Type */}
            <div>
              <label className="text-[11px] text-slate-400 mb-1 block">Tipo de Emisor</label>
              <select
                value={particles.system.emitterType}
                onChange={(e) =>
                  updateParticleSection('system', {
                    emitterType: e.target.value as ParticleEmitterType,
                  })
                }
                className="w-full bg-slate-950 border border-slate-700 rounded px-2 py-1 text-xs text-slate-200"
              >
                <option value="text-outline">Contorno de Texto / Bordes</option>
                <option value="point-center">Punto Central (Emanación)</option>
                <option value="bounding-box">Caja Delimitadora</option>
                <option value="ring">Anillo Orbital</option>
                <option value="bottom-fountain">Fuente Inferior (Géiser)</option>
                <option value="top-rain">Lluvia Superior</option>
              </select>
            </div>

            {/* Particle Shape & Blend */}
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[11px] text-slate-400 mb-1 block">Forma</label>
                <select
                  value={particles.system.shape}
                  onChange={(e) =>
                    updateParticleSection('system', {
                      shape: e.target.value as ParticleShapeType,
                    })
                  }
                  className="w-full bg-slate-950 border border-slate-700 rounded px-2 py-1 text-xs text-slate-200"
                >
                  <option value="circle">Círculo Suave</option>
                  <option value="star">Estrella 5 Puntas</option>
                  <option value="diamond">Rombo Diamante</option>
                  <option value="spark">Chispa en Cruz</option>
                </select>
              </div>

              <div>
                <label className="text-[11px] text-slate-400 mb-1 block">Fusión</label>
                <select
                  value={particles.system.blendMode}
                  onChange={(e) =>
                    updateParticleSection('system', {
                      blendMode: e.target.value as 'screen' | 'lighter' | 'source-over',
                    })
                  }
                  className="w-full bg-slate-950 border border-slate-700 rounded px-2 py-1 text-xs text-slate-200"
                >
                  <option value="screen">Screen (Luminoso)</option>
                  <option value="lighter">Lighter (Aditivo)</option>
                  <option value="source-over">Normal</option>
                </select>
              </div>
            </div>

            {/* Colors */}
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[11px] text-slate-400 mb-1 block">Color Inicio</label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={particles.system.color}
                    onChange={(e) => updateParticleSection('system', { color: e.target.value })}
                    className="w-7 h-7 rounded border border-slate-700 bg-transparent cursor-pointer"
                  />
                  <span className="text-[11px] font-mono text-slate-300">
                    {particles.system.color}
                  </span>
                </div>
              </div>
              <div>
                <label className="text-[11px] text-slate-400 mb-1 block">Color Final</label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={particles.system.secondaryColor}
                    onChange={(e) =>
                      updateParticleSection('system', { secondaryColor: e.target.value })
                    }
                    className="w-7 h-7 rounded border border-slate-700 bg-transparent cursor-pointer"
                  />
                  <span className="text-[11px] font-mono text-slate-300">
                    {particles.system.secondaryColor}
                  </span>
                </div>
              </div>
            </div>

            {/* Emission Rate & Lifetime */}
            <NumberSliderControl
              label="Tasa de Emisión"
              value={particles.system.rate}
              min={10}
              max={250}
              step={5}
              unit="part/s"
              colorAccent="amber"
              onChange={(val) => updateParticleSection('system', { rate: val })}
              quickResetValue={80}
            />

            <NumberSliderControl
              label="Vida Útil"
              value={particles.system.lifetime}
              min={0.5}
              max={5.0}
              step={0.1}
              unit="s"
              colorAccent="amber"
              onChange={(val) => updateParticleSection('system', { lifetime: val })}
              quickResetValue={2.2}
            />

            <NumberSliderControl
              label="Velocidad Inicial"
              value={particles.system.speed}
              min={10}
              max={300}
              step={5}
              unit="px/s"
              colorAccent="amber"
              onChange={(val) => updateParticleSection('system', { speed: val })}
              quickResetValue={70}
            />

            <NumberSliderControl
              label="Tamaño de Partícula"
              value={particles.system.size}
              min={1}
              max={20}
              step={0.5}
              unit="px"
              colorAccent="amber"
              onChange={(val) => updateParticleSection('system', { size: val })}
              quickResetValue={4}
            />

            {/* Forces Sub-Box */}
            <div className="bg-slate-950/70 border border-slate-800 rounded-lg p-3 space-y-2.5">
              <span className="text-[10px] uppercase font-bold text-amber-400 tracking-wider">
                Fuerzas Físicas
              </span>

              <NumberSliderControl
                label="Gravedad (Vertical)"
                value={particles.system.gravity}
                min={-350}
                max={400}
                step={10}
                unit="px/s²"
                colorAccent="amber"
                onChange={(val) => updateParticleSection('system', { gravity: val })}
                quickResetValue={90}
              />

              <NumberSliderControl
                label="Viento Lateral"
                value={particles.system.wind}
                min={-250}
                max={250}
                step={10}
                unit="px/s"
                colorAccent="amber"
                onChange={(val) => updateParticleSection('system', { wind: val })}
                quickResetValue={0}
              />

              <NumberSliderControl
                label="Turbulencia Caótica"
                value={particles.system.turbulence}
                min={0}
                max={80}
                step={2}
                unit="px"
                colorAccent="amber"
                onChange={(val) => updateParticleSection('system', { turbulence: val })}
                quickResetValue={25}
              />

              <NumberSliderControl
                label="Vórtice (Remolino)"
                value={particles.system.vortexSpeed}
                min={-8}
                max={8}
                step={0.5}
                unit="rad/s"
                colorAccent="amber"
                onChange={(val) => updateParticleSection('system', { vortexSpeed: val })}
                quickResetValue={0}
              />
            </div>

            {/* Collisions Sub-Box */}
            <div className="bg-slate-950/70 border border-slate-800 rounded-lg p-3 space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-[10px] uppercase font-bold text-amber-400 tracking-wider">
                  Colisión con Suelo
                </span>
                <input
                  type="checkbox"
                  checked={particles.system.collisionFloor}
                  onChange={(e) =>
                    updateParticleSection('system', { collisionFloor: e.target.checked })
                  }
                  className="w-3.5 h-3.5 rounded border-slate-700 bg-slate-950 text-amber-500"
                />
              </div>

              {particles.system.collisionFloor && (
                <>
                  <NumberSliderControl
                    label="Altura del Suelo"
                    value={particles.system.floorHeightPercent}
                    min={50}
                    max={100}
                    step={1}
                    unit="%"
                    colorAccent="amber"
                    onChange={(val) =>
                      updateParticleSection('system', { floorHeightPercent: val })
                    }
                    quickResetValue={92}
                  />

                  <NumberSliderControl
                    label="Elasticidad de Rebote"
                    value={particles.system.bounceElasticity}
                    min={0.1}
                    max={0.95}
                    step={0.05}
                    isPercent={true}
                    unit="%"
                    colorAccent="amber"
                    onChange={(val) =>
                      updateParticleSection('system', { bounceElasticity: val })
                    }
                    quickResetValue={0.65}
                  />
                </>
              )}
            </div>
          </div>
        )}
      </div>

      {/* ---------------------------------------------------- */}
      {/* 2. EFECTOS DE EXPLOSIÓN */}
      {/* ---------------------------------------------------- */}
      <div className="bg-slate-900/60 border border-slate-800/80 rounded-xl p-3.5 space-y-3.5">
        <div className="flex items-center justify-between pb-2 border-b border-slate-800/70">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-orange-500/10 border border-orange-500/30 rounded-lg text-orange-400">
              <Bomb className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-xs font-semibold text-slate-100">
                2. Efectos de Explosión & Debris
              </h4>
              <p className="text-[10px] text-slate-400">
                Fragmentos geométricos, onda expansiva y humo
              </p>
            </div>
          </div>
          <input
            type="checkbox"
            checked={particles.explosion.enabled}
            onChange={(e) =>
              updateParticleSection('explosion', { enabled: e.target.checked })
            }
            className="w-4 h-4 rounded border-slate-700 bg-slate-950 text-orange-500 focus:ring-orange-500"
          />
        </div>

        {particles.explosion.enabled && (
          <div className="space-y-3 pt-1">
            {/* Trigger time & loop */}
            <div className="flex items-center gap-2">
              <div className="flex-1">
                <NumberSliderControl
                  label="Momento de Explosión"
                  value={particles.explosion.triggerTime}
                  min={0}
                  max={10}
                  step={0.1}
                  unit="s"
                  colorAccent="amber"
                  onChange={(val) => updateParticleSection('explosion', { triggerTime: val })}
                  quickResetValue={1.0}
                />
              </div>
              <button
                onClick={() =>
                  updateParticleSection('explosion', {
                    triggerTime: parseFloat((currentTime || 0).toFixed(1)),
                  })
                }
                title="Detonar en tiempo actual"
                className="mt-4 px-2 py-1 bg-orange-600/30 border border-orange-500/40 hover:bg-orange-600/50 text-orange-200 rounded text-[10px] flex items-center gap-1 shrink-0"
              >
                <Play className="w-2.5 h-2.5" />
                Ahora
              </button>
            </div>

            <div className="flex items-center justify-between py-1">
              <span className="text-[11px] text-slate-400">Repetir en Bucle (Loop)</span>
              <input
                type="checkbox"
                checked={particles.explosion.loop}
                onChange={(e) =>
                  updateParticleSection('explosion', { loop: e.target.checked })
                }
                className="w-4 h-4 rounded border-slate-700 bg-slate-950 text-orange-500"
              />
            </div>

            {particles.explosion.loop && (
              <NumberSliderControl
                label="Intervalo de Repetición"
                value={particles.explosion.loopInterval}
                min={1.5}
                max={8.0}
                step={0.5}
                unit="s"
                colorAccent="amber"
                onChange={(val) => updateParticleSection('explosion', { loopInterval: val })}
                quickResetValue={3.0}
              />
            )}

            {/* Fragment Style */}
            <div>
              <label className="text-[11px] text-slate-400 mb-1 block">Estilo de Fragmentos</label>
              <select
                value={particles.explosion.fragmentStyle}
                onChange={(e) =>
                  updateParticleSection('explosion', {
                    fragmentStyle: e.target.value as ExplosionFragmentStyle,
                  })
                }
                className="w-full bg-slate-950 border border-slate-700 rounded px-2 py-1 text-xs text-slate-200"
              >
                <option value="geometric-shards">Esquirlas Poligonales Afiladas</option>
                <option value="glass-splinters">Astillas de Cristal</option>
                <option value="fire-debris">Ascuas y Chispas de Fuego</option>
                <option value="voxel-cubes">Cubos Voxel 3D</option>
              </select>
            </div>

            {/* Fragment count, force, size */}
            <NumberSliderControl
              label="Cantidad de Fragmentos"
              value={particles.explosion.fragmentCount}
              min={15}
              max={100}
              step={5}
              unit="trozos"
              colorAccent="amber"
              onChange={(val) => updateParticleSection('explosion', { fragmentCount: val })}
              quickResetValue={50}
            />

            <NumberSliderControl
              label="Fuerza de Explosión"
              value={particles.explosion.explosionForce}
              min={50}
              max={450}
              step={10}
              unit="px/s"
              colorAccent="amber"
              onChange={(val) => updateParticleSection('explosion', { explosionForce: val })}
              quickResetValue={220}
            />

            <NumberSliderControl
              label="Tamaño de Fragmentos"
              value={particles.explosion.fragmentSize}
              min={3}
              max={22}
              step={1}
              unit="px"
              colorAccent="amber"
              onChange={(val) => updateParticleSection('explosion', { fragmentSize: val })}
              quickResetValue={8}
            />

            <NumberSliderControl
              label="Gravedad de Caída"
              value={particles.explosion.gravity}
              min={0}
              max={400}
              step={10}
              unit="px/s²"
              colorAccent="amber"
              onChange={(val) => updateParticleSection('explosion', { gravity: val })}
              quickResetValue={180}
            />

            {/* Shockwave & Smoke Toggles */}
            <div className="grid grid-cols-2 gap-2 pt-1 border-t border-slate-800/60">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={particles.explosion.shockwave}
                  onChange={(e) =>
                    updateParticleSection('explosion', { shockwave: e.target.checked })
                  }
                  className="w-3.5 h-3.5 rounded border-slate-700 bg-slate-950 text-orange-500"
                />
                <span className="text-[11px] text-slate-300">Onda Expansiva</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={particles.explosion.debrisSmoke}
                  onChange={(e) =>
                    updateParticleSection('explosion', { debrisSmoke: e.target.checked })
                  }
                  className="w-3.5 h-3.5 rounded border-slate-700 bg-slate-950 text-orange-500"
                />
                <span className="text-[11px] text-slate-300">Humo de Detonación</span>
              </label>
            </div>

            {/* Colors */}
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[11px] text-slate-400 mb-1 block">Color Primario</label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={particles.explosion.color}
                    onChange={(e) =>
                      updateParticleSection('explosion', { color: e.target.value })
                    }
                    className="w-7 h-7 rounded border border-slate-700 bg-transparent cursor-pointer"
                  />
                  <span className="text-[11px] font-mono text-slate-300">
                    {particles.explosion.color}
                  </span>
                </div>
              </div>
              <div>
                <label className="text-[11px] text-slate-400 mb-1 block">Color Secundario</label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={particles.explosion.secondaryColor}
                    onChange={(e) =>
                      updateParticleSection('explosion', { secondaryColor: e.target.value })
                    }
                    className="w-7 h-7 rounded border border-slate-700 bg-transparent cursor-pointer"
                  />
                  <span className="text-[11px] font-mono text-slate-300">
                    {particles.explosion.secondaryColor}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ---------------------------------------------------- */}
      {/* 3. LLUVIA DE CONFETI (FÍSICA REALISTA 3D) */}
      {/* ---------------------------------------------------- */}
      <div className="bg-slate-900/60 border border-slate-800/80 rounded-xl p-3.5 space-y-3.5">
        <div className="flex items-center justify-between pb-2 border-b border-slate-800/70">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-pink-500/10 border border-pink-500/30 rounded-lg text-pink-400">
              <PartyPopper className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-xs font-semibold text-slate-100">
                3. Lluvia de Confeti (Física Realista 3D)
              </h4>
              <p className="text-[10px] text-slate-400">
                Bamboleo aerodinámico, rotación y reflejos
              </p>
            </div>
          </div>
          <input
            type="checkbox"
            checked={particles.confetti.enabled}
            onChange={(e) =>
              updateParticleSection('confetti', { enabled: e.target.checked })
            }
            className="w-4 h-4 rounded border-slate-700 bg-slate-950 text-pink-500 focus:ring-pink-500"
          />
        </div>

        {particles.confetti.enabled && (
          <div className="space-y-3 pt-1">
            {/* Palette & Shapes */}
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[11px] text-slate-400 mb-1 block">Paleta Cromática</label>
                <select
                  value={particles.confetti.palette}
                  onChange={(e) =>
                    updateParticleSection('confetti', {
                      palette: e.target.value as ConfettiPalette,
                    })
                  }
                  className="w-full bg-slate-950 border border-slate-700 rounded px-2 py-1 text-xs text-slate-200"
                >
                  <option value="festive">Carnaval Multicolor</option>
                  <option value="gold-silver">Oro y Plata Gala</option>
                  <option value="neon">Cyber Neón</option>
                  <option value="pastel">Pastel Elegante</option>
                  <option value="cyberpunk">Cyberpunk Glow</option>
                </select>
              </div>

              <div>
                <label className="text-[11px] text-slate-400 mb-1 block">Formas</label>
                <select
                  value={particles.confetti.shapes}
                  onChange={(e) =>
                    updateParticleSection('confetti', {
                      shapes: e.target.value as ConfettiShape,
                    })
                  }
                  className="w-full bg-slate-950 border border-slate-700 rounded px-2 py-1 text-xs text-slate-200"
                >
                  <option value="mixed">Variado (Papel, Cinta, Círculos)</option>
                  <option value="rectangles">Rectángulos Clásicos</option>
                  <option value="ribbons">Cintas Serpentinas</option>
                  <option value="circles">Discos Redondos</option>
                  <option value="stars">Estrellas</option>
                </select>
              </div>
            </div>

            {/* Density & Speed */}
            <NumberSliderControl
              label="Densidad de Confeti"
              value={particles.confetti.density}
              min={20}
              max={220}
              step={5}
              unit="piezas"
              colorAccent="amber"
              onChange={(val) => updateParticleSection('confetti', { density: val })}
              quickResetValue={90}
            />

            <NumberSliderControl
              label="Velocidad de Caída"
              value={particles.confetti.speed}
              min={40}
              max={280}
              step={5}
              unit="px/s"
              colorAccent="amber"
              onChange={(val) => updateParticleSection('confetti', { speed: val })}
              quickResetValue={130}
            />

            <NumberSliderControl
              label="Velocidad de Bamboleo 3D"
              value={particles.confetti.flutterSpeed}
              min={1.0}
              max={8.0}
              step={0.2}
              unit="x"
              colorAccent="amber"
              onChange={(val) => updateParticleSection('confetti', { flutterSpeed: val })}
              quickResetValue={3.8}
            />

            <NumberSliderControl
              label="Resistencia al Aire (Drag)"
              value={particles.confetti.airResistance}
              min={0}
              max={0.8}
              step={0.05}
              isPercent={true}
              unit="%"
              colorAccent="amber"
              onChange={(val) => updateParticleSection('confetti', { airResistance: val })}
              quickResetValue={0.35}
            />

            <NumberSliderControl
              label="Deriva de Viento"
              value={particles.confetti.windDrift}
              min={-80}
              max={80}
              step={5}
              unit="px/s"
              colorAccent="amber"
              onChange={(val) => updateParticleSection('confetti', { windDrift: val })}
              quickResetValue={15}
            />
          </div>
        )}
      </div>

      {/* ---------------------------------------------------- */}
      {/* 4. ESTELAS Y TRAILS */}
      {/* ---------------------------------------------------- */}
      <div className="bg-slate-900/60 border border-slate-800/80 rounded-xl p-3.5 space-y-3.5">
        <div className="flex items-center justify-between pb-2 border-b border-slate-800/70">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-sky-500/10 border border-sky-500/30 rounded-lg text-sky-400">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-xs font-semibold text-slate-100">
                4. Estelas y Trails Luminosos
              </h4>
              <p className="text-[10px] text-slate-400">
                Cometas orbitales, cintas y rastros de luz
              </p>
            </div>
          </div>
          <input
            type="checkbox"
            checked={particles.trails.enabled}
            onChange={(e) =>
              updateParticleSection('trails', { enabled: e.target.checked })
            }
            className="w-4 h-4 rounded border-slate-700 bg-slate-950 text-sky-500 focus:ring-sky-500"
          />
        </div>

        {particles.trails.enabled && (
          <div className="space-y-3 pt-1">
            {/* Trail Type */}
            <div>
              <label className="text-[11px] text-slate-400 mb-1 block">Tipo de Estela</label>
              <select
                value={particles.trails.type}
                onChange={(e) =>
                  updateParticleSection('trails', {
                    type: e.target.value as TrailType,
                  })
                }
                className="w-full bg-slate-950 border border-slate-700 rounded px-2 py-1 text-xs text-slate-200"
              >
                <option value="comet-orbit">Cometa en Órbita 3D (Infinito / 8)</option>
                <option value="motion-ghost">Ecos de Movimiento Orbital</option>
                <option value="sparkle-ribbon">Cinta Ondulante Luminosa</option>
                <option value="plasma-stream">Haz de Plasma Continuo</option>
                <option value="laser-contour">Láser Trazador de Contorno</option>
              </select>
            </div>

            {/* Length & Width */}
            <NumberSliderControl
              label="Longitud de Estela"
              value={particles.trails.trailLength}
              min={8}
              max={55}
              step={1}
              unit="pasos"
              colorAccent="amber"
              onChange={(val) => updateParticleSection('trails', { trailLength: val })}
              quickResetValue={28}
            />

            <NumberSliderControl
              label="Grosor de Estela"
              value={particles.trails.trailWidth}
              min={1}
              max={15}
              step={0.5}
              unit="px"
              colorAccent="amber"
              onChange={(val) => updateParticleSection('trails', { trailWidth: val })}
              quickResetValue={4}
            />

            <NumberSliderControl
              label="Velocidad de Órbita"
              value={particles.trails.speed}
              min={0.5}
              max={3.5}
              step={0.1}
              unit="x"
              colorAccent="amber"
              onChange={(val) => updateParticleSection('trails', { speed: val })}
              quickResetValue={1.6}
            />

            {/* Sparkles Shedding */}
            <div className="space-y-2 pt-1 border-t border-slate-800/60">
              <div className="flex items-center justify-between">
                <span className="text-[11px] text-slate-300">Desprender Chispas</span>
                <input
                  type="checkbox"
                  checked={particles.trails.sparkles}
                  onChange={(e) =>
                    updateParticleSection('trails', { sparkles: e.target.checked })
                  }
                  className="w-3.5 h-3.5 rounded border-slate-700 bg-slate-950 text-sky-500"
                />
              </div>

              {particles.trails.sparkles && (
                <NumberSliderControl
                  label="Intensidad de Chispas"
                  value={particles.trails.sparkleIntensity}
                  min={10}
                  max={100}
                  step={5}
                  unit="%"
                  colorAccent="amber"
                  onChange={(val) => updateParticleSection('trails', { sparkleIntensity: val })}
                  quickResetValue={60}
                />
              )}
            </div>

            {/* Glow Color */}
            <div>
              <label className="text-[11px] text-slate-400 mb-1 block">Color Glow</label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={particles.trails.glowColor}
                  onChange={(e) =>
                    updateParticleSection('trails', { glowColor: e.target.value })
                  }
                  className="w-7 h-7 rounded border border-slate-700 bg-transparent cursor-pointer"
                />
                <span className="text-[11px] font-mono text-slate-300">
                  {particles.trails.glowColor}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ---------------------------------------------------- */}
      {/* 5. EFECTOS DE MAGIA (RUNAS, DESTELLOS, CHISPAS) */}
      {/* ---------------------------------------------------- */}
      <div className="bg-slate-900/60 border border-slate-800/80 rounded-xl p-3.5 space-y-3.5">
        <div className="flex items-center justify-between pb-2 border-b border-slate-800/70">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-purple-500/10 border border-purple-500/30 rounded-lg text-purple-400">
              <Wand2 className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-xs font-semibold text-slate-100">
                5. Efectos de Magia & Runas
              </h4>
              <p className="text-[10px] text-slate-400">
                Runas flotantes, destellos astrales y aura mística
              </p>
            </div>
          </div>
          <input
            type="checkbox"
            checked={particles.magic.enabled}
            onChange={(e) =>
              updateParticleSection('magic', { enabled: e.target.checked })
            }
            className="w-4 h-4 rounded border-slate-700 bg-slate-950 text-purple-500 focus:ring-purple-500"
          />
        </div>

        {particles.magic.enabled && (
          <div className="space-y-3 pt-1">
            {/* Theme */}
            <div>
              <label className="text-[11px] text-slate-400 mb-1 block">Tema Esotérico</label>
              <select
                value={particles.magic.theme}
                onChange={(e) =>
                  updateParticleSection('magic', {
                    theme: e.target.value as MagicTheme,
                  })
                }
                className="w-full bg-slate-950 border border-slate-700 rounded px-2 py-1 text-xs text-slate-200"
              >
                <option value="arcane-runes">Runas Nórdicas Antiguas (ᚠ, ᚢ, ᚦ...)</option>
                <option value="celestial-stars">Estrellas Celestiales (✦, ✧, ★...)</option>
                <option value="alchemical-glyphs">Glifos Alquímicos (🜁, 🜂, 🜃...)</option>
                <option value="sakura-petals">Pétalos Místicos de Sakura (🌸, ✿...)</option>
                <option value="cyber-hex">Glifos Hexagonales Cyber (⬡, ⬢, ◈...)</option>
              </select>
            </div>

            {/* Intensity */}
            <NumberSliderControl
              label="Intensidad de Brillo"
              value={particles.magic.intensity}
              min={0.3}
              max={2.5}
              step={0.1}
              isPercent={true}
              unit="%"
              colorAccent="amber"
              onChange={(val) => updateParticleSection('magic', { intensity: val })}
              quickResetValue={1.0}
            />

            {/* Orbit Radius & Speed */}
            <NumberSliderControl
              label="Radio Orbital"
              value={particles.magic.orbitRadius}
              min={40}
              max={220}
              step={5}
              unit="px"
              colorAccent="amber"
              onChange={(val) => updateParticleSection('magic', { orbitRadius: val })}
              quickResetValue={110}
            />

            <NumberSliderControl
              label="Velocidad Orbital"
              value={particles.magic.orbitSpeed}
              min={0.2}
              max={2.5}
              step={0.1}
              unit="rad/s"
              colorAccent="amber"
              onChange={(val) => updateParticleSection('magic', { orbitSpeed: val })}
              quickResetValue={1.2}
            />

            {/* Rune count & Sparkle count */}
            <NumberSliderControl
              label="Cantidad de Runas Flotantes"
              value={particles.magic.runeCount}
              min={3}
              max={12}
              step={1}
              unit="glifos"
              colorAccent="amber"
              onChange={(val) => updateParticleSection('magic', { runeCount: val })}
              quickResetValue={6}
            />

            <NumberSliderControl
              label="Destellos & Chispas Mágicas"
              value={particles.magic.sparkleCount}
              min={10}
              max={70}
              step={5}
              unit="chispas"
              colorAccent="amber"
              onChange={(val) => updateParticleSection('magic', { sparkleCount: val })}
              quickResetValue={35}
            />

            {/* Aura Glow */}
            <div className="flex items-center justify-between py-1 border-t border-slate-800/60">
              <span className="text-[11px] text-slate-300">
                Aura Mística & Círculo de Transmutación
              </span>
              <input
                type="checkbox"
                checked={particles.magic.auraGlow}
                onChange={(e) =>
                  updateParticleSection('magic', { auraGlow: e.target.checked })
                }
                className="w-4 h-4 rounded border-slate-700 bg-slate-950 text-purple-500"
              />
            </div>

            {/* Colors */}
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[11px] text-slate-400 mb-1 block">Aura Principal</label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={particles.magic.color}
                    onChange={(e) =>
                      updateParticleSection('magic', { color: e.target.value })
                    }
                    className="w-7 h-7 rounded border border-slate-700 bg-transparent cursor-pointer"
                  />
                  <span className="text-[11px] font-mono text-slate-300">
                    {particles.magic.color}
                  </span>
                </div>
              </div>
              <div>
                <label className="text-[11px] text-slate-400 mb-1 block">Glifos / Destellos</label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={particles.magic.secondaryColor}
                    onChange={(e) =>
                      updateParticleSection('magic', { secondaryColor: e.target.value })
                    }
                    className="w-7 h-7 rounded border border-slate-700 bg-transparent cursor-pointer"
                  />
                  <span className="text-[11px] font-mono text-slate-300">
                    {particles.magic.secondaryColor}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
