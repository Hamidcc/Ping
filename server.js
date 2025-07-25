import express from "express";
import axios from "axios";

const app = express();
app.use(express.json());

const WEBHOOK_URL = "https://discord.com/api/webhooks/1398440004140798044/aiEiUZu9CtUX0zPIjBvfwdihTvzK7u-hjJK_MVddaKdzOruD6rpbUTNrV_5uTR-rnMmA";

app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*"); // allow any origin
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  next();
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

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Listening on ${PORT}`);
});
