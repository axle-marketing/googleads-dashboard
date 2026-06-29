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

interface CreateCampaignDraftRequest {
  customer_id: string;
  campaign_name: string;
  config: any;
}

export async function POST(request: Request) {
  try {
    const body: CreateCampaignDraftRequest = await request.json();
    const accessToken = await getAccessToken();

    // Create campaign draft in Google Ads API
    // This is a simplified version - actual implementation would be more complex
    const response = await axios.post(
      `https://googleads.googleapis.com/v17/customers/${body.customer_id}/campaignDrafts:create`,
      {
        campaignDraft: {
          baseCampaignId: null, // For new campaigns
          name: body.campaign_name,
        },
      },
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'developer-token': DEVELOPER_TOKEN,
          'login-customer-id': body.customer_id,
          'Content-Type': 'application/json',
        },
      }
    );

    return NextResponse.json(response.data, { status: 201 });
  } catch (error) {
    console.error('Error creating campaign draft:', error);
    return NextResponse.json(
      { error: 'Failed to create campaign draft' },
      { status: 500 }
    );
  }
}
