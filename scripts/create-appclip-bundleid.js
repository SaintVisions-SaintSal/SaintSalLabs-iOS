#!/usr/bin/env node
/**
 * create-appclip-bundleid.js
 * Uses App Store Connect API to:
 * 1. Create Bundle ID: com.saintvision.saintsallabs.Clip
 * 2. Enable App Clips capability
 * 3. Enable Associated Domains capability
 */
const jwt   = require('/tmp/asc-tools/node_modules/jsonwebtoken');
const https = require('https');
const fs    = require('fs');
const path  = require('path');

const KEY_ID     = 'L5THU6WGBB';
const ISSUER_ID  = '5cefc466-9ad9-4956-b761-683c25505aa1';
const TEAM_ID    = '2DG74QA62B';
const CLIP_BID   = 'com.saintvision.saintsallabs.Clip';
const KEY_PATH   = path.join(__dirname, '../AuthKey_L5THU6WGBB.p8');

const privateKey = fs.readFileSync(KEY_PATH, 'utf8');

function makeToken() {
  return jwt.sign({}, privateKey, {
    algorithm:  'ES256',
    expiresIn:  '20m',
    audience:   'appstoreconnect-v1',
    issuer:     ISSUER_ID,
    keyid:      KEY_ID,
    header:     { alg: 'ES256', kid: KEY_ID, typ: 'JWT' },
  });
}

function request(method, path, body) {
  return new Promise((resolve, reject) => {
    const token = makeToken();
    const data  = body ? JSON.stringify(body) : null;
    const opts  = {
      hostname: 'api.appstoreconnect.apple.com',
      path,
      method,
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type':  'application/json',
        ...(data ? { 'Content-Length': Buffer.byteLength(data) } : {}),
      },
    };
    const req = https.request(opts, (res) => {
      let raw = '';
      res.on('data', d => raw += d);
      res.on('end', () => {
        try { resolve({ status: res.statusCode, body: JSON.parse(raw) }); }
        catch { resolve({ status: res.statusCode, body: raw }); }
      });
    });
    req.on('error', reject);
    if (data) req.write(data);
    req.end();
  });
}

async function main() {
  console.log('🔍 Checking if App Clip bundle ID already exists...');

  // 1. Check if it exists
  const list = await request('GET', `/v1/bundleIds?filter[identifier]=${encodeURIComponent(CLIP_BID)}&filter[platform]=IOS`);

  let clipId = null;

  if (list.body.data && list.body.data.length > 0) {
    clipId = list.body.data[0].id;
    console.log(`✅ Bundle ID already exists: ${clipId}`);
  } else {
    // 2. Create it
    console.log(`📦 Creating bundle ID: ${CLIP_BID}...`);
    const create = await request('POST', '/v1/bundleIds', {
      data: {
        type: 'bundleIds',
        attributes: {
          identifier: CLIP_BID,
          name:       'SaintSal Labs App Clip',
          platform:   'IOS',
          seedId:     TEAM_ID,
        },
      },
    });

    if (create.status === 201) {
      clipId = create.body.data.id;
      console.log(`✅ Created bundle ID: ${clipId}`);
    } else {
      console.error('❌ Failed to create bundle ID:', JSON.stringify(create.body, null, 2));
      process.exit(1);
    }
  }

  // 3. Enable App Clips capability
  console.log('⚡ Enabling App Clips capability...');
  const appClipCap = await request('POST', '/v1/bundleIdCapabilities', {
    data: {
      type: 'bundleIdCapabilities',
      attributes: {
        capabilityType: 'APP_CLIPS',
        settings:       [],
      },
      relationships: {
        bundleId: { data: { type: 'bundleIds', id: clipId } },
      },
    },
  });

  if (appClipCap.status === 201) {
    console.log('✅ App Clips capability enabled');
  } else if (appClipCap.status === 409) {
    console.log('✅ App Clips capability already enabled');
  } else {
    console.log('⚠️  App Clips result:', appClipCap.status, JSON.stringify(appClipCap.body?.errors?.[0]?.detail || appClipCap.body, null, 2));
  }

  // 4. Enable Associated Domains capability
  console.log('🔗 Enabling Associated Domains capability...');
  const assocDomains = await request('POST', '/v1/bundleIdCapabilities', {
    data: {
      type: 'bundleIdCapabilities',
      attributes: {
        capabilityType: 'ASSOCIATED_DOMAINS',
        settings:       [],
      },
      relationships: {
        bundleId: { data: { type: 'bundleIds', id: clipId } },
      },
    },
  });

  if (assocDomains.status === 201) {
    console.log('✅ Associated Domains capability enabled');
  } else if (assocDomains.status === 409) {
    console.log('✅ Associated Domains capability already enabled');
  } else {
    console.log('⚠️  Associated Domains result:', assocDomains.status, JSON.stringify(assocDomains.body?.errors?.[0]?.detail || assocDomains.body, null, 2));
  }

  console.log('\n🎯 Done! Bundle ID summary:');
  console.log(`   Identifier: ${CLIP_BID}`);
  console.log(`   Portal ID:  ${clipId}`);
  console.log(`   Team:       ${TEAM_ID}`);
  console.log('\n🚀 Now run: npx eas build --platform ios --profile production --auto-submit');
}

main().catch(console.error);
