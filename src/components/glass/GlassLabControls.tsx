import { useEffect, useRef, useState } from 'react';
import type { GlassParamsV2 } from './glassParams';
import { GLASS_V2_DEFAULTS } from './glassParams';
import {
  deleteLook,
  loadLooks,
  saveLook,
  applyLook,
  type GlassLook,
} from './glassLooks';
import './glass-lab-controls.css';

type Props = {
  value: GlassParamsV2;
  onChange: (next: GlassParamsV2) => void;
};

function Row({
  label,
  min,
  max,
  step,
  value,
  suffix,
  onChange,
}: {
  label: string;
  min: number;
  max: number;
  step: number;
  value: number;
  suffix?: string;
  onChange: (n: number) => void;
}) {
  const safe = Number.isFinite(value) ? value : min;
  const shown =
    step >= 1 ? safe.toFixed(0) : step >= 0.01 ? safe.toFixed(2) : safe.toFixed(3);

  return (
    <label className="glc-row">
      <span className="glc-label">{label}</span>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={safe}
        onChange={(event) => onChange(Number(event.target.value))}
      />
      <span className="glc-val">
        {shown}
        {suffix ?? ''}
      </span>
    </label>
  );
}

function Toggle({
  label,
  on,
  onChange,
}: {
  label: string;
  on: boolean;
  onChange: (next: boolean) => void;
}) {
  return (
    <div className="glc-toggle">
      <span className="glc-label">{label}</span>
      <button
        type="button"
        role="switch"
        aria-checked={on}
        className={on ? 'is-on' : undefined}
        onClick={() => onChange(!on)}
      >
        {on ? 'On' : 'Off'}
      </button>
    </div>
  );
}

