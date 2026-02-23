import fs from 'fs';
import path from 'path';

const UPLOADS_DIR = path.join(process.cwd(), 'public', 'uploads');
const CONTENTS_DIR = path.join(UPLOADS_DIR, 'contents');
const THUMBNAILS_DIR = path.join(UPLOADS_DIR, 'thumbnails');
const TEMP_DIR = path.join(process.cwd(), 'data', 'tmp');

// Ensure directories exist
for (const dir of [CONTENTS_DIR, THUMBNAILS_DIR, TEMP_DIR]) {
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }
}

export function getTempDir(uploadId: string): string {
    const dir = path.join(TEMP_DIR, uploadId);
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }
    return dir;
}

export function saveChunk(uploadId: string, chunkIndex: number, buffer: Buffer): void {
    const dir = getTempDir(uploadId);
    const chunkPath = path.join(dir, `chunk_${String(chunkIndex).padStart(6, '0')}`);
    fs.writeFileSync(chunkPath, buffer);
}

export function assembleChunks(uploadId: string, totalChunks: number, filename: string): string {
    const dir = getTempDir(uploadId);
    const finalPath = path.join(CONTENTS_DIR, filename);

    // Create write stream for final file
    const writeStream = fs.createWriteStream(finalPath);

    for (let i = 0; i < totalChunks; i++) {
        const chunkPath = path.join(dir, `chunk_${String(i).padStart(6, '0')}`);
        if (!fs.existsSync(chunkPath)) {
            writeStream.close();
            throw new Error(`Missing chunk ${i} for upload ${uploadId}`);
        }
        const chunkData = fs.readFileSync(chunkPath);
        writeStream.write(chunkData);
    }

    writeStream.end();

    // Cleanup temp chunks
    cleanupTempDir(uploadId);

    return `/uploads/contents/${filename}`;
}

export function saveThumbnail(buffer: Buffer, filename: string): string {
    const filePath = path.join(THUMBNAILS_DIR, filename);
    fs.writeFileSync(filePath, buffer);
    return `/uploads/thumbnails/${filename}`;
}

export function deleteFile(filePath: string): void {
    // Convert from URL path to filesystem path
    const fullPath = path.join(process.cwd(), 'public', filePath);
    if (fs.existsSync(fullPath)) {
        fs.unlinkSync(fullPath);
    }
}

export function getStorageUsed(): number {
    return getDirSize(CONTENTS_DIR);
}

function getDirSize(dirPath: string): number {
    if (!fs.existsSync(dirPath)) return 0;

    let total = 0;
    const entries = fs.readdirSync(dirPath, { withFileTypes: true });
    for (const entry of entries) {
        const fullPath = path.join(dirPath, entry.name);
        if (entry.isFile()) {
            total += fs.statSync(fullPath).size;
        } else if (entry.isDirectory()) {
            total += getDirSize(fullPath);
        }
    }
    return total;
}

function cleanupTempDir(uploadId: string): void {
    const dir = path.join(TEMP_DIR, uploadId);
    if (fs.existsSync(dir)) {
        fs.rmSync(dir, { recursive: true, force: true });
    }
}
