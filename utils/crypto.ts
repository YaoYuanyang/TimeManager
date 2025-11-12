
// This utility provides functions for password-based encryption and decryption
// using the Web Crypto API (AES-GCM).

const ALGO = 'AES-GCM';
const SALT_LENGTH = 16; // 128 bit
const IV_LENGTH = 12; // 96 bit is recommended for AES-GCM
const KEY_DERIVATION_ITERATIONS = 100000;

// Helper to convert ArrayBuffer to Base64 string
const bufferToBase64 = (buffer: ArrayBuffer): string => {
  return btoa(String.fromCharCode(...new Uint8Array(buffer)));
};

// Helper to convert Base64 string to Uint8Array
const base64ToBuffer = (base64: string): Uint8Array => {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
};

// Derives an encryption key from a password and salt using PBKDF2
const getKey = async (password: string, salt: Uint8Array): Promise<CryptoKey> => {
  const passwordBuffer = new TextEncoder().encode(password);
  const importedKey = await window.crypto.subtle.importKey(
    'raw',
    passwordBuffer,
    'PBKDF2',
    false,
    ['deriveKey']
  );

  return window.crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: salt,
      iterations: KEY_DERIVATION_ITERATIONS,
      hash: 'SHA-256',
    },
    importedKey,
    { name: ALGO, length: 256 },
    true,
    ['encrypt', 'decrypt']
  );
};

/**
 * Encrypts a JSON object with a password.
 * @param data The JSON object to encrypt.
 * @param password The password to use for encryption.
 * @returns A promise that resolves to a base64 encoded string containing salt, IV, and encrypted data.
 */
export const encryptData = async (data: object, password: string): Promise<string> => {
  const salt = window.crypto.getRandomValues(new Uint8Array(SALT_LENGTH));
  const iv = window.crypto.getRandomValues(new Uint8Array(IV_LENGTH));
  const key = await getKey(password, salt);
  
  const dataString = JSON.stringify(data);
  const dataBuffer = new TextEncoder().encode(dataString);

  const encryptedContent = await window.crypto.subtle.encrypt(
    { name: ALGO, iv: iv },
    key,
    dataBuffer
  );

  const saltB64 = bufferToBase64(salt);
  const ivB64 = bufferToBase64(iv);
  const contentB64 = bufferToBase64(encryptedContent);

  // Combine parts with a separator for easy splitting on decryption
  return `${saltB64}.${ivB64}.${contentB64}`;
};

/**
 * Decrypts a base64 encoded string with a password.
 * @param encryptedString The base64 encoded string from encryptData.
 * @param password The password to use for decryption.
 * @returns A promise that resolves to the decrypted JSON object.
 */
export const decryptData = async (encryptedString: string, password: string): Promise<any> => {
  const parts = encryptedString.split('.');
  if (parts.length !== 3) {
    throw new Error('Invalid encrypted data format.');
  }

  const [saltB64, ivB64, contentB64] = parts;

  const salt = base64ToBuffer(saltB64);
  const iv = base64ToBuffer(ivB64);
  const encryptedContent = base64ToBuffer(contentB64);
  const key = await getKey(password, salt);

  const decryptedContent = await window.crypto.subtle.decrypt(
    { name: ALGO, iv: iv },
    key,
    encryptedContent
  );

  const decryptedString = new TextDecoder().decode(decryptedContent);
  return JSON.parse(decryptedString);
};
