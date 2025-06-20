# Supabase Database Setup for Games

This document explains how to set up and use the Supabase database for the games data in this project.

## Prerequisites

1. Install the Supabase CLI: https://supabase.com/docs/guides/cli
2. Install the Supabase JavaScript client: `npm install @supabase/supabase-js`

## Setup Instructions

### Option 1: Local Development with Supabase CLI

1. **Initialize Supabase locally:**
   ```bash
   supabase init
   supabase start
   ```

2. **Run the migrations:**
   ```bash
   supabase db reset
   ```

3. **Set up environment variables:**
   Create a `.env.local` file with:
   ```
   NEXT_PUBLIC_SUPABASE_URL=http://localhost:54321
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_local_anon_key
   ```
   (Get the anon key from the output of `supabase start`)

### Option 2: Hosted Supabase Project

1. **Create a new project at https://supabase.com**

2. **Run the migrations in the SQL editor:**
   - Copy the contents of `supabase/migrations/001_create_games_table.sql`
   - Paste and run in the Supabase SQL editor
   - Copy the contents of `supabase/migrations/002_seed_games_data.sql`
   - Paste and run in the Supabase SQL editor

3. **Set up environment variables:**
   Create a `.env.local` file with:
   ```
   NEXT_PUBLIC_SUPABASE_URL=your_project_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
   ```

## Database Schema

### Tables

#### `games`
- `id` (UUID, Primary Key)
- `title` (Text, Not Null)
- `slug` (Text, Unique, Not Null)
- `description` (Text, Not Null)
- `source` (Text, Not Null)
- `category` (Text, Not Null)
- `images` (Text Array, Not Null)
- `contract_address` (Text, Not Null)
- `is_active` (Boolean, Default: true)
- `opensea_url` (Text, Not Null)
- `storage_path` (Text, Not Null)
- `release_date` (Date, Not Null)
- `created_at` (Timestamp with Time Zone)
- `updated_at` (Timestamp with Time Zone)

## Usage Examples

### Fetching Games

```typescript
import { getAllGames, getGameBySlug, getGamesByCategory } from '@/lib/supabase/games'

// Get all games
const games = await getAllGames()

// Get a specific game by slug
const game = await getGameBySlug('cosmic-odyssey-the-void-walker')

// Get games by category
const actionGames = await getGamesByCategory('action')

// Get unique categories from existing games
const categories = await getUniqueCategories()
```

### Creating a New Game

```typescript
import { createGame } from '@/lib/supabase/games'

const newGame = await createGame({
  title: 'New Game Title',
  slug: 'new-game-title',
  description: 'Game description...',
  source: 'Game source info',
  category: 'action',
  images: ['https://example.com/image.jpg'],
  contract_address: '0x...',
  opensea_url: 'https://opensea.io/collection/...',
  storage_path: 'new-game',
  release_date: '2024-01-01'
})
```

### Searching Games

```typescript
import { searchGames } from '@/lib/supabase/games'

const results = await searchGames('cosmic')
```

## Row Level Security (RLS)

The database is configured with Row Level Security:
- **Public read access**: Anyone can view games
- **Authenticated write access**: Only authenticated users can create, update, or delete games

## Migration Commands

```bash
# Create a new migration
supabase migration new migration_name

# Reset database (runs all migrations)
supabase db reset

# Generate TypeScript types
supabase gen types typescript --local > lib/supabase/types.ts
```

## Troubleshooting

1. **Connection issues**: Ensure your environment variables are correctly set
2. **Migration errors**: Check that all migrations run in order
3. **Type errors**: Regenerate types with `supabase gen types typescript`

## Converting from Legacy Format

The project includes helper functions to convert between the legacy `GameItem` interface and the new database format:

```typescript
import { gameToGameItem, gameItemToGameInsert } from '@/lib/supabase/types'

// Convert database game to legacy format
const legacyGame = gameToGameItem(databaseGame)

// Convert legacy game to database insert format
const insertData = gameItemToGameInsert(legacyGame)
``` 