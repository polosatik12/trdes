import React, { useState, useEffect } from 'react';
import { Settings, X, Save } from 'lucide-react';

interface HeroImageSettings {
  objectFit: 'cover' | 'contain' | 'fill' | 'none';
  posX: number;
  posY: number;
  scale: number;
  containerWidth: number;
  imgWidth: number;
}

const STORAGE_KEY = 'hero-image-settings';

const defaultSettings: HeroImageSettings = {
  objectFit: 'cover',
  posX: 50,
  posY: 60,
  scale: 111,
  containerWidth: 62,
  imgWidth: 166,
};

export function getHeroImageSettings(): HeroImageSettings {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return { ...defaultSettings, ...JSON.parse(raw) };
  } catch {}
  return defaultSettings;
}

export function getHeroImageStyle(settings: HeroImageSettings): React.CSSProperties {
  const scaleX = (settings.imgWidth / 100) * (settings.scale / 100);
  const scaleY = settings.scale / 100;
  return {
    position: 'absolute' as const,
    width: '100%',
    height: '100%',
    objectFit: settings.objectFit,
    objectPosition: `${settings.posX}% ${settings.posY}%`,
    transform: `scale(${scaleX}, ${scaleY})`,
  };
}

export function getHeroImageClass(_settings: HeroImageSettings): string {
  return '';
}

const HeroImageEditor: React.FC<{ onChange: (s: HeroImageSettings) => void }> = ({ onChange }) => {
  const [open, setOpen] = useState(false);
  const [settings, setSettings] = useState<HeroImageSettings>(getHeroImageSettings);

  const update = (patch: Partial<HeroImageSettings>) => {
    const next = { ...settings, ...patch };
    setSettings(next);
    onChange(next);
  };

  const save = () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
    setOpen(false);
  };

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="absolute top-3 right-3 z-50 p-2 rounded-full bg-black/60 text-white hover:bg-black/80 transition-colors"
        title="Настройки картинки"
      >
        <Settings className="w-5 h-5" />
      </button>
    );
  }

  return (
    <div className="absolute top-3 right-3 z-50 w-72 bg-[#0a1628]/95 backdrop-blur-md text-white rounded-xl p-4 shadow-2xl border border-white/10 space-y-4 text-sm">
      <div className="flex items-center justify-between">
        <span className="font-semibold text-base">Настройки картинки</span>
        <button onClick={() => setOpen(false)} className="p-1 hover:bg-white/10 rounded">
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Object Fit */}
      <div>
        <label className="block text-white/60 mb-1">Object Fit</label>
        <div className="flex gap-1">
          {(['cover', 'contain', 'fill', 'none'] as const).map((v) => (
            <button
              key={v}
              onClick={() => update({ objectFit: v })}
              className={`px-2 py-1 rounded text-xs transition-colors ${
                settings.objectFit === v ? 'bg-white text-black font-bold' : 'bg-white/10 hover:bg-white/20'
              }`}
            >
              {v}
            </button>
          ))}
        </div>
      </div>

      {/* Position X */}
      <div>
        <label className="block text-white/60 mb-1">Позиция X: {settings.posX}%</label>
        <input
          type="range"
          min={0}
          max={100}
          value={settings.posX}
          onChange={(e) => update({ posX: Number(e.target.value) })}
          className="w-full accent-emerald-400"
        />
      </div>

      {/* Position Y */}
      <div>
        <label className="block text-white/60 mb-1">Позиция Y: {settings.posY}%</label>
        <input
          type="range"
          min={0}
          max={100}
          value={settings.posY}
          onChange={(e) => update({ posY: Number(e.target.value) })}
          className="w-full accent-emerald-400"
        />
      </div>

      {/* Scale */}
      <div>
        <label className="block text-white/60 mb-1">Масштаб: {settings.scale}%</label>
        <input
          type="range"
          min={50}
          max={200}
          value={settings.scale}
          onChange={(e) => update({ scale: Number(e.target.value) })}
          className="w-full accent-emerald-400"
        />
      </div>
      {/* Container Width */}
      <div>
        <label className="block text-white/60 mb-1">Ширина контейнера: {settings.containerWidth}%</label>
        <input
          type="range"
          min={30}
          max={90}
          value={settings.containerWidth}
          onChange={(e) => update({ containerWidth: Number(e.target.value) })}
          className="w-full accent-emerald-400"
        />
      </div>
      {/* Image Width */}
      <div>
        <label className="block text-white/60 mb-1">Ширина картинки: {settings.imgWidth}%</label>
        <input
          type="range"
          min={50}
          max={250}
          value={settings.imgWidth}
          onChange={(e) => update({ imgWidth: Number(e.target.value) })}
          className="w-full accent-emerald-400"
        />
      </div>

      <button
        onClick={save}
        className="w-full flex items-center justify-center gap-2 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-black font-semibold transition-colors"
      >
        <Save className="w-4 h-4" />
        Сохранить
      </button>
    </div>
  );
};

export default HeroImageEditor;
