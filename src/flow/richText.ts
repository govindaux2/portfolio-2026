const ALLOW = new Set([
  'B',
  'STRONG',
  'I',
  'EM',
  'S',
  'STRIKE',
  'U',
  'BR',
  'DIV',
  'P',
  'UL',
  'OL',
  'LI',
  'SPAN',
]);

export function looksLikeHtml(value: string) {
  return /<\/?[a-z][\s\S]*>/i.test(value);
}

export function escapeText(value: string) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

export function toSafeHtml(value: string) {
  if (!value) return '';
  if (!looksLikeHtml(value)) {
    return escapeText(value).replace(/\n/g, '<br>');
  }
  const doc = new DOMParser().parseFromString(`<div>${value}</div>`, 'text/html');
  const root = doc.body.firstElementChild;
  if (!root) return escapeText(value);
  scrub(root);
  return root.innerHTML;
}

function scrub(node: Node) {
  const kids = [...node.childNodes];
  for (const child of kids) {
    if (child.nodeType === Node.COMMENT_NODE) {
      child.parentNode?.removeChild(child);
      continue;
    }
    if (child.nodeType === Node.ELEMENT_NODE) {
      const el = child as HTMLElement;
      if (!ALLOW.has(el.tagName)) {
        const parent = el.parentNode;
        while (el.firstChild) parent?.insertBefore(el.firstChild, el);
        parent?.removeChild(el);
        continue;
      }
      for (const attr of [...el.attributes]) el.removeAttribute(attr.name);
      scrub(el);
    }
  }
}

export function plainFromHtml(value: string) {
  if (!looksLikeHtml(value)) return value;
  const doc = new DOMParser().parseFromString(`<div>${value}</div>`, 'text/html');
  return (doc.body.textContent || '').replace(/\u00a0/g, ' ');
}

export function lineBeforeCaret(editor: HTMLElement) {
  const sel = window.getSelection();
  if (!sel?.rangeCount || !sel.anchorNode || !editor.contains(sel.anchorNode))
    return '';
  const range = sel.getRangeAt(0).cloneRange();
  let block: Node | null =
    sel.anchorNode.nodeType === Node.ELEMENT_NODE
      ? sel.anchorNode
      : sel.anchorNode.parentElement;
  while (
    block &&
    block !== editor &&
    !(block instanceof HTMLElement && /^(DIV|P|LI)$/.test(block.tagName))
  ) {
    block = block.parentElement;
  }
  const start = block instanceof HTMLElement && block !== editor ? block : editor;
  try {
    range.setStart(start, 0);
  } catch {
    return '';
  }
  return range.toString();
}

export const DICTATE_DRAFT = 'flow-dictate-draft';

export function placeDictateDraft(el: HTMLElement) {
  const existing = el.querySelector(`.${DICTATE_DRAFT}`) as HTMLElement | null;
  if (existing) return existing;
  const sel = window.getSelection();
  if (!sel) return null;
  if (!sel.rangeCount || !sel.anchorNode || !el.contains(sel.anchorNode)) {
    const end = document.createRange();
    end.selectNodeContents(el);
    end.collapse(false);
    sel.removeAllRanges();
    sel.addRange(end);
  }
  const range = sel.getRangeAt(0);
  range.deleteContents();
  const span = document.createElement('span');
  span.className = DICTATE_DRAFT;
  range.insertNode(span);
  const after = document.createRange();
  after.setStartAfter(span);
  after.collapse(true);
  sel.removeAllRanges();
  sel.addRange(after);
  return span;
}

export function fillDictateDraft(el: HTMLElement, text: string) {
  let span = el.querySelector(`.${DICTATE_DRAFT}`) as HTMLElement | null;
  if (!span) span = placeDictateDraft(el);
  if (!span) return;
  span.textContent = text;
  const sel = window.getSelection();
  const range = document.createRange();
  range.selectNodeContents(span);
  range.collapse(false);
  sel?.removeAllRanges();
  sel?.addRange(range);
}

export function finishDictateDraft(el: HTMLElement) {
  el.querySelectorAll(`.${DICTATE_DRAFT}`).forEach((node) => {
    const text = node.textContent || '';
    node.replaceWith(document.createTextNode(text));
  });
  el.normalize();
}
