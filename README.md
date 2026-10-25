# Calli Art — Full-Stack Calligraphy Web Platform

> A responsive, full-stack calligraphy web platform featuring an interactive digital canvas studio, community showcase feed, digital download resources, and link-in-bio artist portal.

---

## 🏛️ System Architecture

```text
[ Frontend: React / Next.js (App Router) + Tailwind CSS ]  <--- Fully Responsive (Mobile, Tablet & Desktop)
       │
       ├── Link-in-Bio / Portal Page (/links)
       ├── Community Feed & Showcase (/feed)
       ├── Interactive Canvas / Web Studio (/studio)
       └── Digital Downloads / Course Resources (/resources)
       │
[ Backend & Database: Supabase ]
       │
       ├── Storage Bucket: artworks, resources (Images, uploads, practice PDFs)
       ├── Database Tables: profiles, posts, likes, comments, resources
       └── Row Level Security (RLS): Read = Public (Open to All), Write = Authenticated
```

---

## 🌟 Key Features

### 1. 🔗 Link-in-Bio / Portal Page (`/links`)
- Mobile-first artist showcase with toggleable **Smartphone Frame** or **Full Screen Portal** views.
- Artist profile avatar with verified master calligrapher badge, bio, and social channels (Instagram, YouTube, Behance, Email).
- Direct call-to-action cards for the Web Studio, Community Feed, Practice Guides, and Courses.
- Interactive **QR Code Generator** to share or print for workshops and exhibitions.

### 2. 🖼️ Community Feed & Showcase (`/feed`)
- **Responsive Layout**: Single-column on mobile, 2-column on tablet, and 4-column multi-grid on desktop.
- **Category Filter Tabs**: Arabic / Islamic, Copperplate, Gothic, Modern Brush, Flourishing, Digital.
- **Interactive Modals**:
  - Full artwork detail view with discussion and comment threads.
  - **Upload Artwork Modal**: Connected directly to Supabase storage (`artworks` bucket) and database table (`posts`), with celebratory confetti!
- Live like toggle and counters.

### 3. 🖌️ Interactive Canvas / Web Studio (`/studio`)
- **Authentic Calligraphy Physics**:
  - **Chisel / Broad Edge Nib**: Fixed angle vector rendering (45° Gothic, 30° Roman, etc.).
  - **Pointed Pen (Copperplate)**: Pressure and velocity sensitive metal flex nib expansion (hairline upstrokes and rich swells).
  - **Bamboo Qalam**: Traditional 70° Arabic reed pen simulation.
  - **Modern Brush Pen & Monoline**.
- **Guideline Overlays**:
  - 55° Copperplate Slant Lines with ascender, waistline, and descender grids.
  - Arabic Nuqta Rhombic Dot proportions.
  - Gothic 5x ruling.
  - Dot Grid.
- **Artisan Paper Textures**: Antique Parchment, Dark Obsidian, Handmade Deckle, Clean White.
- **Ink Palette**: Sumi Black, Walnut Sepia, Illuminated 24k Gold, Crimson, Lapis Indigo, Forest Emerald, and custom hex picker.
- **Export**: One-click high-res PNG download, SVG export, and instant **"Publish to Feed"** bridge.

### 4. 📥 Digital Downloads & Course Resources (`/resources`)
- Catalog of printable practice sheets, Procreate brush packs, and ductus cheat sheets.
- Difficulty tags (*Beginner*, *Intermediate*, *Masterclass*).
- **Interactive Custom Guideline Generator**: Customize slant angle (55°, 60°, etc.) and x-height in millimeters to instantly generate and print vector SVG ruling sheets!

---

## 🗄️ Supabase Configuration & Schema

The application is pre-configured with your Supabase credentials in `.env.local`:
```env
NEXT_PUBLIC_SUPABASE_URL=https://lvveadhykwvtkepmzytm.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_wYXiktTt-fM-9cAgHkHT-A_QIvtu0Tj
```

### Applying the Database Schema:
To create the tables and storage buckets in your Supabase project:
1. Open your [Supabase Dashboard](https://supabase.com/dashboard/project/lvveadhykwvtkepmzytm).
2. Go to the **SQL Editor** tab.
3. Open `supabase/schema.sql` from this codebase, copy the SQL, paste it into the editor, and click **Run**.
4. That creates:
   - `public.profiles`
   - `public.posts`
   - `public.likes`
   - `public.comments`
   - `public.resources`
   - Storage buckets `artworks` and `resources` with public read RLS.

---

## 🚀 Running the Project

```bash
# 1. Start the development server
npm run dev

# 2. Open in browser
http://localhost:3000
```
