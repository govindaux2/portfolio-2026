import type { Node } from '@xyflow/react';
import { cardImages } from './model';
import { plainFromHtml } from './richText';
import type { CardData, ImageData, LinkData, TextBlockData } from './types';

async function blobFromSrc(src: string): Promise<Blob | undefined> {
  try {
    const res = await fetch(src);
    if (!res.ok) return undefined;
    return await res.blob();
  } catch {
    return undefined;
  }
}

async function toPngBlob(src: string): Promise<Blob> {
  const blob = await blobFromSrc(src);
  if (!blob) throw new Error('image fetch failed');
  if (blob.type === 'image/png') return blob;
  const bmp = await createImageBitmap(blob);
  const canvas = document.createElement('canvas');
  canvas.width = bmp.width;
  canvas.height = bmp.height;
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    bmp.close();
    return blob;
  }
  ctx.drawImage(bmp, 0, 0);
  bmp.close();
  const png = await new Promise<Blob | null>((resolve) => {
    canvas.toBlob(resolve, 'image/png');
  });
  if (png) return png;
  return blob;
}

function nodeText(n: Node): string {
  if (n.type === 'text') return plainFromHtml((n.data as TextBlockData).text || '');
  if (n.type === 'card') {
    const d = n.data as CardData;
    return [d.heading, plainFromHtml(d.text || '')].filter(Boolean).join('\n');
  }
  if (n.type === 'link') return (n.data as LinkData).url || '';
  if (n.type === 'section')
    return String((n.data as { title?: string }).title || '');
  return '';
}

function firstImageSrc(nodes: Node[]): string | undefined {
  for (const n of nodes) {
    if (n.type === 'image') {
      const src = (n.data as ImageData).src;
      if (src) return src;
    }
    if (n.type === 'card') {
      const src = cardImages(n.data as CardData)[0];
      if (src) return src;
    }
    if (n.type === 'link') {
      const src = (n.data as LinkData).image;
      if (src) return src;
    }
  }
  return undefined;
}

function isImageOnlyCopy(nodes: Node[]) {
  if (nodes.length !== 1) return false;
  const n = nodes[0];
  if (n.type === 'image') return Boolean((n.data as ImageData).src);
  if (n.type === 'card') return cardImages(n.data as CardData).length > 0;
  return false;
}

export async function writeSelectionClipboard(nodes: Node[]) {
  if (!nodes.length || typeof navigator === 'undefined' || !navigator.clipboard)
    return;

  const parts = nodes.map(nodeText).map((t) => t.trim()).filter(Boolean);
  const text = parts.join('\n\n');
  const src = firstImageSrc(nodes);
  const imageOnly = isImageOnlyCopy(nodes) && Boolean(src);

  const write = (payload: Record<string, Blob | Promise<Blob>>) =>
    navigator.clipboard.write([
      new ClipboardItem(payload as Record<string, Promise<Blob>>),
    ]);

  try {
    if (imageOnly && src) {
      await write({ 'image/png': toPngBlob(src) });
      return;
    }
    const payload: Record<string, Blob | Promise<Blob>> = {};
    if (src) payload['image/png'] = toPngBlob(src);
    if (text) payload['text/plain'] = new Blob([text], { type: 'text/plain' });
    if (!Object.keys(payload).length) {
      payload['text/plain'] = new Blob([' '], { type: 'text/plain' });
    }
    await write(payload);
  } catch {
    try {
      if (src) await write({ 'image/png': toPngBlob(src) });
      else if (text) await navigator.clipboard.writeText(text);
    } catch {
      if (text) {
        try {
          await navigator.clipboard.writeText(text);
        } catch {
          /* clipboard may be blocked */
        }
      }
    }
  }
}
