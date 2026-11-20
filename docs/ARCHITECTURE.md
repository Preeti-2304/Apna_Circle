# ApnaCircle – Technical Architecture Document

## 1. Executive Summary

**Product Name:** ApnaCircle  
**Tagline:** "Your People. Your Cities. Your Circle."  
**Core Philosophy:** "DON'T JUST SEARCH A PLACE. FIND A PERSON WHO CAN HELP."

ApnaCircle is a location-based friendship, community, and assistance network designed to solve connection loss when people move or travel between cities. It integrates social discovery, city-based friend filtering, intelligent helper matching, real-time messaging, and an immutable rewards and trust score engine.

---

## 2. Monorepo Structure

```
apnacircle/
├── client/                      # React 18 + Vite + Tailwind CSS Frontend
│   ├── public/                  # Static assets & SVG icons
│   ├── src/
│   │   ├── assets/              # Icons and images
│   │   ├── components/          # Reusable UI components (Navbar, TopHeader, Sidebar, MapView, ProfileCard, FriendCard, HelpRequestCard, HelperMatchModal, ReviewModal, etc.)
│   │   ├── context/             # AuthContext & SocketContext
│   │   ├── layouts/             # PublicLayout & DashboardLayout
│   │   ├── pages/               # All public, dashboard, and admin screens
│   │   ├── services/            # Axios API client with bearer token interception
│   │   ├── App.jsx              # Routing table & Toast provider
│   │   ├── index.css            # Tailwind base & Leaflet map styling
│   │   └── main.jsx             # React DOM entry point
│   ├── package.json
│   ├── vite.config.js
│   ├── tailwind.config.js
│   └── postcss.config.js
│
├── server/                      # Node.js + Express + MongoDB Backend
│   ├── config/                  # DB configuration with embedded MongoDB fallback
│   ├── controllers/             # REST controllers for Auth, Users, Friends, Help, Rewards, Reviews, Chat, Communities, Admin
│   ├── middleware/              # JWT auth protection, role checks, Multer uploads
│   ├── models/                  # 14 Mongoose Schema models
│   ├── routes/                  # Express route routers
│   ├── services/                # Smart Matching Engine & Reward Points Ledger
│   ├── sockets/                 # Socket.IO real-time manager (presence, chat, typing, alerts)
│   ├── utils/                   # Seed data generator, test suite, OTP utility
│   ├── server.js                # Server entry point & static SPA serving
│   ├── .env.example             # Safe environment configuration template
│   └── package.json
│
├── docs/                        # Project documentation
│   ├── ARCHITECTURE.md
│   ├── API_DOCUMENTATION.md
│   └── ACCEPTANCE_TEST_REPORT.md
│
├── .gitignore                   # Ignores node_modules, dist, .cache, .env
├── package.json                 # Root script runner for monorepo
└── README.md                    # Installation and operational guide
```

---

## 3. Technology Stack

- **Frontend:**
  - React 18
  - Vite 6
  - Tailwind CSS 3
  - React Router DOM 6
  - Lucide React
  - Axios
  - Leaflet & React-Leaflet (OpenStreetMap)
  - React Hot Toast
  - Socket.IO Client

- **Backend:**
  - Node.js & Express 4
  - MongoDB & Mongoose 8
  - Embedded `mongodb-memory-server` automatic fallback (enables running on machines without local `mongod` installed)
  - JSON Web Tokens (`jsonwebtoken`)
  - Bcryptjs password encryption
  - Socket.IO 4
  - Multer
  - Nodemailer

---

## 4. Database Models (14 Schemas)

1. **User**: Name, email, hashed password, current city, originally from city, GeoJSON coordinates (`2dsphere`), college, profession, languages, skills, "can help with" categories, availability, trust score (0-100), reward points, helper level (1-5), badges.
2. **FriendRequest**: Sender, recipient, status (`pending`, `accepted`, `rejected`, `cancelled`).
3. **Friendship**: Sorted compound keys `user1`, `user2`, `users` array for `$in` queries.
4. **HelpRequest**: Creator, title, description, category, city, coordinates, urgency, preferred language, required skills, status (`Open`, `Matched`, `Accepted`, `In Progress`, `Completed`, `Cancelled`), responses.
5. **HelpTransaction**: HelpRequest reference, creator, helper, category, status, points awarded, confirmation timestamps.
6. **RewardTransaction**: User, type (`EARNED`, `REDEEMED`, `BONUS`), amount, immutable action description, reference ID, audit balance after.
7. **Review**: Author, target user, help request reference, star rating (1-5), written feedback, category. Unique compound index prevents multiple reviews per request.
8. **Conversation**: Participants array, last message text, timestamp, related help request.
9. **Message**: Conversation ID, sender, text, attachment URL, readBy array.
10. **Notification**: Recipient, sender, type, title, message, link, read boolean.
11. **Community**: Name, description, city, category, creator, member count, official flag.
12. **CommunityMember**: Community ID, user ID, role (`member`, `moderator`, `admin`).
13. **CommunityPost**: Community ID, author, title, content, likes, comments array.
14. **Report**: Reporter, reported user, target type, reason, details, status (`pending`, `resolved`, `dismissed`).

---

## 5. Smart Matching Engine

Matches suitable helpers based on the required formula:

$$\text{Match Score} = (0.35 \times \text{Skill}) + (0.25 \times \text{Language}) + (0.20 \times \text{Distance}) + (0.10 \times \text{Trust}) + (0.10 \times \text{Availability})$$

- **Skill Compatibility (35%):** Matches category specializations and required skills.
- **Language Compatibility (25%):** Prioritizes requester's preferred language (Hindi, English, regional).
- **Distance (20%):** Uses Haversine distance formula between requester and helper coordinates.
- **Trust Score (10%):** Verifies the helper's calculated trust score.
- **Availability (10%):** Available (100%), Busy (40%), Unavailable (0%).

Excludes:
- The request creator themselves
- Suspended or unavailable accounts
- Blocked users

---

## 6. Rewards & Reputation Security

- **Strict Server Calculation:** Reward point values are strictly controlled on the backend (`rewardService.js`). Frontend cannot supply or manipulate point values.
- **Duplicate Prevention:** Reward ledger checks `referenceId` and `action` to prevent double-awarding for the same help request.
- **Helper Levels:**
  - Level 1: New Member (0 - 99 pts)
  - Level 2: Active Member (100 - 249 pts)
  - Level 3: Community Helper (250 - 499 pts)
  - Level 4: Trusted Helper (500 - 999 pts)
  - Level 5: Community Champion (1000+ pts)
- **Badges:** First Help, Local Hero, 10 People Helped, Travel Expert, Community Champion.
