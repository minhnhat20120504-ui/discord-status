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
