#!/usr/bin/env node
/**
 * create-clip-profile.js
 * Creates an App Store distribution provisioning profile for the App Clip
 * via App Store Connect API, then saves it as saintsallabsclip.mobileprovision
 */
const jwt   = require('/tmp/asc-tools/node_modules/jsonwebtoken');
const https = require('https');
const fs    = require('fs');
const path  = require('path');

const KEY_ID     = 'L5THU6WGBB';
const ISSUER_ID  = '5cefc466-9ad9-4956-b761-683c25505aa1';
const CLIP_BID_ID = 'TA2WW69CC7';   // portal ID from create-appclip-bundleid.js
const CERT_SERIAL = '28BB00AADE251FA8CF3AF6C9F77C8BDF'; // dist_cert.p12 cert
const KEY_PATH   = path.join(__dirname, '../AuthKey_L5THU6WGBB.p8');
const OUT_PATH   = path.join(__dirname, '../saintsallabsclip.mobileprovision');

const privateKey = fs.readFileSync(KEY_PATH, 'utf8');

function makeToken() {
  return jwt.sign({}, privateKey, {
    algorithm: 'ES256', expiresIn: '20m',
    audience: 'appstoreconnect-v1', issuer: ISSUER_ID,
    keyid: KEY_ID, header: { alg: 'ES256', kid: KEY_ID, typ: 'JWT' },
  });
}

function api(method, path, body) {
  return new Promise((resolve, reject) => {
    const token = makeToken();
    const data  = body ? JSON.stringify(body) : null;
    const opts  = {
      hostname: 'api.appstoreconnect.apple.com', path, method,
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type':  'application/json',
        ...(data ? { 'Content-Length': Buffer.byteLength(data) } : {}),
      },
    };
    const req = https.request(opts, res => {
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
  // 1. Find distribution certificate by serial
  console.log('🔍 Finding distribution certificate...');
  const certs = await api('GET', '/v1/certificates?filter[certificateType]=DISTRIBUTION&limit=50');
  const cert = (certs.body.data || []).find(c =>
    c.attributes?.serialNumber?.toUpperCase() === CERT_SERIAL.toUpperCase()
  );
  if (!cert) {
    console.log('⚠️  Cert not found by serial, trying IOS_DISTRIBUTION type...');
    const certs2 = await api('GET', '/v1/certificates?filter[certificateType]=IOS_DISTRIBUTION&limit=50');
    console.log('Available certs:', (certs2.body.data||[]).map(c => `${c.id} serial:${c.attributes?.serialNumber}`));
    // Use the most recently created one
    const latest = (certs2.body.data || [])[0];
    if (!latest) { console.error('❌ No distribution certs found'); process.exit(1); }
    console.log(`Using cert: ${latest.id}`);
    await createProfile(latest.id);
  } else {
    console.log(`✅ Found cert: ${cert.id}`);
    await createProfile(cert.id);
  }
}

async function createProfile(certId) {
  // 2. Check if profile already exists
  console.log('🔍 Checking for existing App Clip profile...');
  const existing = await api('GET', `/v1/profiles?filter[bundleId]=${CLIP_BID_ID}&filter[profileType]=IOS_APP_STORE&limit=10`);

  let profileData = null;

  if (existing.body.data && existing.body.data.length > 0) {
    // Force delete and recreate to ensure the profile uses the correct cert
    for (const p of existing.body.data) {
      console.log(`🗑️  Deleting old profile: ${p.id} (${p.attributes?.name})`);
      const del = await api('DELETE', `/v1/profiles/${p.id}`);
      if (del.status === 204) {
        console.log(`✅ Deleted`);
      } else {
        console.log(`⚠️  Could not delete: status ${del.status}`);
      }
    }
  }

  if (!profileData) {
    // 3. Create App Store distribution profile for the clip
    console.log('📦 Creating App Store provisioning profile for App Clip...');
    const created = await api('POST', '/v1/profiles', {
      data: {
        type: 'profiles',
        attributes: {
          name:        'SaintSalLabs App Clip AppStore',
          profileType: 'IOS_APP_STORE',
        },
        relationships: {
          bundleId: { data: { type: 'bundleIds', id: CLIP_BID_ID } },
          certificates: { data: [{ type: 'certificates', id: certId }] },
          devices: { data: [] },
        },
      },
    });

    if (created.status !== 201) {
      console.error('❌ Failed to create profile:', JSON.stringify(created.body?.errors || created.body, null, 2));
      process.exit(1);
    }
    profileData = created.body.data;
    console.log(`✅ Created profile: ${profileData.id} (${profileData.attributes?.name})`);
  }

  // 4. Download profile content (base64)
  const profileContent = profileData.attributes?.profileContent;
  if (!profileContent) {
    // Fetch the full profile to get content
    const full = await api('GET', `/v1/profiles/${profileData.id}`);
    const content = full.body.data?.attributes?.profileContent;
    if (!content) {
      console.error('❌ No profileContent in response');
      console.log(JSON.stringify(full.body, null, 2));
      process.exit(1);
    }
    fs.writeFileSync(OUT_PATH, Buffer.from(content, 'base64'));
  } else {
    fs.writeFileSync(OUT_PATH, Buffer.from(profileContent, 'base64'));
  }

  console.log(`✅ Profile saved to: ${OUT_PATH}`);
  console.log(`   Profile ID:   ${profileData.id}`);
  console.log(`   Profile Name: ${profileData.attributes?.name}`);
  console.log(`   Expiry:       ${profileData.attributes?.expirationDate}`);
  console.log(`   State:        ${profileData.attributes?.profileState}`);
}

main().catch(console.error);
