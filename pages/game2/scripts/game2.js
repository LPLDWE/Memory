(async () => {
  // ==============================
  // Konstanten
  // ==============================
  const STORAGE_KEY = 'game2_state_v1';
  const FALLBACK_GROUP_NAME = '(–)';
  const FALLBACK_SCORE = 0;

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
  };

  // ==============================
  // Hilfsfunktionen
  // ==============================
  const generateId = () => 'g' + Math.random().toString(36).slice(2, 9);
  const findGroupById = (id) => state.groups.find((g) => g.id === id);
  const getCurrentGroup = () => findGroupById(state.currentGroupId);

  // ==============================
  // Persistenz mit LocalStorage
  // ==============================
  function saveState() {
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({
          groups: state.groups,
          turnOrder: state.turnOrder,
          currentGroupId: state.currentGroupId,
          availableImages: state.availableImages,
          currentImage: state.currentImage,
        })
      );
    } catch (error) {
      console.warn('Fehler beim Speichern des States:', error);
    }
  }

  function loadPersistedState() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return;
      const snap = JSON.parse(raw);
      if (!Array.isArray(snap.groups)) return;

      state.groups = snap.groups;
      state.turnOrder = snap.turnOrder || state.groups.map((g) => g.id);
      state.currentGroupId = snap.currentGroupId || state.groups[0]?.id || null;
      state.availableImages = snap.availableImages || [];
      state.currentImage = snap.currentImage || null;
    } catch (error) {
      console.warn('Fehler beim Laden des States:', error);
    }
  }

  // ==============================
  // Spiel-Logik
  // ==============================
  function addGroup(name) {
    const trimmedName = name.trim();
    if (!trimmedName) return;

    if (
      state.groups.some(
        (g) => g.name.toLowerCase() === trimmedName.toLowerCase()
      )
    ) {
      alert(`Die Gruppe "${trimmedName}" existiert bereits!`);
      return;
    }

    const newGroup = { id: generateId(), name: trimmedName, score: 0 };
    state.groups.push(newGroup);
    state.turnOrder.push(newGroup.id);
    if (!state.currentGroupId) state.currentGroupId = newGroup.id;

    renderAll();
    saveState();
  }

  function deleteGroup(id) {
    state.groups = state.groups.filter((g) => g.id !== id);
    state.turnOrder = state.turnOrder.filter((gid) => gid !== id);

    if (state.currentGroupId === id) {
      state.currentGroupId = state.groups[0]?.id || null;
    }

    renderAll();
    saveState();
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
      saveState();
    }
  }

  function nextGroup() {
    if (!state.turnOrder.length) return;
    const currentIndex = state.turnOrder.indexOf(state.currentGroupId);
    state.currentGroupId =
      state.turnOrder[(currentIndex + 1) % state.turnOrder.length];
    renderAll();
    saveState();
  }

  function updateCurrentScore(newScore) {
    const group = getCurrentGroup();
    if (!group) return;
    group.score = Math.max(0, Math.round(newScore));
    renderAll();
    saveState();
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

    const sortedGroups = [...state.groups].sort((a, b) =>
      b.score !== a.score
        ? b.score - a.score
        : a.name.localeCompare(b.name, 'de', { sensitivity: 'base' })
    );

    sortedGroups.forEach((group) => {
      const row = document.createElement('tr');
      if (group.id === state.currentGroupId) row.classList.add('is-current');

      row.innerHTML = `
        <td class="gt-name">${group.name}</td>
        <td class="gt-score">${group.score}</td>
        <td class="gt-delete"><button class="delete-btn">×</button></td>
      `;

      row.querySelector('.delete-btn').addEventListener('click', (e) => {
        e.stopPropagation();
        if (confirm(`Gruppe "${group.name}" wirklich löschen?`)) {
          deleteGroup(group.id);
        }
      });

      row.addEventListener('click', () => setCurrentGroup(group.id));
      tbody.appendChild(row);
    });
  }

  function setCurrentGroup(id) {
    if (!findGroupById(id)) return;
    state.currentGroupId = id;
    renderAll();
    saveState();
  }

  function renderCurrentGroupHeader() {
    const group = getCurrentGroup();
    els.currentGroupName.textContent = group?.name ?? FALLBACK_GROUP_NAME;
    els.currentScoreInput.value = group?.score ?? FALLBACK_SCORE;

    const isEnabled = !!group;
    [els.currentScoreInput, els.scoreIncBtn, els.scoreDecBtn].forEach(
      (el) => (el.disabled = !isEnabled)
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

    const randomIndex = Math.floor(
      Math.random() * state.availableImages.length
    );
    return state.availableImages.splice(randomIndex, 1)[0];
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
    saveState();
  }

  function nextImage() {
    displayImage(getRandomImage());
  }

  // ==============================
  // Initialisierung
  // ==============================
  async function loadData() {
    try {
      const response = await fetch('./resources/vocab.json', {
        cache: 'no-store',
      });
      if (!response.ok) throw new Error('Fehler beim Laden der Daten');
      const data = await response.json();
      state.dataCards = Array.isArray(data.cards) ? data.cards : [];
      if (!state.availableImages.length) refillImagePool();
    } catch (error) {
      console.error('Fehler beim Laden der Daten:', error);
      state.dataCards = [];
    }
  }

  function renderImageInit() {
    if (state.currentImage) {
      displayImage(state.currentImage);
    } else {
      nextImage();
    }
  }

  function renderAll() {
    renderGroupTable();
    renderCurrentGroupHeader();
    renderImageInit();
  }

  function wireEvents() {
    els.groupForm.addEventListener('submit', (e) => {
      e.preventDefault();
      addGroup(els.groupInput.value);
      els.groupInput.value = '';
    });
    els.addGroupBtn.addEventListener('click', () => {
      addGroup(els.groupInput.value);
      els.groupInput.value = '';
    });

    els.scoreIncBtn.addEventListener('click', () =>
      updateCurrentScore((getCurrentGroup()?.score ?? 0) + 1)
    );
    els.scoreDecBtn.onclick = () =>
      updateCurrentScore((getCurrentGroup()?.score ?? 0) - 1);
    els.nextGroupBtn.addEventListener('click', nextGroup);
    els.changeImageBtn.addEventListener('click', nextImage);
    els.deleteAllGroupsBtn.addEventListener('click', deleteAllGroups);
  }

  // ==============================
  // Start
  // ==============================
  wireEvents();
  loadPersistedState();
  await loadData();
  renderAll();

  // Optional: Spiel neu starten
  // window.restartGame = renderAll;
})();
