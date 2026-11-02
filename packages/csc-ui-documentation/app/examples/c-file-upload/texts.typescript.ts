import type { CFileUploadFunction, CFileUploadTexts } from '@cscfi/csc-ui';

// Every text, so none falls back to English.
const texts: CFileUploadTexts = {
  announceAdded: (count) =>
    count === 1 ? '1 tiedosto lisätty' : `${count} tiedostoa lisätty`,
  announceFailed: (name, error) => `${name} epäonnistui: ${error}`,
  announceRejected: (name, reason) => `${name}: ${reason}`,
  announceUploaded: (name) => `${name} lähetetty`,
  cancel: (name) => `Peruuta tiedoston ${name} lähetys`,
  choose: (multiple) => (multiple ? 'valitse tiedostot' : 'valitse tiedosto'),
  chooseButton: (multiple) =>
    multiple ? 'Valitse tiedostot' : 'Valitse tiedosto',
  close: (name) => `Sulje ${name}`,
  compactPrompt: (multiple) =>
    multiple ? 'tai pudota tiedostot tähän' : 'tai pudota tiedosto tähän',
  dragPrompt: (multiple) =>
    multiple ? 'Raahaa tiedostot tähän tai' : 'Raahaa tiedosto tähän tai',
  dropActive: (multiple) =>
    multiple
      ? 'Pudota tiedostot lisätäksesi ne'
      : 'Pudota tiedosto lisätäksesi sen',
  progress: (loaded, total, percent) => `${loaded} / ${total} · ${percent} %`,
  queued: 'Jonossa',
  rejectedCount: (max) =>
    max === 1 ? 'Vain yksi tiedosto sallitaan' : `Enintään ${max} tiedostoa`,
  rejectedDuplicate: 'Lisätty jo',
  rejectedFolder: 'Kansioita ei tueta',
  rejectedSize: (max) => `Suurempi kuin ${max}`,
  rejectedType: 'Tiedostotyyppiä ei hyväksytä',
  remove: (name) => `Poista ${name}`,
  retry: (name) => `Yritä uudelleen: ${name}`,
  uploaded: 'Lähetetty',
  uploadFailed: 'Lähetys epäonnistui',
  uploading: 'Lähetetään',
};

// Stands in for a real request: reports progress for two seconds, then
// resolves — or refuses a file whose name contains "fail".
const upload: CFileUploadFunction = (file, { onProgress, signal }) =>
  new Promise((resolve, reject) => {
    let sent = 0;

    const timer = setInterval(() => {
      sent = Math.min(1, sent + 0.1);
      onProgress(sent);

      if (sent < 1) return;
      clearInterval(timer);

      if (file.name.includes('fail')) {
        reject(new Error('The server refused the file'));
      } else {
        resolve({ id: `file-${Date.now()}` });
      }
    }, 200);

    signal.addEventListener('abort', () => clearInterval(timer));
  });

// Objects and functions have no attribute form: set them as DOM properties.
const field = document.querySelector('c-file-upload')!;
field.texts = texts;
field.upload = upload;

field.addEventListener('change', (event) => {
  document.querySelector('p')!.textContent =
    `Tiedostoja: ${event.detail.length}`;
});
