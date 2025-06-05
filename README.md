# Citadel Academy

**Sovereign Family Learning & Credentialing Platform**  
A Nostr-native educational ecosystem empowering families to own their learning journey, credentials, and legacy.

> *"The best time to plant a tree was 20 years ago. The second best time is now."*  
> – Chinese Proverb

## Providing the opportunity for you to plant your 'Tree of Knowledge' now!

[![Built with Nostr](https://img.shields.io/badge/Built%20with-Nostr-purple)](https://nostr.com)
[![Powered by Bitcoin](https://img.shields.io/badge/Powered%20by-Bitcoin-orange)](https://bitcoin.org)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

---

## 🏰 Vision

Citadel Academy transforms education from institutional control to family sovereignty. Built on Nostr's decentralized infrastructure, we enable:

- **🎓 Self-Sovereign Learning**: Own your educational records forever
- **👨‍👩‍👧‍👦 Family-First Design**: Collaborative learning environment
- **🏅 Verifiable Credentials**: NIP-58 badges that can't be censored or revoked
- **⚡ Bitcoin-Native**: Lightning payments for premium content and mentorship

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ ([Download](https://nodejs.org/))
- Git ([Download](https://git-scm.com/))
- A Nostr identity (create one at [Satnam.pub](https://satnam.pub))

### Installation
```bash
# Clone the repository
git clone https://github.com/your-username/citadel-academy.git

# Navigate to the project directory
cd citadel-academy

# Install dependencies
npm install

# Start the development server
npm run dev
```

### Recent Improvements
- Enhanced relay connection stability with improved error handling
- Fixed client initialization in Redux store
- Implemented proper parameter handling in nostrMainInit function
- Added exponential backoff for relay reconnection attempts
- Improved error handling in event publishing
- Migrated core functionality to TypeScript for better type safety
- Added CourseSearch component with NIP-50 search implementation
- Created AcademyStore and LivingryLibrary components
- Implemented unified event manager for better Nostr event handling
- Added TypeScript configuration and type definitions
- Implemented NIP-53 live streaming events for video classrooms
- Implemented Mentor Marketplace with atomic swaps for digital content purchases
- Enhanced atomic swap functionality for trustless content exchange
- Refactored backup system with improved code organization:
  - Created centralized crypto utilities
  - Improved documentation with JSDoc comments
  - Removed duplicate code and redundant functions
  - Enhanced error handling in backup operations
  - Added configurable backup targets and relay settings
- Simplified and cleaned components:
  - Added comprehensive JSDoc comments for better code documentation
  - Improved component organization with logical grouping
  - Enhanced error handling in operations
  - Removed redundant code and simplified component logic
  - Improved readability with better variable names and comments
- Cleaned up project structure:
  - Removed duplicate directories and files
  - Consolidated component files into src/components
  - Standardized on TypeScript for new development
  - Organized styles into src/styles directory
  - Removed redundant JavaScript files where TypeScript versions exist
- Simplified Knowledge Vault components:
  - Improved file upload and management
  - Enhanced user interface for better usability
  - Added better error handling and progress indicators
- Implemented secure credential management:
  - Added TypeScript support for credential management
  - Improved encryption for sensitive data
  - Created initialization scripts for development and production

## 🔌 Implemented NIPs (Nostr Implementation Possibilities)

| NIP | Description | Implementation |
|-----|-------------|----------------|
| [NIP-01](https://github.com/nostr-protocol/nips/blob/master/01.md) | Basic protocol flow | Core client functionality |
| [NIP-02](https://github.com/nostr-protocol/nips/blob/master/02.md) | Contact list | User following system |
| [NIP-04](https://github.com/nostr-protocol/nips/blob/master/04.md) | Encrypted Direct Messages | Private messaging |
| [NIP-05](https://github.com/nostr-protocol/nips/blob/master/05.md) | Mapping Nostr keys to DNS identifiers | User verification |
| [NIP-08](https://github.com/nostr-protocol/nips/blob/master/08.md) | Handling mentions | Content formatting |
| [NIP-10](https://github.com/nostr-protocol/nips/blob/master/10.md) | Reply threading | Discussion threads |
| [NIP-19](https://github.com/nostr-protocol/nips/blob/master/19.md) | bech32-encoded entities | User-friendly identifiers |
| [NIP-25](https://github.com/nostr-protocol/nips/blob/master/25.md) | Reactions | Content engagement |
| [NIP-42](https://github.com/nostr-protocol/nips/blob/master/42.md) | Authentication | User login |
| [NIP-50](https://github.com/nostr-protocol/nips/blob/master/50.md) | Search | Course discovery |
| [NIP-53](https://github.com/nostr-protocol/nips/blob/master/53.md) | Live Events | Video classrooms |
| [NIP-57](https://github.com/nostr-protocol/nips/blob/master/57.md) | Lightning Zaps | Payments |
| [NIP-58](https://github.com/nostr-protocol/nips/blob/master/58.md) | Badges | Educational credentials |
| [NIP-72](https://github.com/nostr-protocol/nips/blob/master/72.md) | Moderated Communities | Learning groups |
| [NIP-2312](https://github.com/nostr-protocol/nips/blob/master/2312.md) | Commerce Events | Atomic swaps |

## 🏗️ Built With

### Core Infrastructure
- **[Satellite.earth](https://github.com/lovvtide/satellite-web)** - Nostr web client foundation
- **[Nostr Dev Kit (NDK)](https://github.com/nostr-dev-kit/ndk)** - Relay management & event handling
- **[Satnam.pub](https://satnam.pub)** - Identity verification & NIP-05 endpoints

### Educational Features
- **[My First Bitcoin](https://github.com/MyFirstBitcoin)** - Open-source Bitcoin curriculum
- **NIP-58 Badges** - Decentralized credential system

### Payment & Automation
- **Lightning Network** - Instant micropayments for courses and between peers
- **Atomic Swaps** - Trustless content purchases using Lightning Network
- **Fedimint** - Family treasury management
- **zap.stream** - Live classroom integration
- **vida.live** - AI integrated voice tutors and fiat on-ramp

---

## 📚 Features

### Current (MVP)
- [x] Nostr-native authentication
- [x] Course catalog browser
- [x] Basic badge issuance
- [x] Family group creation
- [x] NIP-50 search functionality for course discovery
- [x] Atomic swaps for content purchases

### In Development
- [x] Live video classrooms
- [x] Mentor marketplace
- [ ] Mobile app (React Native)
- [x] Lightning Network payment integration

### Planned
- [ ] AI tutoring assistants
- [ ] Cross-platform credential verification
- [ ] Homeschool compliance tracking
- [ ] Community-driven curriculum

---

## 👥 For Families

**Parents**: Create learning pathways, track progress, issue verified credentials, find trusted mentors
**Students**: Earn badges, join study groups, build your sovereign identity, access quality educational content
**Grandparents**: Share wisdom, mentor grandchildren, contribute to family learning legacy
**Educators**: Monetize expertise through the Mentor Marketplace, sell digital content with atomic swaps, reach global families, maintain academic freedom

---

## 🛠️ Development

### Project Structure
```
citadel-academy/
├── public/             # Static assets
├── src/
│   ├── actions/        # Redux actions
│   │   ├── Nostr.js    # Nostr-related actions
│   │   └── ...
│   ├── components/     # React components
│   │   ├── CourseSearch.tsx  # NIP-50 search component
│   │   ├── AcademyStore.tsx  # Marketplace component
│   │   ├── LivingryLibrary.tsx # Library component
│   │   ├── MentorMarketplace.tsx # Mentor marketplace component
│   │   ├── AtomicSwap.tsx    # Atomic swap component
│   │   ├── ContentPurchase.tsx # Content purchase component
│   │   └── ...
│   ├── hooks/          # Custom React hooks
│   │   ├── useCitadelEventManager.ts # Event management hook
│   │   ├── useNostrWalletConnect.d.ts # Type definitions
│   │   └── ...
│   ├── lib/            # Utility libraries
│   │   ├── search.ts   # NIP-50 search implementation
│   │   ├── nostrUtils.ts # Nostr utility functions
│   │   ├── unified-event-manager.ts # Event handling
│   │   ├── marketplace.ts # Store functionality
│   │   ├── mentor-marketplace.ts # Mentor marketplace functionality
│   │   ├── nip53-live-events.ts # NIP-53 live streaming events
│   │   ├── crypto-utils.ts # Cryptographic utilities
│   │   ├── citadel-backup-sdk.ts # Unified backup SDK
│   │   ├── private-relay-manager.ts # Private relay management
│   │   ├── encrypted-backup-manager.ts # Encrypted backup system
│   │   ├── strfry-backup-integration.ts # Strfry relay integration
│   │   ├── atomic-swap.ts # Atomic swap service
│   │   └── ...
│   ├── modules/        # Core functionality modules
│   │   ├── Client.js   # Nostr client implementation
│   │   └── Feed.js     # Feed management
│   ├── reducers/       # Redux reducers
│   │   ├── nostr.js    # Nostr state management
│   │   └── ...
│   ├── styles/         # CSS modules and styles
│   │   ├── atomic-swap.css # Atomic swap styles
│   │   └── ...
│   ├── types/          # TypeScript type definitions
│   ├── App.jsx         # Main application component
│   ├── constants.js    # Application constants (relays, colors, etc.)
│   ├── main.jsx        # Application entry point
│   ├── store.js        # Redux store configuration
│   └── types.d.ts      # Global type definitions
├── pages/              # Next.js pages
│   ├── api/            # API routes
│   │   ├── create-swap.ts # Create atomic swap API
│   │   ├── check-swap.ts # Check swap status API
│   │   ├── mentor/      # Mentor marketplace APIs
│   │   │   ├── profile.ts # Mentor profile API
│   │   │   ├── content.ts # Mentor content API
│   │   │   └── reviews.ts # Mentor reviews API
│   │   └── ...
│   ├── atomic-swap-demo.tsx # Demo page for atomic swaps
│   ├── mentor-marketplace.tsx # Mentor marketplace page
│   └── ...
├── tests/              # Test files
├── tsconfig.json       # TypeScript configuration
├── tsconfig.node.json  # Node-specific TS config
└── package.json        # Project dependencies
```

### Development Commands
```bash
# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

### Key Technical Improvements
1. **Enhanced Relay Management**
   - Improved connection stability with exponential backoff
   - Better error handling for relay connections
   - Normalized URL handling to prevent duplicate connections

2. **Redux Integration**
   - Fixed client initialization in Redux store
   - Proper parameter handling in nostrMainInit function
   - Improved state management for relay status

3. **Error Handling**
   - Added comprehensive error handling in event publishing
   - Improved reconnection logic with maximum attempt limits
   - Better logging for debugging connection issues

4. **NIP-50 Search Implementation**
   - Added support for full-text search of courses
   - Implemented filtering by tags, course level, and instructor
   - Created responsive CourseSearch component for discovery

5. **TypeScript Migration**
   - Added TypeScript configuration and type definitions
   - Migrated key utility functions to TypeScript
   - Implemented type-safe components for new features
   - Created proper type interfaces for Nostr events and data

6. **Unified Event Management**
   - Developed a centralized event manager for Nostr interactions
   - Created custom hooks for simplified component integration
   - Improved event subscription and publishing patterns
   - Better handling of event lifecycles

7. **NIP-53 Live Events Implementation**
   - Added support for live streaming video classrooms
   - Implemented event creation and status updates for streams
   - Integration with zap.stream service
   - Support for participant tracking and stream metadata

8. **Backup System Refactoring**
   - Created centralized crypto utilities to eliminate code duplication
   - Added comprehensive JSDoc documentation for all functions
   - Implemented configurable backup targets and relay settings
   - Enhanced error handling with proper TypeScript typing
   - Improved timeout handling in network operations
   - Added verification capabilities for backup integrity

9. **Mentor Marketplace Implementation**
   - Developed complete Mentor Marketplace with profile creation and discovery
   - Implemented NIP-2312 atomic swaps for trustless digital content purchases
   - Created secure payment flow for educational content and mentorship services
   - Added rating and review system for mentors and educational materials
   - Integrated with Lightning Network for instant micropayments
   - Implemented content preview and sample functionality

## 🤝 Contributing

We welcome contributions from educators, developers, and families worldwide!

1. **Fork** the repository
2. **Create** a feature branch: `git checkout -b feat/amazing-feature`
3. **Commit** your changes: `git commit -m 'Add amazing feature'`
4. **Push** to the branch: `git push origin feat/amazing-feature`
5. **Open** a Pull Request

See [CONTRIBUTING.md](CONTRIBUTING.md) for detailed guidelines.

---

## 🌟 Community

- **Nostr**: Follow us at the Rebuilding Camelot account `nsec1ta7e84kz65k8r797hhmkucgqesgsw43f4ydpfv4sufduzm3k56fqdslpjh`
- **Telegram**: [Rebuilding Camelot](https://t.me/rebuildingcamelot)
- **GitHub Discussions**: Share ideas and get help
- **Lightning**: Support development at `academy@satnam.pub`

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- **Satellite.earth** team for the incredible Nostr foundation
- **My First Bitcoin** for open-source educational content
- **Nostr protocol** developers for decentralized infrastructure
- **Bitcoin** community for sound money principles
- All the **sovereign families** building the future

---

> *"Education is the most powerful weapon which you can use to change the world."*  
> – Nelson Mandela

**Together, we're not just building an academy; We're rebuilding Camelot, one family at a time.**

---

*Built with ❤️ by the Rebuilding Camelot initiative*
