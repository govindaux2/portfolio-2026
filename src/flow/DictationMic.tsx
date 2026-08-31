import { MicIcon } from './icons';

export function DictationMic({
  listening,
  onToggle,
  label,
  onArm,
}: {
  listening: boolean;
  onToggle: () => void;
  label: string;
  onArm?: () => void;
}) {
  return (
    <button
      type="button"
      className={`flow-dictation-mic nodrag nopan${listening ? ' is-on' : ''}`}
      aria-label={listening ? `Stop ${label} dictation` : `Dictate ${label}`}
      aria-pressed={listening}
      title={listening ? 'Stop listening' : `Dictate ${label}`}
      onPointerDown={(e) => {
        e.preventDefault();
        e.stopPropagation();
        onArm?.();
      }}
      onClick={(e) => {
        e.stopPropagation();
        onToggle();
      }}
    >
      <MicIcon size={14} />
    </button>
  );
}

export function ListeningChip({ field }: { field: string }) {
  return (
    <span className="flow-listening" aria-live="polite">
      Listening · {field} · tap mic to stop
    </span>
  );
}
