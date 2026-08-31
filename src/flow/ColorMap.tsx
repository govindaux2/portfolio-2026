import { useRef } from 'react';
import { COLOR_SWATCHES, hexToRgb, hsvToHex, parseColor, rgbToHsv, toColor } from './color';

type Props = {
  value?: string;
  onChange: (color: string) => void;
  hideHex?: boolean;
};

export function ColorMap({ value, onChange, hideHex }: Props) {
  const parsed = parseColor(value);
  const { r, g, b } = hexToRgb(parsed.hex);
  const hsv = rgbToHsv(r, g, b);
  const mapRef = useRef<HTMLDivElement>(null);
  const hueRef = useRef<HTMLDivElement>(null);
  const hueFill = hsvToHex(hsv.h, 1, 1);

  const pickMap = (clientX: number, clientY: number) => {
    const el = mapRef.current;
    if (!el) return;
    const box = el.getBoundingClientRect();
    const s = Math.min(1, Math.max(0, (clientX - box.left) / box.width));
    const v = Math.min(1, Math.max(0, 1 - (clientY - box.top) / box.height));
    onChange(toColor(hsvToHex(hsv.h, s, v), parsed.a || 1));
  };

  const pickHue = (clientX: number) => {
    const el = hueRef.current;
    if (!el) return;
    const box = el.getBoundingClientRect();
    const h = Math.min(359, Math.max(0, ((clientX - box.left) / box.width) * 360));
    onChange(toColor(hsvToHex(h, hsv.s || 1, hsv.v || 1), parsed.a || 1));
  };

  const drag = (
    _el: HTMLElement | null,
    move: (x: number, y: number) => void
  ) => {
    const onMove = (e: PointerEvent) => move(e.clientX, e.clientY);
    const onUp = () => {
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onUp);
    };
    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', onUp);
  };

  return (
    <div className="flow-colormap">
      <div
        ref={mapRef}
        className="flow-colormap-sv"
        style={{ background: hueFill }}
        onPointerDown={(e) => {
          (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
          pickMap(e.clientX, e.clientY);
          drag(mapRef.current, pickMap);
        }}
      >
        <span
          className="flow-colormap-knob"
          style={{ left: `${hsv.s * 100}%`, top: `${(1 - hsv.v) * 100}%` }}
        />
      </div>
      <div
        ref={hueRef}
        className="flow-colormap-hue"
        onPointerDown={(e) => {
          (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
          pickHue(e.clientX);
          drag(hueRef.current, (x) => pickHue(x));
        }}
      >
        <span className="flow-colormap-knob" style={{ left: `${(hsv.h / 360) * 100}%` }} />
      </div>
      {hideHex ? null : (
        <div className="flow-colormap-meta">
          <input
            className="flow-field-input is-hex"
            value={parsed.hex}
            onChange={(e) => {
              const next = e.target.value.trim();
              if (/^#([0-9a-f]{6})$/i.test(next)) onChange(toColor(next, parsed.a || 1));
            }}
            spellCheck={false}
            aria-label="Hex color"
          />
        </div>
      )}
      <div className="flow-swatches">
        {COLOR_SWATCHES.map((c) => (
          <button
            key={c}
            type="button"
            className={`flow-swatch${parsed.hex.toLowerCase() === c.toLowerCase() ? ' is-on' : ''}`}
            style={{ background: c }}
            onClick={() => onChange(toColor(c, parsed.a || 1))}
          />
        ))}
      </div>
    </div>
  );
}
