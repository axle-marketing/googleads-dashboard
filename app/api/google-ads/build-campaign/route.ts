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
      state,
      city,
      daily_budget,
      sitelinks,
      services,
    } = body;

    // Basic validation (city is optional — falls back to the state)
    const missing: string[] = [];
    if (!customer_id) missing.push('customer_id');
    if (!company_name) missing.push('company_name');
    if (!website) missing.push('website');
    if (!state) missing.push('state');
    if (missing.length) {
      return NextResponse.json(
        { error: `Campos obrigatórios faltando: ${missing.join(', ')}` },
        { status: 400 }
      );
    }

    if (!Array.isArray(services) || services.length === 0) {
      return NextResponse.json(
        { error: 'Selecione pelo menos um serviço / grupo de anúncios.' },
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
      state: state || '',
      city,
      dailyBudget: Number(daily_budget) || 50,
      sitelinks: Array.isArray(sitelinks) ? sitelinks : [],
      services: Array.isArray(services) ? services : [],
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
