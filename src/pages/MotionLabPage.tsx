import { useState, type CSSProperties } from 'react';
import { Nav } from '../components/Nav';
import './motion-lab.css';

type Dir = 'left' | 'right' | 'up' | 'down';
type Knob = 'speed' | 'travel' | 'scale' | 'corners' | 'pieces' | 'from' | 'feel' | 'color';

const FEELS = [
  { id: 'gentle', name: 'Gentle', ease: 'cubic-bezier(0.22, 1, 0.36, 1)' },
  { id: 'smooth', name: 'Smooth', ease: 'cubic-bezier(0.45, 0, 0.2, 1)' },
  { id: 'snappy', name: 'Snappy', ease: 'cubic-bezier(0.16, 1, 0.3, 1)' },
  { id: 'bounce', name: 'Bouncy', ease: 'cubic-bezier(0.34, 1.45, 0.64, 1)' },
  { id: 'soft', name: 'Soft', ease: 'cubic-bezier(0.4, 0, 0.6, 1)' },
] as const;

const COLORS = [
  { id: 'cream', name: 'Cream', bg: '#f4f1ea', fg: '#161614' },
  { id: 'ink', name: 'Ink', bg: '#171715', fg: '#f4f1ea' },
  { id: 'coral', name: 'Coral', bg: '#ff6a45', fg: '#1c0c08' },
  { id: 'blue', name: 'Blue', bg: '#9ebfff', fg: '#0c1830' },
  { id: 'lime', name: 'Lime', bg: '#d6f25c', fg: '#172008' },
] as const;

const DIRS: { id: Dir; name: string }[] = [
  { id: 'left', name: 'Left' },
  { id: 'right', name: 'Right' },
  { id: 'up', name: 'Top' },
  { id: 'down', name: 'Bottom' },
];

