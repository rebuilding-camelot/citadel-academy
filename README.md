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
- **👨‍👩‍👧‍👦 Family-First Design**: Multi-generational knowledge preservation
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
| [NIP-57](https://github.com/nostr-protocol/nips/blob/master/57.md) | Lightning Zaps | Payments |
| [NIP-58](https://github.com/nostr-protocol/nips/blob/master/58.md) | Badges | Educational credentials |

## 🏗️ Built With

### Core Infrastructure
- **[Satellite.earth](https://github.com/lovvtide/satellite-web)** - Nostr web client foundation
- **[Nostr Dev Kit (NDK)](https://github.com/nostr-dev-kit/ndk)** - Relay management & event handling
- **[Satnam.pub](https://satnam.pub)** - Identity verification & NIP-05 endpoints

### Educational Features
- **[My First Bitcoin](https://github.com/MyFirstBitcoin)** - Open-source Bitcoin curriculum
- **NIP-58 Badges** - Decentralized credential system
- **Family Vaults** - Encrypted knowledge preservation

### Payment & Automation
- **Lightning Network** - Instant micropayments for courses and between peers
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

### In Development
- [ ] Live video classrooms
- [ ] Mentor marketplace
- [ ] Knowledge vault (IPFS storage)
- [ ] Mobile app (React Native)

### Planned
- [ ] AI tutoring assistants
- [ ] Cross-platform credential verification
- [ ] Homeschool compliance tracking
- [ ] Community-driven curriculum

---

## 👥 For Families

**Parents**: Create learning pathways, track progress, issue verified credentials
**Students**: Earn badges, join study groups, build your sovereign identity
**Grandparents**: Share wisdom, mentor grandchildren, preserve family history
**Educators**: Monetize expertise, reach global families, maintain academic freedom

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
│   ├── modules/        # Core functionality modules
│   │   ├── Client.js   # Nostr client implementation
│   │   └── Feed.js     # Feed management
│   ├── reducers/       # Redux reducers
│   │   ├── nostr.js    # Nostr state management
│   │   └── ...
│   ├── App.jsx         # Main application component
│   ├── constants.js    # Application constants (relays, colors, etc.)
│   ├── main.jsx        # Application entry point
│   └── store.js        # Redux store configuration
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
