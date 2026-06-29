import { NextResponse } from 'next/server';
import axios from 'axios';

const API_VERSION = 'v24';
const DEVELOPER_TOKEN = process.env.GOOGLE_ADS_DEVELOPER_TOKEN;
const REFRESH_TOKEN = process.env.GOOGLE_ADS_REFRESH_TOKEN;
const CLIENT_ID = process.env.GOOGLE_ADS_CLIENT_ID;
const CLIENT_SECRET = process.env.GOOGLE_ADS_CLIENT_SECRET;
// MCC (manager) account ID, digits only. Used as login-customer-id.
const LOGIN_CUSTOMER_ID =
  process.env.GOOGLE_ADS_LOGIN_CUSTOMER_ID || '4401058052';

async function getAccessToken() {
  const response = await axios.post('https://oauth2.googleapis.com/token', {
    client_id: CLIENT_ID,
    client_secret: CLIENT_SECRET,
    refresh_token: REFRESH_TOKEN,
    grant_type: 'refresh_token',
  });
  return response.data.access_token;
}

export async function GET() {
  try {
    const accessToken = await getAccessToken();

    // Query all client accounts managed by the MCC via customer_client.
    // level <= 1 returns direct children; manager = false excludes sub-MCCs.
    const query = `
      SELECT
        customer_client.id,
        customer_client.descriptive_name,
        customer_client.manager,
        customer_client.status
      FROM customer_client
      WHERE customer_client.level <= 1
        AND customer_client.manager = false
        AND customer_client.status = 'ENABLED'
    `;

    const response = await axios.post(
      `https://googleads.googleapis.com/${API_VERSION}/customers/${LOGIN_CUSTOMER_ID}/googleAds:searchStream`,
      { query },
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'developer-token': DEVELOPER_TOKEN,
          'login-customer-id': LOGIN_CUSTOMER_ID,
          'Content-Type': 'application/json',
        },
      }
    );

    // searchStream returns an array of batches, each with a `results` array.
    const batches = Array.isArray(response.data)
      ? response.data
      : [response.data];

    const customers = batches
      .flatMap((batch: any) => batch.results || [])
      .map((result: any) => ({
        customer_id: result.customerClient.id,
        name:
          result.customerClient.descriptiveName ||
          `Conta ${result.customerClient.id}`,
      }))
      // De-duplicate by customer_id
      .filter(
        (c: any, i: number, arr: any[]) =>
          arr.findIndex((x) => x.customer_id === c.customer_id) === i
      )
      .sort((a: any, b: any) => a.name.localeCompare(b.name));

    return NextResponse.json(customers);
  } catch (error: any) {
    const apiError = error.response?.data || error.message;
    console.error(
      'Error fetching Google Ads customers:',
      JSON.stringify(apiError, null, 2)
    );
    return NextResponse.json(
      { error: 'Failed to fetch customers from Google Ads', details: apiError },
      { status: 500 }
    );
  }
}
