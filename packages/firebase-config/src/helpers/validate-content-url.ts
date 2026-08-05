const explicitlyUnsafeScheme = /^(?:javascript|data|vbscript):/i;

/** Validate and normalize CTA destinations accepted by content posts. */
export function validateContentCtaUrl(value: string | null | undefined): string {
  const url = value?.trim() ?? '';
  if (!url) return '';

  if (explicitlyUnsafeScheme.test(url)) {
    throw new Error('CTA URL uses an unsupported scheme');
  }

  if (url.startsWith('/') && !url.startsWith('//')) {
    return url;
  }

  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    throw new Error('CTA URL is malformed');
  }

  if (!['http:', 'https:', 'mailto:', 'tel:'].includes(parsed.protocol)) {
    throw new Error('CTA URL uses an unsupported scheme');
  }

  if ((parsed.protocol === 'http:' || parsed.protocol === 'https:') && !parsed.hostname) {
    throw new Error('CTA URL is malformed');
  }

  return url;
}
