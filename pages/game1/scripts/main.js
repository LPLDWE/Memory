(function () {
  const grid = document.getElementById('grid');
  const treasureList = document.getElementById('treasure-list');
  const historyList = document.getElementById('history-list');

  const demoImgURL =
    'https://www.atelier2f.de/bildkatalog/bild/fitheight/1500/9592/9592_5fb150a841b78166697626.jpg';

  let openCard = null;

  for (let i = 1; i <= 42; i++) {
    const card = document.createElement('div');
    card.className = 'card';
    const img = document.createElement('img');
    img.src = demoImgURL;
    img.alt = `Karte ${i}`;
    card.appendChild(img);

    card.addEventListener('click', () => {
      if (openCard) return;
      card.classList.add('show');
      openCard = card;
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
