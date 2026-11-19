// Leonida Ledger — boot and wiring. Loads the two local data files, renders
// the checklist, roadmap and missables views, and wires the filters, the
// spoiler setting, the detail pane and progress export/import. Everything
// runs offline from files under app/.
import { filterTrophies } from './filters.js';
import { exportProgress, isEarned, loadProgress, parseImportedProgress, saveProgress, toggleEarned } from './store.js';
import { renderDetail, renderRoadmap, renderTrophyList, updateProgressCard } from './views.js';

const VIEWS = ['checklist', 'roadmap', 'missables', 'about'];

let trophies = [];
let stages = [];
let progress = loadProgress();
let filter = 'all';
let grade = 'all';
let query = '';
let selectedId = null;

const listElement = document.getElementById('trophy-list');
const detailElement = document.getElementById('detail');
const statusLine = document.getElementById('status-line');
const emptyNote = document.getElementById('empty-note');
const spoilerToggle = document.getElementById('spoiler-toggle');

function progressWithGrades() {
  const byId = new Map(trophies.map((trophy) => [trophy.id, trophy.grade]));
  return { ...progress, earnedGrades: progress.earned.map((id) => byId.get(id)).filter(Boolean) };
}

function refresh() {
  const shown = filterTrophies(trophies, { filter, grade, query, earnedIds: progress.earned });
  renderTrophyList(listElement, shown, progress, progress.spoiler, selectedId);
  statusLine.textContent = `Showing ${shown.length} of ${trophies.length} trophies.`;
  emptyNote.hidden = shown.length !== 0;
  const selected = trophies.find((trophy) => trophy.id === selectedId) || null;
  renderDetail(detailElement, selected, progress, progress.spoiler);
  const missableList = document.getElementById('missable-list');
  renderTrophyList(
    missableList,
    trophies.filter((trophy) => trophy.missable),
    progress,
    progress.spoiler,
    selectedId,
  );
  renderRoadmap(document.getElementById('roadmap-list'), stages, trophies, progress);
  updateProgressCard(progressWithGrades(), trophies.length);
  document.getElementById('missable-count').textContent = String(trophies.filter((trophy) => trophy.missable).length);
}

function showView(name) {
  const view = VIEWS.includes(name) ? name : 'checklist';
  VIEWS.forEach((candidate) => {
    document.getElementById(`view-${candidate}`).hidden = candidate !== view;
  });
  document.querySelectorAll('.tab').forEach((tab) => {
    tab.classList.toggle('active', tab.dataset.view === view);
  });
  if (view !== 'checklist') history.replaceState(null, '', `#/${view}`);
  else history.replaceState(null, '', '#/');
}

function selectTrophy(id) {
  selectedId = id;
  refresh();
  detailElement.scrollIntoView({ block: 'nearest' });
}

function wireEvents() {
  document.querySelectorAll('.tab').forEach((tab) => {
    tab.addEventListener('click', () => showView(tab.dataset.view));
  });
  document.getElementById('search').addEventListener('input', (event) => {
    query = event.target.value.trim();
    refresh();
  });
  document.getElementById('grade-select').addEventListener('change', (event) => {
    grade = event.target.value;
    refresh();
  });
  document.getElementById('filters').addEventListener('click', (event) => {
    const chip = event.target.closest('[data-filter]');
    if (!chip) return;
    filter = chip.dataset.filter;
    document.querySelectorAll('#filters .chip').forEach((item) => {
      item.classList.toggle('active', item === chip);
    });
    refresh();
  });
  spoilerToggle.addEventListener('change', () => {
    progress = saveProgress({ earned: progress.earned, spoiler: spoilerToggle.checked });
    refresh();
  });
  document.querySelector('main').addEventListener('click', (event) => {
    const check = event.target.closest('[data-check]');
    if (check) {
      event.stopPropagation();
      progress = toggleEarned(progress, Number(check.dataset.check));
      refresh();
      return;
    }
    const row = event.target.closest('.trophy-row');
    if (row) selectTrophy(Number(row.dataset.id));
  });
  document.querySelector('main').addEventListener('keydown', (event) => {
    if (event.key !== 'Enter') return;
    const row = event.target.closest('.trophy-row');
    if (row) selectTrophy(Number(row.dataset.id));
  });
  document.getElementById('export-btn').addEventListener('click', () => exportProgress(progress));
  document.getElementById('import-btn').addEventListener('click', () => {
    document.getElementById('import-file').click();
  });
  document.getElementById('import-file').addEventListener('change', async (event) => {
    const file = event.target.files[0];
    const status = document.getElementById('import-status');
    if (!file) return;
    try {
      const imported = parseImportedProgress(await file.text());
      progress = saveProgress({ earned: imported.earned, spoiler: progress.spoiler });
      spoilerToggle.checked = progress.spoiler;
      status.textContent = `Imported ${imported.earned.length} earned trophies.`;
      refresh();
    } catch {
      status.textContent = 'That file could not be read as Leonida Ledger progress. Nothing was changed.';
    }
    event.target.value = '';
  });
  document.getElementById('reset-btn').addEventListener('click', () => {
    if (window.confirm('Clear all earned trophies? This cannot be undone.')) {
      progress = saveProgress({ earned: [], spoiler: progress.spoiler });
      selectedId = null;
      refresh();
    }
  });
  window.addEventListener('hashchange', () => {
    const name = location.hash.replace('#/', '');
    if (VIEWS.includes(name)) showView(name);
  });
}

async function loadData() {
  const [trophyResponse, roadmapResponse] = await Promise.all([
    fetch('data/trophies.json'),
    fetch('data/roadmap.json'),
  ]);
  const trophyData = await trophyResponse.json();
  const roadmapData = await roadmapResponse.json();
  trophies = trophyData.trophies || trophyData;
  stages = roadmapData.stages || [];
}

async function boot() {
  spoilerToggle.checked = progress.spoiler === true;
  await loadData();
  wireEvents();
  const hash = location.hash.replace('#/', '');
  if (VIEWS.includes(hash) && hash !== 'checklist') showView(hash);
  refresh();
}

boot().catch((error) => {
  statusLine.textContent = `The guide data could not be loaded: ${error.message}`;
});
