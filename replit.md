# SAGE - Scholarly Assistant for Guided Excellence

## Overview
SAGE is an AI-powered research mentor that guides users through the scholarly manuscript lifecycle using gamification and "Why-based" pedagogy.

## Architecture
- **Frontend**: React (Vite) + Tailwind CSS + shadcn/ui components
- **Backend**: Node.js (Express)
- **Database**: PostgreSQL (Drizzle ORM)
- **Font**: Inter (sans-serif)
- **Primary Color**: Purple (#7C3AED / hsl 262 83% 58%)

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
