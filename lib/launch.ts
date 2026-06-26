/**
 * GTA 6 launch target — single source of truth for countdown displays.
 * Edit this when Rockstar updates the date.
 */
export const LAUNCH_DATE_ISO = "2026-11-19T00:00:00-05:00"; // Vice City local

export function timeUntil(target: Date, now: Date = new Date()) {
  const ms = target.getTime() - now.getTime();
  if (ms <= 0) {
    return { ms: 0, days: 0, hours: 0, minutes: 0, seconds: 0, past: true };
  }
  const days = Math.floor(ms / 86_400_000);
  const hours = Math.floor((ms % 86_400_000) / 3_600_000);
  const minutes = Math.floor((ms % 3_600_000) / 60_000);
  const seconds = Math.floor((ms % 60_000) / 1_000);
  return { ms, days, hours, minutes, seconds, past: false };
}
