# Nova Words Admin Panel

A standalone React web app for managing Nova Words game content in Firebase Firestore.

## Tech Stack

- React + Vite
- Firebase (Authentication + Firestore)
- Tailwind CSS
- React Router

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) 18 or later
- npm

### Install & Run

```bash
cd admin-panel
npm install
npm run dev
```

Open the URL shown in the terminal (usually `http://localhost:5173`).

### Build for Production

```bash
npm run build
npm run preview
```

## Creating the First Admin User

The admin panel only allows users who exist in **both** Firebase Authentication and the Firestore `admins` collection.

### Step 1: Create an Auth user

1. Open the [Firebase Console](https://console.firebase.google.com/) and select the **nova-words-c706f** project.
2. Go to **Build → Authentication**.
3. If prompted, enable **Email/Password** sign-in.
4. Click **Add user** and create an account with your admin email and password.

### Step 2: Grant admin access in Firestore

1. Go to **Build → Firestore Database**.
2. Create a collection named `admins`.
3. Add a document with:
   - **Document ID**: the user's **UID** from Authentication (Users tab → copy UID)
   - **Fields** (optional): e.g. `email` (string), `createdAt` (string)

Example:

```
admins/
  {your-user-uid}/
    email: "admin@example.com"
    createdAt: "2026-06-27T00:00:00.000Z"
```

### Step 3: Sign in

Use the email and password from Step 1 at the admin panel login page.

## Firestore Data Structure

```
worlds/
  {worldId}/
    name: "Magic"
    emoji: "🧙"
    order: 1
    levels/
      {levelId}/
        levelNumber: 1
        words: ["MAGIC", "SPELL", "WAND"]

settings/
  metadata/
    lastUpdated: "2026-06-27T12:00:00.000Z"

admins/
  {userUid}/
    email: "admin@example.com"
```

## Features

- **Dashboard** — stats for total words, worlds, levels, and last updated date
- **Worlds & Levels** — create/delete worlds and levels
- **Words Manager** — edit puzzle words per level with inline editing
- **Settings** — change admin email/password, view Firebase project ID

## Firestore Security Rules (Recommended)

Configure rules so only authenticated admins can write game data:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    function isAdmin() {
      return request.auth != null
        && exists(/databases/$(database)/documents/admins/$(request.auth.uid));
    }

    match /admins/{uid} {
      allow read: if request.auth != null && request.auth.uid == uid;
      allow write: if false;
    }

    match /worlds/{worldId} {
      allow read: if true;
      allow write: if isAdmin();

      match /levels/{levelId} {
        allow read: if true;
        allow write: if isAdmin();
      }
    }

    match /settings/{doc} {
      allow read: if isAdmin();
      allow write: if isAdmin();
    }
  }
}
```

## Project Structure

```
admin-panel/
├── src/
│   ├── components/     # Layout, Sidebar, Modal, etc.
│   ├── context/        # Auth context
│   ├── pages/          # Login, Dashboard, Worlds, Words, Settings
│   ├── services/       # Firestore helpers
│   ├── firebase.js     # Firebase initialization
│   ├── App.jsx
│   └── main.jsx
├── package.json
└── README.md
```
