import { useCallback, useEffect, useRef, useState, type RefObject } from 'react';
import { fillDictateDraft, finishDictateDraft, placeDictateDraft } from './richText';
import { composeTranscript, createSpeechRec, dropMic, flowToast, stealMic } from './speech';

export function useDictation({
  enabled,
  value,
  placeholders,
  inputRef,
  onChange,
}: {
  enabled: boolean;
  value: string;
  placeholders: string[];
  inputRef: RefObject<HTMLElement | null>;
  onChange: (next: string) => void;
}) {
  const [listening, setListening] = useState(false);
  const wantRef = useRef(false);
  const recRef = useRef<ReturnType<typeof createSpeechRec> | undefined>(undefined);
  const sessionRef = useRef({
    original: '',
    start: 0,
    end: 0,
    mode: 'insert' as 'replace' | 'insert',
    committed: '',
    live: '',
  });
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;
  const valueRef = useRef(value);
  valueRef.current = value;
  const placeholdersRef = useRef(placeholders);
  placeholdersRef.current = placeholders;
  const inputRefBox = useRef(inputRef);
  inputRefBox.current = inputRef;
  const ownerRef = useRef({ stop: () => {} });

  const isField = (el: HTMLElement | null): el is HTMLTextAreaElement | HTMLInputElement =>
    Boolean(el && (el instanceof HTMLTextAreaElement || el instanceof HTMLInputElement));

  const snapshotCaret = useCallback(() => {
    const el = inputRefBox.current.current;
    if (!el) return;
    el.focus();
    if (isField(el)) {
      const original = el.value;
      const startAt = el.selectionStart ?? original.length;
      const endAt = el.selectionEnd ?? startAt;
      sessionRef.current = {
        original,
        start: startAt,
        end: endAt,
        mode: startAt !== endAt || original.trim() ? 'insert' : 'replace',
        committed: '',
        live: '',
      };
      return;
    }
    placeDictateDraft(el);
    sessionRef.current = {
      original: el.innerText || valueRef.current || '',
      start: 0,
      end: 0,
      mode: 'insert',
      committed: '',
      live: '',
    };
  }, []);

  const apply = useCallback((transcript: string) => {
    const s = sessionRef.current;
    const piece = [s.committed, transcript].filter(Boolean).join(' ');
    const el = inputRefBox.current.current;
    if (el && !isField(el)) {
      fillDictateDraft(el, piece.replace(/\s+/g, ' ').trim());
      onChangeRef.current(el.innerHTML);
      return;
    }
    const next = composeTranscript(
      s.original,
      piece,
      s.mode,
      s.start,
      s.end,
      placeholdersRef.current
    );
    onChangeRef.current(next);
    if (el && isField(el)) {
      el.value = next;
      const from = Math.max(0, Math.min(s.start, s.original.length));
      const inserted = next.length - (s.original.length - (s.end - from));
      const caret = from + Math.max(inserted, 0);
      el.setSelectionRange(caret, caret);
    }
  }, []);

  const stop = useCallback(() => {
    wantRef.current = false;
    setListening(false);
    dropMic(ownerRef.current);
    const rec = recRef.current;
    recRef.current = undefined;
    const el = inputRefBox.current.current;
    if (el && !isField(el)) {
      finishDictateDraft(el);
      onChangeRef.current(el.innerHTML);
    }
    try {
      rec?.abort();
    } catch {
      try {
        rec?.stop();
      } catch {
        /* already stopped */
      }
    }
  }, []);

  ownerRef.current.stop = stop;

  const beginRec = useCallback(() => {
    const rec = createSpeechRec();
    if (!rec) {
      flowToast('Voice isn’t available in this browser');
      wantRef.current = false;
      setListening(false);
      dropMic(ownerRef.current);
      return;
    }
    rec.onresult = (ev) => {
      let text = '';
      for (let i = 0; i < ev.results.length; i += 1) {
        text += ev.results[i][0].transcript;
      }
      sessionRef.current.live = text;
      apply(text);
    };
    rec.onerror = (ev) => {
      if (ev.error === 'not-allowed' || ev.error === 'service-not-allowed') {
        flowToast('Allow the microphone to dictate');
        stop();
        return;
      }
      if (ev.error === 'audio-capture') {
        flowToast('No microphone found');
        stop();
      }
    };
    const startedAt = Date.now();
    rec.onend = () => {
      recRef.current = undefined;
      if (!wantRef.current) {
        setListening(false);
        return;
      }
      if (Date.now() - startedAt < 160) {
        wantRef.current = false;
        setListening(false);
        dropMic(ownerRef.current);
        return;
      }
      const live = sessionRef.current.live.trim();
      if (live) {
        sessionRef.current.committed = [sessionRef.current.committed, live]
          .filter(Boolean)
          .join(' ');
        sessionRef.current.live = '';
      }
      beginRec();
    };
    recRef.current = rec;
    try {
      rec.start();
    } catch {
      recRef.current = undefined;
      if (wantRef.current) {
        flowToast('Couldn’t start the microphone');
        stop();
      }
    }
  }, [apply, stop]);

  const start = useCallback(() => {
    if (wantRef.current && recRef.current) return;
    stealMic(ownerRef.current);
    snapshotCaret();
    wantRef.current = true;
    setListening(true);
    if (!recRef.current) beginRec();
  }, [beginRec, snapshotCaret]);

  const toggle = useCallback(() => {
    if (wantRef.current) stop();
    else start();
  }, [start, stop]);

  useEffect(() => {
    if (!enabled && wantRef.current) stop();
  }, [enabled, stop]);

  useEffect(() => {
    if (!listening) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        stop();
      }
    };
    window.addEventListener('keydown', onKey, true);
    return () => window.removeEventListener('keydown', onKey, true);
  }, [listening, stop]);

  useEffect(() => () => stop(), [stop]);

  return { listening, toggle, stop, arm: snapshotCaret };
}
