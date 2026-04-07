# DentaFind

A premium dental booking platform built with Next.js, MongoDB, and Leaflet maps.

## Features

- 🟣 Premium purple gradient dark theme with glassmorphism
- 👤 User/Doctor role-based registration
- 🦷 Browse, search, and filter dentists
- 🗺️ Interactive map with OpenStreetMap (free)
- 📅 Appointment booking with date/time selection
- 💬 Real-time chat between patients and doctors
- 🩺 Doctor dashboard for profile setup and appointment management
- 🔒 Secure authentication with bcrypt password hashing

## Tech Stack

- **Next.js 14** (App Router)
- **MongoDB Atlas** (free tier)
- **NextAuth.js** (JWT auth)
- **Leaflet + OpenStreetMap** (free maps)
- **Lucide React** (icons)

## Setup

1. Clone this repo
2. Run `npm install`
3. Create `.env.local` with:
   ```
   MONGODB_URI=your_mongodb_connection_string
   NEXTAUTH_SECRET=your_secret_key
   NEXTAUTH_URL=http://localhost:3000
   ```
4. Run `npm run dev`

## Deploy to Vercel

1. Push to GitHub
2. Import in Vercel
3. Add environment variables in Vercel dashboard
4. Deploy!

## License

MIT
