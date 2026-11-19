// Leonida Ledger — saved progress in localStorage, with export and import.
// Storage key holds one object: { version, earned: [trophy ids], spoiler: bool }.
export const STORAGE_KEY = 'leonida-ledger-v5';

export function loadProgress() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { earned: [], spoiler: false };
    const parsed = JSON.parse(raw);
    return {
      earned: Array.isArray(parsed.earned) ? parsed.earned.filter((id) => Number.isInteger(id)) : [],
      spoiler: parsed.spoiler === true,
    };
  } catch {
    return { earned: [], spoiler: false };
  }
}

export function saveProgress(progress) {
  const payload = { version: 5, earned: [...progress.earned].sort((a, b) => a - b), spoiler: progress.spoiler === true };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
  return payload;
}

export function isEarned(progress, id) {
  return progress.earned.includes(id);
}

export function toggleEarned(progress, id) {
  const next = { earned: [...progress.earned], spoiler: progress.spoiler };
  const at = next.earned.indexOf(id);
  if (at === -1) next.earned.push(id);
  else next.earned.splice(at, 1);
  return saveProgress(next);
}

export function exportProgress(progress) {
  const payload = saveProgress(progress);
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = 'leonida-ledger-progress.json';
  document.body.appendChild(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export function parseImportedProgress(text) {
  const parsed = JSON.parse(text);
  const source = parsed && typeof parsed === 'object' ? parsed : {};
  const earned = Array.isArray(source.earned) ? source.earned : [];
  const valid = earned.filter((id) => Number.isInteger(id) && id >= 1 && id <= 55);
  return { earned: [...new Set(valid)].sort((a, b) => a - b), spoiler: source.spoiler === true };
}
