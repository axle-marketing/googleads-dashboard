import { NextResponse } from 'next/server';
import { City } from 'country-state-city';
import { getStateAbbr } from '@/lib/us-states';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const state = searchParams.get('state') || '';
  const abbr = getStateAbbr(state);

  if (!abbr) {
    return NextResponse.json([]);
  }

  const cities = City.getCitiesOfState('US', abbr) || [];
  // Unique, sorted city names
  const names = Array.from(new Set(cities.map((c) => c.name))).sort((a, b) =>
    a.localeCompare(b)
  );

  return NextResponse.json(names);
}
