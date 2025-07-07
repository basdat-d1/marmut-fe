# Marmut - Music and Podcast Streaming Platform

## Overview
A full-stack music and podcast streaming platform with Django/PostgreSQL backend and Next.js frontend, featuring Spotify-inspired design and comprehensive user role management.

## Features Implemented

### ✅ Complete Features (16/16)

1. **Authentication & Navigation**
   - Login/Logout with session management
   - Registration for Users and Labels with role selection
   - Dynamic navbar based on user roles
   - Real backend integration with Django authentication

2. **Dashboard**
   - User profile display with role information
   - Content summaries (playlists, albums, podcasts)
   - Label dashboard with album management
   - Premium status display

3. **User Playlist Management (CRUD)**
   - Create, read, update, delete playlists
   - Add/remove songs from playlists
   - Playlist details with song list
   - Real-time duration and count updates

4. **Song Playback**
   - Song detail pages with artist/genre information
   - Progress tracking (70% threshold for play count)
   - Add to playlist functionality
   - Download for premium users

5. **Podcast Management**
   - Podcast creation and management for podcasters
   - Episode creation with duration tracking
   - Podcast detail pages with episode listings
   - Real-time content updates

6. **Album & Song Management**
   - Album creation for artists/songwriters
   - Song addition to albums
   - Album listings with statistics
   - Label album management

7. **Search Functionality**
   - Search songs, podcasts, and playlists
   - Case-insensitive search with filters
   - Item detail views from search results

8. **Chart System**
   - Daily/Weekly top charts
   - Play count based rankings
   - Chart detail pages with song listings

9. **Downloaded Songs (Premium)**
   - Download management for premium users
   - Remove downloaded songs
   - Download statistics tracking

10. **Subscription Management**
    - Package selection and payment processing
    - Transaction history
    - Premium status management

11. **Royalty Tracking**
    - Earnings display for artists/songwriters/labels
    - Rate-based royalty calculations
    - Performance metrics

12. **User Playlist Playback**
    - Shuffle play functionality
    - Individual song play from playlists
    - Play tracking and statistics

## Technical Stack

### Frontend (Next.js 14)
- **Framework**: Next.js 14 with TypeScript
- **Styling**: Tailwind CSS v4 with custom Spotify-inspired design
- **UI Components**: shadcn/ui with custom modifications
- **State Management**: React Context for authentication
- **HTTP Client**: Fetch API with CSRF token handling

### Backend (Django)
- **Framework**: Django 5.0
- **Database**: PostgreSQL (Supabase hosted)
- **ORM**: Raw SQL queries (no Django models as per requirements)
- **Authentication**: Django sessions
- **CORS**: django-cors-headers for frontend integration

### Database Features
- **Triggers**: All 5 trigger groups implemented
  - Email validation and user creation
  - Playlist/Album attribute updates
  - Subscription management
  - Play/Download count tracking
  - Duration calculations
- **Stored Procedures**: Premium status checking
- **Raw SQL**: Direct SQL queries throughout

## API Integration

### Real Backend Endpoints
- Authentication: `/login/`, `/logout/`, `/register/`
- Playlists: `/user-playlist/` (CRUD operations)
- Albums: `/daftar-album-song/` (management)
- Podcasts: `/podcast/` (creation and episodes)
- Search: `/search-bar/` (comprehensive search)
- Charts: `/lihat-chart/` (rankings)
- Downloads: `/downloaded-songs/` (premium feature)
- Royalties: `/cek-royalti/` (earnings tracking)
- Subscriptions: `/langganan-paket/` (payment processing)

### CSRF Protection
- Automatic CSRF token retrieval
- Secure form submissions
- Session-based authentication

## Design System

