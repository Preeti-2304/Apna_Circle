# ApnaCircle – API & Socket.IO Reference

Base URL: `/api`  
Authentication: HTTP Bearer Token (`Authorization: Bearer <JWT>`)

---

## 1. Authentication Endpoints (`/api/auth`)

| Method | Endpoint | Description | Access |
|---|---|---|---|
| `POST` | `/api/auth/register` | Register a new account (name, email, password, phone) | Public |
| `POST` | `/api/auth/login` | Log in with email & password | Public |
| `POST` | `/api/auth/verify-otp` | Verify 6-digit email OTP and award signup bonus points | Public |
| `POST` | `/api/auth/resend-otp` | Resend fresh 6-digit OTP | Public |
| `POST` | `/api/auth/forgot-password` | Request password reset code | Public |
| `POST` | `/api/auth/reset-password` | Set new password with verified OTP | Public |
| `GET` | `/api/auth/me` | Fetch currently logged in user profile | Authenticated |
| `POST` | `/api/auth/logout` | Invalidate session client-side | Authenticated |

---

## 2. User & Discovery Endpoints (`/api/users`)

| Method | Endpoint | Description | Access |
|---|---|---|---|
| `GET` | `/api/users/discover` | Search & filter users by city, college, skill, help category | Public/Auth |
| `GET` | `/api/users/nearby` | Geospatial discovery using `$centerSphere` with radius (km) | Public/Auth |
| `GET` | `/api/users/:id` | Get public profile by ID (with privacy-masked coordinates) | Public/Auth |
| `PUT` | `/api/users/profile` | Update profile, location, "can help with", availability | Authenticated |
| `POST` | `/api/users/upload-avatar` | Upload avatar image using Multer | Authenticated |
| `POST` | `/api/users/:id/block` | Block user from appearing in discovery or messaging | Authenticated |
| `POST` | `/api/users/:id/unblock` | Unblock user | Authenticated |

---

## 3. Friendship Endpoints (`/api/friends`)

| Method | Endpoint | Description | Access |
|---|---|---|---|
| `GET` | `/api/friends` | Get accepted friends with city, college, skill filters & sorting | Authenticated |
| `GET` | `/api/friends/requests` | Get pending received & sent friend requests | Authenticated |
| `POST` | `/api/friends/request/:userId` | Send friend request | Authenticated |
| `POST` | `/api/friends/accept/:requestId` | Accept friend request & create mutual friendship | Authenticated |
| `POST` | `/api/friends/reject/:requestId` | Reject incoming friend request | Authenticated |
| `POST` | `/api/friends/cancel/:requestId` | Cancel sent friend request | Authenticated |
| `DELETE` | `/api/friends/:userId` | Remove accepted friendship (unfriend) | Authenticated |
| `GET` | `/api/friends/of-friends` | Discover 2nd-degree mutual connections | Authenticated |

---

## 4. Help Request & Matching Endpoints (`/api/help-requests`)

| Method | Endpoint | Description | Access |
|---|---|---|---|
| `GET` | `/api/help-requests` | List help requests with category, city, urgency, status filters | Public/Auth |
| `POST` | `/api/help-requests` | Create new help request | Authenticated |
| `GET` | `/api/help-requests/:id` | Get help request details, responses, assigned helper | Public/Auth |
| `PUT` | `/api/help-requests/:id` | Update/edit help request | Creator/Admin |
| `DELETE` | `/api/help-requests/:id` | Cancel/delete help request | Creator/Admin |
| `POST` | `/api/help-requests/:id/respond` | Offer/propose help on request | Authenticated |
| `POST` | `/api/help-requests/:id/accept` | Accept a helper & transition status to `In Progress` | Creator |
| `POST` | `/api/help-requests/:id/complete` | Confirm completion & award points to helper | Creator/Admin |
| `GET` | `/api/help-requests/:id/matches` | Run Smart Matching Engine and return ranked helper list | Public/Auth |

---

## 5. Rewards & Points Endpoints (`/api/rewards`)

| Method | Endpoint | Description | Access |
|---|---|---|---|
| `GET` | `/api/rewards` | Get user rewards dashboard, level, next level progress, transactions | Authenticated |
| `GET` | `/api/rewards/leaderboard` | Get leaderboard (Overall India, or City-wise) | Public/Auth |
| `GET` | `/api/rewards/history` | Get immutable transaction ledger history | Authenticated |

---

## 6. Real-Time Chat & Socket.IO (`/api/chat` & Socket events)

| Method | Endpoint | Description | Access |
|---|---|---|---|
| `GET` | `/api/chat/conversations` | List user conversations with unread counts & last messages | Authenticated |
| `POST` | `/api/chat/conversations` | Get or create 1-to-1 conversation with another user | Authenticated |
| `GET` | `/api/chat/messages/:conversationId` | Fetch message history & mark messages as read | Authenticated |
| `POST` | `/api/chat/messages/:conversationId` | REST fallback to send message | Authenticated |

### Socket.IO Real-Time Events:
- `connect`: Authenticated with Bearer token in handshake
- `join_conversation`: Join conversation room `conversation_<id>`
- `send_message`: Send message payload `{ conversationId, text, attachmentUrl }`
- `new_message`: Broadcasted message to conversation participants
- `typing_start` / `typing_stop`: Broadcast typing state
- `user_status`: Broadcast online/offline state change
- `notification`: Real-time push alert for requests, completions, rewards

---

## 7. Reviews, Communities & Administration

- **Reviews:**
  - `POST /api/reviews`: Submit 1-5 star review & feedback after assistance completion.
  - `GET /api/reviews/user/:id`: View verified reviews for a user.
- **Communities:**
  - `GET /api/communities`: List city & interest communities.
  - `POST /api/communities`: Create new community.
  - `GET /api/communities/:id`: Community details & member list.
  - `POST /api/communities/:id/join` & `leave`: Join/leave community.
  - `GET /api/communities/:id/posts`: Community discussion posts.
  - `POST /api/communities/:id/posts`: Create post.
  - `POST /api/communities/posts/:postId/comments`: Add comment.
- **Admin Panel (Role: admin):**
  - `GET /api/admin/dashboard`: Platform overview statistics.
  - `GET /api/admin/users`: Search, filter, and list registered users.
  - `PUT /api/admin/users/:id/status`: Suspend or activate user.
  - `GET /api/admin/reports`: List pending safety reports.
  - `PUT /api/admin/reports/:id/resolve`: Resolve report and take action.
