# NIP-72 Communities for Course Cohorts

This document describes the implementation of NIP-72 moderated communities for course cohorts in Citadel Academy.

## Overview

NIP-72 is a Nostr Implementation Possibility that defines a standard for moderated communities. In Citadel Academy, we use NIP-72 to create and manage course cohorts, allowing instructors and students to interact in a moderated environment.

## Event Types

### Community Definition (Kind 34550)

This event defines a course cohort community. It includes:

- `d` tag: Unique identifier for the community (cohortId)
- `name` tag: Display name for the cohort
- `description` tag: Description of the cohort
- `image` tag: Banner image for the cohort
- `p` tags: Public keys of moderators (instructors)
- Custom tags for course-specific information:
  - `course`: Course identifier
  - `start_date`: Cohort start date
  - `end_date`: Cohort end date
  - `max_students`: Maximum number of students allowed

The content field contains a JSON object with:
- `rules`: Array of community rules
- `schedule`: Information about the cohort schedule

### Community Approval (Kind 34551)

This event approves a student to join a cohort. It includes:
- `a` tag: Reference to the community (`34550:cohortId`)
- `p` tag: Public key of the approved student

### Community Chat Message (Kind 42)

This event represents a chat message in the cohort community. It includes:
- `a` tag: Reference to the community (`34550:cohortId`)
- `e` tag: Reference to the root event (cohortId)
- Content: The message text

## Components

### CohortManager

The `CohortManager` component allows instructors to:
- Create new cohorts
- View existing cohorts
- Add students to cohorts
- View cohort details

### CohortChat

The `CohortChat` component provides a chat interface for cohort members to communicate. It:
- Displays messages from all cohort members
- Allows sending new messages
- Updates in real-time

## Implementation Details

### Authentication

Authentication is handled through Nostr private keys. Users can:
1. Use a NIP-07 compatible browser extension (recommended)
2. Provide their private key directly (not stored, only used for signing)

### Event Publishing

Events are signed using either:
- The user's NIP-07 extension
- The provided private key

Events are published to the relays specified in the environment variables.

### Event Subscription

The application subscribes to relevant events based on the cohort identifier, allowing real-time updates for:
- New chat messages
- Student approvals
- Community updates

## Environment Variables

The following environment variables are used for NIP-72 communities:

```
# Nostr Keys for Zap Receipts and NIP-72 Communities
ACADEMY_PRIVATE_KEY=your_academy_private_key_here

# NIP-72 Community Configuration
NEXT_PUBLIC_COMMUNITY_RELAYS=wss://relay.damus.io,wss://nos.lol,wss://relay.nostr.band
NEXT_PUBLIC_COMMUNITY_MODERATORS=pubkey1,pubkey2
```

## Usage

To use the NIP-72 communities feature:

1. Navigate to the Cohort Management page
2. Authenticate using your Nostr private key or NIP-07 extension
3. Create a new cohort or select an existing one
4. Add students to the cohort
5. Use the chat interface to communicate with cohort members

## Security Considerations

- Private keys are never stored or transmitted to any server
- All events are signed locally in the browser
- Only approved students can participate in cohort discussions
- Instructors have moderation capabilities