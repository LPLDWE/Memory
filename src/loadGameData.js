export async function loadData() {
  try {
    const res = await fetch('../resources/vocab.json', { cache: 'no-store' });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    return Array.isArray(data.images) ? data.images : [];
  } catch (err) {
    console.warn('Konnte resources/vocab.json nicht laden:', err);
    return []; // Gebe ein leeres Array zurück, wenn der Ladevorgang fehlschlägt
  }
}