export function GlassLabControls({ value, onChange }: Props) {
  const root = useRef<HTMLElement>(null);
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');
  const [looks, setLooks] = useState<GlassLook[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);

  useEffect(() => {
    const store = loadLooks();
    setLooks(store.looks);
    setActiveId(store.activeId);
    const active = store.looks.find((look) => look.id === store.activeId);
    if (active) onChange({ ...GLASS_V2_DEFAULTS, ...active.params });
    // Load saved look once on mount.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false);
    };
    const onPointerDown = (event: PointerEvent) => {
      const node = root.current;
      if (!node) return;
      if (event.target instanceof Node && node.contains(event.target)) return;
      setOpen(false);
    };
    window.addEventListener('keydown', onKey);
    window.addEventListener('pointerdown', onPointerDown);
    return () => {
      window.removeEventListener('keydown', onKey);
      window.removeEventListener('pointerdown', onPointerDown);
    };
  }, [open]);

  const set = <K extends keyof GlassParamsV2>(key: K, next: GlassParamsV2[K]) => {
    onChange({ ...value, [key]: next });
  };

  const persist = (store: { activeId: string | null; looks: GlassLook[] }) => {
    setLooks(store.looks);
    setActiveId(store.activeId);
  };

  return (
    <aside
      ref={root}
      className={open ? 'glc is-open' : 'glc'}
      data-glass-controls
    >
      <div className="glc-panel" hidden={!open}>
        <header className="glc-head">
          <p>Shaders</p>
          <div className="glc-head__actions">
            <button type="button" onClick={() => onChange(GLASS_V2_DEFAULTS)}>
              Reset
            </button>
            <button
              type="button"
              className="glc-min"
              aria-label="Minimize"
              onClick={() => setOpen(false)}
            >
              <span aria-hidden />
            </button>
          </div>
        </header>

        <section className="glc-saves">
          <h2>Looks</h2>
          <div className="glc-save-row">
            <input
              type="text"
              value={name}
              placeholder="Name this look"
              maxLength={28}
              onChange={(event) => setName(event.target.value)}
              onKeyDown={(event) => {
                if (event.key !== 'Enter') return;
                persist(saveLook(name, value));
                setName('');
              }}
            />
            <button
              type="button"
              className="glc-save"
              onClick={() => {
                persist(saveLook(name, value));
                setName('');
              }}
            >
              Save
            </button>
          </div>
          {looks.length === 0 ? (
            <p className="glc-empty">No saved looks yet</p>
          ) : (
            <ul className="glc-looks">
              {looks.map((look) => (
                <li key={look.id} className={look.id === activeId ? 'is-active' : undefined}>
                  <span>{look.name}</span>
                  <button
                    type="button"
                    onClick={() => {
                      persist(applyLook(look.id));
                      onChange({ ...GLASS_V2_DEFAULTS, ...look.params });
                    }}
                  >
                    Use
                  </button>
                  <button
                    type="button"
                    className="glc-del"
                    onClick={() => persist(deleteLook(look.id))}
                  >
                    Del
                  </button>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section>
          <h2>Mouse</h2>
          <Row label="Stiffness" min={8} max={90} step={1} value={value.stiffness} onChange={(n) => set('stiffness', n)} />
          <Row label="Damping" min={2} max={28} step={1} value={value.damping} onChange={(n) => set('damping', n)} />
          <Row label="Liquid" min={0} max={1.2} step={0.01} value={value.react} onChange={(n) => set('react', n)} />
        </section>

        <section>
          <h2>Light</h2>
          <Row label="Intensity" min={0} max={0.8} step={0.01} value={value.lightIntensity} onChange={(n) => set('lightIntensity', n)} />
          <Row label="Size" min={0.12} max={1} step={0.01} value={value.lightSize} onChange={(n) => set('lightSize', n)} />
          <Row label="Hue" min={140} max={220} step={1} value={value.lightHue} onChange={(n) => set('lightHue', n)} />
          <Row label="Hover dim" min={0.35} max={1} step={0.01} value={value.hoverDim} onChange={(n) => set('hoverDim', n)} />
          <Row label="Inner glow" min={0} max={0.4} step={0.01} value={value.innerGlow} onChange={(n) => set('innerGlow', n)} />
          <Row label="Stack" min={0} max={0.6} step={0.01} value={value.stack} onChange={(n) => set('stack', n)} />
          <Row label="Spill" min={0} max={0.25} step={0.01} value={value.spill} onChange={(n) => set('spill', n)} />
        </section>

        <section>
          <h2>Edges</h2>
          <Row label="React" min={0} max={1.4} step={0.01} value={value.edgeReact} onChange={(n) => set('edgeReact', n)} />
          <Row label="Width" min={1} max={18} step={0.5} value={value.edgeWidth} onChange={(n) => set('edgeWidth', n)} />
          <Row label="Reach" min={0} max={1} step={0.01} value={value.edgeReach} onChange={(n) => set('edgeReach', n)} />
          <Row label="Top" min={0} max={0.8} step={0.01} value={value.edgeTop} onChange={(n) => set('edgeTop', n)} />
          <Row label="Base rim" min={0} max={0.8} step={0.01} value={value.rim} onChange={(n) => set('rim', n)} />
        </section>

        <section>
          <h2>Pill</h2>
          <Row label="Width" min={180} max={360} step={1} value={value.pillW} suffix="px" onChange={(n) => set('pillW', n)} />
          <Row label="Height" min={40} max={72} step={1} value={value.pillH} suffix="px" onChange={(n) => set('pillH', n)} />
          <Row label="Tint" min={0} max={0.4} step={0.01} value={value.tint} onChange={(n) => set('tint', n)} />
        </section>

        <section>
          <h2>Inner pill</h2>
          <Toggle
            label="Visible"
            on={(value.innerVis ?? 1) >= 0.5}
            onChange={(on) => set('innerVis', on ? 1 : 0)}
          />
          <Row label="Amount" min={0} max={1} step={0.01} value={value.innerAmt} onChange={(n) => set('innerAmt', n)} />
          <Row label="Inset" min={2} max={18} step={0.5} value={value.innerInset} suffix="px" onChange={(n) => set('innerInset', n)} />
          <Row label="Blur" min={2} max={22} step={0.5} value={value.innerBlur} suffix="px" onChange={(n) => set('innerBlur', n)} />
          <Row label="Hue" min={0} max={360} step={1} value={value.innerHue} onChange={(n) => set('innerHue', n)} />
          <Row label="Near" min={0} max={1} step={0.01} value={value.innerNear} onChange={(n) => set('innerNear', n)} />
          <Row label="Spread" min={0} max={1} step={0.01} value={value.innerSpread} onChange={(n) => set('innerSpread', n)} />
          <Row label="Follow" min={0} max={1} step={0.01} value={value.innerFollow} onChange={(n) => set('innerFollow', n)} />
          <Row label="React" min={0} max={1.2} step={0.01} value={value.innerReact} onChange={(n) => set('innerReact', n)} />
          <Row label="Light" min={0} max={1.6} step={0.01} value={value.innerLight} onChange={(n) => set('innerLight', n)} />
          <Row label="Frost" min={0} max={1} step={0.01} value={value.innerFrost} onChange={(n) => set('innerFrost', n)} />
        </section>

        <section>
          <h2>Glass</h2>
          <Row label="Refract" min={0} max={0.05} step={0.001} value={value.refraction} onChange={(n) => set('refraction', n)} />
          <Row label="Magnify" min={0} max={0.16} step={0.005} value={value.magnify} onChange={(n) => set('magnify', n)} />
          <Row label="Frost" min={0} max={1} step={0.01} value={value.frost} onChange={(n) => set('frost', n)} />
          <Row label="Grain" min={0} max={0.04} step={0.001} value={value.grain} onChange={(n) => set('grain', n)} />
        </section>
      </div>

      <button
        type="button"
        className="glc-fab"
        aria-label={open ? 'Minimize shader controls' : 'Open shader controls'}
        aria-expanded={open}
        onClick={() => setOpen((prev) => !prev)}
      >
        <span className="glc-fab__bars" aria-hidden>
          <i />
          <i />
          <i />
        </span>
      </button>
    </aside>
  );
}
