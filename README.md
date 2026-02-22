# Walden's Word Trainer

A simple, effective word list memorization helper built with Next.js.

## Features

- **User Authentication**: Sign up and log in with email/password using Better Auth
- **Create Word Lists**: Paste word lists with definitions (one word per line)
- **Public Word Lists**: All word lists are visible to logged-in users
- **Study Mode**: Test your recall by typing words from memory
- **Results Tracking**: See which words you remembered, missed, and any incorrect attempts

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Database**: SQLite with Prisma ORM (v7)
- **Authentication**: Better Auth
- **Styling**: Tailwind CSS (with dark mode support)

## Getting Started

### Prerequisites

- Node.js 20.19.0 or higher
- npm

### Installation

1. Clone the repository and navigate to the project:

```bash
cd word-list
```

2. Install dependencies:

```bash
npm install
```

3. Set up your environment variables by creating a `.env` file:

```env
DATABASE_URL="file:./prisma/dev.db"
BETTER_AUTH_SECRET=your-super-secret-key-change-in-production-32chars
BETTER_AUTH_URL=http://localhost:3000
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

> **Important**: Change `BETTER_AUTH_SECRET` to a secure random string in production!

4. Generate Prisma client and run migrations:

```bash
npx prisma generate
npx prisma migrate dev
```

5. Start the development server:

```bash
npm run dev
```

6. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Word List Format

Word lists should be entered with one word per line, in the format:

```
WORD definition text...
```

For example:

```
AA rough, cindery lava [n AAS]
AB a muscle in the abdomen [n ABS]
AD an advertisement [n ADS]
AE one [adj]
```

The word is everything before the first space. The definition is everything after.

## Study Mode

1. Navigate to a word list and click "Study This List"
2. Type words from memory and press Enter
3. Words are automatically uppercased
4. Correct words show in green with their definitions
5. Incorrect words (not in the list) show in red
6. Duplicate entries are ignored
7. Click "Done" when finished to see your results

## Results

After completing a study session, you'll see:

- **Words You Remembered**: Successfully recalled words with definitions
- **Words You Missed**: Words in the list you didn't type
- **Incorrect Attempts**: Words you typed that weren't in the list

## Development

```bash
# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run linting
npm run lint

# Prisma commands
npx prisma studio    # Open database GUI
npx prisma generate  # Regenerate client
npx prisma migrate dev --name <name>  # Create migration
```

## License

MIT