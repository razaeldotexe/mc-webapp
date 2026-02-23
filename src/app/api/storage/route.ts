import { NextResponse } from 'next/server';
import { getTotalStoredSize, getContentCount, getContentsByCategory } from '@/lib/db';
import { getSetting } from '@/lib/db';

export async function GET() {
    try {
        const used = getTotalStoredSize();
        const maxStorageStr = getSetting('max_storage_bytes') || '1099511627776';
        const total = parseInt(maxStorageStr, 10);
        const percentage = total > 0 ? Math.round((used / total) * 100 * 10) / 10 : 0;
        const contentCount = getContentCount();
        const byCategory = getContentsByCategory();

        return NextResponse.json({
            used,
            total,
            percentage,
            contentCount,
            byCategory,
        });
    } catch (error) {
        console.error('Failed to get storage info:', error);
        return NextResponse.json({ error: 'Failed to get storage info' }, { status: 500 });
    }
}
