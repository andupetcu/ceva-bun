import { NextResponse } from 'next/server';
import { buildBucharestQuery, fetchOverpass } from '@/lib/overpass';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q') || buildBucharestQuery();
    const data = await fetchOverpass(query);
    return NextResponse.json({ data }, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Eroare Overpass' },
      { status: 500 },
    );
  }
}
