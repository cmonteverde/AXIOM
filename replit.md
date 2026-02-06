# SAGE - Scholarly Assistant for Guided Excellence

## Overview
SAGE is an AI-powered research mentor that guides users through the scholarly manuscript lifecycle using gamification and "Why-based" pedagogy.

## Architecture
- **Frontend**: React (Vite) + Tailwind CSS + shadcn/ui components
- **Backend**: Node.js (Express)
- **Database**: PostgreSQL (Drizzle ORM)
- **Authentication**: Replit Auth (OIDC with Google, GitHub, Apple, email)
- **File Storage**: Replit App Storage (GCS-backed object storage)
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
- `client/src/hooks/use-auth.ts` - Authentication hook
- `client/src/hooks/use-upload.ts` - File upload hook
- `client/src/lib/auth-utils.ts` - Auth error handling utilities
- `server/` - Express server (routes.ts, storage.ts, db.ts)
- `server/replit_integrations/auth/` - Replit Auth integration
- `server/replit_integrations/object_storage/` - App Storage integration
- `shared/schema.ts` - Drizzle ORM schema definitions
- `shared/models/auth.ts` - Auth-related schema (users, sessions)

## Database Schema
- `users` - User profiles with auth info (email, name, profile image), research level, field, learning mode, XP, level, streak
- `sessions` - Session storage for auth (mandatory for Replit Auth)
- `manuscripts` - Manuscripts with stage, help types, title, file_key, preview_text, extraction_status, readiness score

## Key Routes
- `GET /api/auth/user` - Get current authenticated user
- `POST /api/users/profile` - Update user profile (research level, field, learning mode)
- `GET /api/users/me` - Get current user details
- `DELETE /api/users/me` - Delete current user and all data
- `GET /api/manuscripts` - Get current user's manuscripts
- `POST /api/manuscripts` - Create manuscript
- `POST /api/manuscripts/:id/extract` - Extract text from uploaded manuscript file
- `POST /api/manuscripts/:id/paste-text` - Save pasted manuscript text directly
- `POST /api/uploads/request-url` - Get presigned URL for file upload (max 50MB)

## User Flow
1. Welcome screen → Sign In (Replit Auth)
2. Profile Setup (3 steps): Research Level → Primary Field → Learning Mode
3. Dashboard with gamification stats, user profile info, sign out
4. New Manuscript flow (3 steps): Stage → Help Types → Upload or Paste
5. File upload (up to 50MB) → Object Storage → Text extraction (PDF/DOCX/TXT) → Preview text saved
6. Or paste manuscript sections directly → Text saved as preview

## State Management
- Authentication managed via Replit Auth sessions (server-side)
- useAuth hook provides user state on frontend
- React Query for server state management
- No sidebar needed - centered card-based layout

## File Upload Pipeline
1. Client selects PDF/DOCX/TXT file (max 10MB)
2. Client requests presigned URL from backend
3. Client uploads file directly to GCS via presigned URL
4. Backend receives file_key, creates manuscript record
5. Backend extracts text using pdf-parse (PDF) or mammoth (DOCX)
6. First 500 chars saved as preview_text for dashboard display
