// Leonida Ledger — rendering: the checklist rows, the guide detail pane,
// the roadmap stages and the missables list. All text comes from the data
// files; nothing here reaches the network.
import { displayDescription, displayName, spoilerHides } from './filters.js';

const GRADE_LABELS = { platinum: 'Platinum', gold: 'Gold', silver: 'Silver', bronze: 'Bronze' };
const KIND_LABELS = {
  platinum: 'Platinum',
  story: 'Story',
  collectible: 'Collectible',
  activity: 'Activity',
  misc: 'World & combat',
  online: 'Online',
};

function badge(text, className) {
  return `<span class="badge ${className}">${text}</span>`;
}

export function trophyRowHtml(trophy, progress, spoilerOn, selectedId) {
  const earned = progress.earned.includes(trophy.id);
  const hidden = spoilerHides(trophy, spoilerOn, progress.earned);
  const name = displayName(trophy, spoilerOn, progress.earned);
  const description = displayDescription(trophy, spoilerOn, progress.earned);
  const countBadge = trophy.count ? badge(`Target: ${trophy.count.toLocaleString('en-US')}`, 'count') : '';
  const missableBadge = trophy.missable ? badge('Missable', 'missable') : '';
  const hiddenBadge = trophy.hidden && !earned ? badge('Hidden on PSN', 'hidden-flag') : '';
  return `<li class="trophy-row${earned ? ' earned' : ''}${selectedId === trophy.id ? ' selected' : ''}" data-id="${trophy.id}" tabindex="0" role="button" aria-label="${hidden ? 'Hidden story trophy' : trophy.name}">
    <input type="checkbox" data-check="${trophy.id}" ${earned ? 'checked' : ''} aria-label="Mark ${hidden ? 'hidden trophy' : trophy.name} as earned">
    <div><div class="trophy-name">${name}</div>
    <div class="trophy-desc">${description}</div>
    <div class="trophy-meta">${badge(GRADE_LABELS[trophy.grade], trophy.grade)}${badge(KIND_LABELS[trophy.kind] || trophy.kind, 'kind')}${countBadge}${missableBadge}${hiddenBadge}</div></div>
    <span class="earned-mark">${earned ? '✓ Earned' : '○ To earn'}</span>
  </li>`;
}

export function renderTrophyList(listElement, trophies, progress, spoilerOn, selectedId) {
  listElement.innerHTML = trophies.map((trophy) => trophyRowHtml(trophy, progress, spoilerOn, selectedId)).join('');
}

export function detailHtml(trophy, progress, spoilerOn) {
  const earned = progress.earned.includes(trophy.id);
  const hidden = spoilerHides(trophy, spoilerOn, progress.earned);
  const name = displayName(trophy, spoilerOn, progress.earned);
  const description = displayDescription(trophy, spoilerOn, progress.earned);
  const sources = (trophy.sources || [])
    .map((source) => `<a href="${source.url}">${source.name}</a>`)
    .join(' &middot; ');
  const guide = hidden
    ? 'This is a hidden story trophy. Its guide stays covered while spoilers are hidden — earn the trophy, or switch spoilers off, to read it.'
    : trophy.guide;
  const tip = hidden ? 'Earn the trophy first, or turn the spoiler setting off.' : trophy.tip;
  return `<h3>${name}</h3>
  <p class="trophy-meta">${badge(GRADE_LABELS[trophy.grade], trophy.grade)}${badge(KIND_LABELS[trophy.kind] || trophy.kind, 'kind')}${trophy.missable ? badge('Missable', 'missable') : ''}${earned ? badge('Earned', 'count') : ''}</p>
  <p><em>Official description:</em> ${description}</p>
  <p class="guide-text">${guide}</p>
  <p class="tip"><strong>Tip</strong><br>${tip}</p>
  <p class="sources"><strong>Sources:</strong> ${sources || 'Official trophy list (Exophase / PSNProfiles).'}</p>`;
}

export function renderDetail(detailElement, trophy, progress, spoilerOn) {
  if (!trophy) {
    detailElement.innerHTML = '<p class="detail-hint">Select a trophy to read its full guide, tip and sources.</p>';
    return;
  }
  detailElement.innerHTML = detailHtml(trophy, progress, spoilerOn);
}

export function roadmapHtml(stages, trophies, progress) {
  return stages
    .map((stage, index) => {
      const stageTrophies = trophies.filter((trophy) => stage.ids.includes(trophy.id));
      const earnedCount = stageTrophies.filter((trophy) => progress.earned.includes(trophy.id)).length;
      const names = stageTrophies.map((trophy) => trophy.name).join(', ');
      return `<li><h3>Stage ${index + 1} — ${stage.title.replace(/^Stage \d+ — /, '')}</h3>
      <p class="stage-progress">${earnedCount} of ${stageTrophies.length} earned in this stage</p>
      <p>${stage.text}</p>
      <p><strong>Goal:</strong> ${stage.goal}</p>
      <p class="stage-ids">Trophies: ${names}</p></li>`;
    })
    .join('');
}

export function renderRoadmap(listElement, stages, trophies, progress) {
  listElement.innerHTML = roadmapHtml(stages, trophies, progress);
}

export function updateProgressCard(progress, total) {
  const earned = progress.earned.length;
  const pct = total ? Math.round((earned / total) * 100) : 0;
  document.getElementById('earned-count').textContent = String(earned);
  document.getElementById('earned-pct').textContent = `${pct}%`;
  const fill = document.getElementById('progress-fill');
  fill.style.width = `${pct}%`;
  document.getElementById('progress-bar').setAttribute('aria-valuenow', String(earned));
  const byGrade = { platinum: 0, gold: 0, silver: 0, bronze: 0 };
  progress.earnedGrades.forEach((grade) => {
    if (grade in byGrade) byGrade[grade] += 1;
  });
  document.getElementById('grade-line').textContent =
    `${byGrade.platinum} platinum · ${byGrade.gold} gold · ${byGrade.silver} silver · ${byGrade.bronze} bronze`;
}
