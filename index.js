import express from "express";
import { Client, GatewayIntentBits, ActivityType } from "discord.js";

const app = express();
const PORT = process.env.PORT || 3000;

const client = new Client({
  intents: [GatewayIntentBits.Guilds]
});

const activities = [
  { name: "pmnx.pages.dev", type: ActivityType.Playing },
  { name: "phamminhnhat__", type: ActivityType.Watching },
  { name: "[ HEAVEN IS HERE ]", type: ActivityType.Listening },
  { name: "Discord.com", type: ActivityType.Playing }
];

let index = 0;

client.once("ready", () => {
  console.log("Bot online:", client.user.tag);

  client.user.setPresence({
    status: "online",
    activities: [activities[0]]
  });

  setInterval(() => {
    index = (index + 1) % activities.length;
    client.user.setPresence({
      status: "online",
      activities: [activities[index]]
    });
  }, 10000);
});

client.login(process.env.BOT_TOKEN);

/* ==== WEB PART (BẮT BUỘC) ==== */
app.get("/", (req, res) => {
  res.send("Bot is running");
});

app.listen(PORT, () => {
  console.log("Listening on port", PORT);
});

  setInterval(() => {
    index = (index + 1) % activities.length;

    client.user.setPresence({
      status: "idle", // online | idle | dnd
      activities: [activities[index]]
    });
  }, 10000);
});

client.login(process.env.BOT_TOKEN);

/* ===== BẮT BUỘC CHO RENDER ===== */
app.get("/", (req, res) => {
  res.send("Bot is running");
});

app.listen(PORT, () => {
  console.log("Listening on port", PORT);
});



