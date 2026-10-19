/* ═══════════════════════════════════════════════════════════════
   Video Source Parser & Embed Formatter
   Supports YouTube, Streamable, Catbox, Cloudinary, Dropbox, 
   Google Drive, and Direct MP4/WebM video URLs.
   ═══════════════════════════════════════════════════════════════ */

export function extractYoutubeId(url) {
  if (!url) return null;
  const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=|shorts\/))([\w-]{11})/);
  return match ? match[1] : null;
}

export function extractGoogleDriveId(url) {
  if (!url) return null;
  const trimmed = url.trim();
  const match = trimmed.match(/(?:drive\.google\.com\/(?:file\/d\/|open\?id=|uc\?id=)|docs\.google\.com\/file\/d\/)([a-zA-Z0-9_-]{20,})/);
  if (match) return match[1];
  if (/^[a-zA-Z0-9_-]{25,50}$/.test(trimmed)) return trimmed;
  return null;
}

export function extractStreamableId(url) {
  if (!url) return null;
  const match = url.trim().match(/streamable\.com\/(?:e\/)?([a-zA-Z0-9]+)/);
  return match ? match[1] : null;
}

export function parseVideoSource(rawUrl) {
  if (!rawUrl || typeof rawUrl !== 'string') return { type: 'none', url: '' };
  const trimmed = rawUrl.trim();

  // 1. YouTube
  const ytId = extractYoutubeId(trimmed);
  if (ytId) {
    return {
      type: 'youtube',
      id: ytId,
      embedUrl: `https://www.youtube.com/embed/${ytId}?autoplay=1&rel=0`,
      thumbnailUrl: `https://img.youtube.com/vi/${ytId}/maxresdefault.jpg`,
      label: 'YouTube Video'
    };
  }

  // 2. Streamable
  const streamableId = extractStreamableId(trimmed);
  if (streamableId) {
    return {
      type: 'streamable',
      id: streamableId,
      embedUrl: `https://streamable.com/e/${streamableId}?autoplay=1`,
      thumbnailUrl: '',
      label: 'Streamable Video'
    };
  }

  // 3. Dropbox (convert to direct streamable link)
  if (trimmed.includes('dropbox.com')) {
    let directUrl = trimmed.replace('?dl=0', '?raw=1').replace('&dl=0', '&raw=1');
    if (!directUrl.includes('raw=1')) {
      directUrl += directUrl.includes('?') ? '&raw=1' : '?raw=1';
    }
    return {
      type: 'direct',
      url: directUrl,
      label: 'Dropbox Direct Video'
    };
  }

  // 4. Google Drive
  const driveId = extractGoogleDriveId(trimmed);
  if (driveId) {
    return {
      type: 'googledrive',
      id: driveId,
      embedUrl: `https://drive.google.com/file/d/${driveId}/preview?autoplay=1`,
      label: 'Google Drive Video'
    };
  }

  // 5. Direct Video file (Catbox, Cloudinary, Firebase Storage, CDN, MP4, WebM)
  return {
    type: 'direct',
    url: trimmed,
    label: 'Direct Cloud Video'
  };
}
