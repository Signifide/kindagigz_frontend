# KindaGigz Frontend - User Flows & Project Organization

## Project Overview

**KindaGigz** is a Next.js-based web application that connects clients with local service providers/professionals. The platform enables users to discover, evaluate, and hire skilled professionals for various services within their locality.

**Tech Stack:**
- **Framework:** Next.js 16.1.4 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS 4.1.18
- **UI Components:** Custom components + Heroicons
- **Notifications:** React Hot Toast
- **Fonts:** Plus Jakarta Sans, Inter

---

### Note:
When it comes to Service Providers (those offering services on the platform) on the platform, the name was previously Professionals but after discussions, it was switched to Service Providers. So to avoid confusion note that Professionals and Service Providers are the same, one of the tasks is to completely change any namings from Professionals to Service Providers.

---

## User Flows

### 1. **Unauthenticated User Flow (Client Discovery)**

```
Homepage → Browse Categories/Services → View Service Providers → Learn About Platform
     ↓
   CTA Options
     ├─→ Sign Up (as Client)
     │    └─→ Create Account
     │         └─→ Explore Services
     │
     └─→ Resources
          ├─→ How It Works
          ├─→ Minimum Wage Guide
          └─→ Skills Boost
```

**Key Pages:**
- **Home Page** (`/`) - Featured sections: Hero, Categories, Explore Services, Live Map, Why KindaGigz
- **Services Page** (`/services`) - Browse all services, filter by category, view service cards on map
- **Professional Profile** (`/professional/[id]`) - View detailed professional info, ratings, reviews, gallery, availability
- **How It Works** (`/how-it-works`) - Platform explanation
- **Minimum Wage Guide** (`/minimum-wage-guide`) - Educational resource
- **Skills Boost** (`/skills-boost`) - Professional development content

---

### 2. **Client User Flow**

```
┌─────────────────────────────────────────────────────┐
│                   SIGN UP / LOGIN                    │
└──────────────────┬──────────────────────────────────┘
                   │
        ┌──────────┴──────────┐
        │                     │
    New Client           Returning Client
        │                     │
   Sign Up Page          Login Page
    `/signup`            `/login`
        │                     │
        └──────────┬──────────┘
                   │
        Authenticated as Client
                   │
        ┌──────────┴──────────┐
        │                     │
    Explore Services    Account Features
        │                     │
   Browse & Filter      Saved Professionals
   View Details         Saved Searches
   Check Availability   Profile Settings
   Read Reviews         Preferences
        │
   Select Professional
        │
   Contact & Hire
```

**Key Client Routes & Features:**
- **Login** (`/login`) - Email/password authentication
- **Signup** (`/signup`) - Create new client account
- **Services** (`/services`) - Main discovery area with:
  - Category filtering
  - Location-based search
  - Active filters display
  - Grid/Map view toggle
  - Service provider cards
- **Professional Detail** (`/professional/[id]`) - View:
  - About and gallery
  - Operating hours & location
  - Services offered
  - Similar professionals
  - Reviews and ratings
  - Contact form

---

### 3. **Service Provider (Professional) User Flow**

```
┌──────────────────────────────────────────────┐
│      SIGN UP / LOGIN                         │
└───────────────────┬──────────────────────────┘
                    │
         ┌──────────┴──────────┐
         │                     │
   New Professional      Returning Professional
         │                     │
    Sign Up Page           Login Page
  `/signup`               `/login`
(Select "Professional")        │
         │                     │
         └───────────┬─────────┘
                     │
            Authenticated as Professional
                     │
            ┌────────┴────────┐
            │                 │
        Onboarding Form    Fill Profile
        (if first time)        │
            │                 │
        Business Details,  Dashboard `/dashboard`
        Services,          │
        Availability,      ├─ Analytics `/dashboard/analytics`
        Pricing,           │  (Track performance, jobs)
        Media (photos/     │
        videos)            └─ Settings `/dashboard/settings`
            │               (Update profile, availability)
            │
        Complete Setup
            │
        Professional Dashboard
```

**Key Professional Routes & Features:**
- **Signup** (`/signup`) - Professional registration with:
  - Business information
  - Service category selection
  - Location setup
  - Initial onboarding form
- **Dashboard** (`/dashboard`) - Main control center:
  - Overview of profile
  - Job statistics
  - Recent activity
  - Quick actions
- **Analytics** (`/dashboard/analytics`) - Performance tracking:
  - Jobs completed
  - Ratings and reviews
  - Response metrics
- **Settings** (`/dashboard/settings`) - Profile management:
  - Update business details
  - Manage services
  - Configure availability
  - Update pricing
  - Manage gallery/media

