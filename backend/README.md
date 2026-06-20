**Switch**  
A real-time collaborative Kanban board, built from scratch. Multiple people can work the same board at once: drag a card and everyone watching sees it move within milliseconds, no refresh required.  
**Live:** [switchapp.space](https://app.switchapp.space "https://app.switchapp.space")  
![](data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAnEAAAACCAYAAAA3pIp+AAAABmJLR0QA/wD/AP+gvaeTAAAACXBIWXMAAA7EAAAOxAGVKw4bAAAANklEQVR4nO3OUQmAABBAsSeYxZyXSzCJASxgACv4J8KWYMvMbNURAAB/ca7VXe1fTwAAeO16AKe+BdmJqrPdAAAAAElFTkSuQmCC)  
Stack  
**Backend**: Node.js, Express, TypeScript, PostgreSQL (Drizzle ORM), Redis, BullMQ, Socket.io, Passport.js  
   
 **Frontend**: Next.js 15, TypeScript, Zustand, Tanstack Query, dnd-kit, Tailwind CSS, Socket.io-client  
   
 **Infra**: Render (API), Vercel (web), Neon (Postgres), Upstash (Redis)  
![](data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAnEAAAACCAYAAAA3pIp+AAAABmJLR0QA/wD/AP+gvaeTAAAACXBIWXMAAA7EAAAOxAGVKw4bAAAANUlEQVR4nO3OMQ2AABAAsSNBCUpfEJ5YGBDBgAU2QtIq6DIzW7UHAMBfHGt1V+fXEwAAXrseHDYF+yOk59sAAAAASUVORK5CYII=)  
Features  
- Workspaces → Projects → Boards → Columns → Cards, with role-based access (Owner / Admin / Member) at the workspace level  
- Live drag-and-drop reordering of cards and columns, synced across every connected client in real time  
- Google & GitHub OAuth, plus email/password with OTP verification  
- Card assignees, labels, comments, file attachments, and an activity log per card  
- In-app + email notifications (invitations, due dates, mentions)  
- Live presence: see who else is currently viewing a board  
![](data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAnEAAAACCAYAAAA3pIp+AAAABmJLR0QA/wD/AP+gvaeTAAAACXBIWXMAAA7EAAAOxAGVKw4bAAAANElEQVR4nO3OQQmAUBBAwSf8GGLWDWFDY3ixgjcRZhLMNjNHdQYAwF9cq1rV/vUEAIDX7gcRXAQ2s/16gwAAAABJRU5ErkJggg==)  
Architecture  
Every board mutation (create/move/update/delete card or column, assignee/label changes, comments) writes to Postgres first, then broadcasts the change over Socket.io to everyone currently viewing that board, including the person who made the change. That broadcast *is* the state-update mechanism for most of the UI: rather than maintaining a hand-rolled optimistic-update path on top of a separate server-reconciliation path, the realtime event is the single source of truth for both the actor and every other viewer. A couple of high-frequency interactions (assignee toggling, card deletion) do use true optimistic updates with rollback, since even the realtime round-trip reads as laggy for rapid clicking.  
**A few decisions worth knowing about**  
- **Card and column ordering uses fractional indexing**, not integer positions. Reordering a card is a single-row write (a new lexicographically-sortable string key between its two neighbors) instead of re-numbering every card after the insertion point, no cascading updates, no table-wide lock contention when multiple people reorder at once.  
- **Auth uses refresh-token rotation with reuse detection.** Every refresh issues a new token and invalidates the old one; if an already-rotated token is ever presented again, that's only possible via a stolen/replayed token, so the entire token family is revoked immediately rather than just the one token.  
- **Authorization is centralized in middleware**, not scattered per-route checks. A single requireWorkspaceMember middleware resolves whichever resource is in the route (board, column, card, label, etc.) up to its owning workspace and checks membership there, attaching the resolved entity to the request so controllers don't redo the lookup.  
- **File uploads go straight to Cloudinary from the browser** via a signed upload, the Express server generates a signature but never touches the file bytes themselves, so upload bandwidth and memory cost don't land on the API tier.  
![](data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAnEAAAACCAYAAAA3pIp+AAAABmJLR0QA/wD/AP+gvaeTAAAACXBIWXMAAA7EAAAOxAGVKw4bAAAANklEQVR4nO3OMQ2AABAAsSPBCj5fFgpQwYwEZiywEZJWQZeZ2ao9AAD+4lyruzq+ngAA8Nr1AMTRBeEgNK9YAAAAAElFTkSuQmCC)  
Local Setup  
**Backend**  
cd backend  
 bun install  
 # create a .env file with the variables listed below  
 bun run db:migrate  
 bun run dev             # http://localhost:7000  
   
**Required environment variables:**  
| | |  
|-|-|  
| **Variable** | **Purpose** |   
| DATABASE_URL | Postgres connection string |   
| REDIS_URL | Redis connection (caching, Socket.io) |   
| ACCESS_TOKEN_SECRET / RESET_TOKEN_SECRET | JWT signing secrets |   
| RESEND_API_KEY / EMAIL_FROM | Transactional email (Resend) |   
| CLOUDINARY_CLOUD_NAME / CLOUDINARY_API_KEY / CLOUDINARY_API_SECRET | File uploads |   
| GOOGLE_CLIENT_ID / GOOGLE_CLIENT_SECRET / GOOGLE_CALLBACK_URL | Google OAuth |   
| GITHUB_CLIENT_ID / GITHUB_CLIENT_SECRET / GITHUB_CALLBACK_URL | GitHub OAuth |   
| FRONTEND_URL | CORS + email link target |   
   
**Frontend**  
cd frontend  
 bun install  
 bun run dev   # http://localhost:7001  
   
![](data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAnEAAAACCAYAAAA3pIp+AAAABmJLR0QA/wD/AP+gvaeTAAAACXBIWXMAAA7EAAAOxAGVKw4bAAAANklEQVR4nO3OQQmAABRAsScYxpg/h5VMYARvRrCCNxG2BFtmZquOAAD4i3Ot7mr/egIAwGvXA224BcUMk6pDAAAAAElFTkSuQmCC)  
Known Limitations  
A few things noted during a self-review of this codebase, kept here deliberately rather than swept under the rug:  
- **No periodic rebalance job** for fractional-indexing keys. This is fine at current scale, would need one if a single column saw very heavy sustained reordering.  
- Presence tracking and Socket.io broadcast are currently single-instance. Horizontally scaling the API would need the Socket.io Redis adapter to share room state across instances.  
   
   
