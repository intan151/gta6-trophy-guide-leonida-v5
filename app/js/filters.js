// Leonida Ledger — filtering, searching and the spoiler rule.
// Kinds the guide filters by: story, missable, collectible, activity, misc,
// online (the official list has no online trophy, so that filter is honest
// about showing zero), earned and todo. The spoiler rule hides the name and
// description of a hidden story trophy until it is earned.

export function trophyMatchesKind(trophy, filter, earnedIds) {
  if (filter === 'all') return true;
  if (filter === 'earned') return earnedIds.includes(trophy.id);
  if (filter === 'todo') return !earnedIds.includes(trophy.id);
  if (filter === 'missable') return trophy.missable === true;
  if (filter === 'online') return trophy.kind === 'online';
  return trophy.kind === filter;
}

export function trophyMatchesSearch(trophy, query) {
  if (!query) return true;
  const haystack = [trophy.name, trophy.description, trophy.guide, trophy.tip, trophy.kind]
    .join(' ')
    .toLowerCase();
  return query.toLowerCase().split(/\s+/).every((word) => haystack.includes(word));
}

export function trophyMatchesGrade(trophy, grade) {
  return grade === 'all' || trophy.grade === grade;
}

export function filterTrophies(trophies, options) {
  const earnedIds = options.earnedIds || [];
  return trophies.filter(
    (trophy) =>
      trophyMatchesKind(trophy, options.filter, earnedIds) &&
      trophyMatchesGrade(trophy, options.grade) &&
      trophyMatchesSearch(trophy, options.query),
  );
}

export function spoilerHides(trophy, spoilerOn, earnedIds) {
  return spoilerOn && trophy.hidden === true && !earnedIds.includes(trophy.id);
}

export function displayName(trophy, spoilerOn, earnedIds) {
  return spoilerHides(trophy, spoilerOn, earnedIds) ? 'Hidden story trophy' : trophy.name;
}

export function displayDescription(trophy, spoilerOn, earnedIds) {
  return spoilerHides(trophy, spoilerOn, earnedIds)
    ? 'Spoiler hidden — earn this trophy to reveal its name and description.'
    : trophy.description;
}
