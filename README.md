# Switch

A minimal, real-time collaborative Kanban board built from scratch. Multiple people can work the same board at once: drag a card and everyone watching sees it move within milliseconds, no refresh required.

**Live:** https://app.switchapp.space

## 🛠 Tech Stack

- **Backend:** Node.js, Express, TypeScript, PostgreSQL (Drizzle ORM), Redis, BullMQ, Socket.io, Passport.js
- **Frontend:** Next.js 15, TypeScript, Zustand, Tanstack Query, dnd-kit, Tailwind CSS, Socket.io-client
- **Infrastructure:** Northflank (API), Vercel (Web), Neon (Postgres), Upstash (Redis)

---

## ✨ Features

- **Hierarchical Organization:** Workspaces → Projects → Boards → Columns → Cards, with role-based access (Owner / Admin / Member) at the workspace level.
- **Real-Time Sync:** Live drag-and-drop reordering of cards and columns, synced across every connected client instantly.
- **Authentication:** Google & GitHub OAuth, plus email/password with OTP verification.
- **Card Management:** Assignees, labels, comments, file attachments, and an activity log per card.
- **Notifications:** In-app and transactional email notifications (invitations, due dates, mentions).
- **Live Presence:** Visual indicators showing who else is currently viewing a board.

---

## 🏗 Architecture & Engineering Decisions

### The Real-Time State Mechanism

Every board mutation (create/move/update/delete card or column, assignee/label changes, comments) writes to Postgres first, then broadcasts the change over Socket.io to everyone currently viewing that board—including the person who made the change.

That broadcast is the state-update mechanism for most of the UI. Rather than maintaining a hand-rolled optimistic-update path on top of a separate server-reconciliation path, the real-time event is the single source of truth. (A couple of high-frequency interactions, like assignee toggling and card deletion, use true optimistic updates with rollback to prevent rapid-click lag).

### Fractional Indexing

Card and column ordering uses fractional indexing, not integer positions. Reordering a card is a single-row write (inserting a new lexicographically-sortable string key between its two neighbors) instead of re-numbering every card after the insertion point. This means no cascading updates and no table-wide lock contention when multiple people reorder at once.

### Secure Auth & Rotation

Auth uses refresh-token rotation with reuse detection. Every refresh issues a new token and invalidates the old one. If an already-rotated token is ever presented again, it is flagged as a stolen/replayed token, and the entire token family is revoked immediately.

### Centralized Authorization Middleware

Authorization is centralized rather than scattered across per-route checks. A single `requireWorkspaceMember` middleware resolves whichever resource is in the route (board, column, card, label, etc.) up to its owning workspace, checks membership there, and attaches the resolved entity to the request so controllers don't redo the lookup.

### Offloaded File Uploads

File uploads go straight to Cloudinary from the browser via signed uploads. The Express server generates a signature but never touches the file bytes themselves, ensuring upload bandwidth and memory costs do not bottleneck the API tier.

---

## 💻 Local Setup

### Backend

```bash
cd backend
bun install
# create a .env file with the variables listed below
bun run db:migrate
bun run dev             # http://localhost:7000


Required Environment Variables (Backend):

Variable                                Purpose


DATABASE_URLPostgres                    connection string

REDIS_URL                               Redis connection (caching, Socket.io)
ACCESS_TOKEN_SECRET /
RESET_TOKEN_SECRET                      JWT signing secrets

RESEND_API_KEY /
EMAIL_FROM                              Transactional email (Resend)

CLOUDINARY_CLOUD_NAME /
API_KEY / API_SECRET                    File uploads

GOOGLE_CLIENT_ID / CLIENT_SECRET /
CALLBACK_URL                            Google OAuth

GITHUB_CLIENT_ID / CLIENT_SECRET /
CALLBACK_URL                            GitHub OAuth

FRONTEND_URL                            CORS + email link target


Frontend:

cd frontend
bun install
bun run dev             # http://localhost:7001


🚧 Known Limitations
A few things noted during a self-review of this codebase:

  *No Periodic Rebalance Job: There is currently no job to rebalance fractional-indexing keys. This is fine at the current scale, but would be required if a single column saw very heavy, sustained reordering.

  *Single-Instance Presence: Presence tracking and Socket.io broadcasts are currently single-instance. Horizontally scaling the API would require implementing the Socket.io Redis adapter to share room state across instances.


```
