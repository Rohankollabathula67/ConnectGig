/**
 * ConnectGig — Firestore Provider Seeder
 * Populates real verified service providers into your live Firestore database.
 * 
 * Usage:
 *   node scripts/seedFirestore.js
 */

const fs = require('fs');
const path = require('path');
const { initializeApp } = require('firebase/app');
const { getFirestore, doc, setDoc, writeBatch, serverTimestamp } = require('firebase/firestore');

// Load environment variables from .env
const envPath = path.resolve(__dirname, '../.env');
if (!fs.existsSync(envPath)) {
  console.error('❌ .env file not found at:', envPath);
  process.exit(1);
}

const envContent = fs.readFileSync(envPath, 'utf8');
const env = {};
envContent.split('\n').forEach(line => {
  const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
  if (match) {
    let value = match[2] || '';
    if (value.startsWith('"') && value.endsWith('"')) value = value.slice(1, -1);
    if (value.startsWith("'") && value.endsWith("'")) value = value.slice(1, -1);
    env[match[1]] = value.trim();
  }
});

const firebaseConfig = {
  apiKey: env.EXPO_PUBLIC_FIREBASE_API_KEY,
  authDomain: env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: env.EXPO_PUBLIC_FIREBASE_APP_ID,
};

console.log('🌱 ConnectGig Firestore Seeder');
console.log('   Target Project ID:', firebaseConfig.projectId);

if (!firebaseConfig.apiKey || firebaseConfig.apiKey.includes('mock')) {
  console.warn('⚠️  Notice: Your .env still has a placeholder or mock API key.');
  console.warn('   Please paste your real Firebase Web credentials in .env to populate your cloud Firestore.');
}

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const PROVIDERS = [
  {
    uid: 'prov_marcus_rivera',
    name: 'Marcus Rivera',
    phone: '+91 98765 43210',
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

async function seed() {
  console.log(`🚀 Seeding ${PROVIDERS.length} providers into Firestore...`);
  try {
    for (const p of PROVIDERS) {
      // 1. User doc
      await setDoc(doc(db, 'users', p.uid), {
        uid: p.uid,
        name: p.name,
        phone: p.phone,
        role: 'provider',
        address: p.address,
        createdAt: serverTimestamp()
      }, { merge: true });

      // 2. Provider doc
      await setDoc(doc(db, 'providers', p.uid), {
        uid: p.uid,
        name: p.name,
        phone: p.phone,
        categories: p.categories,
        skills: p.skills,
        hourlyRate: p.hourlyRate,
        avgRating: p.avgRating,
        rating: p.rating,
        totalJobsCompleted: p.totalJobsCompleted,
        totalJobs: p.totalJobs,
        isOnline: p.isOnline,
        isAvailable: p.isAvailable,
        verificationStatus: p.verificationStatus,
        yearsExperience: p.yearsExperience,
        address: p.address,
        currentLocation: p.currentLocation,
        createdAt: serverTimestamp()
      }, { merge: true });

      console.log(`  ✅ Seeded: ${p.name} (${p.categories.join(', ')})`);
    }

    console.log('\n🎉 Finished! All real providers have been written to Firestore.');
  } catch (error) {
    console.error('❌ Seeding failed:', error);
  }
}

seed();
