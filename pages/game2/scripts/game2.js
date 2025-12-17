(async () => {
  // ==============================
  // DOM-Elemente
  // ==============================
  const els = {
    groupForm: document.getElementById('group-form'),
    groupInput: document.getElementById('group-input'),
    addGroupBtn: document.getElementById('add-group-btn'),
    deleteAllGroupsBtn: document.getElementById('delete-all-groups-btn'),
    groupTableBody: document.getElementById('group-table-body'),
    groupTableEmpty: document.getElementById('group-table-empty'),
    currentGroupName: document.getElementById('current-group-name'),
    currentScoreInput: document.getElementById('current-score-input'),
    scoreIncBtn: document.getElementById('score-increase-btn'),
    scoreDecBtn: document.getElementById('score-decrease-btn'),
    imageArea: document.getElementById('image-area'),
    imageEl: document.getElementById('prompt-image'),
    imageFallback: document.getElementById('image-fallback'),
    nextGroupBtn: document.getElementById('next-group-btn'),
    changeImageBtn: document.getElementById('change-image-btn'),
  };

  // ==============================
  // State
  // ==============================
  const state = {
    groups: [],
    turnOrder: [],
    currentGroupId: null,
    dataCards: [],
    availableImages: [],
    currentImage: null,
    persistKey: 'game2_state_v1',
  };

  // ==============================
  // Hilfsfunktionen
  // ==============================
  const uid = () => 'g' + Math.random().toString(36).slice(2, 9);
  const byId = (id) => state.groups.find((g) => g.id === id);
  const currentGroup = () => byId(state.currentGroupId);

  // ==============================
  // Persistenz mithilfe von LocalStorage
  // ==============================
  function save() {
    localStorage.setItem(
      state.persistKey,
      JSON.stringify({
        groups: state.groups,
        turnOrder: state.turnOrder,
        currentGroupId: state.currentGroupId,
        availableImages: state.availableImages,
        currentImage: state.currentImage,
      })
    );
  }

  function loadPersisted() {
    const raw = localStorage.getItem(state.persistKey);
    if (!raw) return;
    const snap = JSON.parse(raw);
    if (!Array.isArray(snap.groups)) return;

    state.groups = snap.groups;
    state.turnOrder = snap.turnOrder || state.groups.map((g) => g.id);
    state.currentGroupId = snap.currentGroupId || state.groups[0]?.id || null;
    state.availableImages = snap.availableImages || [];
    state.currentImage = snap.currentImage || null;
  }

  // ==============================
  // Spiel-Logik
  // ==============================
  function addGroup(name) {
    const clean = name.trim();
    if (!clean) return;

    if (
      state.groups.some((g) => g.name.toLowerCase() === clean.toLowerCase())
    ) {
      alert(`Die Gruppe "${clean}" existiert bereits!`);
      return;
    }

    const g = { id: uid(), name: clean, score: 0 };
    state.groups.push(g);
    state.turnOrder.push(g.id);
    if (!state.currentGroupId) state.currentGroupId = g.id;

    renderAll();
    save();
  }

  function deleteGroup(id) {
    state.groups = state.groups.filter((g) => g.id !== id);
    state.turnOrder = state.turnOrder.filter((gid) => gid !== id);

    if (state.currentGroupId === id) {
      state.currentGroupId = state.groups[0]?.id || null;
    }

    renderAll();
    save();
  }

  async function deleteAllGroups() {
    if (
      state.groups.length &&
      confirm(
        'Wirklich alle Gruppen löschen? Diese Aktion kann nicht rückgängig gemacht werden.'
      )
    ) {
      state.groups = [];
      state.turnOrder = [];
      state.currentGroupId = null;
      renderAll();
      save();
    }
  }

  function nextGroup() {
    if (!state.turnOrder.length) return;
    const idx = state.turnOrder.indexOf(state.currentGroupId);
    state.currentGroupId = state.turnOrder[(idx + 1) % state.turnOrder.length];
    renderAll();
    save();
  }

  function updateCurrentScore(score) {
    const g = currentGroup();
    if (!g) return;
    g.score = Math.max(0, Math.round(score));
    renderAll();
    save();
  }

  // ==============================
  // Rendering
  // ==============================
  function renderGroupTable() {
    const tbody = els.groupTableBody;
    tbody.innerHTML = '';

    if (!state.groups.length) {
      els.groupTableEmpty.style.display = 'block';
      return;
    }
    els.groupTableEmpty.style.display = 'none';

    [...state.groups]
      .sort((a, b) =>
        b.score !== a.score
          ? b.score - a.score
          : a.name.localeCompare(b.name, 'de', { sensitivity: 'base' })
      )
      .forEach((g) => {
        const tr = document.createElement('tr');
        if (g.id === state.currentGroupId) tr.classList.add('is-current');

        tr.innerHTML = `
          <td class="gt-name">${g.name}</td>
          <td class="gt-score">${g.score}</td>
          <td class="gt-delete"><button class="delete-btn">×</button></td>
        `;

        tr.querySelector('.delete-btn').onclick = () => {
          if (confirm(`Gruppe "${g.name}" wirklich löschen?`)) {
            deleteGroup(g.id);
          }
        };

        tr.onclick = () => setCurrentGroup(g.id);
        tbody.appendChild(tr);
      });
  }

  function setCurrentGroup(id) {
    if (!byId(id)) return;
    state.currentGroupId = id;
    renderAll();
    save();
  }

  function renderCurrentGroupHeader() {
    const g = currentGroup();
    els.currentGroupName.textContent = g?.name ?? '(–)';
    els.currentScoreInput.value = g?.score ?? 0;

    const enabled = !g;
    [els.currentScoreInput, els.scoreIncBtn, els.scoreDecBtn].forEach(
      (el) => (el.disabled = !enabled)
    );

    els.nextGroupBtn.disabled = state.groups.length < 2;
  }

  // ==============================
  // Bilder
  // ==============================
  function refillImagePool() {
    state.availableImages = [...state.dataCards];
  }

  function getRandomImage() {
    if (!state.availableImages.length) refillImagePool();
    if (!state.availableImages.length) return null;

    return state.availableImages.splice(
      Math.floor(Math.random() * state.availableImages.length),
      1
    )[0];
  }

  function displayImage(image) {
    if (!image) {
      els.imageEl.style.display = 'none';
      els.imageFallback.style.display = 'block';
      return;
    }
    state.currentImage = image;
    els.imageFallback.style.display = 'none';
    els.imageEl.style.display = '';
    els.imageEl.src = './resources/' + image.picture;
    save();
  }

  function nextImage() {
    displayImage(getRandomImage());
  }

  // ==============================
  // Initialisierung
  // ==============================
  async function loadData() {
    try {
      const res = await fetch('./resources/vocab.json', { cache: 'no-store' });
      const data = await res.json();
      state.dataCards = Array.isArray(data.cards) ? data.cards : [];
      if (!state.availableImages.length) refillImagePool();
    } catch {
      state.dataCards = [];
    }
  }

  function renderImageInit() {
    state.currentImage ? displayImage(state.currentImage) : nextImage();
  }

  function renderAll() {
    renderGroupTable();
    renderCurrentGroupHeader();
    renderImageInit();
  }

  function wireEvents() {
    els.groupForm.onsubmit = (e) => {
      e.preventDefault();
      addGroup(els.groupInput.value);
      els.groupInput.value = '';
    };
    els.addGroupBtn.onclick = () => {
      addGroup(els.groupInput.value);
      els.groupInput.value = '';
    };

    els.scoreIncBtn.onclick = () =>
      updateCurrentScore((currentGroup()?.score ?? 0) + 1);
    els.scoreDecBtn.onclick = () =>
      updateCurrentScore((currentGroup()?.score ?? 0) - 1);
    els.nextGroupBtn.onclick = nextGroup;
    els.changeImageBtn.onclick = nextImage;
    els.deleteAllGroupsBtn.onclick = deleteAllGroups;
  }

  // ==============================
  // Start
  // ==============================
  wireEvents();
  loadPersisted();
  await loadData();
  renderAll();

  // optional bewusst freigeben
  // window.restartGame = renderAll;
})();
