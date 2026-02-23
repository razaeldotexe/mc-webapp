import { NextResponse } from 'next/server';
import { getAllContents } from '@/lib/db';

export async function GET() {
    try {
        const contents = getAllContents();
        return NextResponse.json({ contents });
    } catch (error) {
        console.error('Failed to fetch contents:', error);
        return NextResponse.json({ error: 'Failed to fetch contents' }, { status: 500 });
    }
}
