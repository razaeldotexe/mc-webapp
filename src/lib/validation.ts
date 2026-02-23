export const ALLOWED_EXTENSIONS = [
    '.mcpack',
    '.zip',
    '.mcworld',
    '.mctemplate',
    '.mcaddon',
    '.tar',
];

export const ALLOWED_THUMBNAIL_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.webp'];

export const MAX_FILE_SIZE = 5 * 1024 * 1024 * 1024; // 5GB in bytes
export const CHUNK_SIZE = 5 * 1024 * 1024; // 5MB per chunk

export const CATEGORIES = [
    { value: 'mod', label: 'Mod' },
    { value: 'skin', label: 'Skin' },
    { value: 'world', label: 'World' },
    { value: 'texture-pack', label: 'Texture Pack' },
    { value: 'addon', label: 'Add-on' },
    { value: 'template', label: 'Template' },
    { value: 'other', label: 'Other' },
];

export function getFileExtension(filename: string): string {
    const lastDot = filename.lastIndexOf('.');
    if (lastDot === -1) return '';
    return filename.slice(lastDot).toLowerCase();
}

export function validateContentFile(filename: string, size: number): { valid: boolean; error?: string } {
    const ext = getFileExtension(filename);

    if (!ext) {
        return { valid: false, error: 'File has no extension.' };
    }

    if (!ALLOWED_EXTENSIONS.includes(ext)) {
        return {
            valid: false,
            error: `Format "${ext}" tidak didukung. Format yang diizinkan: ${ALLOWED_EXTENSIONS.join(', ')}`,
        };
    }

    if (size > MAX_FILE_SIZE) {
        return {
            valid: false,
            error: `File terlalu besar (${formatFileSize(size)}). Maksimum: 5GB.`,
        };
    }

    return { valid: true };
}

export function validateThumbnail(filename: string): { valid: boolean; error?: string } {
    const ext = getFileExtension(filename);

    if (!ALLOWED_THUMBNAIL_EXTENSIONS.includes(ext)) {
        return {
            valid: false,
            error: `Format thumbnail "${ext}" tidak didukung. Gunakan: ${ALLOWED_THUMBNAIL_EXTENSIONS.join(', ')}`,
        };
    }

    return { valid: true };
}

export function formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 B';
    const units = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    const size = bytes / Math.pow(1024, i);
    return `${size.toFixed(i > 0 ? 1 : 0)} ${units[i]}`;
}
