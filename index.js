import express from "express";
import { Client, GatewayIntentBits, ActivityType, PermissionsBitField } from "discord.js";

const app = express();
const PORT = process.env.PORT || 3000;

app.get("/", (req, res) => res.send("Bot is running"));
app.listen(PORT, () => console.log("Web alive on", PORT));

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMembers
  ]
});

/* ===== STATUS ROTATE ===== */
const activities = [
  { name: "pmnx.pages.dev", type: ActivityType.Playing },
  { name: "phamminhnhat__", type: ActivityType.Watching },
  { name: "[ HEAVEN IS HERE ]", type: ActivityType.Listening },
  { name: "Pham Minh Nhat", type: ActivityType.Playing }
];

let i = 0;
client.once("ready", () => {
  console.log("Bot online:", client.user.tag);

  setInterval(() => {
    i = (i + 1) % activities.length;
    client.user.setPresence({
      status: "online",
      activities: [activities[i]]
    });
  }, 5000);
});

/* ===== COMMANDS ===== */
const PREFIX = "!";

client.on("messageCreate", async msg => {
  if (msg.author.bot || !msg.content.startsWith(PREFIX)) return;

  const args = msg.content.slice(PREFIX.length).trim().split(/ +/);
  const cmd = args.shift().toLowerCase();

  if (cmd === "say") {
    return msg.channel.send(args.join(" "));
  }

  if (cmd === "kick") {
    if (!msg.member.permissions.has(PermissionsBitField.Flags.KickMembers))
      return msg.reply("❌ Bạn không có quyền kick");

    const member = msg.mentions.members.first();
    if (!member) return msg.reply("❌ Tag người cần kick");

    await member.kick();
    msg.channel.send(`✅ Đã kick ${member.user.tag}`);
  }

  if (cmd === "mute") {
    if (!msg.member.permissions.has(PermissionsBitField.Flags.ModerateMembers))
      return msg.reply("❌ Bạn không có quyền mute");

    const member = msg.mentions.members.first();
    const minutes = parseInt(args[1]);
    if (!member || !minutes) return msg.reply("❌ Dùng: !mute @user 5");

    await member.timeout(minutes * 60 * 1000);
    msg.channel.send(`🔇 Đã mute ${member.user.tag} trong ${minutes} phút`);
  }
});

client.login(process.env.BOT_TOKEN);
