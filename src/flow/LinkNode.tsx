import { type Node, type NodeProps } from '@xyflow/react';
import { LINK_MIN } from './model';
import { CornerResize } from './CornerResize';
import { NodeMenu } from './NodeMenu';
import { NodePorts } from './NodePorts';
import { kindLabel, type LinkPreview } from './linkMeta';
import type { LinkData } from './types';

export type LinkNodeType = Node<LinkData, 'link'>;

export function LinkNode({ id, data, selected }: NodeProps<LinkNodeType>) {
  const preview = data as LinkPreview;
  const loading = preview.status === 'loading';

  return (
    <div
      className={`flow-link-card${selected ? ' is-selected' : ''}${
        loading ? ' is-loading' : ''
      }`}
      onDoubleClick={(e) => {
        e.stopPropagation();
        window.open(preview.url, '_blank', 'noopener,noreferrer');
      }}
    >
      <CornerResize lockRatio minWidth={LINK_MIN.w} minHeight={LINK_MIN.h} />
      <NodeMenu id={id} />
      <NodePorts />
      <div className={`flow-link-thumb is-${preview.kind}`}>
        {preview.image ? (
          <img src={preview.image} alt="" draggable={false} />
        ) : (
          <span>{preview.site.slice(0, 1).toUpperCase() || '·'}</span>
        )}
        {preview.kind === 'video' ? (
          <span className="flow-link-play" aria-hidden>
            <svg width="22" height="22" viewBox="0 0 22 22">
              <circle cx="11" cy="11" r="10" fill="rgba(0,0,0,.55)" />
              <path d="M9 7.2 15.2 11 9 14.8Z" fill="#fff" />
            </svg>
          </span>
        ) : null}
      </div>
      <div className="flow-link-meta">
        <strong>{preview.title || preview.url}</strong>
        <span>
          {kindLabel(preview.kind)}
          {preview.site ? ` · ${preview.site}` : ''}
        </span>
      </div>
    </div>
  );
}
