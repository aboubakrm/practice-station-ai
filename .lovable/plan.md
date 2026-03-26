

# PracticeStation — AI-Powered PACES Exam Practice Tool

## Overview
A medical education web app for UK PACES exam candidates featuring timed practice stations with AI patient interaction (placeholder), structured feedback reports, and session tracking. Clean, professional design inspired by "Notion meets a medical prep course."

## Design System
- **Primary:** Teal `#0D9488` / Dark `#0F766E`
- **Accent:** Amber `#F59E0B` for CTAs
- **Background:** Off-white `#F8FAFC`, white cards with `rounded-xl shadow-sm`
- **Typography:** Inter font, semibold headings, generous whitespace
- **Mobile-first**, clean flat design, no gradients

## Pages & Features

### 1. Landing Page (`/`)
- Hero with headline, subheadline, amber "Try a Free Station" CTA
- Three feature cards: Timed Stations, AI Patient Interaction, Structured Feedback
- Social proof placeholder section
- Footer with links + medical disclaimer

### 2. Authentication (`/login`, `/signup`)
- Centered card layout with Supabase magic link (email only)
- "Check your inbox" confirmation state
- Auto-redirect if already logged in

### 3. Dashboard (`/dashboard`) — Protected
- Personalized greeting with credits remaining indicator
- Prominent "Start a Station" amber CTA
- Recent sessions list with case name, date, duration, feedback link
- Friendly empty state for new users

### 4. Case Selection (`/cases`)
- Grid of 4 case cards with title, category badge, difficulty dots, duration
- Cases: Explaining a New Diagnosis, Breaking Bad News, Consent for a Procedure, Chest Pain Consultation
- "Start Station" button per card

### 5. Station Session (`/station/[id]`)
- **Step 1 — Brief:** Case scenario card + "Begin Station" button
- **Step 2 — Active:** Countdown timer (5:00), amber at <1min, red at <30s, pulsing mic icon placeholder, "End Early" button
- **Step 3 — Complete:** Duration summary, "View Your Feedback" CTA, placeholder transcript area

### 6. Feedback Report (`/feedback/[session_id]`)
- Structured coaching report with cards: Overall Performance, Strengths, Improvements, Missed Opportunities
- Communication sub-ratings (Structure, Empathy, Clarity, Safety-netting) with color-coded labels
- Better Phrasing highlight box, Action Item amber box
- Thumbs up/down feedback + "Practice Another Station" button
- All mock data for now

### 7. Session History (`/history`)
- Table/card list of past sessions sorted by most recent
- Columns: Case Name, Date, Duration, Performance Summary, View Feedback link

## Navigation
- Fixed top navbar: PracticeStation text logo (teal), Dashboard/Cases/History links, user avatar dropdown with Sign Out
- Mobile hamburger menu
- Medical disclaimer footer on all authenticated pages

## Database (Supabase)
- **profiles** — id, first_name, credits_remaining, timestamps
- **cases** — id, title, category, difficulty, duration, scenario_brief, rubric_points (jsonb)
- **sessions** — id, user_id, case_id, status, duration_seconds, transcript, timestamps
- **feedback_reports** — id, session_id, overall_summary, strengths/improvements/missed (jsonb), 4 sub-ratings, better_phrasing, action_item, thumbs_up
- RLS on all tables: users access own data only, cases readable by all authenticated users
- Seed the 4 case records with scenario briefs and rubric points

## Authentication
- Supabase magic link (passwordless email)
- Profile auto-created on signup via database trigger
- Protected routes redirect to login if unauthenticated

