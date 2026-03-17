#!/usr/bin/env node
/**
 * fix-main-profile.js
 * Regenerates the main app provisioning profile WITH Associated Domains
 * Saves it as saintsallabs.mobileprovision
 */
const jwt   = require('/tmp/asc-tools/node_modules/jsonwebtoken');
const https = require('https');
const fs    = require('fs');
const path  = require('path');

const KEY_ID     = 'L5THU6WGBB';
const ISSUER_ID  = '5cefc466-9ad9-4956-b761-683c25505aa1';
const TEAM_ID    = '2DG74QA62B';
const MAIN_BID   = 'com.saintvision.saintsallabs';
const CERT_SERIAL = '25A3FB4BA20DA228DA453F929B8DB6F6';
const KEY_PATH   = path.join(__dirname, '../AuthKey_L5THU6WGBB.p8');
const OUT_PATH   = path.join(__dirname, '../saintsallabs.mobileprovision');

const privateKey = fs.readFileSync(KEY_PATH, 'utf8');

function makeToken() {
  return jwt.sign({}, privateKey, {
    algorithm: 'ES256', expiresIn: '20m',
    audience: 'appstoreconnect-v1', issuer: ISSUER_ID,
    keyid: KEY_ID, header: { alg: 'ES256', kid: KEY_ID, typ: 'JWT' },
  });
}

function api(method, urlPath, body) {
  return new Promise((resolve, reject) => {
    const token = makeToken();
    const data  = body ? JSON.stringify(body) : null;
    const opts  = {
      hostname: 'api.appstoreconnect.apple.com', path: urlPath, method,
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
  // 1. Find main bundle ID
  console.log(`🔍 Finding bundle ID: ${MAIN_BID}...`);
  const list = await api('GET', `/v1/bundleIds?filter[identifier]=${encodeURIComponent(MAIN_BID)}&filter[platform]=IOS`);
  const bundleId = (list.body.data || [])[0];
  if (!bundleId) {
    console.error('❌ Bundle ID not found:', MAIN_BID);
    process.exit(1);
  }
  const bidId = bundleId.id;
  console.log(`✅ Found bundle ID: ${bidId} (${bundleId.attributes?.identifier})`);

  // 2. Ensure Associated Domains capability is enabled
  console.log('🔗 Ensuring Associated Domains capability is enabled...');
  const assocDomains = await api('POST', '/v1/bundleIdCapabilities', {
    data: {
      type: 'bundleIdCapabilities',
      attributes: { capabilityType: 'ASSOCIATED_DOMAINS', settings: [] },
      relationships: { bundleId: { data: { type: 'bundleIds', id: bidId } } },
    },
  });
  if (assocDomains.status === 201) {
    console.log('✅ Associated Domains capability enabled');
  } else if (assocDomains.status === 409) {
    console.log('✅ Associated Domains capability already enabled');
  } else {
    console.log('⚠️  Associated Domains result:', assocDomains.status, JSON.stringify(assocDomains.body?.errors?.[0]?.detail || assocDomains.body));
  }

  // 3. Find distribution certificate
  console.log('🔍 Finding distribution certificate...');
  const certs = await api('GET', '/v1/certificates?filter[certificateType]=IOS_DISTRIBUTION&limit=50');
  let certId = null;
  const certBySerial = (certs.body.data || []).find(c =>
    c.attributes?.serialNumber?.toUpperCase() === CERT_SERIAL.toUpperCase()
  );
  if (certBySerial) {
    certId = certBySerial.id;
    console.log(`✅ Found cert by serial: ${certId}`);
  } else {
    // Fall back to most recent
    const latest = (certs.body.data || [])[0];
    if (!latest) { console.error('❌ No distribution certs found'); process.exit(1); }
    certId = latest.id;
    console.log(`⚠️  Cert not found by serial, using most recent: ${certId}`);
  }

  // 4. Delete old "v3" profile if it exists to force a fresh one
  console.log('🔍 Checking for old profiles to clean up...');
  const existing = await api('GET', `/v1/profiles?filter[bundleId]=${bidId}&filter[profileType]=IOS_APP_STORE&limit=20`);
  for (const profile of (existing.body.data || [])) {
    const name = profile.attributes?.name;
    if (name === 'SaintSalLabs AppStore v3' || name === 'SaintSalLabs AppStore') {
      console.log(`🗑️  Deleting old profile: ${profile.id} (${name})`);
      const del = await api('DELETE', `/v1/profiles/${profile.id}`);
      if (del.status === 204) {
        console.log(`✅ Deleted: ${name}`);
      } else {
        console.log(`⚠️  Could not delete ${name}: status ${del.status}`);
      }
    }
  }

  // 5. Create new profile WITH Associated Domains
  console.log('📦 Creating new main app profile with Associated Domains...');
  const created = await api('POST', '/v1/profiles', {
    data: {
      type: 'profiles',
      attributes: {
        name:        'SaintSalLabs AppStore',
        profileType: 'IOS_APP_STORE',
      },
      relationships: {
        bundleId:     { data: { type: 'bundleIds', id: bidId } },
        certificates: { data: [{ type: 'certificates', id: certId }] },
        devices:      { data: [] },
      },
    },
  });

  if (created.status !== 201) {
    console.error('❌ Failed to create profile:', JSON.stringify(created.body?.errors || created.body, null, 2));
    process.exit(1);
  }

  const profileData = created.body.data;
  console.log(`✅ Created profile: ${profileData.id} (${profileData.attributes?.name})`);

  // 6. Download profile
  let profileContent = profileData.attributes?.profileContent;
  if (!profileContent) {
    const full = await api('GET', `/v1/profiles/${profileData.id}`);
    profileContent = full.body.data?.attributes?.profileContent;
    if (!profileContent) {
      console.error('❌ No profileContent in response');
      process.exit(1);
    }
  }
  fs.writeFileSync(OUT_PATH, Buffer.from(profileContent, 'base64'));

  console.log(`\n✅ Profile saved to: ${OUT_PATH}`);
  console.log(`   Profile ID:   ${profileData.id}`);
  console.log(`   Profile Name: ${profileData.attributes?.name}`);
  console.log(`   Expiry:       ${profileData.attributes?.expirationDate}`);
  console.log(`   State:        ${profileData.attributes?.profileState}`);
  console.log('\n🎯 Now run: git add saintsallabs.mobileprovision && git commit -m "fix: regenerate main profile with Associated Domains" && git push');
}

main().catch(console.error);
