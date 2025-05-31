# NIP-05 Implementation for Citadel Academy

This document outlines the implementation of NIP-05 verification for the Citadel Academy Members' Only section.

## Overview

NIP-05 is a Nostr protocol specification that allows for verification of user identities through DNS-based identifiers. In this implementation, we've added support for verifying users with NIP-05 identifiers from the `satnam.pub` domain to grant access to the Members' Only section of the website.

## Components Added

1. **NIP-05 Utility Functions** (`src/lib/nip05.js`)
   - `verifyCitadelUser`: Verifies a user's NIP-05 identifier against the whitelist
   - `isUserInWhitelist`: Checks if a user is in the membership whitelist

2. **API Endpoint** (`src/server/nostr-api.js`)
   - `nostrJsonHandler`: Express route handler for `.well-known/nostr.json`
   - This endpoint follows the NIP-05 specification for DNS-based verification

3. **Redux Actions** (`src/actions/Nostr.js`)
   - `verifyNip05Identifier`: Action creator for verifying NIP-05 identifiers
   - New action types: `VERIFY_NIP05_REQUEST`, `VERIFY_NIP05_SUCCESS`, `VERIFY_NIP05_FAILURE`

4. **Redux Reducer Updates** (`src/reducers/nostr.js`)
   - Added state for NIP-05 verification status
   - Added handlers for NIP-05 verification actions

5. **Members' Only Page** (`src/components/MembersOnlyPage/index.jsx`)
   - New page component for the Members' Only section
   - Includes NIP-05 verification form
   - Displays member content when verified

6. **Navigation Updates** (`src/components/Nav/NavigationLinks.jsx`)
   - Added link to the Members' Only section in the navigation

## Configuration

- The default relay is set to `wss://relay.nostr.band`
- Currently, only NIP-05 identifiers from the `satnam.pub` domain are accepted
- The whitelist functionality is stubbed for now and will need to be implemented with actual database queries

## Future Enhancements

1. Implement actual database integration for the whitelist
2. Add support for additional NIP-05 domains
3. Implement caching for NIP-05 verification results
4. Add admin interface for managing the whitelist

## Usage

Users can access the Members' Only section by:
1. Navigating to `/members`
2. Entering their NIP-05 identifier (e.g., `username@satnam.pub`)
3. Clicking "Verify Membership"

If verification is successful and the user is in the whitelist, they will be granted access to the Members' Only content.