import AsyncStorage from '@react-native-async-storage/async-storage';
import { sha256 } from './pinSecurityService';

const AES_MASTER_KEY_STORAGE = '@morabaraba_data_aes_key_v1';

// ============================================================================
// AES-256 S-BOX & INVERSE S-BOX TABLES (FIPS 197)
// ============================================================================

const S_BOX: number[] = [
  0x63, 0x7c, 0x77, 0x7b, 0xf2, 0x6b, 0x6f, 0xc5, 0x30, 0x01, 0x67, 0x2b, 0xfe, 0xd7, 0xab, 0x76,
  0xca, 0x82, 0xc9, 0x7d, 0xfa, 0x59, 0x47, 0xf0, 0xad, 0xd4, 0xa2, 0xaf, 0x9c, 0xa4, 0x72, 0xc0,
  0xb7, 0xfd, 0x93, 0x26, 0x36, 0x3f, 0xf7, 0xcc, 0x34, 0xa5, 0xe5, 0xf1, 0x71, 0xd8, 0x31, 0x15,
  0x04, 0xc7, 0x23, 0xc3, 0x18, 0x96, 0x05, 0x9a, 0x07, 0x12, 0x80, 0xe2, 0xeb, 0x27, 0xb2, 0x75,
  0x09, 0x83, 0x2c, 0x1a, 0x1b, 0x6e, 0x5a, 0xa0, 0x52, 0x3b, 0xd6, 0xb3, 0x29, 0xe3, 0x2f, 0x84,
  0x53, 0xd1, 0x00, 0xed, 0x20, 0xfc, 0xb1, 0x5b, 0x6a, 0xcb, 0xbe, 0x39, 0x4a, 0x4c, 0x58, 0xcf,
  0xd0, 0xef, 0xaa, 0xfb, 0x43, 0x4d, 0x33, 0x85, 0x45, 0xf9, 0x02, 0x7f, 0x50, 0x3c, 0x9f, 0xa8,
  0x51, 0xa3, 0x40, 0x8f, 0x92, 0x9d, 0x38, 0xf5, 0xbc, 0xb6, 0xda, 0x21, 0x10, 0xff, 0xf3, 0xd2,
  0xcd, 0x0c, 0x13, 0xec, 0x5f, 0x97, 0x44, 0x17, 0xc4, 0xa7, 0x7e, 0x3d, 0x64, 0x5d, 0x19, 0x73,
  0x60, 0x81, 0x4f, 0xdc, 0x22, 0x2a, 0x90, 0x88, 0x46, 0xee, 0xb8, 0x14, 0xde, 0x5e, 0x0b, 0xdb,
  0xe0, 0x32, 0x3a, 0x0a, 0x49, 0x06, 0x24, 0x5c, 0xc2, 0xd3, 0xac, 0x62, 0x91, 0x95, 0xe4, 0x79,
  0xe7, 0xc8, 0x37, 0x6d, 0x8d, 0xd5, 0x4e, 0xa9, 0x6c, 0x56, 0xf4, 0xea, 0x65, 0x7a, 0xae, 0x08,
  0xba, 0x78, 0x25, 0x2e, 0x1c, 0xa6, 0xb4, 0xc6, 0xe8, 0xdd, 0x74, 0x1f, 0x4b, 0xbd, 0x8b, 0x8a,
  0x70, 0x3e, 0xb5, 0x66, 0x48, 0x03, 0xf6, 0x0e, 0x61, 0x35, 0x57, 0xb9, 0x86, 0xc1, 0x1d, 0x9e,
  0xe1, 0xf8, 0x98, 0x11, 0x69, 0xd9, 0x8e, 0x94, 0x9b, 0x1e, 0x87, 0xe9, 0xce, 0x55, 0x28, 0xdf,
  0x8c, 0xa1, 0x89, 0x0d, 0xbf, 0xe6, 0x42, 0x68, 0x41, 0x99, 0x2d, 0x0f, 0xb0, 0x54, 0xbb, 0x16,
];

const INV_S_BOX: number[] = new Array(256);
for (let i = 0; i < 256; i++) {
  INV_S_BOX[S_BOX[i]] = i;
}

