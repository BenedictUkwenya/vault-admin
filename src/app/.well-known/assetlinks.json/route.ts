import { NextResponse } from 'next/server';

/**
 * Android App Links verification.
 * Set ANDROID_SHA256_CERT_FINGERPRINTS as comma-separated SHA-256 fingerprints
 * from your Play App Signing / upload keystore.
 */
export async function GET() {
  const fingerprints = String(process.env.ANDROID_SHA256_CERT_FINGERPRINTS || '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);

  const body = [
    {
      relation: ['delegate_permission/common.handle_all_urls'],
      target: {
        namespace: 'android_app',
        package_name: 'com.blacklimitless.mobile',
        sha256_cert_fingerprints: fingerprints.length
          ? fingerprints
          : ['REPLACE_WITH_PLAY_APP_SIGNING_SHA256'],
      },
    },
  ];

  return NextResponse.json(body, {
    headers: { 'Cache-Control': 'public, max-age=3600' },
  });
}
