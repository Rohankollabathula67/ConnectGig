/**
 * ConnectGig — Firestore Provider Seeder
 * Populates real verified service providers into your live Firestore database.
 * 
 * Supports two modes:
 * 1. Admin SDK Mode (Recommended): Uses serviceAccountKey.json to bypass rules.
 * 2. Web SDK Mode: Uses .env credentials (requires open write rules or authenticated session).
 * 
 * Usage:
 *   node scripts/seedFirestore.js
 */

const fs = require('fs');
const path = require('path');

// 1. Check for Admin Service Account Key
const serviceAccountPath = path.resolve(__dirname, '../serviceAccountKey.json');
let useAdmin = false;
let adminDb = null;
let adminModule = null;

if (fs.existsSync(serviceAccountPath)) {
  try {
    adminModule = require('../firebase/functions/node_modules/firebase-admin');
    const serviceAccount = require(serviceAccountPath);
    if (adminModule.apps.length === 0) {
      adminModule.initializeApp({
        credential: adminModule.credential.cert(serviceAccount),
      });
    }
    adminDb = adminModule.firestore();
    useAdmin = true;
    console.log('🔑 Found serviceAccountKey.json! Running in Admin Mode (Rules Bypassed).');
  } catch (e) {
    console.warn('⚠️  serviceAccountKey.json found but could not load firebase-admin:', e.message);
  }
}

// 2. Load .env config
const envPath = path.resolve(__dirname, '../.env');
const env = {};
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8');
  envContent.split('\n').forEach(line => {
    const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
    if (match) {
      let value = match[2] || '';
      if (value.startsWith('"') && value.endsWith('"')) value = value.slice(1, -1);
      if (value.startsWith("'") && value.endsWith("'")) value = value.slice(1, -1);
      env[match[1]] = value.trim();
    }
  });
}

const firebaseConfig = {
  apiKey: env.EXPO_PUBLIC_FIREBASE_API_KEY,
  authDomain: env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: env.EXPO_PUBLIC_FIREBASE_APP_ID,
};

console.log('🌱 ConnectGig Firestore Seeder');
console.log('   Target Project ID:', useAdmin ? 'Service Account Target' : (firebaseConfig.projectId || 'None'));

const isMock = !firebaseConfig.apiKey || firebaseConfig.apiKey.includes('mock') || firebaseConfig.projectId === 'connect-gig';
if (isMock && !useAdmin) {
  console.log('\n⚠️  ATTENTION:');
  console.log('   Your .env is still set to placeholder values:');
  console.log(`   EXPO_PUBLIC_FIREBASE_PROJECT_ID=${firebaseConfig.projectId}`);
  console.log(`   EXPO_PUBLIC_FIREBASE_API_KEY=${firebaseConfig.apiKey}\n`);
}

const PROVIDERS = [
  {
    uid: 'prov_marcus_rivera',
    name: 'Marcus Rivera',
    phone: '+91 98765 43210',
    email: 'marcus.rivera@connectgig.pro',
    role: 'provider',
    categories: ['Electrician', 'Handyman'],
    skills: ['Electrician', 'Handyman'],
    hourlyRate: 350,
    avgRating: 4.9,
    rating: 4.9,
    totalJobsCompleted: 88,
    totalJobs: 88,
    isOnline: true,
    isAvailable: true,
    verificationStatus: 'verified',
    yearsExperience: 6,
    address: 'Indiranagar 100ft Rd, Bengaluru',
    currentLocation: {
      lat: 12.9716,
      lng: 77.5946,
      geohash: 'tdr1v4'
    }
  },
  {
    uid: 'prov_sarah_jenkins',
    name: 'Sarah Jenkins',
    phone: '+91 98765 43211',
    email: 'sarah.jenkins@connectgig.pro',
    role: 'provider',
    categories: ['Cleaner'],
    skills: ['Cleaner'],
    hourlyRate: 220,
    avgRating: 5.0,
    rating: 5.0,
    totalJobsCompleted: 142,
    totalJobs: 142,
    isOnline: true,
    isAvailable: true,
    verificationStatus: 'verified',
    yearsExperience: 4,
    address: 'Koramangala 4th Block, Bengaluru',
    currentLocation: {
      lat: 12.9352,
      lng: 77.6245,
      geohash: 'tdr1w2'
    }
  },
  {
    uid: 'prov_david_chen',
    name: 'David Chen',
    phone: '+91 98765 43212',
    email: 'david.chen@connectgig.pro',
    role: 'provider',
    categories: ['Plumber'],
    skills: ['Plumber'],
    hourlyRate: 380,
    avgRating: 4.8,
    rating: 4.8,
    totalJobsCompleted: 95,
    totalJobs: 95,
    isOnline: true,
    isAvailable: true,
    verificationStatus: 'verified',
    yearsExperience: 8,
    address: 'HSR Layout Sector 1, Bengaluru',
    currentLocation: {
      lat: 12.9121,
      lng: 77.6446,
      geohash: 'tdr1te'
    }
  },
  {
    uid: 'prov_elena_rodriguez',
    name: 'Elena Rodriguez',
    phone: '+91 98765 43213',
    email: 'elena.rodriguez@connectgig.pro',
    role: 'provider',
    categories: ['Painter'],
    skills: ['Painter'],
    hourlyRate: 280,
    avgRating: 4.9,
    rating: 4.9,
    totalJobsCompleted: 64,
    totalJobs: 64,
    isOnline: true,
    isAvailable: true,
    verificationStatus: 'verified',
    yearsExperience: 5,
    address: 'Whitefield Main Rd, Bengaluru',
    currentLocation: {
      lat: 12.9698,
      lng: 77.7499,
      geohash: 'tdr3j1'
    }
  },
  {
    uid: 'prov_rajesh_kumar',
    name: 'Rajesh Kumar',
    phone: '+91 98765 43214',
    email: 'rajesh.kumar@connectgig.pro',
    role: 'provider',
    categories: ['AC Technician', 'Electrician'],
    skills: ['AC Technician', 'Electrician'],
    hourlyRate: 450,
    avgRating: 4.9,
    rating: 4.9,
    totalJobsCompleted: 112,
    totalJobs: 112,
    isOnline: true,
    isAvailable: true,
    verificationStatus: 'verified',
    yearsExperience: 7,
    address: 'Jayanagar 4th Block, Bengaluru',
    currentLocation: {
      lat: 12.9250,
      lng: 77.5938,
      geohash: 'tdr1ss'
    }
  },
  {
    uid: 'prov_priya_sharma',
    name: 'Priya Sharma',
    phone: '+91 98765 43215',
    email: 'priya.sharma@connectgig.pro',
    role: 'provider',
    categories: ['Gardener'],
    skills: ['Gardener'],
    hourlyRate: 200,
    avgRating: 4.7,
    rating: 4.7,
    totalJobsCompleted: 43,
    totalJobs: 43,
    isOnline: true,
    isAvailable: true,
    verificationStatus: 'verified',
    yearsExperience: 3,
    address: 'Bellandur EcoSpace, Bengaluru',
    currentLocation: {
      lat: 12.9260,
      lng: 77.6762,
      geohash: 'tdr1wf'
    }
  }
];

