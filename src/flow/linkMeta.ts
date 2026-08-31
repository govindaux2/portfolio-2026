export type LinkKind = 'web' | 'video' | 'doc' | 'sheet';

export type LinkPreview = {
  url: string;
  title: string;
  description?: string;
  image?: string;
  site: string;
  kind: LinkKind;
  status: 'loading' | 'ready' | 'error';
};

const URL_RE = /https?:\/\/[^\s<>"']+/i;

export function extractUrl(text: string): string | null {
  const trimmed = text.trim();
  if (/^[a-z][a-z0-9+.-]*:\/\//i.test(trimmed) && !/\s/.test(trimmed)) {
    return trimmed;
  }
  const m = trimmed.match(URL_RE);
  if (!m) return null;
  if (trimmed.replace(m[0], '').trim()) return null;
  return m[0];
}

function hostOf(url: string) {
  try {
    return new URL(url).hostname.replace(/^www\./, '');
  } catch {
    return '';
  }
}

function youtubeId(url: string) {
  const m = url.match(
    /(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/|live\/)|youtu\.be\/)([\w-]{11})/
  );
  return m?.[1] ?? null;
}

function classify(url: string): LinkKind {
  if (youtubeId(url) || /vimeo\.com\//i.test(url)) return 'video';
  if (/docs\.google\.com\/spreadsheets/i.test(url) || /\.xlsx(\?|$)/i.test(url))
    return 'sheet';
  if (
    /docs\.google\.com\/document/i.test(url) ||
    /figma\.com\//i.test(url) ||
    /\.(pdf|docx?)(\?|$)/i.test(url)
  )
    return 'doc';
  return 'web';
}

function kindLabel(kind: LinkKind) {
  if (kind === 'video') return 'Video';
  if (kind === 'sheet') return 'Sheet';
  if (kind === 'doc') return 'File';
  return 'Link';
}

export { kindLabel };

function proxyImage(src: string) {
  if (!src || src.startsWith('data:')) return src;
  return `https://images.weserv.nl/?url=${encodeURIComponent(src.replace(/^https?:\/\//, ''))}&w=720&q=80`;
}

export function seedPreview(url: string): LinkPreview {
  const id = youtubeId(url);
  const kind = classify(url);
  return {
    url,
    title: hostOf(url) || url,
    site: hostOf(url),
    kind,
    status: 'loading',
    image: id ? `https://i.ytimg.com/vi/${id}/hqdefault.jpg` : undefined,
  };
}

type Meta = { title?: string; image?: string; description?: string };

async function fetchJson(url: string): Promise<unknown> {
  const res = await fetch(url);
  if (!res.ok) throw new Error('fail');
  return res.json();
}

async function fromMicrolink(url: string): Promise<Meta> {
  const json = (await fetchJson(
    `https://api.microlink.io/?url=${encodeURIComponent(url)}`
  )) as {
    status?: string;
    data?: {
      title?: string;
      description?: string;
      image?: { url?: string } | string;
    };
  };
  if (json.status !== 'success' || !json.data) throw new Error('fail');
  const image =
    typeof json.data.image === 'string' ? json.data.image : json.data.image?.url;
  return {
    title: json.data.title,
    description: json.data.description,
    image,
  };
}

async function fromNoembed(url: string): Promise<Meta> {
  const json = (await fetchJson(
    `https://noembed.com/embed?url=${encodeURIComponent(url)}`
  )) as { title?: string; thumbnail_url?: string; error?: string };
  if (json.error) throw new Error('fail');
  return { title: json.title, image: json.thumbnail_url };
}

export async function resolvePreview(url: string): Promise<LinkPreview> {
  const seed = seedPreview(url);
  try {
    let meta: Meta = {};
    try {
      meta = await fromNoembed(url);
    } catch {
      meta = await fromMicrolink(url);
    }
    const image = meta.image ? proxyImage(meta.image) : seed.image;
    return {
      ...seed,
      title: meta.title?.trim() || seed.title,
      description: meta.description,
      image,
      status: 'ready',
    };
  } catch {
    return {
      ...seed,
      status: seed.image ? 'ready' : 'error',
    };
  }
}
