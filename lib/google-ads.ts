import axios from 'axios';

export const API_VERSION = 'v24';
export const BASE_URL = `https://googleads.googleapis.com/${API_VERSION}`;

const DEVELOPER_TOKEN = process.env.GOOGLE_ADS_DEVELOPER_TOKEN;
const REFRESH_TOKEN = process.env.GOOGLE_ADS_REFRESH_TOKEN;
const CLIENT_ID = process.env.GOOGLE_ADS_CLIENT_ID;
const CLIENT_SECRET = process.env.GOOGLE_ADS_CLIENT_SECRET;
// MCC (manager) account ID, digits only. Used as login-customer-id.
export const LOGIN_CUSTOMER_ID =
  process.env.GOOGLE_ADS_LOGIN_CUSTOMER_ID || '4401058052';

let cachedToken: { value: string; expiresAt: number } | null = null;

export async function getAccessToken(): Promise<string> {
  // Reuse token while it's still valid (minus a 60s safety margin)
  if (cachedToken && cachedToken.expiresAt > Date.now() + 60_000) {
    return cachedToken.value;
  }

  const response = await axios.post('https://oauth2.googleapis.com/token', {
    client_id: CLIENT_ID,
    client_secret: CLIENT_SECRET,
    refresh_token: REFRESH_TOKEN,
    grant_type: 'refresh_token',
  });

  cachedToken = {
    value: response.data.access_token,
    expiresAt: Date.now() + (response.data.expires_in ?? 3600) * 1000,
  };
  return cachedToken.value;
}

function headers(accessToken: string) {
  return {
    Authorization: `Bearer ${accessToken}`,
    'developer-token': DEVELOPER_TOKEN,
    'login-customer-id': LOGIN_CUSTOMER_ID,
    'Content-Type': 'application/json',
  };
}

/**
 * Calls a `<service>:mutate` endpoint for the given customer and returns the
 * array of results (each has a `resourceName`).
 */
export async function mutate(
  customerId: string,
  service: string,
  operations: any[]
): Promise<any[]> {
  const accessToken = await getAccessToken();
  const url = `${BASE_URL}/customers/${customerId}/${service}:mutate`;
  const response = await axios.post(
    url,
    { operations },
    { headers: headers(accessToken) }
  );
  return response.data.results || [];
}

/** Runs a GAQL query via searchStream and returns flattened results. */
export async function searchStream(
  customerId: string,
  query: string
): Promise<any[]> {
  const accessToken = await getAccessToken();
  const url = `${BASE_URL}/customers/${customerId}/googleAds:searchStream`;
  const response = await axios.post(
    url,
    { query },
    { headers: headers(accessToken) }
  );
  const batches = Array.isArray(response.data)
    ? response.data
    : [response.data];
  return batches.flatMap((batch: any) => batch.results || []);
}

/** Extracts a readable error message from a Google Ads API error response. */
export function extractApiError(error: any): {
  message: string;
  details: any;
} {
  const data = error?.response?.data;
  if (data?.error?.details?.length) {
    const gaErrors = data.error.details
      .flatMap((d: any) => d.errors || [])
      .map((e: any) => {
        const field = e.location?.fieldPathElements
          ?.map((f: any) => f.fieldName)
          .join('.');
        return `${e.message}${field ? ` (campo: ${field})` : ''}`;
      });
    if (gaErrors.length) {
      return { message: gaErrors.join(' | '), details: data.error };
    }
  }
  if (data?.error?.message) {
    return { message: data.error.message, details: data.error };
  }
  return { message: error?.message || 'Erro desconhecido', details: data };
}
