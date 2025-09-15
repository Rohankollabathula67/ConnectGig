import { nanoid } from 'nanoid';
import crypto from 'crypto';

// Constants for encryption
const ALGORITHM = 'aes-256-gcm';
const KEY_LENGTH = 32; // 256 bits
const IV_LENGTH = 16; // 128 bits
const TAG_LENGTH = 16; // 128 bits

// Generate a secure random key
export const generateEncryptionKey = (): Buffer => {
  return crypto.randomBytes(KEY_LENGTH);
};

// Generate a secure random IV
export const generateIV = (): Buffer => {
  return crypto.randomBytes(IV_LENGTH);
};

// Encrypt data using AES-256-GCM
export const encrypt = (data: string, key: Buffer): { encrypted: string; iv: string; tag: string } => {
  const iv = generateIV();
  const cipher = crypto.createCipher(ALGORITHM, key);
  
  let encrypted = cipher.update(data, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  
  const tag = cipher.getAuthTag();
  
  return {
    encrypted,
    iv: iv.toString('hex'),
    tag: tag.toString('hex')
  };
};

// Decrypt data using AES-256-GCM
export const decrypt = (encrypted: string, key: Buffer, iv: string, tag: string): string => {
  const decipher = crypto.createDecipher(ALGORITHM, key);
  decipher.setAuthTag(Buffer.from(tag, 'hex'));
  
  let decrypted = decipher.update(encrypted, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  
  return decrypted;
};

// Hash password using bcrypt-like approach (simplified for demo)
export const hashPassword = async (password: string): Promise<string> => {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.pbkdf2Sync(password, salt, 10000, 64, 'sha512');
  return `${salt}:${hash.toString('hex')}`;
};

// Verify password hash
export const verifyPassword = async (password: string, hash: string): Promise<boolean> => {
  const [salt, storedHash] = hash.split(':');
  const computedHash = crypto.pbkdf2Sync(password, salt, 10000, 64, 'sha512');
  return crypto.timingSafeEqual(Buffer.from(storedHash, 'hex'), computedHash);
};

// Generate secure random string
export const generateSecureToken = (length: number = 32): string => {
  return crypto.randomBytes(length).toString('hex');
};

// Generate secure random number
export const generateSecureNumber = (min: number, max: number): number => {
  const range = max - min + 1;
  const bytes = crypto.randomBytes(4);
  const value = bytes.readUInt32BE(0);
  return min + (value % range);
};

// Generate UUID-like identifier
export const generateId = (prefix?: string): string => {
  const id = nanoid(21); // 21 characters for URL-safe IDs
  return prefix ? `${prefix}_${id}` : id;
};

// Hash sensitive data for comparison (one-way)
export const hashSensitiveData = (data: string): string => {
  return crypto.createHash('sha256').update(data).digest('hex');
};

// Generate API key
export const generateApiKey = (): string => {
  return `cg_${crypto.randomBytes(32).toString('base64url')}`;
};

// Generate session token
export const generateSessionToken = (): string => {
  return `sess_${crypto.randomBytes(32).toString('base64url')}`;
};

// Generate verification code (6 digits)
export const generateVerificationCode = (): string => {
  return generateSecureNumber(100000, 999999).toString();
};

// Generate OTP (6 digits)
export const generateOTP = (): string => {
  return generateVerificationCode();
};

// Check if string is a valid hash
export const isValidHash = (hash: string, algorithm: string = 'sha256'): boolean => {
  const hashRegex = new RegExp(`^[a-f0-9]{${algorithm === 'sha256' ? '64' : '40'}}$`, 'i');
  return hashRegex.test(hash);
};

// Generate checksum for data integrity
export const generateChecksum = (data: string): string => {
  return crypto.createHash('md5').update(data).digest('hex');
};

// Verify checksum
export const verifyChecksum = (data: string, checksum: string): boolean => {
  return generateChecksum(data) === checksum;
};
