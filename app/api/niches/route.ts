import { getSupabaseServerClient } from '@/lib/supabase';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const supabase = getSupabaseServerClient();
    const { data, error } = await supabase
      .from('niches')
      .select('*')
      .order('name');

    if (error) throw error;

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching niches:', error);
    return NextResponse.json(
      { error: 'Failed to fetch niches' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const supabase = getSupabaseServerClient();

    const { data, error } = await supabase
      .from('niches')
      .insert([{ name: body.name, description: body.description }])
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    console.error('Error creating niche:', error);
    return NextResponse.json(
      { error: 'Failed to create niche' },
      { status: 500 }
    );
  }
}
