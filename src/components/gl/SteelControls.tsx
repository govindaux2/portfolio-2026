import { STEEL_DEFAULTS, STEEL_SHAPES, type SteelParams } from './steelParams';
import './steel-controls.css';

type Props = {
  value: SteelParams;
  onChange: (next: SteelParams) => void;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

function Row({
  label,
  min,
  max,
  step,
  value,
  onChange,
}: {
  label: string;
  min: number;
  max: number;
  step: number;
  value: number;
  onChange: (n: number) => void;
}) {
  const shown =
    step >= 1 ? value.toFixed(0) : step >= 0.01 ? value.toFixed(2) : value.toFixed(3);
  return (
    <div className="steel-controls__row">
      <label>{label}</label>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
      />
      <span className="steel-controls__val">{shown}</span>
    </div>
  );
}

function ColorRow({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (hex: string) => void;
}) {
  return (
    <div className="steel-controls__row steel-controls__row--color">
      <label>{label}</label>
      <input
        type="color"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
}

function Switch({
  label,
  on,
  onChange,
}: {
  label: string;
  on: boolean;
  onChange: (next: boolean) => void;
}) {
  return (
    <div className="steel-controls__switch">
      <span>{label}</span>
      <button
        type="button"
        className={on ? 'is-on' : undefined}
        aria-pressed={on}
        onClick={() => onChange(!on)}
      >
        {on ? 'On' : 'Off'}
      </button>
    </div>
  );
}

export function SteelControls({ value, onChange, open, onOpenChange }: Props) {
  const set = <K extends keyof SteelParams>(key: K, next: SteelParams[K]) =>
    onChange({ ...value, [key]: next });

  if (!open) {
    return (
      <div className="steel-controls">
        <button
          type="button"
          className="steel-controls__fab"
          aria-label="Open steel controls"
          onClick={() => onOpenChange(true)}
        >
          <span />
        </button>
      </div>
    );
  }

  return (
    <div className="steel-controls">
      <div className="steel-controls__panel">
        <div className="steel-controls__head">
          <p>Stainless Steel 1</p>
          <div className="steel-controls__actions">
            <button type="button" onClick={() => onChange(STEEL_DEFAULTS)}>
              Reset
            </button>
            <button
              type="button"
              className="steel-controls__min"
              aria-label="Close controls"
              onClick={() => onOpenChange(false)}
            >
              <i />
            </button>
          </div>
        </div>

        <section>
          <h3>Look</h3>
          <Row
            label="Grain"
            min={0}
            max={1}
            step={0.01}
            value={value.grain}
            onChange={(n) => set('grain', n)}
          />
          <Row
            label="Auto rotate"
            min={0}
            max={2}
            step={0.01}
            value={value.autoRotate}
            onChange={(n) => set('autoRotate', n)}
          />
          <Row
            label="Seed"
            min={0}
            max={200}
            step={1}
            value={value.seed}
            onChange={(n) => set('seed', n)}
          />
        </section>

        <section>
          <h3>Shape</h3>
          <div className="steel-controls__row steel-controls__row--color">
            <label>Type</label>
            <select
              value={value.shapeType}
              onChange={(e) =>
                set('shapeType', e.target.value as SteelParams['shapeType'])
              }
            >
              {STEEL_SHAPES.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>
          <Row
            label="Scale"
            min={0.4}
            max={2.2}
            step={0.01}
            value={value.scale}
            onChange={(n) => set('scale', n)}
          />
          <Row
            label="Rotation"
            min={0}
            max={360}
            step={1}
            value={value.rotation}
            onChange={(n) => set('rotation', n)}
          />
          <Row
            label="Radius"
            min={0.06}
            max={0.42}
            step={0.002}
            value={value.radius}
            onChange={(n) => set('radius', n)}
          />
          <Row
            label="Tube"
            min={0.02}
            max={0.16}
            step={0.002}
            value={value.tube}
            onChange={(n) => set('tube', n)}
          />
          <Row
            label="Length"
            min={0.02}
            max={0.28}
            step={0.002}
            value={value.length}
            onChange={(n) => set('length', n)}
          />
          <Row
            label="Height"
            min={0.06}
            max={0.4}
            step={0.002}
            value={value.height}
            onChange={(n) => set('height', n)}
          />
          <Row
            label="Size X"
            min={0.08}
            max={0.4}
            step={0.002}
            value={value.sizeX}
            onChange={(n) => set('sizeX', n)}
          />
          <Row
            label="Size Y"
            min={0.08}
            max={0.4}
            step={0.002}
            value={value.sizeY}
            onChange={(n) => set('sizeY', n)}
          />
          <Row
            label="Size Z"
            min={0.08}
            max={0.4}
            step={0.002}
            value={value.sizeZ}
            onChange={(n) => set('sizeZ', n)}
          />
          <Row
            label="Rounding"
            min={0}
            max={0.12}
            step={0.002}
            value={value.rounding}
            onChange={(n) => set('rounding', n)}
          />
          <Row
            label="Rot X"
            min={-180}
            max={180}
            step={1}
            value={value.rotX}
            onChange={(n) => set('rotX', n)}
          />
          <Row
            label="Rot Y"
            min={-180}
            max={180}
            step={1}
            value={value.rotY}
            onChange={(n) => set('rotY', n)}
          />
          <Row
            label="Rot Z"
            min={-180}
            max={180}
            step={1}
            value={value.rotZ}
            onChange={(n) => set('rotZ', n)}
          />
          <Switch
            label="Follow pointer"
            on={value.followPointer}
            onChange={(n) => set('followPointer', n)}
          />
        </section>

        <section>
          <h3>Metal</h3>
          <ColorRow
            label="Tint"
            value={value.tint}
            onChange={(n) => set('tint', n)}
          />
          <ColorRow
            label="Warm"
            value={value.warmColor}
            onChange={(n) => set('warmColor', n)}
          />
          <ColorRow
            label="Cool"
            value={value.coolColor}
            onChange={(n) => set('coolColor', n)}
          />
        </section>

        <section>
          <h3>Surface</h3>
          <Row
            label="Bevel W"
            min={0}
            max={0.16}
            step={0.001}
            value={value.bevelWidth}
            onChange={(n) => set('bevelWidth', n)}
          />
          <Row
            label="Bevel"
            min={0}
            max={1}
            step={0.01}
            value={value.bevelShape}
            onChange={(n) => set('bevelShape', n)}
          />
          <Row
            label="Curve"
            min={0}
            max={1}
            step={0.01}
            value={value.curvature}
            onChange={(n) => set('curvature', n)}
          />
          <Row
            label="Wave"
            min={0}
            max={1}
            step={0.01}
            value={value.waviness}
            onChange={(n) => set('waviness', n)}
          />
          <Row
            label="Softness"
            min={0}
            max={1}
            step={0.01}
            value={value.softness}
            onChange={(n) => set('softness', n)}
          />
          <Row
            label="Edge"
            min={0}
            max={0.2}
            step={0.001}
            value={value.edgeSoftness}
            onChange={(n) => set('edgeSoftness', n)}
          />
        </section>

        <section>
          <h3>Studio</h3>
          <Row
            label="Env"
            min={0}
            max={2}
            step={0.01}
            value={value.environment}
            onChange={(n) => set('environment', n)}
          />
          <Row
            label="Env rot"
            min={0}
            max={360}
            step={1}
            value={value.envRotation}
            onChange={(n) => set('envRotation', n)}
          />
          <Row
            label="Spectral"
            min={0}
            max={1}
            step={0.01}
            value={value.spectral}
            onChange={(n) => set('spectral', n)}
          />
          <Row
            label="Disperse"
            min={0}
            max={1}
            step={0.01}
            value={value.dispersion}
            onChange={(n) => set('dispersion', n)}
          />
          <Row
            label="Shadows"
            min={0}
            max={1}
            step={0.01}
            value={value.shadows}
            onChange={(n) => set('shadows', n)}
          />
          <Row
            label="Orbit"
            min={0}
            max={4}
            step={0.01}
            value={value.speed}
            onChange={(n) => set('speed', n)}
          />
        </section>

        <section>
          <h3>Grain</h3>
          <Row
            label="Strength"
            min={0}
            max={1}
            step={0.01}
            value={value.grain}
            onChange={(n) => set('grain', n)}
          />
          <Row
            label="Bias"
            min={0}
            max={4}
            step={0.05}
            value={value.grainBias}
            onChange={(n) => set('grainBias', n)}
          />
          <Switch
            label="Animated grain"
            on={value.grainAnimated}
            onChange={(n) => set('grainAnimated', n)}
          />
        </section>
      </div>
    </div>
  );
}
