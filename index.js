import express from "express";
import { Client, GatewayIntentBits, ActivityType, REST, Routes, PermissionsBitField } from "discord.js";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

app.get("/", (req, res) => {
  res.send("Bot is running");
});

const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMembers]
});

/* ====== RPC / Activity ====== */
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

/* ====== SLASH COMMANDS ====== */
const commands = [
  {
    name: "say",
    description: "Bot nói thay bạn",
    options: [
      {
        name: "text",
        type: 3,
        description: "Nội dung",
        required: true
      }
    ]
  },
  {
    name: "kick",
    description: "Kick thành viên",
    options: [
      {
        name: "user",
        type: 6,
        description: "Người cần kick",
        required: true
      }
    ]
  },
  {
    name: "mute",
    description: "Mute (timeout) thành viên",
    options: [
      {
        name: "user",
        type: 6,
        description: "Người cần mute",
        required: true
      },
      {
        name: "minutes",
        type: 4,
        description: "Số phút mute",
        required: true
      }
    ]
  }
];

const rest = new REST({ version: "10" }).setToken(process.env.BOT_TOKEN);

(async () => {
  try {
    console.log("Đang đăng slash commands...");
    await rest.put(
      Routes.applicationCommands(process.env.CLIENT_ID),
      { body: commands }
    );
    console.log("Slash commands xong!");
  } catch (e) {
    console.error(e);
  }
})();

/* ====== COMMAND HANDLER ====== */
client.on("interactionCreate", async interaction => {
  if (!interaction.isChatInputCommand()) return;

  if (interaction.commandName === "say") {
    const text = interaction.options.getString("text");
    await interaction.reply(text);
  }

  if (interaction.commandName === "kick") {
    if (!interaction.member.permissions.has(PermissionsBitField.Flags.KickMembers))
      return interaction.reply({ content: "❌ Bạn không có quyền kick!", ephemeral: true });

    const user = interaction.options.getUser("user");
    const member = await interaction.guild.members.fetch(user.id);
    await member.kick();
    await interaction.reply(`✅ Đã kick ${user.tag}`);
  }

  if (interaction.commandName === "mute") {
    if (!interaction.member.permissions.has(PermissionsBitField.Flags.ModerateMembers))
      return interaction.reply({ content: "❌ Bạn không có quyền mute!", ephemeral: true });

    const user = interaction.options.getUser("user");
    const minutes = interaction.options.getInteger("minutes");
    const member = await interaction.guild.members.fetch(user.id);

    await member.timeout(minutes * 60 * 1000);
    await interaction.reply(`🔇 Đã mute ${user.tag} trong ${minutes} phút`);
  }
});

client.login(process.env.BOT_TOKEN);

app.listen(PORT,
