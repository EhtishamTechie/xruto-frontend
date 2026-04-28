/**
 * Extracts latitude & longitude from a Google Maps URL or pasted text.
 *
 * Priority order:
 *  1. Plain "lat,lng" text
 *  2. !3d…!4d… — the ACTUAL pinned place coordinates (most accurate)
 *  3. /@lat,lng  — the map VIEW CENTER (less accurate, falls back when place pin absent)
 *  4. ?q=lat,lng  /  &ll=lat,lng
 *
 * Returns { latitude, longitude } or null.
 * Returns { isShortUrl: true } when a maps.app.goo.gl short link is detected
 * (these links have no coordinates — the user must open the link first to get the full URL).
 */
export function parseLatLngFromGoogleMapsText(input) {
  if (input == null || typeof input !== 'string') return null;
  const s = input.trim();
  if (!s) return null;

  // Detect short links — they cannot be parsed; tell the user to expand them first
  if (/maps\.app\.goo\.gl/.test(s) || /goo\.gl\/maps/.test(s)) {
    return { isShortUrl: true };
  }

  const tight = s.replace(/\s/g, '');

  // 1. Plain "lat,lng"
  let m = tight.match(/^(-?\d+\.?\d*),(-?\d+\.?\d*)$/);
  if (m) {
    const r = validatePair(m[1], m[2]);
    if (r) return r;
  }

  // 2. !3d…!4d… — actual place pin (PRIORITY over map center)
  m = s.match(/!3d(-?\d+\.?\d*)!4d(-?\d+\.?\d*)/i);
  if (m) {
    const r = validatePair(m[1], m[2]);
    if (r) return r;
  }

  // 3. /@lat,lng — map view center (fallback)
  m = s.match(/@(-?\d+\.?\d*),(-?\d+\.?\d*)(?:,|\s|\/|\?|#|z|\]|$)/);
  if (!m) m = s.match(/@(-?\d+\.?\d*),(-?\d+\.?\d+)/);
  if (m) {
    const r = validatePair(m[1], m[2]);
    if (r) return r;
  }

  // 4. Query params
  m = s.match(/[?&]q=(-?\d+\.?\d*),(-?\d+\.?\d*)\b/);
  if (m) {
    const r = validatePair(m[1], m[2]);
    if (r) return r;
  }

  m = s.match(/[?&]ll=(-?\d+\.?\d*),(-?\d+\.?\d*)\b/);
  if (m) {
    const r = validatePair(m[1], m[2]);
    if (r) return r;
  }

  return null;
}

/** Returns true when the input is a short Maps URL that cannot be parsed. */
export function isShortGoogleMapsUrl(input) {
  if (!input || typeof input !== 'string') return false;
  return /maps\.app\.goo\.gl/.test(input) || /goo\.gl\/maps/.test(input);
}

function validatePair(a, b) {
  const lat = parseFloat(a);
  const lng = parseFloat(b);
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null;
  if (Math.abs(lat) > 90 || Math.abs(lng) > 180) return null;
  if (Math.abs(lat) < 1e-9 && Math.abs(lng) < 1e-9) return null;
  return { latitude: lat, longitude: lng };
}
