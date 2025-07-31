import express from "express";
import axios from "axios";
import cors from "cors";

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(cors());

const WEBHOOK_URL = "https://discord.com/api/webhooks/1398440004140798044/aiEiUZu9CtUX0zPIjBvfwdihTvzK7u-hjJK_MVddaKdzOruD6rpbUTNrV_5uTR-rnMmA";
const WEBHOOK_URL2 = "https://discord.com/api/webhooks/1398440004140798044/aiEiUZu9CtUX0zPIjBvfwdihTvzK7u-hjJK_MVddaKdzOruD6rpbUTNrV_5uTR-rnMmA";

// CORS headers (optional if using `cors()` middleware)
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  next();
});

// POST /player-joined → Discord embed webhook
app.post("/player-joined1", async (req, res) => {
  const { username, userid, joinTime } = req.body;

  const avatarURL = `https://www.roblox.com/headshot-thumbnail/image?userId=${userid}&width=150&height=150&format=png`;

  const embed = {
    embeds: [
      {
        title: `🎮 ${username} joined the Hiking Game`,
        thumbnail: { url: avatarURL },
        fields: [
          { name: "Username", value: `[${username}](https://www.roblox.com/users/${userid}/profile)`, inline: true },
          { name: "User ID", value: userid.toString(), inline: true },
          { name: "Time", value: joinTime, inline: false }
        ],
        color: 0x00ff00,
        timestamp: new Date().toISOString()
      }
    ]
  };

  try {
    await axios.post(WEBHOOK_URL, embed);
    res.status(200).send("Ping sent.");
  } catch (err) {
    res.status(500).send("Error sending to Discord.");
  }
});

app.post("/player-joined", async (req, res) => {
  const { username, userid, joinTime } = req.body;

  const avatarURL = `https://www.roblox.com/headshot-thumbnail/image?userId=${userid}&width=150&height=150&format=png`;

  const embed = {
    embeds: [
      {
        title: `🎮 ${username} joined the game`,
        thumbnail: { url: avatarURL },
        fields: [
          { name: "Username", value: `[${username}](https://www.roblox.com/users/${userid}/profile)`, inline: true },
          { name: "User ID", value: userid.toString(), inline: true },
          { name: "Time", value: joinTime, inline: false }
        ],
        color: 0x00ff00,
        timestamp: new Date().toISOString()
      }
    ]
  };

  try {
    await axios.post(WEBHOOK_URL, embed);
    res.status(200).send("Ping sent.");
  } catch (err) {
    res.status(500).send("Error sending to Discord.");
  }
});

app.get("/get-gamepass", async (req, res) => {
  const userId = req.query.userId;
  if (!userId) return res.status(400).json({ error: "Missing userId" });

  try {
    const gamepasses = await axios.get(`https://catalog.roblox.com/v1/search/items?category=GamePass&limit=30&creatorType=User&creatorTargetId=${userId}`);
    
    const simplified = gamepasses.data.data.map(gp => ({
      id: gp.id,
      name: gp.name,
      price: gp.price,
    }));

    res.json({ gamepasses: simplified });
  } catch (err) {
    const code = err.response?.status || 500;
    res.status(code).json({ error: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