---

### 4. **Authentication & Authorization Flow**

```
┌─────────────────────────────────────────────┐
│         AuthProvider (Root Context)         │
│  (/contexts/AuthContext.tsx)                │
└─────────────────┬───────────────────────────┘
                  │
         ┌────────┴────────┐
         │                 │
    On Mount          Check Storage
    Initialize Auth    (localStorage)
         │                 │
         └────────┬────────┘
                  │
         ┌────────┴────────┐
         │                 │
    User Stored?      No User
         │                 │
      YES │                 │ Not Authenticated
         │                 │
    Validate with      Set Loading: false
    Backend (GET /me)  User: null
         │
    ┌────┴─────┐
    │           │
  Valid      Invalid (401)
    │           │
  Set User   Clear Storage
  isAuth=true Logout
         │
    Continue with
    Authenticated State
```

**Auth Service Features:**
- User registration (client & professional with FormData)
- Login with email/password
- Token refresh mechanism
- Logout with cleanup
- Session validation on app load
- Role-based redirects (professional → dashboard, client → home)

---

## Project Organization

### Directory Structure & Purpose

```
kindagigz_frontend/
│
├── app/                                # Next.js App Router (13+ Structure)
│   │
│   ├── (auth)/                         # Route group - unauthenticated pages
│   │   ├── login/page.tsx              # Login form page
│   │   └── signup/page.tsx             # Signup form page
│   │
│   ├── (main)/                         # Route group - authenticated pages with Navbar/Footer
│   │   ├── page.tsx                    # Home page with hero, categories, maps
│   │   ├── services/page.tsx           # Services discovery page
│   │   ├── professional/[id]/page.tsx  # Dynamic professional profile
│   │   ├── dashboard/...               # Professional dashboard (protected)
│   │   ├── how-it-works/page.tsx       # Educational content
│   │   ├── minimum-wage-guide/page.tsx # Resource page
│   │   └── skills-boost/page.tsx       # Skill development content
│   │
│   ├── api/                            # Backend API routes (if needed)
│   │   └── auth/route.ts
│   │
│   ├── layout.tsx                      # Root layout with providers
│   └── globals.css                     # Global styles
│
├── components/                         # Reusable UI Components
│   ├── auth/                           # Authentication components
│   │   ├── LoginForm.tsx               # Login form with validation
│   │   ├── SignupForm.tsx              # Signup form
│   │   ├── LogoutModal.tsx             # Logout confirmation
│   │   └── ServiceProOnboardingForm.tsx# Professional onboarding form
│   │
│   ├── layout/                         # Layout components
│   │   ├── Navbar/                     # Navigation bar
│   │   │   ├── Navbar.tsx              # Main navbar wrapper
│   │   │   ├── NavbarLinks.tsx         # Navigation links
│   │   │   └── UserMenu.tsx            # User profile dropdown
│   │   └── Footer/                     # Footer component
│   │
│   ├── home/                           # Homepage sections
│   │   ├── HeroSection.tsx             # Hero banner with CTA
│   │   ├── CategoriesSection.tsx       # Service categories showcase
│   │   ├── ExploreServicesSection.tsx  # Featured services
│   │   ├── WhyKindaGigz.tsx            # Value proposition
│   │   ├── CTASection.tsx              # Call-to-action sections
│   │   └── LiveMap.tsx                 # Interactive map view
│   │
│   ├── dashboard/                      # Dashboard pages (professional-only)
│   │   ├── DashboardLayout.tsx         # Dashboard wrapper with sidebar
│   │   ├── DashboardGreetings.tsx      # Welcome message
│   │   ├── DashboardSidebar.tsx        # Navigation sidebar
│   │   ├── RoleSwitcher.tsx            # Switch between client/pro
│   │   ├── sections/                   # Dashboard subsections
│   │   └── shared/                     # Shared dashboard components
│   │
│   ├── professionals/                  # Professional profile components
│   │   ├── ProfessionalHeader.tsx      # Profile header with name, rating
│   │   ├── ProfessionalHeroClient.tsx  # Hero section on profile
│   │   ├── ProfessionalAboutandGallery.tsx # Bio, skills, media gallery
│   │   ├── ProfessionalOpsTimeandLocation.tsx # Hours & location info
│   │   ├── ProfessionalContactForm.tsx # Contact/booking form
│   │   ├── ProfessionalSimilarServices.tsx # Related professionals
│   │   └── ReviewsList.tsx             # Reviews & ratings display
│   │
│   ├── services/                       # Services discovery components
│   │   ├── ServicesList.tsx            # Grid of service cards
│   │   ├── ServiceProviderCard.tsx     # Individual provider card
│   │   ├── ServicesHeader.tsx          # Page header
│   │   ├── ServicesMapView.tsx         # Map view of services
│   │   ├── FilterPanel.tsx             # Filter controls
│   │   ├── ActiveFilters.tsx           # Display applied filters
│   │   ├── CategoryCard.tsx            # Category selector card
│   │   └── ResultsGrid.tsx             # Results display
│   │
│   ├── map/                            # Map components (Google Maps)
│   │   ├── InteractiveMap.tsx          # Main and reusable map component
│   │   └── MapMarker.tsx               # Custom map marker
│   │
│   ├── ui/                             # Base UI components
│   │   ├── Button.tsx                  # Button styles
│   │   ├── Card.tsx                    # Card layout
│   │   ├── Badge.tsx                   # Badge/tag display
│   │   ├── Input.tsx                   # Text input
│   │   ├── Dropdown.tsx                # Dropdown menu
│   │   ├── Modal.tsx                   # Modal dialog
│   │   ├── Tooltip.tsx                 # Tooltip display
│   │   ├── MultiSelect.tsx             # Multi-select input
│   │   └── LocationPicker.tsx          # Location selection
│   │
│   └── providers/                      # Context providers
│       └── ToastProvider.tsx           # Toast notification setup
│
├── contexts/                           # React Context
│   └── AuthContext.tsx                 # Authentication state & methods
│
├── features/                           # Feature-specific logic (modular)
│   ├── auth/
│   │   ├── types.ts                    # Auth-specific types
│   │   ├── api/                        # Auth API calls
│   │   └── hooks/                      # Auth custom hooks
│   │
│   ├── professionals/
│   │   ├── types.ts                    # Professional-specific types
│   │   ├── api/                        # Professional API calls
│   │   └── hooks/                      # Professional custom hooks
│   │
│   └── services/
│       ├── types.ts                    # Service-specific types
│       ├── api/                        # Services API calls
│       └── hooks/                      # Services custom hooks
│
├── hooks/                              # Reusable custom hooks
│   ├── useDebounce.ts                  # Debounce input
│   ├── useLocalStorage.ts              # localStorage management
│   └── useMediaQuery.ts                # Responsive breakpoints
│
├── lib/                                # Utilities & services
│   ├── api/
│   │   └── apiClient.ts                # Axios-like API wrapper
│   │
│   ├── config/
│   │   └── api.ts                      # API endpoints & base URL
│   │
│   ├── constants/
│   │   ├── routes.ts                   # Route definitions
│   │   └── services.ts                 # Service categories
│   │
│   ├── hooks/
│   │   ├── useGooglePlaces.ts          # Google Places API integration
│   │   └── useUserLocation.ts          # Geolocation hook
│   │
│   ├── services/
│   │   ├── authService.ts              # Auth API calls
│   │   ├── professionalService.ts      # Professional API calls
│   │   ├── categoryService.ts          # Category API calls
│   │   ├── dashboardService.ts         # Dashboard API calls
│   │   └── categoryService.ts          # Service API calls
│   │
│   └── utils/
│       ├── cn.ts                       # Class name merger (clsx wrapper)
│       ├── cookies.ts                  # Cookie utilities
│       ├── formatters.ts               # Data formatting functions
│       ├── location.ts                 # Location utilities
│       ├── professional.ts             # Professional data utils
│       └── validators.ts               # Form validation functions
│
├── types/                              # Global TypeScript types
│   ├── auth.ts                         # User, Auth, Professional interfaces
│   ├── dashboard.ts                    # Dashboard-specific types
│   └── index.ts                        # Exported type barrel
│
├── styles/
│   └── animations.css                  # Custom CSS animations
│
├── public/
│   ├── icons/                          # SVG icons
│   └── images/                         # Static images
│
├── tailwind.config.ts                  # Tailwind customization
├── tsconfig.json                       # TypeScript configuration
├── eslint.config.mjs                   # ESLint rules
├── postcss.config.mjs                  # PostCSS plugins
└── package.json                        # Dependencies & scripts
```

