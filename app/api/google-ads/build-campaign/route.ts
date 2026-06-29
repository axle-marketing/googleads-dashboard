import { NextResponse } from 'next/server';
import { buildCommercialCleaning } from '@/lib/strategies/build-commercial-cleaning';
import { extractApiError } from '@/lib/google-ads';

export const maxDuration = 300; // allow up to 5 min for the full build

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const {
      builder,
      customer_id,
      company_name,
      website,
      city,
      include_region,
      daily_budget,
      ad_group_keys,
    } = body;

    // Basic validation
    const missing: string[] = [];
    if (!customer_id) missing.push('customer_id');
    if (!company_name) missing.push('company_name');
    if (!website) missing.push('website');
    if (!city) missing.push('city');
    if (missing.length) {
      return NextResponse.json(
        { error: `Campos obrigatórios faltando: ${missing.join(', ')}` },
        { status: 400 }
      );
    }

    if (builder !== 'commercial_cleaning') {
      return NextResponse.json(
        { error: `Builder desconhecido: ${builder}` },
        { status: 400 }
      );
    }

    const result = await buildCommercialCleaning({
      customerId: customer_id,
      companyName: company_name,
      website,
      city,
      includeRegion: !!include_region,
      dailyBudget: Number(daily_budget) || 50,
      adGroupKeys:
        Array.isArray(ad_group_keys) && ad_group_keys.length
          ? ad_group_keys
          : ['office', 'medical', 'post_construction', 'school'],
    });

    return NextResponse.json(result, { status: 201 });
  } catch (error: any) {
    const { message, details } = extractApiError(error);
    console.error('Build campaign error:', message, JSON.stringify(details));
    return NextResponse.json(
      { error: message, details },
      { status: 500 }
    );
  }
}
