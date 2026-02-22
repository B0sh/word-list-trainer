Walden's Word Trainer - Specification

## Overview
A Next.js application for memorizing word lists. Users create accounts, build word lists (public to all authenticated users), and test their recall by typing words from memory.

## Tech Stack
- **Framework:** Next.js 14+ (App Router)
- **Database:** SQLite with Prisma ORM
- **Authentication:** Better Auth (email/password)
- **Styling:** Tailwind CSS (with dark mode)

## Data Models

### User
- id (string, primary key)
- email (string, unique)
- name (string, optional)
- emailVerified (boolean)
- image (string, optional)
- createdAt (datetime)
- updatedAt (datetime)

### WordList
- id (string, primary key)
- name (string)
- createdAt (datetime)
- updatedAt (datetime)
- userId (foreign key → User)

### Word
- id (string, primary key)
- word (string) - the word itself, stored uppercase
- definition (string, optional)
- wordListId (foreign key → WordList)

## Pages & Routes

### Public Routes
- `/` - Landing page with app description, login/signup links
- `/login` - Login form
- `/signup` - Registration form

### Protected Routes (require auth)
- `/dashboard` - Shows all word lists (from all users), button to create new
- `/lists/new` - Create a new word list (name + textarea for bulk paste)
- `/lists/[id]` - View a word list (shows all words + definitions in table)
- `/lists/[id]/edit` - Edit word list (only if owner)
- `/lists/[id]/study` - Study mode for the word list
- `/lists/[id]/results` - Results page after study session

## Study Mode Flow

1. User navigates to `/lists/[id]/study`
2. Shows word list name, word count, and a text input
3. User types a word and hits Enter:
   - Input is uppercased automatically
   - If word is in list AND not already guessed → **Success** (show word + definition, add to "remembered" list)
   - If word is NOT in list → **Incorrect** (show error feedback, add to "incorrect" list)
   - If word already guessed → ignore (no feedback)
4. Progress indicator shows: "X of Y words remembered"
5. "Done" button ends session → redirects to results page

## Results Page

Displays two sections:

### 1. Words You Remembered ✓
Table with columns: Word | Definition

### 2. Words You Missed
Table with columns: Word | Definition
(Words in the list that weren't typed)

### 3. Incorrect Attempts ✗
List of invalid words typed

## UI/UX Notes
- Clean, minimal design
- Dark mode support (system preference + toggle)
- Responsive for mobile
- Success = green feedback, Error = red feedback
- Auto-focus on input during study mode
