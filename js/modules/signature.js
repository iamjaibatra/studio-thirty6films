/**
 * A small signature for anyone curious enough to open the console —
 * the code equivalent of an artist's mark in the corner of a frame.
 */
export function printSignature() {
  const box = 'color:#F4F4F4; background:#080808; padding:6px 10px; font-family:monospace;';
  const label = 'color:#A61E22; background:#080808; padding:6px 0 6px 10px; font-family:monospace; font-weight:bold;';
  const dim = 'color:#3A3A3A; background:#080808; padding:6px 10px 6px 0; font-family:monospace;';

  console.log(
    '%cSTUDIO THIRTY6 FILMS%c — website designed & built by%cJai Batra',
    label,
    box,
    'color:#F4F4F4; background:#080808; padding:6px 10px 6px 0; font-family:monospace; font-weight:bold;'
  );
  console.log('%cEvery frame is a decision, not an accident.', dim);
}
