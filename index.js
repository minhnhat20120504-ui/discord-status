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

const client = new Client({
  intents: [GatewayIntentBits.Guilds]
});

const activities = [
  { name: "pmnx.pages.dev", type: ActivityType.Playing },
  { name: "phamminhnhat__", type: ActivityType.Watching },
  { name: "[ HEAVEN IS HERE ]", type: ActivityType.Listening },
  { name: "Pham Minh Nhat", type: ActivityType.Playing }
];


client.once("ready", () => {
  console.log("Bot online:", client.user.tag);

  // Activity mỗi 4s
  setInterval(() => {
    activityIndex = (activityIndex + 1) % activities.length;
    updatePresence();
  }, 4000);

 
client.login(process.env.BOT_TOKEN);

app.listen(PORT, () => {
  console.log("Server running on port", PORT);
});
