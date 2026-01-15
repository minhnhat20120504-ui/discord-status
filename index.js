import express from "express";
import { Client, GatewayIntentBits } from "discord.js";

const app = express();

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildPresences
  ]
});
import express from "express";
import { Client, GatewayIntentBits } from "package.js";

const app = express();

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds
  ]
});

client.once("ready", () => {
  console.log(`Bot online: ${client.user.tag}`);

  // ===== FAKE RPC / PRESENCE =====
  const activities = [
    { name: "pmnx.pages.dev", type: 0 }, // Playing
    { name: "[ HEAVEN IS HERE ]", type: 0 },
    { name: "Listening Spotify", type: 2 },      // Listening
    { name: "Watching Anime", type: 3 }           // Watching
  ];

  let i = 0;
  setInterval(() => {
    client.user.setPresence({
      status: "online",
      activities: [activities[i]]
    });
    i = (i + 1) % activities.length;
  }, 10000); // đổi mỗi 10 giây
});

// ===== EXPRESS (GIỮ NGUYÊN) =====
app.get("/", (req, res) => {
  res.send("Bot is running");
});

client.login(process.env.BOT_TOKEN);
app.listen(3000);

// LẤY TỪ ENV (KHÔNG VIẾT TRỰC TIẾP)
const BOT_TOKEN = process.env.BOT_TOKEN;
const GUILD_ID  = process.env.GUILD_ID;
const USER_ID   = process.env.USER_ID;

if (!BOT_TOKEN || !GUILD_ID || !USER_ID) {
  console.error("❌ Missing env vars");
  process.exit(1);
}

client.login(BOT_TOKEN);

app.get("/discord-status", async (req, res) => {
  try {
    const guild = await client.guilds.fetch(GUILD_ID);
    const member = await guild.members.fetch(USER_ID);

    res.json({
      username: member.user.username,
      avatar: member.user.displayAvatarURL({ size: 256 }),
      status: member.presence?.status || "offline",
      activities: member.presence?.activities || []
    });
  } catch (e) {
    res.status(500).json({ error: "Failed" });
  }
});

app.listen(3000, () => console.log("Server running"));



