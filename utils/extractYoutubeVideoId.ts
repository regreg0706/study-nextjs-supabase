export function extractYouTubeVideoId(url: string): string | null {
  const match =
    /^https?:\/\/(www\.)?youtube\.com\/watch\?(.*&)?v=([^&]+)/.exec(url) ||
    /^https?:\/\/youtu\.be\/([^?]+)/.exec(url) ||
    /^https?:\/\/(www\.)?youtube\.com\/embed\/([^?]+)/.exec(url);

  if (match) {
    return match[3] || match[1] || match[2];
  } else {
    return null;
  }
}