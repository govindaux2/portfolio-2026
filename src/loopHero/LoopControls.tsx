import { useState } from 'react';
import {
  LOOP_DEFAULTS,
  LOOP_PRESETS,
  copyLoopParams,
  type LoopParams,
} from './loopParams';

type Props = {
  value: LoopParams;
  onChange: (next: LoopParams) => void;
  locked: boolean;
  onLockedChange: (locked: boolean) => void;
};

function Row({
  label,
  min,
  max,
  step,
  value,
  disabled,
  onChange,
}: {
  label: string;
  min: number;
  max: number;
  step: number;
  value: number;
  disabled: boolean;
  onChange: (n: number) => void;
}) {
  const shown =
    step >= 1 ? value.toFixed(0) : step >= 0.01 ? value.toFixed(2) : value.toFixed(3);
  return (
    <label className="loop-ctrl-row">
      <span>{label}</span>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        disabled={disabled}
        onChange={(e) => onChange(Number(e.target.value))}
      />
      <em>{shown}</em>
    </label>
  );
}

function ColorRow({
  label,
  value,
  disabled,
  onChange,
}: {
  label: string;
  value: string;
  disabled: boolean;
  onChange: (hex: string) => void;
}) {
  return (
    <label className="loop-ctrl-row loop-ctrl-row--color">
      <span>{label}</span>
      <input
        type="color"
        value={value}
        disabled={disabled}
        onChange={(e) => onChange(e.target.value)}
      />
    </label>
  );
}

export function LoopControls({ value, onChange, locked, onLockedChange }: Props) {
  const [open, setOpen] = useState(true);
  const [copied, setCopied] = useState(false);

  const set = <K extends keyof LoopParams>(key: K, next: LoopParams[K]) => {
    if (locked) return;
    onChange({ ...value, [key]: next });
  };

  const copy = async () => {
    try {
      await copyLoopParams(value);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1600);
    } catch {
      setCopied(false);
    }
  };

  if (!open) {
    return (
      <div className="loop-ctrl">
        <button
          type="button"
          className="loop-ctrl-fab"
          aria-label="Open shader controls"
          onClick={() => setOpen(true)}
        >
          <i />
          <i />
          <i />
        </button>
      </div>
    );
  }

  return (
    <aside className="loop-ctrl">
      <div className="loop-ctrl-panel">
        <header className="loop-ctrl-head">
          <p>Shaders{locked ? ' · locked' : ''}</p>
          <div className="loop-ctrl-actions">
            <button type="button" onClick={copy}>
              {copied ? 'Copied' : 'Copy JSON'}
            </button>
            <button
              type="button"
              className={locked ? 'is-on' : undefined}
              onClick={() => onLockedChange(!locked)}
            >
              {locked ? 'Unlock' : 'Lock'}
            </button>
            <button
              type="button"
              disabled={locked}
              onClick={() => onChange(LOOP_DEFAULTS)}
            >
              Reset
            </button>
            <button
              type="button"
              className="loop-ctrl-min"
              aria-label="Minimize"
              onClick={() => setOpen(false)}
            />
          </div>
        </header>

        <div className="loop-ctrl-presets">
          {LOOP_PRESETS.map((preset) => (
            <button
              key={preset.id}
              type="button"
              disabled={locked}
              onClick={() => onChange(preset.params)}
            >
              {preset.label}
            </button>
          ))}
        </div>

        <section>
          <h3>Tunnel</h3>
          <Row label="Speed" min={0} max={1.6} step={0.01} value={value.speed} disabled={locked} onChange={(n) => set('speed', n)} />
          <Row label="Density" min={0.4} max={4} step={0.01} value={value.density} disabled={locked} onChange={(n) => set('density', n)} />
          <Row label="Thickness" min={0.004} max={0.05} step={0.001} value={value.thickness} disabled={locked} onChange={(n) => set('thickness', n)} />
          <Row label="Fog" min={0.02} max={0.22} step={0.001} value={value.fog} disabled={locked} onChange={(n) => set('fog', n)} />
          <Row label="Warp" min={0} max={0.4} step={0.01} value={value.warp} disabled={locked} onChange={(n) => set('warp', n)} />
          <Row label="Pulse" min={0} max={1} step={0.01} value={value.pulse} disabled={locked} onChange={(n) => set('pulse', n)} />
          <Row label="Room W" min={1.2} max={4} step={0.01} value={value.roomW} disabled={locked} onChange={(n) => set('roomW', n)} />
          <Row label="Room H" min={0.6} max={2.2} step={0.01} value={value.roomH} disabled={locked} onChange={(n) => set('roomH', n)} />
          <ColorRow label="Lines" value={value.lineColor} disabled={locked} onChange={(n) => set('lineColor', n)} />
          <ColorRow label="Field" value={value.bgColor} disabled={locked} onChange={(n) => set('bgColor', n)} />
        </section>

        <section>
          <h3>Loop</h3>
          <Row label="Size" min={32} max={78} step={1} value={value.circleSize} disabled={locked} onChange={(n) => set('circleSize', n)} />
          <Row label="Soft" min={8} max={90} step={1} value={value.circleSoft} disabled={locked} onChange={(n) => set('circleSoft', n)} />
          <Row label="Ring" min={6} max={28} step={1} value={value.ringGap} disabled={locked} onChange={(n) => set('ringGap', n)} />
          <Row label="Glow" min={0} max={2} step={0.01} value={value.glow} disabled={locked} onChange={(n) => set('glow', n)} />
          <ColorRow label="Well A" value={value.circleA} disabled={locked} onChange={(n) => set('circleA', n)} />
          <ColorRow label="Well B" value={value.circleB} disabled={locked} onChange={(n) => set('circleB', n)} />
          <ColorRow label="Tint" value={value.glowColor} disabled={locked} onChange={(n) => set('glowColor', n)} />
        </section>

        <section>
          <h3>Figure</h3>
          <Row label="Scale" min={0.7} max={1.4} step={0.01} value={value.figureScale} disabled={locked} onChange={(n) => set('figureScale', n)} />
          <Row label="Turn" min={-0.8} max={0.8} step={0.01} value={value.figureRotY} disabled={locked} onChange={(n) => set('figureRotY', n)} />
          <Row label="Lift" min={-0.4} max={0.2} step={0.01} value={value.figureY} disabled={locked} onChange={(n) => set('figureY', n)} />
          <Row label="Key" min={0} max={1.4} step={0.01} value={value.keyLight} disabled={locked} onChange={(n) => set('keyLight', n)} />
          <Row label="Fill" min={0} max={0.6} step={0.01} value={value.fillLight} disabled={locked} onChange={(n) => set('fillLight', n)} />
          <Row label="Rim" min={0} max={6} step={0.05} value={value.rimLight} disabled={locked} onChange={(n) => set('rimLight', n)} />
          <Row label="Ambient" min={0} max={0.3} step={0.005} value={value.ambient} disabled={locked} onChange={(n) => set('ambient', n)} />
        </section>

        <section>
          <h3>Motion</h3>
          <Row label="Parallax" min={0} max={2} step={0.01} value={value.parallax} disabled={locked} onChange={(n) => set('parallax', n)} />
          <Row label="Mouse" min={0} max={2} step={0.01} value={value.mouse} disabled={locked} onChange={(n) => set('mouse', n)} />
          <Row label="Breathe" min={0} max={2} step={0.01} value={value.breathe} disabled={locked} onChange={(n) => set('breathe', n)} />
        </section>
      </div>
    </aside>
  );
}