async function seedWithAdmin() {
  console.log(`🚀 Seeding ${PROVIDERS.length} providers via Admin SDK...`);
  const batch = adminDb.batch();
  const now = adminModule.firestore.Timestamp.now();

  for (const p of PROVIDERS) {
    const userRef = adminDb.collection('users').doc(p.uid);
    batch.set(userRef, {
      uid: p.uid,
      name: p.name,
      phone: p.phone,
      email: p.email,
      role: 'provider',
      address: p.address,
      createdAt: now,
    }, { merge: true });

    const provRef = adminDb.collection('providers').doc(p.uid);
    batch.set(provRef, {
      ...p,
      createdAt: now,
      lastLocationUpdate: now,
    }, { merge: true });

    console.log(`  ✅ Queued: ${p.name} (${p.categories.join(', ')})`);
  }

  await batch.commit();
  console.log('\n🎉 Finished! All real providers have been written to Firestore with Admin access.');
}

async function seedWithClient() {
  const { initializeApp } = require('firebase/app');
  const { getFirestore, doc, setDoc, serverTimestamp } = require('firebase/firestore');

  const app = initializeApp(firebaseConfig);
  const db = getFirestore(app);

  console.log(`🚀 Seeding ${PROVIDERS.length} providers via Web SDK...`);
  for (const p of PROVIDERS) {
    await setDoc(doc(db, 'users', p.uid), {
      uid: p.uid,
      name: p.name,
      phone: p.phone,
      email: p.email,
      role: 'provider',
      address: p.address,
      createdAt: serverTimestamp()
    }, { merge: true });

    await setDoc(doc(db, 'providers', p.uid), {
      ...p,
      createdAt: serverTimestamp(),
      lastLocationUpdate: serverTimestamp(),
    }, { merge: true });

    console.log(`  ✅ Seeded: ${p.name} (${p.categories.join(', ')})`);
  }
  console.log('\n🎉 Finished! All real providers have been written to Firestore.');
}

async function run() {
  try {
    if (useAdmin) {
      await seedWithAdmin();
    } else {
      await seedWithClient();
    }
  } catch (error) {
    console.error('\n❌ Seeding failed with:', error.message || error);
    console.log('\n📋 HOW TO FIX THIS:');
    console.log('----------------------------------------------------');
    console.log('1. FILL REAL CREDENTIALS IN .env');
    console.log('   Open your .env file and paste real Firebase Web keys from:');
    console.log('   Firebase Console → Project Settings → General → Your apps (Web app)');
    console.log('\n2. OR USE A SERVICE ACCOUNT KEY (Recommended):');
    console.log('   Go to Firebase Console → Project Settings → Service accounts');
    console.log('   Click "Generate new private key", and save the downloaded file as:');
    console.log('   d:\\startup\\Connect_Gig\\serviceAccountKey.json');
    console.log('   Then re-run: npm run seed');
    console.log('\n3. OR USE THE CLOUD FUNCTION SEEDER (1-Click in Browser):');
    console.log('   Deploy Cloud Functions: firebase deploy --only functions');
    console.log('   Then open: https://<region>-<project_id>.cloudfunctions.net/seedRealProviders');
    console.log('----------------------------------------------------\n');
  }
}

run();
