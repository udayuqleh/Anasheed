export function parseYouTubeId(input: string): string | null {
  const s = input.trim();
  if (/^[\w-]{11}$/.test(s)) return s;
  const m =
    s.match(/(?:youtube\.com\/(?:watch\?(?:.*&)?v=|embed\/|shorts\/|live\/)|youtu\.be\/)([\w-]{11})/i);
  return m ? m[1] : null;
}

export const thumb = (id: string) => `https://i.ytimg.com/vi/${id}/mqdefault.jpg`;

export async function fetchTitle(id: string): Promise<{ title: string; author: string } | null> {
  const url = `https://www.youtube.com/watch?v=${id}`;
  for (const endpoint of [
    `https://www.youtube.com/oembed?format=json&url=${encodeURIComponent(url)}`,
    `https://noembed.com/embed?url=${encodeURIComponent(url)}`,
  ]) {
    try {
      const r = await fetch(endpoint);
      if (!r.ok) continue;
      const j = await r.json();
      if (j.title) return { title: j.title, author: j.author_name ?? '' };
    } catch {}
  }
  return null;
}

export type SearchResult = { youtubeId: string; title: string; channel: string };

export const API_KEY = process.env.EXPO_PUBLIC_YOUTUBE_API_KEY ?? '';

const decode = (s: string) =>
  s.replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>');

export async function searchYouTube(q: string, vocalOnly: boolean): Promise<SearchResult[]> {
  if (!API_KEY) throw new Error('NO_KEY');
  const query = vocalOnly ? `${q} نشيد بدون موسيقى` : `${q} نشيد`;
  const params = new URLSearchParams({
    part: 'snippet',
    type: 'video',
    maxResults: '20',
    q: query,
    videoEmbeddable: 'true',
    safeSearch: 'strict',
    relevanceLanguage: 'ar',
    key: API_KEY,
  });
  const r = await fetch(`https://www.googleapis.com/youtube/v3/search?${params}`);
  if (!r.ok) throw new Error('HTTP_' + r.status);
  const j = await r.json();
  return (j.items ?? []).map((it: any) => ({
    youtubeId: it.id.videoId,
    title: decode(it.snippet.title),
    channel: decode(it.snippet.channelTitle),
  }));
}