---

## Key Components & Their Purposes

### Authentication System
- **AuthContext**: Global state for user, login status, and auth methods
- **LoginForm**: Email/password login with validation
- **SignupForm**: User registration with role selection
- **Service providers** get special onboarding form with business details

### Homepage (Discovery)
- **HeroSection**: Main call-to-action banner
- **CategoriesSection**: Browse service categories
- **ExploreServicesSection**: Featured professionals
- **LiveMap**: Interactive map showing service providers
- **WhyKindaGigz**: Value proposition messaging

### Services Discovery (`/services`)
- **FilterPanel**: Filter by category, location, rating
- **ActiveFilters**: Display currently applied filters
- **ServicesList**: Grid view of service providers
- **ServicesMapView**: Map-based discovery
- **ResultsGrid**: Responsive display format

### Professional Profile (`/professional/[id]`)
- **ProfessionalHeader**: Name, rating, verification badges
- **ProfessionalAboutandGallery**: Bio, skills, photo gallery
- **ProfessionalOpsTimeandLocation**: Hours, service radius, address
- **ProfessionalContactForm**: Book/contact professional
- **ReviewsList**: Reviews and ratings
- **ProfessionalSimilarServices**: Related professionals

### Professional Dashboard (`/dashboard`)
- **DashboardLayout**: Wrapper with sidebar navigation
- **DashboardSidebar**: Main menu (Analytics, Settings, etc.)
- **DashboardGreetings**: Welcome message with stats
- **RoleSwitcher**: Toggle between client/professional roles
- **Analytics**: Job stats, ratings, performance
- **Settings**: Profile, availability, services management

