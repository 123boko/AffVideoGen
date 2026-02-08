# Auto Affiliate Video Generator

Web application for automatically generating affiliate videos from marketplace product links (Shopee & Tokopedia).

## Features

- 🔐 User authentication (email/password)
- 🔍 Product scraping from Shopee & Tokopedia
- ✏️ Product data editor
- 🤖 AI-powered content generation (captions, descriptions, hashtags)
- 🎙️ Text-to-speech audio generation
- 🎬 Video generation (placeholder for Google Veo 3)
- 📊 Project dashboard
- 👁️ Preview and download

## Tech Stack

- **Framework**: Next.js 14 (App Router) + TypeScript
- **Database**: PostgreSQL + Prisma ORM
- **Authentication**: NextAuth.js
- **Styling**: Tailwind CSS
- **Scraping**: Puppeteer
- **AI**: OpenRouter API, ElevenLabs API

## Prerequisites

- Node.js 18+
- PostgreSQL database
- OpenRouter API key
- ElevenLabs API key

## Installation

1. Clone the repository and install dependencies:

```bash
npm install
```

2. Set up environment variables in `.env.local`:

```env
DATABASE_URL="postgresql://user:password@localhost:5432/affvideogen"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key-here"
OPENROUTER_API_KEY="your-openrouter-api-key"
ELEVENLABS_API_KEY="your-elevenlabs-api-key"
```

3. Set up the database:

```bash
npx prisma migrate dev --name init
npx prisma generate
```

4. Run the development server:

```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000)

## Usage

1. **Register/Login**: Create an account or sign in
2. **Create Project**: Enter a Shopee or Tokopedia product URL
3. **Edit Product**: Review and edit scraped product data
4. **Generate AI Content**: Click "Analyze" to generate marketing content
5. **Generate Audio**: Create voice-over from AI-generated script
6. **Generate Video**: Create video from AI prompts
7. **Preview**: View and download your completed video

## Project Structure

```
app/
├── (auth)/          # Authentication pages
├── (dashboard)/     # Protected dashboard pages
└── api/             # API routes
components/          # React components
lib/                 # Utilities and integrations
prisma/              # Database schema
```