const R_CON: number[] = [0x00, 0x01, 0x02, 0x04, 0x08, 0x10, 0x20, 0x40, 0x80, 0x1b, 0x36];

// Galois Multiplication in GF(2^8)
function gmul(a: number, b: number): number {
  let p = 0;
  for (let counter = 0; counter < 8; counter++) {
    if ((b & 1) !== 0) p ^= a;
    const hiBitSet = (a & 0x80) !== 0;
    a = (a << 1) & 0xff;
    if (hiBitSet) a ^= 0x1b; // Rijndael polynomial x^8 + x^4 + x^3 + x + 1
    b >>= 1;
  }
  return p;
}

// ============================================================================
// AES-256 CORE (14 ROUNDS, 60 WORDS KEY SCHEDULE)
// ============================================================================

function keyExpansion(keyBytes: number[]): number[][] {
  const words: number[][] = [];
  const Nk = 8; // 8 32-bit words for 256-bit key
  const Nr = 14; // 14 rounds
  const Nb = 4; // 4 words per state block

  for (let i = 0; i < Nk; i++) {
    words.push([keyBytes[4 * i], keyBytes[4 * i + 1], keyBytes[4 * i + 2], keyBytes[4 * i + 3]]);
  }

  for (let i = Nk; i < Nb * (Nr + 1); i++) {
    let temp = [...words[i - 1]];
    if (i % Nk === 0) {
      // RotWord & SubWord & Rcon
      const rot = [temp[1], temp[2], temp[3], temp[0]];
      temp = [
        S_BOX[rot[0]] ^ R_CON[i / Nk],
        S_BOX[rot[1]],
        S_BOX[rot[2]],
        S_BOX[rot[3]],
      ];
    } else if (Nk > 6 && i % Nk === 4) {
      temp = [S_BOX[temp[0]], S_BOX[temp[1]], S_BOX[temp[2]], S_BOX[temp[3]]];
    }
    const prev = words[i - Nk];
    words.push([prev[0] ^ temp[0], prev[1] ^ temp[1], prev[2] ^ temp[2], prev[3] ^ temp[3]]);
  }

  const roundKeys: number[][] = [];
  for (let round = 0; round <= Nr; round++) {
    const rKey: number[] = [];
    for (let word = 0; word < 4; word++) {
      rKey.push(...words[round * 4 + word]);
    }
    roundKeys.push(rKey);
  }
  return roundKeys;
}

function cipherBlock(block: number[], roundKeys: number[][]): number[] {
  let state = [...block];

  // AddRoundKey 0
  for (let i = 0; i < 16; i++) state[i] ^= roundKeys[0][i];

  // Rounds 1 to 13
  for (let round = 1; round < 14; round++) {
    // SubBytes
    for (let i = 0; i < 16; i++) state[i] = S_BOX[state[i]];

    // ShiftRows
    state = [
      state[0], state[5], state[10], state[15],
      state[4], state[9], state[14], state[3],
      state[8], state[13], state[2], state[7],
      state[12], state[1], state[6], state[11],
    ];

    // MixColumns
    const nextState = new Array(16);
    for (let c = 0; c < 4; c++) {
      const idx = c * 4;
      const s0 = state[idx];
      const s1 = state[idx + 1];
      const s2 = state[idx + 2];
      const s3 = state[idx + 3];

      nextState[idx] = gmul(0x02, s0) ^ gmul(0x03, s1) ^ s2 ^ s3;
      nextState[idx + 1] = s0 ^ gmul(0x02, s1) ^ gmul(0x03, s2) ^ s3;
      nextState[idx + 2] = s0 ^ s1 ^ gmul(0x02, s2) ^ gmul(0x03, s3);
      nextState[idx + 3] = gmul(0x03, s0) ^ s1 ^ s2 ^ gmul(0x02, s3);
    }
    state = nextState;

    // AddRoundKey
    for (let i = 0; i < 16; i++) state[i] ^= roundKeys[round][i];
  }

  // Round 14 (No MixColumns)
  for (let i = 0; i < 16; i++) state[i] = S_BOX[state[i]];

  state = [
    state[0], state[5], state[10], state[15],
    state[4], state[9], state[14], state[3],
    state[8], state[13], state[2], state[7],
    state[12], state[1], state[6], state[11],
  ];

  for (let i = 0; i < 16; i++) state[i] ^= roundKeys[14][i];
  return state;
}

