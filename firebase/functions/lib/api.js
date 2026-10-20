"use strict";
/**
 * ConnectGig — Users & Providers HTTP API (§4.5)
 *
 * Provides HTTP endpoints:
 * 1. getUsersList: Returns all users and providers in JSON format.
 * 2. seedRealProviders: Automatically populates real verified providers into Firestore.
 */
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.seedRealProviders = exports.getUsersList = void 0;
const https_1 = require("firebase-functions/v2/https");
const admin = __importStar(require("firebase-admin"));
// Initialize Admin SDK if not already initialized
if (admin.apps.length === 0) {
    admin.initializeApp();
}
const db = admin.firestore();
/**
 * Sample realistic service providers to seed into live Firestore
 */
const REAL_SEED_PROVIDERS = [
    {
        uid: 'provider_marcus_rivera',
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
        uid: 'provider_sarah_jenkins',
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
        uid: 'provider_david_chen',
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
        uid: 'provider_elena_rodriguez',
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
        uid: 'provider_rajesh_kumar',
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
        uid: 'provider_priya_sharma',
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
/**
 * HTTP GET API Endpoint: Return all users and providers in standard JSON format
 * URL: https://<region>-<project_id>.cloudfunctions.net/getUsersList
 */
exports.getUsersList = (0, https_1.onRequest)({ cors: true }, async (req, res) => {
    try {
        const usersSnap = await db.collection('users').get();
        const providersSnap = await db.collection('providers').get();
        const users = usersSnap.docs.map((docSnap) => ({
            id: docSnap.id,
            ...docSnap.data()
        }));
        const providers = providersSnap.docs.map((docSnap) => ({
            id: docSnap.id,
            ...docSnap.data()
        }));
        res.status(200).json({
            status: 'success',
            timestamp: new Date().toISOString(),
            counts: {
                totalUsers: users.length,
                totalProviders: providers.length
            },
            users,
            providers
        });
    }
    catch (error) {
        console.error('[API getUsersList] Error:', error);
        res.status(500).json({
            status: 'error',
            message: error?.message || 'Failed to retrieve users list'
        });
    }
});
/**
 * HTTP POST / GET Endpoint: Seed real providers into Firestore database
 * URL: https://<region>-<project_id>.cloudfunctions.net/seedRealProviders
 */
exports.seedRealProviders = (0, https_1.onRequest)({ cors: true }, async (req, res) => {
    try {
        const batch = db.batch();
        const now = admin.firestore.Timestamp.now();
        for (const p of REAL_SEED_PROVIDERS) {
            // 1. Write to 'users' collection
            const userRef = db.collection('users').doc(p.uid);
            batch.set(userRef, {
                uid: p.uid,
                name: p.name,
                phone: p.phone,
                email: p.email,
                role: 'provider',
                address: p.address,
                createdAt: now
            }, { merge: true });
            // 2. Write to 'providers' collection
            const providerRef = db.collection('providers').doc(p.uid);
            batch.set(providerRef, {
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
                lastLocationUpdate: now,
                createdAt: now
            }, { merge: true });
        }
        await batch.commit();
        res.status(200).json({
            status: 'success',
            message: `Successfully seeded ${REAL_SEED_PROVIDERS.length} real providers into Firestore.`,
            seededProviders: REAL_SEED_PROVIDERS.map(p => ({
                uid: p.uid,
                name: p.name,
                category: p.categories[0],
                rating: p.rating,
                hourlyRate: p.hourlyRate,
                phone: p.phone
            }))
        });
    }
    catch (error) {
        console.error('[API seedRealProviders] Error:', error);
        res.status(500).json({
            status: 'error',
            message: error?.message || 'Failed to seed real providers'
        });
    }
});
//# sourceMappingURL=api.js.map