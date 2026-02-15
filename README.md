# 🚗 Dealer OS

**Das Betriebssystem für Autohändler.** Bestand, Inserate, Kunden — alles in einem.

## Status

🚧 **Phase 1: MVP Development** (Beta)

## Tech Stack

- **Frontend:** Next.js 14 + TypeScript
- **UI:** Tailwind CSS + shadcn/ui
- **Backend:** Supabase (Auth, DB, Storage)
- **Hosting:** Vercel
- **AI:** OpenAI (für Pricing Engine, später)

## Features (MVP)

- [ ] Fahrzeug-Erfassung (Fotos, Daten, Zustand)
- [ ] Multi-Channel Publishing (AutoScout24, tutti, FB)
- [ ] Kunden-Inbox (Lead Management)
- [ ] Standzeit-Tracking
- [ ] Basic Analytics

## Getting Started

```bash
# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local

# Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Environment Variables

```env
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
```

## Project Structure

```
src/
├── app/                    # Next.js App Router
│   ├── (auth)/            # Auth pages (login, register)
│   ├── dashboard/         # Main app
│   └── api/               # API routes
├── components/
│   └── ui/                # shadcn/ui components
└── lib/                   # Utilities
```

## License

Proprietary — © 2026 Dealer OS

---

Built with ❤️ in Switzerland 🇨🇭
