export interface SignageItem {
  Id: number;
  Title: string;
  MediaUrl?: string | { Url: string };
  DurationSeconds: number;
  IsEnabled: boolean;
  SortOrder: number;
}
export function mediaSource(item: SignageItem): string | undefined {
  const raw = typeof item.MediaUrl === 'string' ? item.MediaUrl : item.MediaUrl?.Url;
  if (!raw) return undefined;
  try {
    const parsed = new URL(raw);
    // Avoid javascript:, data:, file: or other unsafe schemes.
    return parsed.protocol === 'https:' ? parsed.href : undefined;
  } catch { return undefined; }
}
export function mediaKind(url?: string): 'image' | 'video' | 'pdf' | 'external' {
  if (!url) return 'external';
  const pathname = new URL(url).pathname.toLowerCase();
  if (/\.(png|jpg|jpeg|webp|gif|svg)$/.test(pathname)) return 'image';
  if (/\.(mp4|webm|ogg)$/.test(pathname)) return 'video';
  if (/\.pdf$/.test(pathname)) return 'pdf';
  return 'external';
}
export function orderedItems(items: SignageItem[]): SignageItem[] {
  return items.filter(x => x.IsEnabled && Boolean(mediaSource(x))).sort((a,b) =>
    (a.SortOrder || 0) - (b.SortOrder || 0) || a.Id-b.Id);
}
