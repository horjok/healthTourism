const ALFABE = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';

export function generatePNR(): string {
  const yil = new Date().getFullYear().toString().slice(-2);
  const kod = Array.from({ length: 4 }, () =>
    ALFABE[Math.floor(Math.random() * ALFABE.length)]
  ).join('');
  return `HT-${yil}-${kod}`;
}
