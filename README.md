 Live Bidding Platform (Levich R1 Challenge)

A real-time auction platform where users compete to place bids in the final seconds of an auction. Built using Node.js, Socket.io, and React with server-synced timers and race-condition-safe bid handling.

Features

📡 Real-time bidding using WebSockets (Socket.io)

⏱️ Server-synced countdown timer (client clock cannot be hacked)

⚡ Instant UI updates on new bids

🟢 Green flash animation when a new bid arrives

🔴 “Outbid” visual state when user loses highest bid

🏆 “Winning” badge when user is highest bidder

🐳 Dockerized backend for easy setup

Architecture
Backend (Node.js + Socket.io)

REST API: GET /items

Socket events:

BID_PLACED: Client sends a bid

UPDATE_BID: Server broadcasts updated bid

Server is the single source of truth for:

Current bid

Auction end time

Bid validation

Frontend (React)

Displays auction items in a grid layout

Shows real-time prices and countdown timers

Provides visual feedback on bid updates

Race Condition Handling

When multiple users place bids at the same time, race conditions are avoided by handling bid validation and mutation synchronously on the server.

The server logic ensures:

Only one bid can update an item at a time

The first valid bid is accepted

Any subsequent bid with the same or lower value is rejected with an "Outbid" error

Since Node.js runs on a single-threaded event loop, bid validation and state mutation occur atomically within one event loop cycle.

⏱Server-Synced Timer

The server sends:

endTime of auction

serverTime (current server timestamp)

The client computes a clock offset:

offset = serverTime - clientTime


All countdown timers are calculated using this offset, ensuring:

Users cannot manipulate their local clock to gain an advantage

Timer remains synchronized for all users

📡 API & Socket Events
REST API
GET /items


Returns:

{
  "serverTime": 1700000000000,
  "items": [
    {
      "id": "1",
      "title": "iPhone 15",
      "startingPrice": 500,
      "currentBid": 510,
      "endTime": 1700000300000,
      "highestBidder": "user123"
    }
  ]
}

Socket Events

Client → Server:

BID_PLACED
{
  itemId,
  amount,
  userId
}


Server → Client:

UPDATE_BID
(updatedItem)


Error:

BID_ERROR
("Outbid" | "Auction Ended")

🐳 Docker Support

The backend is Dockerized for easy setup and deployment.

Backend Dockerfile:
FROM node:18
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
CMD ["node", "server.js"]

Local Setup
1️⃣ Clone repository
git clone <your-repo-url>
cd live-bidding-platform

2️⃣ Run Backend
cd backend
npm install
node server.js


Backend runs on:

http://localhost:4000

3️⃣ Run Frontend
cd frontend
npm install
npm run dev


Frontend runs on:

http://localhost:5173

Testing Race Condition

Open the app in two browser tabs

Click Bid +10 at the same time

Observe:

Only one bid is accepted

Other user receives an “Outbid” state instantly

 Deployment

Backend: Render

Frontend: Vercel

Deployed links:

Frontend: <your-vercel-link>

Backend: <your-render-link>

Assessment Alignment
Requirement	Status
REST API	✅
Socket Events	✅
Race Condition Handling	✅
Countdown Timer Sync	✅
Visual Feedback	✅
Docker Support	✅
Code Quality	✅

Future Improvements

Redis-based locking for distributed race condition handling

Authentication for real users

Persistent database for auction data

Bid history tracking

👨‍💻 Author

Built as part of Levich Internship Level 1 Challenge.