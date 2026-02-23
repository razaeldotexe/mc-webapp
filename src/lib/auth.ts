import { createHash, randomBytes } from 'crypto';

// Default admin credentials — change in Settings after first login
const DEFAULT_USERNAME = 'razael';
const DEFAULT_PASSWORD = 'admin123';

// In-memory session store (resets on server restart)
const sessions = new Map<string, { username: string; expiresAt: number }>();

const SESSION_DURATION = 24 * 60 * 60 * 1000; // 24 hours
export const SESSION_COOKIE_NAME = 'mc_admin_session';

function hashPassword(password: string): string {
    return createHash('sha256').update(password).digest('hex');
}

/**
 * Get admin credentials from DB, falling back to defaults.
 */
function getAdminCredentials(): { username: string; passwordHash: string } {
    // Dynamic import to avoid circular dependency issues at module level
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const db = require('./db');
    const username = db.getSetting('admin_username') || DEFAULT_USERNAME;
    const storedHash = db.getSetting('admin_password_hash');

    // If no hash stored yet, use default password hash
    const passwordHash = storedHash || hashPassword(DEFAULT_PASSWORD);

    return { username, passwordHash };
}

/**
 * Verify login credentials.
 */
export function verifyCredentials(username: string, password: string): boolean {
    const creds = getAdminCredentials();
    return username === creds.username && hashPassword(password) === creds.passwordHash;
}

/**
 * Create a new session and return the token.
 */
export function createSession(username: string): string {
    const token = randomBytes(32).toString('hex');
    sessions.set(token, {
        username,
        expiresAt: Date.now() + SESSION_DURATION,
    });
    return token;
}

/**
 * Validate a session token.
 */
export function validateSession(token: string): boolean {
    const session = sessions.get(token);
    if (!session) return false;

    if (Date.now() > session.expiresAt) {
        sessions.delete(token);
        return false;
    }

    return true;
}

/**
 * Destroy a session.
 */
export function destroySession(token: string): void {
    sessions.delete(token);
}

/**
 * Update admin password.
 */
export function updateAdminPassword(newPassword: string): void {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const db = require('./db');
    db.setSetting('admin_password_hash', hashPassword(newPassword));
}

/**
 * Update admin username.
 */
export function updateAdminUsername(newUsername: string): void {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const db = require('./db');
    db.setSetting('admin_username', newUsername);
}
