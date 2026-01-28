import { useEffect, useState } from "react";
import io from "socket.io-client";

const socket = io("https://live-bidding-platform-13ov.onrender.com/");

function App() {
  const [items, setItems] = useState([]);
  const [offset, setOffset] = useState(0);
  const [flashMap, setFlashMap] = useState({});
  const [outbidMap, setOutbidMap] = useState({});

  const userId =
    localStorage.getItem("userId") || Math.random().toString(36).substring(2);
  localStorage.setItem("userId", userId);

  useEffect(() => {
    fetch("https://live-bidding-platform-13ov.onrender.com/items")
      .then((res) => res.json())
      .then((data) => {
        setItems(data.items);
        setOffset(data.serverTime - Date.now());
      });

    socket.on("UPDATE_BID", (updatedItem) => {
      setItems((prev) =>
        prev.map((i) => (i.id === updatedItem.id ? updatedItem : i)),
      );

      // green flash
      setFlashMap((prev) => ({ ...prev, [updatedItem.id]: "green" }));
      setTimeout(() => {
        setFlashMap((prev) => ({ ...prev, [updatedItem.id]: "" }));
      }, 500);

      // if I was winning but now lost
      if (updatedItem.highestBidder !== userId) {
        setOutbidMap((prev) => ({ ...prev, [updatedItem.id]: true }));
        setTimeout(() => {
          setOutbidMap((prev) => ({ ...prev, [updatedItem.id]: false }));
        }, 1500);
      }
    });

    socket.on("BID_ERROR", (msg) => {
      alert(msg);
    });

    return () => socket.off();
  }, []);

  const placeBid = (item) => {
    socket.emit("BID_PLACED", {
      itemId: item.id,
      amount: item.currentBid + 10,
      userId,
    });
  };

  const timeLeft = (endTime) => {
    const diff = endTime - (Date.now() + offset);
    if (diff <= 0) return "Ended";
    const m = Math.floor(diff / 60000);
    const s = Math.floor((diff % 60000) / 1000);
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  return (
    <div style={{ padding: 20 }}>
      <h2>Live Auction</h2>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(2, 1fr)",
          gap: 20,
        }}
      >
        {items.map((item) => {
          const isWinning = item.highestBidder === userId;
          const flash = flashMap[item.id];
          const isOutbid = outbidMap[item.id];

          return (
            <div
              key={item.id}
              style={{
                border: "1px solid gray",
                padding: 20,
                borderRadius: 10,
                transition: "0.3s",
                backgroundColor:
                  flash === "green"
                    ? "#1b5e20"
                    : isOutbid
                      ? "#7f1d1d"
                      : "#1e1e1e",
              }}
            >
              <h3>{item.title}</h3>
              <p>Price: ${item.currentBid}</p>
              <p>Time Left: {timeLeft(item.endTime)}</p>

              <button onClick={() => placeBid(item)}>Bid +10</button>

              {isWinning && <p style={{ color: "lime" }}>Winning</p>}
              {isOutbid && <p style={{ color: "red" }}>Outbid</p>}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default App;
