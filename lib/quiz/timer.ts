export function formatTime(
  totalSeconds: number
) {
  const minutes = Math.floor(
    totalSeconds / 60
  );

  const seconds = totalSeconds % 60;

  return `${String(minutes).padStart(
    2,
    "0"
  )}:${String(seconds).padStart(2, "0")}`;
}

export function getRemainingTime(
  startedAt: number,
  limitMinutes: number
) {
  const total = limitMinutes * 60;

  const elapsed = Math.floor(
    (Date.now() - startedAt) / 1000
  );

  return Math.max(total - elapsed, 0);
}