import { NextResponse } from 'next/server';
import { getSetting, setSetting } from '@/lib/db';

export async function GET() {
    try {
        const maxStorage = getSetting('max_storage_bytes') || '1099511627776';
        return NextResponse.json({
            max_storage_bytes: parseInt(maxStorage, 10),
        });
    } catch (error) {
        console.error('Failed to get settings:', error);
        return NextResponse.json({ error: 'Failed to get settings' }, { status: 500 });
    }
}

export async function PUT(request: Request) {
    try {
        const body = await request.json();
        const { max_storage_bytes } = body;

        if (max_storage_bytes !== undefined) {
            setSetting('max_storage_bytes', String(max_storage_bytes));
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Failed to update settings:', error);
        return NextResponse.json({ error: 'Failed to update settings' }, { status: 500 });
    }
}
