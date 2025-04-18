// --- File: lib/utils.js ---
export function formatInt(n) {
  return Number.isNaN(n) ? "?" : `${Math.round(n)}`;
}

export function calculateDuration(duration) {
  const bufferPercentage = 10;
  const bufferingGoal = (duration * bufferPercentage) / 100;
  return Math.round(bufferingGoal * 100) / 100;
}

export function filterDuplicates(array, keys) {
  const seen = new Set();
  return array.filter((item) => {
    const keyValues = keys.map((key) => item[key]).join("|");
    if (seen.has(keyValues)) return false;
    seen.add(keyValues);
    return true;
  });
}
