# SAGE - Scholarly Assistant for Guided Excellence

## Overview
SAGE is an AI-powered research mentor that guides users through the scholarly manuscript lifecycle using gamification and "Why-based" pedagogy.

## Architecture
- **Frontend**: React (Vite) + Tailwind CSS + shadcn/ui components
- **Backend**: Node.js (Express)
- **Database**: PostgreSQL (Drizzle ORM)
- **Authentication**: Replit Auth (OIDC with Google, GitHub, Apple, email)
- **File Storage**: Replit App Storage (GCS-backed object storage)
- **AI**: OpenAI API (process.env.OPENAI_API_KEY) for manuscript analysis using UMA framework
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
- `client/src/pages/` - Page components (welcome, profile-setup, dashboard, new-manuscript, manuscript-workspace)
- `client/src/components/ui/` - shadcn/ui base components
- `client/src/hooks/use-auth.ts` - Authentication hook
- `client/src/hooks/use-upload.ts` - File upload hook
- `client/src/lib/auth-utils.ts` - Auth error handling utilities
- `server/` - Express server (routes.ts, storage.ts, db.ts)
- `server/replit_integrations/auth/` - Replit Auth integration
- `server/replit_integrations/object_storage/` - App Storage integration
- `shared/schema.ts` - Drizzle ORM schema definitions
- `shared/models/auth.ts` - Auth-related schema (users, sessions)
- `attached_assets/THE_UNIVERSAL_MANUSCRIPT_ARCHITECTURE_(UMA)*.pdf` - UMA knowledge base

## Database Schema
- `users` - User profiles with auth info (email, name, profile image), research level, field, learning mode, XP, level, streak
- `sessions` - Session storage for auth (mandatory for Replit Auth)
- `manuscripts` - Manuscripts with stage, help types, title, file_key, full_text, preview_text, extraction_status, analysis_json (JSONB), analysis_status, readiness_score

## Key Routes
- `GET /api/auth/user` - Get current authenticated user
- `POST /api/users/profile` - Update user profile (research level, field, learning mode)
- `GET /api/users/me` - Get current user details
- `DELETE /api/users/me` - Delete current user and all data
- `GET /api/manuscripts` - Get current user's manuscripts
- `GET /api/manuscripts/:id` - Get single manuscript (with ownership check)
- `POST /api/manuscripts` - Create manuscript
- `DELETE /api/manuscripts/:id` - Delete a manuscript (with ownership check)
- `POST /api/manuscripts/:id/extract` - Extract text from uploaded manuscript file
- `POST /api/manuscripts/:id/paste-text` - Save pasted manuscript text directly
- `POST /api/manuscripts/:id/analyze` - Run AI analysis using OpenAI + UMA framework
- `POST /api/uploads/request-url` - Get presigned URL for file upload (max 50MB)

## User Flow
1. Welcome screen -> Sign In (Replit Auth)
2. Profile Setup (3 steps): Research Level -> Primary Field -> Learning Mode
3. Dashboard with gamification stats, user profile info, sign out
4. New Manuscript: Upload file or paste text (single step) -> redirects to manuscript workspace
5. File upload (up to 50MB) -> Object Storage -> Text extraction (PDF/DOCX/TXT) -> Full text + preview saved
6. Or paste manuscript sections directly -> Text saved
7. Manuscript workspace (/manuscript/:id): Split-view, left (60%) text, right (40%) analysis panel
8. Click "Run SAGE Analysis" -> choose focus areas -> OpenAI analyzes using UMA -> Results stored in DB

## AI Analysis (UMA Framework — Dual Engine)
- Uses OpenAI GPT-4o with dual-engine UMA system prompt
- **UMA 1.0 (Primary Logic Engine)**: Recipe rules, mirror principles, CaRS model, Zero-I perspective, 5-Move abstract, writing standards — evaluates manuscript text
- **UMA v2.0 (Educational Link Engine)**: Every suggestion cross-referenced with authoritative sources (ICMJE, EQUATOR, APA, COPE, Nature, Springer, etc.)
- Each feedback item includes: finding, suggestion, whyItMatters (UMA pedagogy), resourceUrl (direct link to authority), resourceSource
- Checks for: Structured 5-Move Abstract, Zero-I Perspective, IRB approval, AI disclosure, data availability, COI declaration
- Returns structured JSON: readinessScore, scoreBreakdown (9 categories with weighted scores), criticalIssues, detailedFeedback (with resourceUrl/resourceSource), actionItems, abstractAnalysis, zeroIPerspective, learnLinks
- Score breakdown weighted contributions: Title/Keywords (8%), Abstract (12%), Introduction (10%), Methods (15%), Results (13%), Discussion (12%), Ethics & Transparency (10%), Writing Quality (10%), Zero-I (10%)
- Ethics & Transparency category specifically checks IRB approvals, AI disclosure statements, COI declarations, data availability
- Analysis options dialog lets users select focus areas before each analysis
- Analysis stored in manuscripts.analysis_json (JSONB)
- Loaded from DB on subsequent visits (no re-analysis needed)
- Auto-re-extraction triggers when fullText is null but fileKey exists (for legacy manuscripts)
- LEARN_LINK_URLS map covers 21 topic areas with curated URLs from UMA v2.0 references

## State Management
- Authentication managed via Replit Auth sessions (server-side)
- useAuth hook provides user state on frontend
- React Query for server state management
- No sidebar needed - centered card-based layout

## File Upload Pipeline
1. Client selects PDF/DOCX/TXT file (max 50MB)
2. Client requests presigned URL from backend
3. Client uploads file directly to GCS via presigned URL
4. Backend receives file_key, creates manuscript record
5. Backend extracts text using pdf-parse (PDF) or mammoth (DOCX)
6. Full text stored in full_text column, first 500 chars in preview_text
