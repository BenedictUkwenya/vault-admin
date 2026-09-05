import { NextResponse } from 'next/server';

/**
 * Apple Universal Links verification.
 * Set APPLE_TEAM_ID in Vercel env (e.g. ABCD123456).
 * After changing, rebuild the iOS app with associatedDomains.
 */
export async function GET() {
  const teamId = process.env.APPLE_TEAM_ID || 'TEAMID';
  const body = {
    applinks: {
      apps: [],
      details: [
        {
          appID: `${teamId}.com.blacklimitless.mobile`,
          paths: ['/ref/*', '/ref'],
        },
      ],
    },
  };

  return new NextResponse(JSON.stringify(body), {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'public, max-age=3600',
    },
  });
}
