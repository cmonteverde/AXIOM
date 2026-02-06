# SAGE - Scholarly Assistant for Guided Excellence

## Overview
SAGE is an AI-powered research mentor that guides users through the scholarly manuscript lifecycle using gamification and "Why-based" pedagogy.

## Architecture
- **Frontend**: React (Vite) + Tailwind CSS + shadcn/ui components
- **Backend**: Node.js (Express)
- **Database**: PostgreSQL (Drizzle ORM)
- **Font**: Inter (sans-serif)
- **Color Palette**:
  - Primary Purple: #7C3AED (actions, headings, brand)
  - Lavender Background: #F5F1FB (UI wash / page background)
  - Sage Green: #9EBFA6 (learning, progress, success states)
  - Insight Gold: #F0C861 (highlights only, used sparingly)
  - Text Dark: #1F2937 (primary text)
  - Muted Gray: #6B7280 (secondary text)
- **Logo**: attached_assets/SAGE_logo_1770411503546.png (shown on welcome screen)

## Project Structure
- `client/src/pages/` - Page components (welcome, profile-setup, dashboard, new-manuscript)
- `client/src/components/ui/` - shadcn/ui base components
- `server/` - Express server (routes.ts, storage.ts, db.ts)
- `shared/schema.ts` - Drizzle ORM schema definitions

## Database Schema
- `users` - User profiles with research level, field, learning mode, XP, level, streak
- `manuscripts` - Manuscripts with stage, help types, title, readiness score

## Key Routes
- `POST /api/users` - Create user profile
- `GET /api/users/:id` - Get user by ID
- `DELETE /api/users/:id` - Delete user and all data
- `GET /api/manuscripts/:userId` - Get manuscripts by user
- `POST /api/manuscripts` - Create manuscript

## User Flow
1. Welcome screen → New User / Returning
2. Profile Setup (3 steps): Research Level → Primary Field → Learning Mode
3. Dashboard with gamification stats
4. New Manuscript flow (3 steps): Stage → Help Types → Upload/Title

## State Management
- User ID stored in localStorage as `sage_user_id`
- React Query for server state management
- No sidebar needed - centered card-based layout