---

## Data Flow & API Integration

### API Client Architecture
```
Components
    ↓
Custom Hooks (features/*/hooks)
    ↓
Service Layer (lib/services/*)
    ↓
API Client Wrapper (lib/api/apiClient.ts)
    ↓
Backend API (http://localhost:8000 or Render.com for now)
    ↓
Database
```

### Authentication Flow
1. User submits credentials
2. AuthService sends POST to backend
3. Backend returns `{ user, tokens }`
4. Tokens stored in httpOnly cookies
5. AuthContext updates global user state
6. App redirects based on user role (professional → dashboard, client → home)

### Data Fetching Patterns
- **Service Layer**: `authService`, `professionalService`, `categoryService`, etc.
- **Custom Hooks**: `useAuth()`, feature-specific hooks in `features/*/hooks`
- **API Client**: Handles auth headers, error handling, token refresh

---

## Available Routes

| Route | Role | Purpose |
|-------|------|---------|
| `/` | Anyone | Homepage with discovery sections |
| `/login` | Guest | Login page |
| `/signup` | Guest | User registration |
| `/services` | Anyone | Browse all service providers |
| `/professional/[id]` | Anyone | View professional profile |
| `/dashboard` | Professional | Main dashboard |
| `/dashboard/analytics` | Professional | Performance metrics |
| `/dashboard/settings` | Professional | Profile management |
| `/how-it-works` | Anyone | How platform works |
| `/minimum-wage-guide` | Anyone | Wage information |
| `/skills-boost` | Anyone | Skill development |

---

## Development Setup

### Prerequisites
- Node.js 18+
- npm or yarn

### Installation
```bash
npm install
```

### Environment Variables
Create `.env.local`:
```
NEXT_PUBLIC_API_BASE_URL=http://localhost:8000
# For production:
# NEXT_PUBLIC_API_BASE_URL=https://kindagigz-backend.onrender.com
```

### Running Development Server
```bash
npm run dev
# Opens on http://localhost:3000
```

### Building for Production
```bash
npm run build
npm start
```

### Linting
```bash
npm run lint
```

---

## Key Technologies & Integrations

- **Google Maps API**: Location display, service radius visualization
- **Google Places API**: Location autocomplete in search
- **React Hot Toast**: User notifications
- **Tailwind CSS**: Utility-first styling
- **TypeScript**: Type safety throughout
- **Next.js App Router**: Modern routing with layouts

---

## Common User Journeys

### Journey 1: Client Finding a Service
1. Land on homepage
2. Browse categories or use search
3. View service providers on map or grid
4. Click on professional
5. Read reviews and details
6. Use contact form to reach out

### Journey 2: Professional Setup
1. Create account (select "Professional")
2. Complete onboarding form
3. Add business details, services, pricing
4. Upload gallery images
5. Set availability and location
6. View analytics and manage jobs from dashboard

### Journey 3: Existing User Logging In
1. Navigate to `/login`
2. Enter email/password
3. Redirected based on role
4. Professional → Dashboard
5. Client → Homepage or back to previous page

---

## Notes for Developers

- **Protected Routes**: Dashboard checks `isAuthenticated` and `user.role === 'professional'`
- **Error Handling**: Using toast notifications for user feedback
- **Loading States**: Components handle loading/error states gracefully
- **Responsive Design**: Mobile-first approach with Tailwind breakpoints
- **Code Organization**: Features folder organizes logic by domain
- **Type Safety**: Comprehensive TypeScript interfaces prevent runtime errors

