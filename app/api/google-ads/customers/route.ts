import { NextResponse } from 'next/server';
import axios from 'axios';

const DEVELOPER_TOKEN = process.env.GOOGLE_ADS_DEVELOPER_TOKEN;
const REFRESH_TOKEN = process.env.GOOGLE_ADS_REFRESH_TOKEN;
const CLIENT_ID = process.env.GOOGLE_ADS_CLIENT_ID;
const CLIENT_SECRET = process.env.GOOGLE_ADS_CLIENT_SECRET;

async function getAccessToken() {
  try {
    const response = await axios.post(
      'https://oauth2.googleapis.com/token',
      {
        client_id: CLIENT_ID,
        client_secret: CLIENT_SECRET,
        refresh_token: REFRESH_TOKEN,
        grant_type: 'refresh_token',
      }
    );
    return response.data.access_token;
  } catch (error) {
    console.error('Error getting access token:', error);
    throw error;
  }
}

export async function GET() {
  try {
    const accessToken = await getAccessToken();

    // Get list of customers from MCC
    const response = await axios.post(
      'https://googleads.googleapis.com/v17/customers:searchStream',
      {
        query: 'SELECT customer.id, customer.descriptive_name FROM customer',
      },
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'developer-token': DEVELOPER_TOKEN,
          'Content-Type': 'application/json',
        },
      }
    );

    const customers = response.data.results?.map(
      (result: any) => ({
        customer_id: result.customer.id,
        name: result.customer.descriptive_name,
      })
    ) || [];

    return NextResponse.json(customers);
  } catch (error) {
    console.error('Error fetching Google Ads customers:', error);
    return NextResponse.json(
      { error: 'Failed to fetch customers from Google Ads' },
      { status: 500 }
    );
  }
}
