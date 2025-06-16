# AI Real Estate Helper

A modern, minimalistic Next.js application that helps real estate professionals generate optimized property listings and analyze contracts using AI.

## Features

- **Generative Listings**: Create professional MLS descriptions and social media content optimized for Facebook, Instagram, and LinkedIn
- **Contract Analysis**: Upload real estate contracts and get AI-powered summaries and insights
- **User Authentication**: Secure login and signup with Supabase Auth
- **User Dashboard**: Modern, minimalistic dashboard with analytics
- **Subscription Management**: Different pricing tiers with feature limitations

## Tech Stack

- **Frontend**: Next.js 14, React 18, TypeScript
- **Styling**: TailwindCSS
- **Authentication**: Supabase Auth
- **Database**: Supabase PostgreSQL
- **AI**: OpenAI API

## Getting Started

### Prerequisites

- Node.js 18+ and npm/yarn
- Supabase account
- OpenAI API key

### Environment Variables

Create a `.env.local` file in the root directory with the following variables:

```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
NEXT_PUBLIC_OPENAI_API_KEY=your_openai_api_key
NEXT_PUBLIC_OPENAI_MODEL=gpt-4
```

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   # or
   yarn install
   ```
3. Run the development server:
   ```bash
   npm run dev
   # or
   yarn dev
   ```
4. Open [http://localhost:3000](http://localhost:3000) in your browser

### Database Setup

1. Create a new Supabase project
2. Run the SQL migration script in `lib/supabase-schema.sql` in the Supabase SQL editor
3. Enable email authentication in Supabase Auth settings

## Project Structure

```
/app                  # Next.js app directory
  /dashboard          # Dashboard pages
  /login              # Login page
  /signup             # Signup page
/components           # React components
  /ui                 # UI component library
/lib                  # Utility functions and services
  openai.ts           # OpenAI API integration
  supabase.ts         # Supabase client
  auth-utils.ts       # Authentication utilities
  file-utils.ts       # File handling utilities
/public               # Static assets
```

## License

MIT
