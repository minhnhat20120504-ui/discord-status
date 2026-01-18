import express from "express";
import { Client, GatewayIntentBits, ActivityType } from "discord.js";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

// ===== DISCORD BOT =====
const client = new Client({
  intents: [GatewayIntentBits.Guilds]
});

const activities = [
  { name: "pmnx.pages.dev", type: ActivityType.Playing },
  { name: "phamminhnhat__", type: ActivityType.Watching },
  { name: "[ HEAVEN IS HERE ]", type: ActivityType.Listening },
  { name: "Pham Minh Nhat", type: ActivityType.Playing }
];

const thoughts = [
  "pmnx.pages.dev",
  "Join Our Server!",
  "dc:phamminhnhat__",
  
];

let activityIndex = 0;

client.once("ready", () => {
  console.log("Bot online:", client.user.tag);

  // ⏱ Đổi ACTIVITY mỗi 1s
  setInterval(() => {
    activityIndex = (activityIndex + 1) % activities.length;

    client.user.setPresence({
      status: "online",
      activities: [activities[activityIndex]]
    });
  }, 1000);

  // 💭 Đổi THOUGHT mỗi 4s
  setInterval(() => {
    const thought = thoughts[Math.floor(Math.random() * thoughts.length)];

    client.user.setPresence({
      status: "online",
      activities: [
        activities[activityIndex],
        { name: thought, type: ActivityType.Custom }
      ]
    });
  }, 7000);
});

client.login(process.env.BOT_TOKEN);

app.listen(PORT, () => {
  console.log("Server running on port", PORT);
});
