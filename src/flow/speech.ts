export function flowToast(message: string) {
  if (typeof window === 'undefined') return;
  window.dispatchEvent(new CustomEvent('flow-toast', { detail: message }));
}

export function composeTranscript(
  original: string,
  transcript: string,
  mode: 'replace' | 'insert',
  start: number,
  end: number,
  placeholders: string[]
) {
  const piece = transcript.replace(/\s+/g, ' ').trim();
  if (!piece) return original;
  const trimmed = original.trim();
  const empty =
    !trimmed || placeholders.some((p) => p.toLowerCase() === trimmed.toLowerCase());
  if (mode === 'replace' || empty) return piece;
  const from = Math.max(0, Math.min(start, original.length));
  const to = Math.max(from, Math.min(end, original.length));
  const before = original.slice(0, from);
  const after = original.slice(to);
  const left = before && !/\s$/.test(before) ? ' ' : '';
  const right = after && !/^\s/.test(after) ? ' ' : '';
  return `${before}${left}${piece}${right}${after}`;
}

type Rec = {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start: () => void;
  stop: () => void;
  abort: () => void;
  onresult: ((ev: { results: ArrayLike<{ isFinal: boolean; 0: { transcript: string } }> }) => void) | null;
  onerror: ((ev: { error: string }) => void) | null;
  onend: (() => void) | null;
};

export function createSpeechRec(): Rec | undefined {
  if (typeof window === 'undefined') return undefined;
  const w = window as Window & {
    SpeechRecognition?: new () => Rec;
    webkitSpeechRecognition?: new () => Rec;
  };
  const Ctor = w.SpeechRecognition || w.webkitSpeechRecognition;
  if (!Ctor) return undefined;
  const rec = new Ctor();
  rec.continuous = true;
  rec.interimResults = true;
  rec.lang = navigator.language || 'en-US';
  return rec;
}

let micOwner: { stop: () => void } | null = null;

export function stealMic(owner: { stop: () => void }) {
  if (micOwner && micOwner !== owner) micOwner.stop();
  micOwner = owner;
}

export function dropMic(owner: { stop: () => void }) {
  if (micOwner === owner) micOwner = null;
}
