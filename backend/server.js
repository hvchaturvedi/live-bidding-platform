const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: "*" },
});

// In-memory items
const items = {
  1: {
    id: "1",
    title: "iPhone 15",
    startingPrice: 500,
    currentBid: 500,
    highestBidder: null,
    endTime: Date.now() + 5 * 60 * 1000,
  },
  2: {
    id: "2",
    title: "MacBook Air",
    startingPrice: 1000,
    currentBid: 1000,
    highestBidder: null,
    endTime: Date.now() + 8 * 60 * 1000,
  },
};

// REST API
app.get("/items", (req, res) => {
  res.json({
    serverTime: Date.now(),
    items: Object.values(items),
  });
});

// Socket logic
io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  socket.on("BID_PLACED", ({ itemId, amount, userId }) => {
    const item = items[itemId];

    if (!item) return socket.emit("BID_ERROR", "Invalid Item");

    if (Date.now() > item.endTime)
      return socket.emit("BID_ERROR", "Auction Ended");

    if (amount <= item.currentBid) return socket.emit("BID_ERROR", "Outbid");

    // atomic update
    item.currentBid = amount;
    item.highestBidder = userId;

    io.emit("UPDATE_BID", item);
  });
});

server.listen(4000, () => {
  console.log("Backend running on http://localhost:4000");
});
