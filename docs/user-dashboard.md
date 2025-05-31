# User Dashboard Implementation

This document provides an overview of the User Dashboard implementation for Citadel Academy.

## Overview

The User Dashboard is a comprehensive interface for logged-in users to manage their learning journey, family connections, achievements, and Bitcoin-related activities. The dashboard is designed to be modular, responsive, and user-friendly.

## Components Structure

### Main Components

1. **DashboardPage** (`src/components/DashboardPage/index.jsx`)
   - Main container component that handles routing between dashboard sections
   - Checks for user authentication and renders appropriate content
   - Integrates with the sidebar and quick actions components

2. **DashboardSidebar** (`src/components/DashboardPage/DashboardSidebar.jsx`)
   - Navigation sidebar with links to all dashboard sections
   - Highlights the active section
   - Responsive design for both desktop and mobile views

3. **QuickActions** (`src/components/DashboardPage/QuickActions.jsx`)
   - Quick access buttons for common actions
   - Includes "Add Family Member", "Create Course", and "Help & Support"

### Section Components

1. **CurrentCourses** (`src/components/DashboardPage/CurrentCourses.jsx`)
   - Displays active learning paths
   - Shows course progress, recommended courses, and recently completed courses
   - Provides quick access to continue learning

2. **FamilyProgress** (`src/components/DashboardPage/FamilyProgress.jsx`)
   - Multi-generational tracking dashboard
   - Shows progress for all family members
   - Allows switching between different family groups
   - Displays family learning statistics

3. **Achievements** (`src/components/DashboardPage/Achievements.jsx`)
   - NIP-58 badges and certificates
   - Displays earned badges and certificates
   - Shows progress toward earning new badges
   - Integrates with Nostr for verification

4. **LightningWallet** (`src/components/DashboardPage/LightningWallet.jsx`)
   - Course payments and zap rewards
   - Displays wallet balance and transaction history
   - Shows zap rewards from community interactions
   - Provides options to send, receive, and withdraw sats

5. **Settings** (`src/components/DashboardPage/Settings.jsx`)
   - Profile settings, notifications, family invites
   - Nostr identity management
   - Privacy and notification preferences
   - Relay configuration

6. **AddFamilyMember** (`src/components/DashboardPage/AddFamilyMember.jsx`)
   - Invite flow with Nostr verification
   - Multiple invitation methods (email, Nostr, manual setup)
   - Family group management

7. **CreateCourse** (`src/components/DashboardPage/CreateCourse.jsx`)
   - For families creating custom curricula
   - Course creation from scratch or templates
   - Content import options
   - Course privacy settings

## Routing

The dashboard uses React Router for navigation between sections:

- `/dashboard` or `/dashboard/courses` - Current Courses (default view)
- `/dashboard/family-progress` - Family Progress tracking
- `/dashboard/achievements` - Badges and certificates
- `/dashboard/wallet` - Lightning wallet
- `/dashboard/settings` - User settings
- `/dashboard/add-family` - Add family member flow
- `/dashboard/create-course` - Course creation

## State Management

The dashboard components connect to the Redux store to access:

- User authentication state (pubkey)
- Device information (mobile/desktop view)
- Course data
- Family group information
- Wallet balance and transactions
- Achievements and badges

## Features

### Authentication

- Requires Nostr authentication to access the dashboard
- Shows a login prompt for unauthenticated users
- Integrates with Nostr Wallet Connect

### Responsive Design

- Adapts to both desktop and mobile views
- Reorganizes content based on screen size
- Maintains usability across devices

### Bitcoin Integration

- Lightning Network wallet for payments and rewards
- Zap functionality for community interactions
- Course completion rewards in sats

### Nostr Integration

- NIP-05 verification
- NIP-58 badges and certificates
- Direct messaging for family invites
- Profile management

### Family Features

- Multi-generational tracking
- Family group management
- Custom course creation for family members
- Progress tracking across family members

## Future Enhancements

1. **Real-time Updates**
   - Implement WebSocket connections for real-time notifications
   - Live updates for family member progress

2. **Advanced Analytics**
   - Detailed learning analytics and insights
   - Personalized learning recommendations

3. **Enhanced Lightning Integration**
   - Lightning Address support
   - Automated allowance for children
   - Family savings goals

4. **Expanded Course Creation**
   - Interactive course builder with drag-and-drop interface
   - AI-assisted content creation
   - Community course marketplace

5. **Mobile App**
   - Native mobile applications for iOS and Android
   - Offline learning capabilities