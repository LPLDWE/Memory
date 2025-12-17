(async function () {
  const grid = document.getElementById('grid');
  const treasureList = document.getElementById('treasure-list');
  const historyList = document.getElementById('history-list');

  const demoImgURL = '/resources/images/lion.png';

  let openCard = null;

  // === Functions ===

  async function loadData() {
    try {
      const res = await fetch('./resources/vocab.json', { cache: 'no-store' });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      return Array.isArray(data.cards) ? data.cards : [];
    } catch (err) {
      console.warn('Konnte resources/vocab.json nicht laden:', err);
      return [];
    }
  }

  async function loadConfig() {
    try {
      const response = await fetch('./resources/config.json');
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      const temp = await response.json();
      return temp.treasureHunt;
    } catch (error) {
      console.error('Es gab ein Problem beim Laden der Konfiguration:', error);
    }
  }

  function add_config_categories() {
    const container = document.getElementById('dynamic-categories');

    config.categories.forEach((category) => {
      const entryDiv = document.createElement('div');
      entryDiv.className = 'history-entry';

      entryDiv.innerHTML = `
        ${category}
        <div class="image-history"></div>
      `;

      container.appendChild(entryDiv);
    });
  }

  function refreshTreasures() {
    document.getElementById('treasure-title').innerHTML =
      'Schätze (' + foundTreasures + ' / ' + config.treasure_chests + ')';
  }

  // === Main ===
  const data = await loadData();
  const config = await loadConfig();

  add_config_categories();

  let foundTreasures = 0;
  refreshTreasures();

  const treasureCardIndices = [];

  while (treasureCardIndices.length < config.treasure_chests) {
    const randomIndex = Math.floor(Math.random() * 42);
    if (!treasureCardIndices.includes(randomIndex)) {
      treasureCardIndices.push(randomIndex);
    }
  }

  for (let i = 0; i <= 41; i++) {
    const card = document.createElement('div');
    card.className = 'card';
    const img = document.createElement('img');

    if (treasureCardIndices.includes(i)) {
      img.src = './../../../resources/assets/images/treasure.svg';
      card.classList.add('treasure-card');
    } else {
      img.src = './../../../resources/' + data[i].picture || demoImgURL;
    }

    img.alt = `Karte ${i}`;
    card.appendChild(img);

    card.addEventListener('click', () => {
      if (openCard) return;
      card.classList.add('show');
      openCard = card;

      if (openCard.classList.contains('treasure-card')) {
        openCard = null;
        foundTreasures++;
        refreshTreasures();

        const entryDiv = document.createElement('div');
        entryDiv.className = 'history-entry';
        entryDiv.innerHTML = `
          <img style="height: 6rem"
               src="./../../../resources/assets/images/treasure.svg"
               alt="Schatz gefunden">
        `;
        treasureList.appendChild(entryDiv);
      }
    });

    grid.appendChild(card);
  }

  const categoryEntries = Array.from(
    historyList.querySelectorAll('.history-entry')
  );

  categoryEntries.forEach((categoryEntry) => {
    categoryEntry.style.cursor = 'pointer';
    categoryEntry.addEventListener('click', () => {
      if (!openCard) return;

      const imageHistory = categoryEntry.querySelector('.image-history');
      imageHistory.innerHTML = '';

      const cloneCard = openCard.cloneNode(true);
      cloneCard.classList.remove('show');
      cloneCard.style.cursor = 'default';
      cloneCard.classList.add('show');

      imageHistory.appendChild(cloneCard);

      openCard.style.opacity = '0.4';
      openCard.style.pointerEvents = 'none';

      openCard = null;
    });
  });
})();
