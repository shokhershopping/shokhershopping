/**
 * One-time script to create an admin user in Firebase Auth + Firestore.
 * Run from packages/firebase-config/:  node setup-admin.js
 */

const { initializeApp, cert } = require('firebase-admin/app');
const { getAuth } = require('firebase-admin/auth');
const { getFirestore, Timestamp } = require('firebase-admin/firestore');
const path = require('path');
const fs = require('fs');

// Load env from isomorphic/.env.local
const envPath = path.join(__dirname, '..', '..', 'apps', 'isomorphic', '.env.local');
const envContent = fs.readFileSync(envPath, 'utf-8');
const env = {};
for (const line of envContent.split('\n')) {
  const trimmed = line.trim();
  if (!trimmed || trimmed.startsWith('#')) continue;
  const eqIndex = trimmed.indexOf('=');
  if (eqIndex === -1) continue;
  const key = trimmed.substring(0, eqIndex);
  let value = trimmed.substring(eqIndex + 1);
  // Remove trailing comma
  if (value.endsWith(',')) value = value.slice(0, -1);
  // Remove surrounding quotes
  if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
    value = value.slice(1, -1);
  }
  env[key] = value;
}

const privateKey = env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n');

console.log('Project:', env.FIREBASE_PROJECT_ID);
console.log('Email:', env.FIREBASE_CLIENT_EMAIL);
console.log('Key starts:', privateKey.substring(0, 27) + '...');

// Initialize Firebase Admin
const app = initializeApp({
  credential: cert({
    projectId: env.FIREBASE_PROJECT_ID,
    clientEmail: env.FIREBASE_CLIENT_EMAIL,
    privateKey: privateKey,
  }),
});

const auth = getAuth(app);
const db = getFirestore(app);

// ---- CONFIGURE YOUR ADMIN USER HERE ----
const ADMIN_EMAIL = 'admin@shokhershopping.com';
const ADMIN_PASSWORD = 'Admin@123456';
const ADMIN_NAME = 'Admin';
// -----------------------------------------

async function main() {
  console.log('\nSetting up admin user...');

  let uid;

  try {
    const existingUser = await auth.getUserByEmail(ADMIN_EMAIL);
    uid = existingUser.uid;
    console.log('Firebase Auth: User already exists (uid: ' + uid + ')');
  } catch (error) {
    if (error.code === 'auth/user-not-found') {
      const newUser = await auth.createUser({
        email: ADMIN_EMAIL,
        password: ADMIN_PASSWORD,
        displayName: ADMIN_NAME,
      });
      uid = newUser.uid;
      console.log('Firebase Auth: Created new user (uid: ' + uid + ')');
    } else {
      throw error;
    }
  }

  const now = Timestamp.now();
  await db.collection('users').doc(uid).set({
    id: uid,
    email: ADMIN_EMAIL,
    name: ADMIN_NAME,
    image: null,
    role: 'ADMIN',
    createdAt: now,
    updatedAt: now,
  }, { merge: true });

  console.log('Firestore: User document set with role: ADMIN');
  console.log('\nAdmin user ready!');
  console.log('  Email:    ' + ADMIN_EMAIL);
  console.log('  Password: ' + ADMIN_PASSWORD);
  console.log('  UID:      ' + uid);
  console.log('\nChange the password after first login!');

  process.exit(0);
}

main().catch((err) => {
  console.error('Error:', err.message);
  process.exit(1);
});