const STYLES: { id: string; name: string; note: string; knobs: Knob[] }[] = [
  { id: 'wipe', name: 'Wipe', note: 'A panel uncovers from one edge.', knobs: ['speed', 'scale', 'corners', 'from', 'feel', 'color'] },
  { id: 'iris', name: 'Iris', note: 'A circle opens on the card.', knobs: ['speed', 'scale', 'corners', 'feel', 'color'] },
  { id: 'lines', name: 'Lines', note: 'Lines arrive one after another.', knobs: ['speed', 'travel', 'pieces', 'feel', 'color'] },
  { id: 'blob', name: 'Blob', note: 'A soft shape settles into a card.', knobs: ['speed', 'scale', 'corners', 'feel', 'color'] },
  { id: 'push', name: 'Push', note: 'The card enters and clips its trailing edge.', knobs: ['speed', 'travel', 'corners', 'from', 'feel', 'color'] },
  { id: 'pop', name: 'Pop', note: 'It scales up and lands.', knobs: ['speed', 'scale', 'corners', 'feel', 'color'] },
  { id: 'flip', name: 'Flip', note: 'It turns in, like a card flipping over.', knobs: ['speed', 'scale', 'from', 'feel', 'color'] },
  { id: 'unfold', name: 'Unfold', note: 'It opens from a folded edge.', knobs: ['speed', 'scale', 'from', 'feel', 'color'] },
  { id: 'curtain', name: 'Curtain', note: 'Two panels close in from the sides.', knobs: ['speed', 'corners', 'feel', 'color'] },
  { id: 'blinds', name: 'Blinds', note: 'Strips open across the frame.', knobs: ['speed', 'pieces', 'from', 'feel', 'color'] },
  { id: 'typing', name: 'Typing', note: 'The words appear one beat at a time.', knobs: ['speed', 'pieces', 'feel', 'color'] },
  { id: 'letters', name: 'Letters', note: 'Each letter tilts in from the edge you pick.', knobs: ['speed', 'travel', 'pieces', 'from', 'feel', 'color'] },
  { id: 'scribble', name: 'Scribble', note: 'A line draws the frame.', knobs: ['speed', 'scale', 'corners', 'feel', 'color'] },
  { id: 'diagonal', name: 'Diagonal', note: 'A slanted mask sweeps across.', knobs: ['speed', 'corners', 'from', 'feel', 'color'] },
  { id: 'drift', name: 'Drift', note: 'A slow zoom and slide, like a still camera.', knobs: ['speed', 'travel', 'scale', 'from', 'feel', 'color'] },
  { id: 'hinge', name: 'Hinge', note: 'It swings in from the edge you pick.', knobs: ['speed', 'travel', 'from', 'feel', 'color'] },
  { id: 'orbit', name: 'Orbit', note: 'It travels around a point, then lands.', knobs: ['speed', 'travel', 'scale', 'feel', 'color'] },
  { id: 'ripple', name: 'Ripple', note: 'Rings expand and fade.', knobs: ['speed', 'pieces', 'scale', 'feel', 'color'] },
  { id: 'split', name: 'Split', note: 'Two words arrive from opposite sides.', knobs: ['speed', 'travel', 'feel', 'color'] },
  { id: 'skew', name: 'Skew', note: 'It leans, then stands straight.', knobs: ['speed', 'travel', 'from', 'feel', 'color'] },
  { id: 'sheet', name: 'Sheet', note: 'A panel slides in over the frame.', knobs: ['speed', 'corners', 'from', 'feel', 'color'] },
  { id: 'grow', name: 'Grow', note: 'A small mark becomes the card.', knobs: ['speed', 'scale', 'corners', 'feel', 'color'] },
  { id: 'corner', name: 'Corner', note: 'The frame opens from one corner.', knobs: ['speed', 'corners', 'from', 'feel', 'color'] },
  { id: 'crossfade', name: 'Crossfade', note: 'One frame leaves as the next arrives.', knobs: ['speed', 'travel', 'feel', 'color'] },
  { id: 'bounce', name: 'Bounce', note: 'It lands and settles.', knobs: ['speed', 'travel', 'from', 'feel', 'color'] },
  { id: 'overshoot', name: 'Overshoot', note: 'It goes a little too far, then rests.', knobs: ['speed', 'scale', 'corners', 'feel', 'color'] },
  { id: 'spotlight', name: 'Spotlight', note: 'A pool of light widens over the card.', knobs: ['speed', 'scale', 'from', 'feel', 'color'] },
  { id: 'snap', name: 'Snap', note: 'It jumps forward in even beats.', knobs: ['speed', 'travel', 'pieces', 'from', 'color'] },
  { id: 'swing', name: 'Swing', note: 'It hangs from an edge and rocks to still.', knobs: ['speed', 'travel', 'from', 'feel', 'color'] },
  { id: 'tiles', name: 'Tiles', note: 'A mosaic builds itself.', knobs: ['speed', 'travel', 'pieces', 'feel', 'color'] },
];

const LINES = ['Make it playful', 'Keep it light', 'Show the work', 'One idea', 'Then the next', 'Hold the frame'];
const WORD = 'PLAYGROUND';

const CLIP: Record<Dir, string> = {
  left: 'inset(0 100% 0 0)',
  right: 'inset(0 0 0 100%)',
  up: 'inset(100% 0 0 0)',
  down: 'inset(0 0 100% 0)',
};

const POLY: Record<Dir, string> = {
  left: 'polygon(0 0, 0 0, 0 100%, 0 100%)',
  right: 'polygon(100% 0, 100% 0, 100% 100%, 100% 100%)',
  up: 'polygon(0 0, 100% 0, 100% 0, 0 0)',
  down: 'polygon(0 100%, 100% 100%, 100% 100%, 0 100%)',
};

const CORNER: Record<Dir, string> = {
  left: 'polygon(0 0, 0 0, 0 0, 0 0)',
  right: 'polygon(100% 0, 100% 0, 100% 0, 100% 0)',
  up: 'polygon(0 0, 0 0, 0 0, 0 0)',
  down: 'polygon(0 100%, 0 100%, 0 100%, 0 100%)',
};

function speedWord(value: number) {
  if (value < 0.55) return 'Quick';
  if (value < 0.95) return 'Steady';
  if (value < 1.35) return 'Unhurried';
  return 'Slow';
}

function travelWord(value: number) {
  if (value < 28) return 'Short';
  if (value < 70) return 'Medium';
  return 'Far';
}

