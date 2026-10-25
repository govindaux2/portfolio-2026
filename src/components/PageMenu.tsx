import { useId, useRef, useState, type PointerEvent } from 'react';
import { HOME_SECTION_MAP, type HomeSectionId } from '../pageMenu/homeSections';

type PageMenuProps = {
  order: HomeSectionId[];
  onMove: (from: number, to: number) => void;
};

export function PageMenu({ order, onMove }: PageMenuProps) {
  const listId = useId();
  const listRef = useRef<HTMLOListElement>(null);
  const [open, setOpen] = useState(true);
  const dragFrom = useRef<number | null>(null);
  const [over, setOver] = useState<number | null>(null);
  const [dragging, setDragging] = useState<number | null>(null);

  const indexFromPoint = (clientY: number) => {
    const items = listRef.current?.querySelectorAll<HTMLElement>('[data-section-index]');
    if (!items?.length) return null;
    let closest = 0;
    let best = Infinity;
    items.forEach((el) => {
      const rect = el.getBoundingClientRect();
      const mid = rect.top + rect.height / 2;
      const dist = Math.abs(clientY - mid);
      const index = Number(el.dataset.sectionIndex);
      if (dist < best) {
        best = dist;
        closest = index;
      }
    });
    return closest;
  };

  const onPointerDown = (index: number) => (e: PointerEvent<HTMLLIElement>) => {
    if (e.button !== 0) return;
    dragFrom.current = index;
    setDragging(index);
    setOver(index);
    e.currentTarget.setPointerCapture(e.pointerId);
  };

  const onPointerMove = (e: PointerEvent<HTMLLIElement>) => {
    if (dragFrom.current == null) return;
    const next = indexFromPoint(e.clientY);
    if (next != null && next !== over) setOver(next);
  };

  const onPointerUp = () => {
    const from = dragFrom.current;
    const to = over;
    dragFrom.current = null;
    setDragging(null);
    setOver(null);
    if (from == null || to == null || from === to) return;
    onMove(from, to);
  };

  return (
    <aside className={`page-menu${open ? ' is-open' : ''}`} aria-label="Page layout">
      <div className="page-menu-bar">
        <button
          type="button"
          className="page-menu-toggle"
          aria-expanded={open}
          aria-controls={listId}
          onClick={() => setOpen((v) => !v)}
        >
          <span className="page-menu-kicker">Layout</span>
          <span className="page-menu-title">Home</span>
        </button>
        <button
          type="button"
          className="page-menu-chevron"
          aria-expanded={open}
          aria-controls={listId}
          aria-label={open ? 'Collapse layout menu' : 'Expand layout menu'}
          onClick={() => setOpen((v) => !v)}
        >
          {open ? '–' : '+'}
        </button>
      </div>

      {open && (
        <div id={listId} className="page-menu-body">
          <div className="page-menu-tabs" role="tablist" aria-label="Pages">
            <button type="button" role="tab" aria-selected className="is-on">
              Homepage
            </button>
          </div>

          <ol ref={listRef} className="page-menu-list" aria-label="Homepage sections">
            {order.map((id, index) => {
              const meta = HOME_SECTION_MAP[id];
              return (
                <li
                  key={id}
                  data-section-index={index}
                  className={
                    'page-menu-item' +
                    (dragging === index ? ' is-dragging' : '') +
                    (over === index && dragging !== index ? ' is-over' : '')
                  }
                  onPointerDown={onPointerDown(index)}
                  onPointerMove={onPointerMove}
                  onPointerUp={onPointerUp}
                  onPointerCancel={onPointerUp}
                >
                  <span className="page-menu-grip" aria-hidden>
                    ⋮⋮
                  </span>
                  <span className="page-menu-copy">
                    <span className="page-menu-label">{meta.label}</span>
                    <span className="page-menu-hint">{meta.hint}</span>
                  </span>
                  <span className="page-menu-index">{index + 1}</span>
                </li>
              );
            })}
          </ol>
        </div>
      )}
    </aside>
  );
}
