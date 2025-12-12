(function () {
  const els = {
    // Gruppen / Tabelle
    groupForm: document.getElementById('group-form'),
    groupInput: document.getElementById('group-input'),
    addGroupBtn: document.getElementById('add-group-btn'),
    deleteAllGroupsBtn: document.getElementById('delete-all-groups-btn'),
    groupTableBody: document.getElementById('group-table-body'),
    groupTableEmpty: document.getElementById('group-table-empty'),

    // Aktuelle Runde
    currentGroupName: document.getElementById('current-group-name'),
    currentScoreInput: document.getElementById('current-score-input'),
    scoreIncBtn: document.getElementById('score-increase-btn'),
    scoreDecBtn: document.getElementById('score-decrease-btn'),

    // Bild / Aktionen
    imageArea: document.getElementById('image-area'),
    imageEl: document.getElementById('prompt-image'),
    imageFallback: document.getElementById('image-fallback'),
    nextGroupBtn: document.getElementById('next-group-btn'),
    changeImageBtn: document.getElementById('change-image-btn'),
  };

  const state = {
    groups: [], // [{id, name, score}]
    turnOrder: [], // [groupId, ...] – Reihenfolge für "Nächste Gruppe"
    currentGroupId: null, // aktive Gruppe
    allImages: [], // Alle Bilder aus JSON [{src, word_de?, word_native?}, ...]
    availableImages: [], // Pool verfügbarer Bilder (wird geleert)
    currentImage: null, // Aktuell angezeigtes Bild
    persistKey: 'game2_state_v1',
  };

  // Hilfsfunktionen
  const uid = () => 'g' + Math.random().toString(36).slice(2, 9);
  const byId = (id) => state.groups.find((g) => g.id === id);
  const currentGroup = () => byId(state.currentGroupId);

  function save() {
    const snapshot = {
      groups: state.groups,
      turnOrder: state.turnOrder,
      currentGroupId: state.currentGroupId,
      availableImages: state.availableImages,
      currentImage: state.currentImage,
    };
    try {
      localStorage.setItem(state.persistKey, JSON.stringify(snapshot));
    } catch (_) {}
  }

  function loadPersisted() {
    try {
      const raw = localStorage.getItem(state.persistKey);
      if (!raw) return;
      const snap = JSON.parse(raw);
      if (snap && Array.isArray(snap.groups)) {
        state.groups = snap.groups;
        state.turnOrder = snap.turnOrder || state.groups.map((g) => g.id);
        state.currentGroupId =
          snap.currentGroupId || (state.groups[0]?.id ?? null);
        state.availableImages = snap.availableImages || [];
        state.currentImage = snap.currentImage || null;
      }
    } catch (_) {}
  }

  // Gruppen-Logik
  function addGroup(name) {
    const clean = name.trim();
    if (!clean) return;

    // Prüfen ob Gruppenname bereits existiert (case-insensitive)
    const nameExists = state.groups.some(
      (g) => g.name.toLowerCase() === clean.toLowerCase()
    );

    if (nameExists) {
      alert(`Die Gruppe "${clean}" existiert bereits!`);
      return;
    }

    const g = { id: uid(), name: clean, score: 0 };
    state.groups.push(g);
    state.turnOrder.push(g.id);
    if (!state.currentGroupId) {
      state.currentGroupId = g.id;
    }
    renderAll();
    save();
  }

  function setCurrentGroup(id) {
    if (!byId(id)) return;
    state.currentGroupId = id;
    // Turn-Index anpassen
    state.turnOrder = state.turnOrder.filter((x) => byId(x)); // Sicherheits-Filter
    renderAll();
    save();
  }

  function deleteGroup(id) {
    const idx = state.groups.findIndex((g) => g.id === id);
    if (idx === -1) return;
    state.groups.splice(idx, 1);
    state.turnOrder = state.turnOrder.filter((gid) => gid !== id);

    // Wenn gelöschte Gruppe die aktuelle war, nächste wählen
    if (state.currentGroupId === id) {
      state.currentGroupId =
        state.groups.length > 0 ? state.groups[0].id : null;
    }
    renderAll();
    save();
  }

  function deleteAllGroups() {
    if (state.groups.length === 0) return;

    if (
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
    if (state.turnOrder.length === 0) return;
    const idx = state.turnOrder.indexOf(state.currentGroupId);
    const nextIdx = (idx + 1) % state.turnOrder.length;
    state.currentGroupId = state.turnOrder[nextIdx];
    renderAll();
    save();
  }

  function updateCurrentScore(newScore) {
    const g = currentGroup();
    if (!g) return;
    const v = Number.isFinite(newScore)
      ? Math.max(0, Math.round(newScore))
      : g.score;
    g.score = v;
    renderAll(); // sortiert Tabelle neu
    save();
  }

  // Tabelle rendern (sortiert nach Score desc, dann Name asc)
  function renderGroupTable() {
    const tbody = els.groupTableBody;
    tbody.innerHTML = '';

    if (state.groups.length === 0) {
      els.groupTableEmpty.style.display = 'block';
      return;
    }
    els.groupTableEmpty.style.display = 'none';

    const sorted = [...state.groups].sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score;
      return a.name.localeCompare(b.name, 'de', { sensitivity: 'base' });
    });

    for (const g of sorted) {
      const tr = document.createElement('tr');
      tr.dataset.groupId = g.id;
      if (g.id === state.currentGroupId) tr.classList.add('is-current');

      const tdName = document.createElement('td');
      tdName.className = 'gt-name';
      tdName.textContent = g.name;

      const tdScore = document.createElement('td');
      tdScore.className = 'gt-score';
      tdScore.textContent = g.score;

      const tdDelete = document.createElement('td');
      tdDelete.className = 'gt-delete';
      const deleteBtn = document.createElement('button');
      deleteBtn.className = 'delete-btn';
      deleteBtn.textContent = '×';
      deleteBtn.title = 'Gruppe löschen';
      deleteBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        if (confirm(`Gruppe "${g.name}" wirklich löschen?`)) {
          deleteGroup(g.id);
        }
      });
      tdDelete.appendChild(deleteBtn);

      tr.appendChild(tdName);
      tr.appendChild(tdScore);
      tr.appendChild(tdDelete);

      tr.addEventListener('click', () => {
        setCurrentGroup(g.id);
      });

      tbody.appendChild(tr);
    }
  }

  // Aktuelle Gruppe + Punktefeld synchronisieren
  function renderCurrentGroupHeader() {
    const g = currentGroup();
    els.currentGroupName.textContent = g ? g.name : '(–)';
    els.currentScoreInput.value = g ? g.score : 0;

    const hasGroup = !!g;
    els.currentScoreInput.disabled = !hasGroup;
    els.scoreIncBtn.disabled = !hasGroup;
    els.scoreDecBtn.disabled = !hasGroup;
    els.nextGroupBtn.disabled = state.groups.length < 2;
  }

  // Bild-Logik: Zufällig ohne Wiederholung
  function refillImagePool() {
    // Pool wieder auffüllen mit allen Bildern
    state.availableImages = [...state.allImages];
  }

  function getRandomImage() {
    // Wenn Pool leer, wieder auffüllen
    if (state.availableImages.length === 0) {
      refillImagePool();
    }

    // Falls immer noch keine Bilder vorhanden
    if (state.availableImages.length === 0) {
      return null;
    }

    // Zufälliges Bild aus dem Pool wählen
    const randomIndex = Math.floor(
      Math.random() * state.availableImages.length
    );
    const image = state.availableImages[randomIndex];

    // Bild aus Pool entfernen
    state.availableImages.splice(randomIndex, 1);

    return image;
  }

  function displayImage(image) {
    if (!image) {
      els.imageEl.style.display = 'none';
      els.imageFallback.style.display = 'block';
      return;
    }

    state.currentImage = image;
    els.imageFallback.style.display = 'none';
    els.imageEl.style.display = 'block';
    els.imageEl.src = image.src;
    els.imageEl.alt = image.word_de ? `Bild: ${image.word_de}` : 'Bild';
    save();
  }

  function nextImage() {
    const image = getRandomImage();
    displayImage(image);
  }

  function renderImageInit() {
    if (!state.allImages || state.allImages.length === 0) {
      els.imageEl.style.display = 'none';
      els.imageFallback.style.display = 'block';
      return;
    }

    // Wenn gespeichertes Bild vorhanden, anzeigen
    if (state.currentImage) {
      displayImage(state.currentImage);
    } else {
      // Sonst neues zufälliges Bild
      nextImage();
    }
  }

  function wireImageEvents() {
    els.imageEl.addEventListener('error', () => {
      els.imageEl.style.display = 'none';
      els.imageFallback.style.display = 'block';
    });
  }

  // Gesamtes UI neu zeichnen
  function renderAll() {
    renderGroupTable();
    renderCurrentGroupHeader();
  }

  // Events verbinden
  function wireEvents() {
    // Gruppe hinzufügen
    els.addGroupBtn.addEventListener('click', (e) => {
      e.preventDefault();
      addGroup(els.groupInput.value);
      els.groupInput.value = '';
      els.groupInput.focus();
    });
    // Enter im Input = hinzufügen
    els.groupForm.addEventListener('submit', (e) => {
      e.preventDefault();
      addGroup(els.groupInput.value);
      els.groupInput.value = '';
    });

    // Punkte-Input
    els.currentScoreInput.addEventListener('change', () => {
      const n = parseInt(els.currentScoreInput.value, 10);
      updateCurrentScore(Number.isFinite(n) ? n : 0);
    });
    els.scoreIncBtn.addEventListener('click', () => {
      const g = currentGroup();
      if (!g) return;
      updateCurrentScore(g.score + 1);
    });
    els.scoreDecBtn.addEventListener('click', () => {
      const g = currentGroup();
      if (!g) return;
      updateCurrentScore(Math.max(0, g.score - 1));
    });

    // Nächste Gruppe / Bild ändern
    els.nextGroupBtn.addEventListener('click', () => {
      nextGroup();
    });
    els.changeImageBtn.addEventListener('click', () => {
      nextImage();
    });

    // Alle Gruppen löschen
    els.deleteAllGroupsBtn.addEventListener('click', () => {
      deleteAllGroups();
    });
  }

  // Daten laden
  async function loadData() {
    try {
      const res = await fetch('./data/game.json', { cache: 'no-store' });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      state.allImages = Array.isArray(data.images) ? data.images : [];

      // Pool initialisieren, falls noch nicht geladen aus localStorage
      if (state.availableImages.length === 0 && state.allImages.length > 0) {
        refillImagePool();
      }
    } catch (err) {
      console.warn('Konnte data/game.json nicht laden:', err);
      state.allImages = [];
    }
  }

  // Init
  (async function init() {
    wireEvents();
    wireImageEvents();
    loadPersisted();
    await loadData();
    renderAll();
    renderImageInit();
  })();
});