// Helpers
function stringToUtf8Bytes(str: string): number[] {
  const bytes: number[] = [];
  for (let i = 0; i < str.length; i++) {
    let charcode = str.charCodeAt(i);
    if (charcode < 0x80) bytes.push(charcode);
    else if (charcode < 0x800) {
      bytes.push(0xc0 | (charcode >> 6), 0x80 | (charcode & 0x3f));
    } else if (charcode < 0xd800 || charcode >= 0xe000) {
      bytes.push(0xe0 | (charcode >> 12), 0x80 | ((charcode >> 6) & 0x3f), 0x80 | (charcode & 0x3f));
    } else {
      i++;
      charcode = 0x10000 + (((charcode & 0x3ff) << 10) | (str.charCodeAt(i) & 0x3ff));
      bytes.push(
        0xf0 | (charcode >> 18),
        0x80 | ((charcode >> 12) & 0x3f),
        0x80 | ((charcode >> 6) & 0x3f),
        0x80 | (charcode & 0x3f)
      );
    }
  }
  return bytes;
}

function bytesToHex(bytes: number[]): string {
  return bytes.map((b) => (b < 16 ? '0' : '') + b.toString(16)).join('');
}

function hexToBytes(hex: string): number[] {
  const bytes: number[] = [];
  for (let c = 0; c < hex.length; c += 2) {
    bytes.push(parseInt(hex.substr(c, 2), 16));
  }
  return bytes;
}

function generateRandomBytes(len: number): number[] {
  const bytes: number[] = [];
  for (let i = 0; i < len; i++) {
    bytes.push(Math.floor(Math.random() * 256));
  }
  return bytes;
}

export interface EncryptedPayload {
  format: 'MORABARABA_AES256_V1';
  timestamp: string;
  iv: string; // 16 bytes hex
  data: string; // CBC cipher bytes hex
  mac: string; // SHA-256 MAC
}

export const EncryptionService = {
  /**
   * Retrieves or initializes device master key for AES-256.
   */
  getMasterKey: async (): Promise<string> => {
    let key = await AsyncStorage.getItem(AES_MASTER_KEY_STORAGE);
    if (!key) {
      const randomKeyBytes = generateRandomBytes(32); // 256 bits
      key = bytesToHex(randomKeyBytes);
      await AsyncStorage.setItem(AES_MASTER_KEY_STORAGE, key);
    }
    return key;
  },

  /**
   * Encrypts plaintext string using AES-256-CBC with PKCS#7 padding.
   */
  encryptString: async (plainText: string): Promise<string> => {
    const keyHex = await EncryptionService.getMasterKey();
    const keyBytes = hexToBytes(keyHex);
    const roundKeys = keyExpansion(keyBytes);

    const iv = generateRandomBytes(16);
    const plainBytes = stringToUtf8Bytes(plainText);

    // PKCS#7 padding
    const padLen = 16 - (plainBytes.length % 16);
    for (let p = 0; p < padLen; p++) {
      plainBytes.push(padLen);
    }

    // CBC encryption
    const cipherBytes: number[] = [];
    let prevBlock = [...iv];

    for (let i = 0; i < plainBytes.length; i += 16) {
      const block = plainBytes.slice(i, i + 16);
      const xorBlock = block.map((b, idx) => b ^ prevBlock[idx]);
      const encryptedBlock = cipherBlock(xorBlock, roundKeys);
      cipherBytes.push(...encryptedBlock);
      prevBlock = encryptedBlock;
    }

    const ivHex = bytesToHex(iv);
    const dataHex = bytesToHex(cipherBytes);
    const mac = sha256(`${ivHex}:${dataHex}:${keyHex}`);

    const payload: EncryptedPayload = {
      format: 'MORABARABA_AES256_V1',
      timestamp: new Date().toISOString(),
      iv: ivHex,
      data: dataHex,
      mac,
    };

    return JSON.stringify(payload, null, 2);
  },

  /**
   * Encrypts arbitrary game data / career statistics.
   */
  encryptCareerData: async (data: any): Promise<string> => {
    return EncryptionService.encryptString(JSON.stringify(data, null, 2));
  },
};

export default EncryptionService;
