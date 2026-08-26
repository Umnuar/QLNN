
const MASTER_KEY_STORAGE_KEY = 'qlnn_client_master_key';

// Derive or get Master CryptoKey
async function getMasterKey(): Promise<CryptoKey> {
  let rawKeyHex = localStorage.getItem(MASTER_KEY_STORAGE_KEY);
  if (!rawKeyHex) {
    const rawKey = window.crypto.getRandomValues(new Uint8Array(32));
    rawKeyHex = Array.from(rawKey)
      .map((b) => b.toString(16).padStart(2, '0'))
      .join('');
    localStorage.setItem(MASTER_KEY_STORAGE_KEY, rawKeyHex);
  }

  const rawKeyBytes = new Uint8Array(
    rawKeyHex.match(/.{1,2}/g)!.map((byte) => parseInt(byte, 16))
  );

  return window.crypto.subtle.importKey(
    'raw',
    rawKeyBytes,
    { name: 'AES-GCM' },
    false,
    ['encrypt', 'decrypt']
  );
}

export async function encryptData(data: any): Promise<string> {
  if (data === undefined || data === null) return '';
  try {
    const plaintext = JSON.stringify(data);
    const key = await getMasterKey();
    const iv = window.crypto.getRandomValues(new Uint8Array(12));
    const encoded = new TextEncoder().encode(plaintext);

    const ciphertext = await window.crypto.subtle.encrypt(
      { name: 'AES-GCM', iv },
      key,
      encoded
    );

    const ivHex = Array.from(iv)
      .map((b) => b.toString(16).padStart(2, '0'))
      .join('');
    const cipherHex = Array.from(new Uint8Array(ciphertext))
      .map((b) => b.toString(16).padStart(2, '0'))
      .join('');

    return `enc:${ivHex}:${cipherHex}`;
  } catch (error) {
    console.error('Error encrypting data:', error);
    return JSON.stringify(data); // Fallback
  }
}

export async function decryptData(encryptedText: string): Promise<any> {
  if (!encryptedText || typeof encryptedText !== 'string' || !encryptedText.startsWith('enc:')) {
    try {
      return JSON.parse(encryptedText);
    } catch {
      return encryptedText;
    }
  }
  try {
    const parts = encryptedText.split(':');
    if (parts.length !== 3) return null;

    const [, ivHex, cipherHex] = parts;
    const iv = new Uint8Array(ivHex.match(/.{1,2}/g)!.map((b) => parseInt(b, 16)));
    const ciphertext = new Uint8Array(
      cipherHex.match(/.{1,2}/g)!.map((b) => parseInt(b, 16))
    );

    const key = await getMasterKey();
    const decrypted = await window.crypto.subtle.decrypt(
      { name: 'AES-GCM', iv },
      key,
      ciphertext
    );

    const plaintext = new TextDecoder().decode(decrypted);
    return JSON.parse(plaintext);
  } catch (error) {
    console.error('Error decrypting data:', error);
    return null;
  }
}

/**
 * Helper định dạng số liệu diện tích, đàn vật nuôi, tiền tệ
 */
export const cryptoHelper = {
  formatCurrency(val: number | null | undefined): string {
    if (val === null || val === undefined) return '0';
    return new Intl.NumberFormat('vi-VN').format(val);
  },

  formatArea(val: number | null | undefined, withUnit: boolean = true): string {
    if (val === null || val === undefined || val === 0) return withUnit ? '0 ha' : '0';
    const formatted = Number(val).toLocaleString('vi-VN', { maximumFractionDigits: 3 });
    return withUnit ? `${formatted} ha` : formatted;
  },

  formatCount(val: number | null | undefined, unit?: string): string {
    if (val === null || val === undefined || val === 0) return unit ? `0 ${unit}` : '0';
    const formatted = Number(val).toLocaleString('vi-VN');
    return unit ? `${formatted} ${unit}` : formatted;
  },
};