function scaleWord(value: number) {
  if (value < 0.9) return 'Small';
  if (value < 1.12) return 'Natural';
  return 'Big';
}

function cornerWord(value: number) {
  if (value < 8) return 'Sharp';
  if (value < 28) return 'Soft';
  return 'Round';
}

export function MotionLabPage() {
  const systemQuiet = useState(
    () => window.matchMedia('(prefers-reduced-motion: reduce)').matches,
  )[0];
  const [allowMotion, setAllowMotion] = useState(!systemQuiet);
  const [styleId, setStyleId] = useState('wipe');
  const [play, setPlay] = useState(0);
  const [live, setLive] = useState('Wipe. A panel uncovers from one edge.');
  const [speed, setSpeed] = useState(0.85);
  const [travel, setTravel] = useState(48);
  const [scale, setScale] = useState(1);
  const [corners, setCorners] = useState(18);
  const [pieces, setPieces] = useState(4);
  const [from, setFrom] = useState<Dir>('left');
  const [feelId, setFeelId] = useState<(typeof FEELS)[number]['id']>('snappy');
  const [colorId, setColorId] = useState<(typeof COLORS)[number]['id']>('cream');

  const style = STYLES.find((item) => item.id === styleId) ?? STYLES[0];
  const feel = FEELS.find((item) => item.id === feelId) ?? FEELS[2];
  const color = COLORS.find((item) => item.id === colorId) ?? COLORS[0];
  const has = (knob: Knob) => style.knobs.includes(knob);

  const signed = from === 'left' || from === 'up' ? -1 : 1;
  const tx = from === 'left' ? -travel : from === 'right' ? travel : 0;
  const ty = from === 'up' ? -travel : from === 'down' ? travel : 0;
  const sheetX = from === 'left' ? '-110%' : from === 'right' ? '110%' : '0px';
  const sheetY = from === 'up' ? '-110%' : from === 'down' ? '110%' : '0px';

  function replay(message: string) {
    setPlay((n) => n + 1);
    setLive(message);
  }

  const vars = {
    '--t': `${speed}s`,
    '--d': `${travel}px`,
    '--s': String(scale),
    '--r': `${corners}px`,
    '--tx': style.id === 'sheet' ? sheetX : `${tx}px`,
    '--ty': style.id === 'sheet' ? sheetY : `${ty}px`,
    '--angle': `${signed * Math.min(48, Math.round(travel / 2))}deg`,
    '--clip': CLIP[from],
    '--poly': style.id === 'corner' ? CORNER[from] : POLY[from],
    '--ease': feel.ease,
    '--bg': color.bg,
    '--fg': color.fg,
    '--steps': String(pieces),
  } as CSSProperties;

  return (
    <main className={allowMotion ? 'motion-lab' : 'motion-lab is-quiet'}>
      <Nav variant="inner" />
      <header className="motion-lab-head">
        <p className="motion-lab-kicker">Lab</p>
        <h1>Motion presets</h1>
        <p>
          Pick a style, then use the sliders. Press Play to see it again. {STYLES.length} styles,
          each with its own movement.
        </p>
      </header>

      <div className="motion-lab-styles" role="radiogroup" aria-label="Motion style">
        {STYLES.map((item) => (
          <label key={item.id} className="choice">
            <input
              type="radio"
              name="motion-style"
              value={item.id}
              checked={item.id === style.id}
              onChange={() => {
                setStyleId(item.id);
                replay(`${item.name}. ${item.note}`);
              }}
            />
            <span>{item.name}</span>
          </label>
        ))}
      </div>

      <section className="motion-stage" aria-label="Preview">
        <div className="stage-frame">
          <div
            key={`${style.id}-${play}`}
            className={`actor actor-${style.id}`}
            data-from={from}
            style={vars}
          >
            <Actor styleId={style.id} pieces={pieces} corners={corners} speed={speed} />
          </div>
        </div>
        <p className="motion-lab-note">{style.note}</p>
        <div className="motion-lab-actions">
          <button type="button" onClick={() => replay(`Playing ${style.name} again. ${style.note}`)}>
            Play
          </button>
          {systemQuiet ? (
            <button type="button" onClick={() => setAllowMotion((on) => !on)}>
              {allowMotion ? 'Turn motion off' : 'Turn motion on'}
            </button>
          ) : null}
        </div>
      </section>

      <section className="motion-controls" aria-label="Adjust">
        <h2>Adjust</h2>
        <p className="motion-lab-note">Tab to a control. Arrow keys move a slider. Let go to play it.</p>
        <div className="knob-grid">
          {has('speed') ? (
            <Slider
              label="Speed"
              min={0.35}
              max={1.8}
              step={0.05}
              value={speed}
              display={speedWord(speed)}
              onChange={setSpeed}
              onDone={() => replay(`${style.name}, ${speedWord(speed).toLowerCase()} speed.`)}
            />
          ) : null}
          {has('travel') ? (
            <Slider
              label="Travel"
              min={8}
              max={120}
              step={1}
              value={travel}
              display={travelWord(travel)}
              onChange={setTravel}
              onDone={() => replay(`${style.name}, ${travelWord(travel).toLowerCase()} travel.`)}
            />
          ) : null}
          {has('scale') ? (
            <Slider
              label="Size"
              min={0.7}
              max={1.35}
              step={0.01}
              value={scale}
              display={scaleWord(scale)}
              onChange={setScale}
              onDone={() => replay(`${style.name}, ${scaleWord(scale).toLowerCase()} size.`)}
            />
          ) : null}
          {has('corners') ? (
            <Slider
              label="Corners"
              min={0}
              max={48}
              step={1}
              value={corners}
              display={cornerWord(corners)}
              onChange={setCorners}
              onDone={() => replay(`${style.name}, ${cornerWord(corners).toLowerCase()} corners.`)}
            />
          ) : null}
          {has('pieces') ? (
            <Slider
              label="Pieces"
              min={style.id === 'typing' || style.id === 'letters' ? 3 : 2}
              max={style.id === 'typing' || style.id === 'letters' ? 10 : style.id === 'lines' ? 6 : 8}
              step={1}
              value={pieces}
              display={`${pieces} pieces`}
              onChange={setPieces}
              onDone={() => replay(`${style.name}, ${pieces} pieces.`)}
            />
          ) : null}
        </div>

        {has('from') ? (
          <fieldset className="choice-row">
            <legend>Comes from</legend>
            {DIRS.map((dir) => (
              <label key={dir.id} className="choice">
                <input
                  type="radio"
                  name="motion-from"
                  value={dir.id}
                  checked={from === dir.id}
                  onChange={() => {
                    setFrom(dir.id);
                    replay(`${style.name} comes from the ${dir.name.toLowerCase()}.`);
                  }}
                />
                <span>{dir.name}</span>
              </label>
            ))}
          </fieldset>
        ) : null}

        {has('feel') ? (
          <fieldset className="choice-row">
            <legend>Feel</legend>
            {FEELS.map((item) => (
              <label key={item.id} className="choice">
                <input
                  type="radio"
                  name="motion-feel"
                  value={item.id}
                  checked={feel.id === item.id}
                  onChange={() => {
                    setFeelId(item.id);
                    replay(`${style.name} feels ${item.name.toLowerCase()}.`);
                  }}
                />
                <span>{item.name}</span>
              </label>
            ))}
          </fieldset>
        ) : null}

        <fieldset className="choice-row">
          <legend>Color</legend>
          {COLORS.map((item) => (
            <label key={item.id} className="choice">
              <input
                type="radio"
                name="motion-color"
                value={item.id}
                checked={color.id === item.id}
                onChange={() => setColorId(item.id)}
              />
              <span className="swatch" style={{ background: item.bg, color: item.fg }}>
                {item.name}
              </span>
            </label>
          ))}
        </fieldset>
      </section>
      <p className="sr-only" aria-live="polite">
        {live}
      </p>
    </main>
  );
}

