import {
  useEffect,
  useState,
  type CSSProperties,
  type KeyboardEvent,
  type ReactNode,
  type RefObject,
} from 'react';
import { lineBeforeCaret, toSafeHtml } from './richText';

export function RichBody({
  value,
  onChange,
  placeholder,
  style,
  editorRef,
  onFocus,
  showToolbar,
  className,
  leading,
}: {
  value: string;
  onChange: (html: string) => void;
  placeholder: string;
  style?: CSSProperties;
  editorRef: RefObject<HTMLDivElement | null>;
  onFocus?: () => void;
  showToolbar: boolean;
  className?: string;
  leading?: ReactNode;
}) {
  const [marks, setMarks] = useState({
    bold: false,
    italic: false,
    strike: false,
  });

  const node = () => editorRef.current;

  const syncMarks = () => {
    try {
      setMarks({
        bold: document.queryCommandState('bold'),
        italic: document.queryCommandState('italic'),
        strike: document.queryCommandState('strikeThrough'),
      });
    } catch {
      /* queryCommandState can throw in empty docs */
    }
  };

  useEffect(() => {
    const el = node();
    if (!el || document.activeElement === el) return;
    const next = toSafeHtml(value);
    if (el.innerHTML !== next) el.innerHTML = next;
  }, [value]);

  useEffect(() => {
    document.addEventListener('selectionchange', syncMarks);
    return () => document.removeEventListener('selectionchange', syncMarks);
  }, []);

  const format = (cmd: string) => {
    node()?.focus();
    document.execCommand(cmd);
    const el = node();
    if (el) onChange(toSafeHtml(el.innerHTML));
    syncMarks();
  };

  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    const mod = e.metaKey || e.ctrlKey;
    if (mod && e.key.toLowerCase() === 'b') {
      e.preventDefault();
      format('bold');
      return;
    }
    if (mod && e.key.toLowerCase() === 'i') {
      e.preventDefault();
      format('italic');
      return;
    }
    if (mod && e.shiftKey && e.key.toLowerCase() === 's') {
      e.preventDefault();
      format('strikeThrough');
      return;
    }
    if (e.key !== ' ' && e.key !== 'Enter') return;
    const el = node();
    if (!el) return;
    const prefix = lineBeforeCaret(el).replace(/\u00a0/g, ' ').trim();
    const bullet = prefix === '-' || prefix === '*';
    const numbered = /^\d+[.)]$/.test(prefix);
    if (!bullet && !numbered) return;
    e.preventDefault();
    for (let i = 0; i < prefix.length; i += 1) document.execCommand('delete');
    document.execCommand(bullet ? 'insertUnorderedList' : 'insertOrderedList');
    onChange(toSafeHtml(el.innerHTML));
  };

  return (
    <div className="flow-rich">
      {leading || showToolbar ? (
        <div className="flow-format-row">
          {leading}
          {showToolbar ? (
            <div
              className="flow-format-bar nodrag nopan"
              onPointerDown={(e) => e.preventDefault()}
            >
              <button
                type="button"
                data-on={marks.bold}
                aria-label="Bold"
                onClick={() => format('bold')}
              >
                <span className="flow-format-b">B</span>
              </button>
              <button
                type="button"
                data-on={marks.italic}
                aria-label="Italic"
                onClick={() => format('italic')}
              >
                <span className="flow-format-i">I</span>
              </button>
              <button
                type="button"
                data-on={marks.strike}
                aria-label="Strikethrough"
                onClick={() => format('strikeThrough')}
              >
                <span className="flow-format-s">S</span>
              </button>
            </div>
          ) : null}
        </div>
      ) : null}
      <div
        ref={editorRef}
        className={`flow-rich-editor nodrag ${className ?? ''}`}
        contentEditable
        role="textbox"
        aria-multiline="true"
        data-placeholder={placeholder}
        suppressContentEditableWarning
        style={style}
        onFocus={onFocus}
        onKeyDown={onKeyDown}
        onInput={(e) => onChange(toSafeHtml(e.currentTarget.innerHTML))}
        onPointerDown={(e) => {
          if (e.shiftKey || e.metaKey || e.ctrlKey) return;
          e.stopPropagation();
        }}
      />
    </div>
  );
}
