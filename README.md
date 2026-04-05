# 🌿 Memory Timeline — Our Journey Since August 15, 2023

A premium, animated memory timeline for **hammad Masood, Raza Khan, Hammad Shah & Aitzaz Hasan** — built with Next.js, TypeScript, Tailwind CSS, Framer Motion, and Supabase.

---

## ✨ Features

- **Hero Section** — Large orbiting photo system with parallax mouse movement
- **Memory Cards** — Alternating left/right layout with 3D tilt on hover + scroll-reveal animations
- **Memory Detail Modal** — Full-screen view with prev/next navigation (keyboard arrows supported)
- **Upload Modal** — Any of the 4 friends can upload photos with title, date, location, story, series tag, and private toggle
- **Horizontal Timeline** — Scrollable event timeline from Aug 15, 2023 to today
- **Friends Section** — 4 cards with continuously rotating gradient border animation
- **Memory Wall** — Masonry grid + auto-scrolling film reel strip
- **This Day in Our Journey** — Shows memories from the same calendar date in past years
- **Upcoming Chapters** — Future events planning section
- **Floating Particles** — Gentle botanical particle animations throughout
- **Glassmorphism Nav** — Floating pill navbar with ambient shadow
- **Sidebar Timeline** — Vertical dot navigation tracking scroll position

---

## 🚀 Getting Started

### 1. Install dependencies
```bash
cd ethereal-archive
npm install
```

### 2. Use a supported Node.js version
This app should run on **Node.js 20 or 22**.

If you are on Node 24, switch first:
```bash
nvm install 22
nvm use 22
```

### 3. Configure environment variables
Create `.env.local` from `.env.example` and fill Supabase values:

```bash
copy .env.example .env.local
```

### 4. Run development server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

### 5. Build for production
```bash
npm run build
npm start
```

## ⚡ Supabase Persistence

`/api/memories` now supports:

- **Supabase table (`memories`)** for metadata storage
- **Supabase Storage bucket (`memories`)** for uploaded images
- **Fallback seed data** (`lib/data.ts`) when data fetch fails

This keeps the frontend unchanged while running on Supabase for persistence and auth.

---

## 📁 Folder Structure

```
ethereal-archive/
├── app/
│   ├── api/memories/route.ts   ← Upload API endpoint
│   ├── globals.css             ← All animations & design tokens
│   ├── layout.tsx              ← Root layout with fonts
│   └── page.tsx                ← Main page (assembles everything)
├── components/
│   ├── NavBar.tsx              ← Floating glassmorphism navigation
│   ├── SideBar.tsx             ← Vertical timeline dot sidebar
│   ├── Hero.tsx                ← Orbiting photo hero section
│   ├── MemoryCard.tsx          ← Individual memory card with 3D hover
│   ├── MemoryDetail.tsx        ← Full memory view modal
│   ├── MemoryWall.tsx          ← Masonry grid + film reel
│   ├── MemoriesSection.tsx     ← Year-grouped alternating cards
│   ├── TimelineSection.tsx     ← Horizontal scrollable timeline
│   ├── FriendsSection.tsx      ← 4 friends with rotating borders
│   ├── UpcomingSection.tsx     ← Future events
│   ├── UploadModal.tsx         ← Photo upload form
│   ├── ThisDay.tsx             ← "This day in history" section
│   ├── Particles.tsx           ← Floating particle background
│   └── Footer.tsx              ← Site footer
├── lib/
│   ├── data.ts                 ← Seed memories + friends data
│   └── utils.ts                ← Helper functions
├── public/
│   └── memories/               ← Uploaded images stored here
│       ├── 2023/               ← Pre-launch photos go here
│       ├── 2024/
│       ├── 2025/
│       └── 2026/
├── types/
│   └── index.ts                ← TypeScript interfaces
└── README.md
```

---

## 📸 Adding Pre-Launch Photos

Before going live, place your photos in `/public/memories/YEAR/` and update `/lib/data.ts`:

```typescript
// In lib/data.ts → INITIAL_MEMORIES array
{
  id: 'mem-new',
  title: 'Our Amazing Trip',
  description: 'Description of what happened...',
  date: '2024-07-15',
  location: 'Lahore, Pakistan',
  imagePath: '/memories/2024/our-trip.jpg',  // ← Your image path
  uploadedBy: 'hammad Masood',
  tags: ['trip', 'summer'],
  isPrivate: false,
  createdAt: '2024-07-15T12:00:00Z',
  series: 'Adventures',
}
```

---

## 🎨 Design System

Colors are based on Material Design 3 with botanical green palette:

| Token | Color | Usage |
|-------|-------|-------|
| `primary` | `#486648` | Main brand color |
| `primary-fixed` | `#c9ecc6` | Backgrounds, highlights |
| `primary-container` | `#9ebf9c` | Buttons, badges |
| `surface` | `#f8faf8` | Page background |
| `on-surface` | `#191c1b` | Body text |

Typography:
- **Noto Serif** (italic) — Headlines, display text, emotional moments
- **Manrope** — Body text, labels, UI elements

---

## 🔮 Future Enhancements

- Add role-based access for multiple admin groups
- Add image transforms and thumbnails via edge functions
- Add email templates for auth onboarding
- Push notifications for new uploads
- Mobile app wrapper (React Native / Capacitor)

---

*Built with love for hammad Masood, Raza Khan, Hammad Shah & Aitzaz Hasan — August 15, 2023 → Forever* 🌿
