const grid = document.getElementById('grid');
const treasureList = document.getElementById('treasure-list');
const historyList = document.getElementById('history-list');

const demoImgURL =
  'https://www.atelier2f.de/bildkatalog/bild/fitheight/1500/9592/9592_5fb150a841b78166697626.jpg';

let openCard = null;


// === Functions ===

async function loadData() {
  try {
    const res = await fetch("./resources/vocab.json", { cache: 'no-store' });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    return Array.isArray(data.cards) ? data.cards : [];
  } catch (err) {
    console.warn('Konnte resources/vocab.json nicht laden:', err);
    return []; // Gebe ein leeres Array zurück, wenn der Ladevorgang fehlschlägt
  }
}

async function loadConfig() {
  try {
    const response = await fetch('./resources/config.json');
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    return await response.json();
  } catch (error) {
    console.error('Es gab ein Problem beim Laden der Konfiguration:', error);
  }
}

function add_config_categories() {
  const container = document.getElementById('dynamic-categories'); // or any other container

  config.categories.forEach(category => {
    const entryDiv = document.createElement('div');
    entryDiv.className = 'history-entry';

    entryDiv.innerHTML = `
    ${category}
    <div class="image-history"></div>
  `;

    container.appendChild(entryDiv);
  });
}


// === Main ===
const data = await loadData();
const config = await loadConfig();

add_config_categories();


const treasureCardIndices = [];

// Randomly pick 4 unique indices for treasure cards
while (treasureCardIndices.length < 20) {
  const randomIndex = Math.floor(Math.random() * 42); // Generate random number between 0 and 41
  if (!treasureCardIndices.includes(randomIndex)) {
    treasureCardIndices.push(randomIndex);
  }
}

for (let i = 0; i <= 41; i++) {
  const card = document.createElement('div');
  card.className = 'card';
  const img = document.createElement('img');

  if (treasureCardIndices.includes(i)) {
    img.src = "./../../../resources/assets/images/treasure.svg";  // Set treasure image for these 4 cards
    card.classList.add('treasure-card'); // Add a special class for treasure cards
  } else {
    img.src = "./../../../resources/" + data[i].picture || demoImgURL;  // Default image for other cards
  }

  img.alt = `Karte ${i}`;
  card.appendChild(img);



  card.addEventListener('click', () => {
    if (openCard) return;
    card.classList.add('show');
    openCard = card;

    if (openCard.classList.contains('treasure-card')) {
      console.log("treasure");
      openCard = null;

      const entryDiv = document.createElement('div');
      entryDiv.className = 'history-entry';

      entryDiv.innerHTML = `
        <img class="" style="height: 6rem" src="./../../../resources/assets/images/treasure.svg" alt="Schatz gefunden">
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