function Slider({
  label,
  min,
  max,
  step,
  value,
  display,
  onChange,
  onDone,
}: {
  label: string;
  min: number;
  max: number;
  step: number;
  value: number;
  display: string;
  onChange: (value: number) => void;
  onDone: () => void;
}) {
  return (
    <label className="knob">
      <span className="knob-label">{label}</span>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        aria-valuetext={display}
        onChange={(event) => onChange(Number(event.target.value))}
        onPointerUp={onDone}
        onKeyUp={onDone}
      />
      <span className="knob-value">{display}</span>
    </label>
  );
}

function Actor({
  styleId,
  pieces,
  corners,
  speed,
}: {
  styleId: string;
  pieces: number;
  corners: number;
  speed: number;
}) {
  const count = Math.round(pieces);
  const delay = (index: number) => ({ animationDelay: `${index * speed * 0.12}s` });

  if (styleId === 'lines') {
    return (
      <div className="stack">
        {LINES.slice(0, Math.max(2, Math.min(6, count))).map((line, index) => (
          <span key={line} className="line" style={delay(index)}>
            {line}
          </span>
        ))}
      </div>
    );
  }

  if (styleId === 'letters') {
    const text = WORD.slice(0, Math.max(3, Math.min(10, count)));
    return (
      <p className="letter-row">
        {text.split('').map((letter, index) => (
          <span
            key={`${letter}-${index}`}
            className="letter"
            style={{ ...delay(index), ['--spin' as string]: `${index % 2 === 0 ? -10 : 10}deg` }}
          >
            {letter}
          </span>
        ))}
      </p>
    );
  }

  if (styleId === 'typing') {
    const text = WORD.slice(0, Math.max(3, Math.min(10, count)));
    return (
      <p className="type-row">
        <span className="type-word" style={{ animationTimingFunction: `steps(${text.length}, end)` }}>
          {text}
        </span>
      </p>
    );
  }

  if (styleId === 'blinds') {
    const n = Math.max(2, Math.min(8, count));
    return (
      <div className="strips">
        {Array.from({ length: n }, (_, index) => (
          <span key={index} className="strip" style={delay(index)} />
        ))}
      </div>
    );
  }

  if (styleId === 'tiles') {
    const n = Math.max(2, Math.min(8, count));
    const cols = n <= 4 ? 2 : n <= 6 ? 3 : 4;
    return (
      <div className="tiles" style={{ gridTemplateColumns: `repeat(${cols}, 1fr)` }}>
        {Array.from({ length: n }, (_, index) => (
          <span key={index} className="tile" style={delay(index)} />
        ))}
      </div>
    );
  }

  if (styleId === 'ripple') {
    const n = Math.max(2, Math.min(6, count));
    return (
      <div className="ripples">
        {Array.from({ length: n }, (_, index) => (
          <span key={index} className="ring" style={delay(index)} />
        ))}
        <span className="dot">Ripple</span>
      </div>
    );
  }

  if (styleId === 'curtain') {
    return (
      <>
        <div className="panel">Open</div>
        <div className="panel panel-alt">Close</div>
      </>
    );
  }

  if (styleId === 'split') {
    return (
      <p className="split-row">
        <span>Learn</span>
        <span>play</span>
      </p>
    );
  }

  if (styleId === 'crossfade') {
    return (
      <>
        <div className="card card-back">
          <p>Before</p>
          <strong>Frame</strong>
        </div>
        <div className="card card-front">
          <p>After</p>
          <strong>Frame</strong>
        </div>
      </>
    );
  }

  if (styleId === 'scribble') {
    return (
      <div className="scribble-wrap">
        <svg viewBox="0 0 200 120" className="scribble" aria-hidden="true">
          <rect
            x="6"
            y="6"
            width="188"
            height="108"
            rx={Math.min(48, corners)}
            pathLength="1"
          />
        </svg>
        <strong>Draw</strong>
      </div>
    );
  }

  if (styleId === 'drift') {
    return (
      <div className="card drift-card">
        <p>Still</p>
        <strong>Drift</strong>
      </div>
    );
  }

  return (
    <div
      className="card"
      style={styleId === 'snap' ? { animationTimingFunction: `steps(${count}, end)` } : undefined}
    >
      <p>Case study</p>
      <strong>{STYLES.find((item) => item.id === styleId)?.name}</strong>
    </div>
  );
}