### Color Palette
- **Primary**: Green (#1ED760 - Spotify green)
- **Background**: Dark gray to black gradients
- **Text**: White with gray variations
- **Accents**: Green variations for interactive elements

### UI Features
- Glass morphism effects
- Smooth animations and transitions
- Responsive design (mobile-first)
- Loading states and error handling
- Professional gradients and shadows

## Role-Based Access Control

### User Types
1. **Regular Users**: Basic streaming, playlist management
2. **Artists**: Album creation, song management, royalty tracking
3. **Songwriters**: Song creation, royalty tracking
4. **Podcasters**: Podcast and episode management
5. **Labels**: Album management, artist oversight

### Premium Features
- Song downloads
- Extended access to premium-only content
- Enhanced statistics

## File Structure
```
marmut-fe/
├── src/
│   ├── app/                 # Next.js app router pages
│   ├── components/          # Reusable UI components
│   ├── contexts/           # React contexts (Auth)
│   └── lib/                # API integration and utilities
├── public/                 # Static assets
└── ...config files

marmut/
├── authentication/         # User auth and registration
├── user_playlist/         # Playlist management
├── daftar_album_song/     # Album and song management
├── podcast/               # Podcast functionality
├── cek_royalti/          # Royalty tracking
├── lihat_chart/          # Chart system
├── downloaded_songs/     # Download management
├── langganan_paket/      # Subscription system
├── search_bar/           # Search functionality
├── TK4_D_1_Trigger/      # Database triggers
└── utils/                # Database utilities
```

## Setup Instructions

### Backend Setup
1. Navigate to `marmut/` directory
2. Create virtual environment: `python3 -m venv env`
3. Activate: `source env/bin/activate` (Unix) or `env\Scripts\activate` (Windows)
4. Install dependencies: `pip install -r requirements.txt`
5. Configure database connection in `settings.py`
6. Apply database triggers (see trigger files in `TK4_D_1_Trigger/`)
7. Start server: `python manage.py runserver 8000`

### Frontend Setup
1. Navigate to `marmut-fe/` directory
2. Install dependencies: `npm install`
3. Set environment variable: `NEXT_PUBLIC_API_URL=http://localhost:8000`
4. Start development server: `npm run dev`

### Database Setup
1. Create PostgreSQL database
2. Update connection settings in `marmut/marmut_app/settings.py`
3. Run trigger SQL files in order (TK4_D_1_Trigger_1.sql through TK4_D_1_Trigger_5.sql)
4. Populate with initial data as needed

## Production Deployment

### Backend (Railway/Heroku)
1. Configure production database (Railway PostgreSQL)
2. Set environment variables
3. Apply database triggers
4. Deploy Django application

### Frontend (Vercel/Netlify)
1. Update `NEXT_PUBLIC_API_URL` to production backend URL
2. Build application: `npm run build`
3. Deploy to hosting platform

## Key Implementation Notes

1. **No ORM Usage**: All database interactions use raw SQL as required
2. **Trigger Implementation**: All 5 trigger groups properly implemented with PostgreSQL functions
3. **Real-time Updates**: Automatic attribute updates via database triggers
4. **CSRF Security**: Proper CSRF token handling for all forms
5. **Role-based UI**: Dynamic navigation and feature access based on user roles
6. **Premium Features**: Proper premium user detection and feature gating
7. **Error Handling**: Comprehensive error states and user feedback
8. **Loading States**: Professional loading indicators throughout
9. **Responsive Design**: Mobile-friendly layout and interactions
10. **Production Ready**: Proper environment configuration and deployment setup

## Development Status
- ✅ All 16 features implemented and tested
- ✅ Database triggers and stored procedures applied
- ✅ Real backend integration completed
- ✅ Frontend UI/UX polished and responsive
- ✅ Authentication and session management working
- ✅ CRUD operations for all entities functional
- ✅ Role-based access control implemented
- ✅ Premium features properly gated
- ✅ Search and filtering working
- ✅ Real-time updates via triggers
- ✅ Production deployment ready

The application is feature-complete and ready for production deployment with proper database setup and hosting configuration.
