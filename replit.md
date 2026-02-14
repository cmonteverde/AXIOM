# AXIOM - Pre-Submission Manuscript Audit

## Overview
AXIOM is an AI-powered pre-submission manuscript auditing tool that stress-tests research papers across 11 rigor phases using reporting guidelines (CONSORT, PRISMA, STROBE). It surfaces compliance gaps, severity-ranked violations, and structural weaknesses before editors and reviewers do. Uses gamification to track progress.

## Architecture
- **Frontend**: React (Vite) + Tailwind CSS + shadcn/ui components
- **Backend**: Node.js (Express)
- **Database**: PostgreSQL (Drizzle ORM)
- **Authentication**: Replit Auth (OIDC with Google, GitHub, Apple, email)
- **File Storage**: Replit App Storage (GCS-backed object storage)
- **AI**: OpenAI API (process.env.OPENAI_API_KEY) for manuscript auditing using UMA framework
- **Font**: Plus Jakarta Sans (primary), Inter (fallback), Source Serif 4 (serif), JetBrains Mono (monospace)
- **Color Palette** (dark indigo-blue, matching AXIOM shield logo):
  - Primary Indigo: hsl(248, 58%, 38%) — deep blue-purple for actions, headings, brand
  - Background: hsl(228, 25%, 97%) — near-white with subtle cool blue tone
  - Card: pure white — clean card surfaces
  - Sage Green: #4ADE80 (progress, success states)
  - Chart Blue: hsl(200, 70%, 48%) — secondary chart/accent blue
  - Foreground: hsl(240, 45%, 15%) — deep navy text for readability
  - Muted Foreground: hsl(228, 12%, 40%) — secondary text with good contrast
- **Logo**: attached_assets/image_(2)_1771052353785.png (AXIOM shield logo with purple/blue split, "Audit & Rigor Platform" tagline)

## Brand Voice
- Urgent, authoritative "auditing" language — not educational/helpful "mentor" language
- Key terminology: Audit (not Analysis), Audit Score (not Readiness Score), Violations/Required Fixes (not Suggestions)
- CTAs: "Run Pre-Submission Audit", "Start Rigor Check"
- Dark sections use `.axiom-dark-section` CSS class

## Project Structure
- `client/src/pages/` - Page components (welcome, profile-setup, dashboard, new-manuscript, manuscript-workspace)
- `client/src/components/ui/` - shadcn/ui base components
- `client/src/hooks/use-auth.ts` - Authentication hook
- `client/src/hooks/use-upload.ts` - File upload hook
- `client/src/lib/auth-utils.ts` - Auth error handling utilities
- `server/` - Express server (routes.ts, storage.ts, db.ts, axiom-prompt.ts)
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
- `POST /api/manuscripts/:id/analyze` - Run AI audit using OpenAI + UMA framework
- `POST /api/uploads/request-url` - Get presigned URL for file upload (max 50MB)

## User Flow
1. Welcome screen -> Sign In (Replit Auth)
2. Profile Setup (3 steps): Research Level -> Primary Field -> Learning Mode
3. Dashboard with gamification stats, user profile info, sign out
4. New Manuscript: Upload file or paste text (single step) -> redirects to manuscript workspace
5. File upload (up to 50MB) -> Object Storage -> Text extraction (PDF/DOCX/TXT) -> Full text + preview saved
6. Or paste manuscript sections directly -> Text saved
7. Manuscript workspace (/manuscript/:id): Split-view, left (60%) text, right (40%) audit panel
8. Click "Run AXIOM Audit" -> choose focus areas -> OpenAI audits using UMA -> Results stored in DB

## AI Audit (11-Phase AXIOM Audit Workflow)
- System prompt defined in `server/axiom-prompt.ts` (buildAxiomSystemPrompt function + LEARN_LINK_URLS export)
- Uses OpenAI GPT-4o with 11-Phase Audit Workflow based on UMA framework
- **Phase 1**: Document Classification (manuscript type, discipline, study design, reporting guideline)
- **Phase 2**: Reporting Guideline Decision Tree (CONSORT 2025 for RCTs, PRISMA 2020 for systematic reviews, STROBE for observational, COREQ for qualitative, STARD for diagnostics, ARRIVE for animal, TRIPOD+AI for prediction models)
- **Phase 3**: Structured 5-Move Abstract (Hook, Gap, Approach, Findings, Impact)
- **Phase 4**: CaRS Model Introduction (Establish Territory, Establish Gap, Resolve Gap)
- **Phase 5**: Methods Recipe Rule (Nature standard reproducibility)
- **Phase 6**: Results Mirror Principle (match research questions order)
- **Phase 7**: Discussion 4 Moves (Interpretation, Comparison, Implication, Novelty Resolution)
- **Phase 8**: Limitations as Generalizability Boundaries
- **Phase 9**: Conclusions (New Reality synthesis)
- **Phase 10**: Zero-I Perspective (first-person pronoun removal)
- **Phase 11**: Writing Standards & Technical Sweep
- **Dual Engine**: UMA 1.0 (evaluation logic) + UMA v2.0 (references from ICMJE, EQUATOR, APA, COPE, Nature, Springer, etc.)
- **Severity Levels**: CRITICAL (must fix before submission), IMPORTANT (strongly recommended), MINOR (quality improvements)
- **Feedback Protocol**: Every item includes Issue, Why It Matters, Recommendation, Standard, Learn More with severity level
- Returns structured JSON: readinessScore, executiveSummary, documentClassification, scoreBreakdown (9 categories), criticalIssues (with severity), detailedFeedback (with severity + resourceTopic), actionItems, abstractAnalysis, zeroIPerspective, strengthsToMaintain, learnLinks
- Score breakdown weighted contributions: Title/Keywords (8%), Abstract (12%), Introduction (10%), Methods (15%), Results (13%), Discussion (12%), Ethics & Transparency (10%), Writing Quality (10%), Zero-I (10%)
- Ethics & Transparency checks: IRB approvals, AI disclosure (ICMJE 2024), COI declarations, data availability, funding, author contributions (CRediT)
- Audit options dialog lets users select focus areas before each audit
- Audit results stored in manuscripts.analysis_json (JSONB)
- Loaded from DB on subsequent visits (no re-audit needed)
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
