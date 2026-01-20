import express from "express";
import {
  Client,
  GatewayIntentBits,
  ActivityType,
  REST,
  Routes,
  SlashCommandBuilder,
  PermissionFlagsBits
} from "discord.js";
import path from "path";
import { fileURLToPath } from "url";

/* ===== Setup ===== */
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(path.dirname(__filename));
const app = express();
const PORT = process.env.PORT || 3000;

app.get("/", (req, res) => {
  res.send("Bot is running 🚀");
});

/* ===== Discord Client ===== */
const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMembers]
});

/* ===== Status + Thought ===== */
const activities = [
  { name: "pmnx.pages.dev", type: ActivityType.Playing },
  { name: "phamminhnhat__", type: ActivityType.Watching },
  { name: "[ HEAVEN IS HERE ]", type: ActivityType.Listening },
  { name: "Pham Minh Nhat", type: ActivityType.Playing }
];

const thoughts = [
  "Thinking about life...",
  "Watching the universe 🌌",
  "Coding something cool 💻",
  "Dreaming big ✨"
];

let activityIndex = 0;
let thoughtIndex = 0;
let currentActivity = activities[0];
let currentThought = thoughts[0];
let startTime = Date.now();

/* ===== Presence Update ===== */
function updatePresence() {
  client.user.setPresence({
    status: "online",
    activities: [
      currentActivity,
      { name: currentThought, type: ActivityType.Custom }
    ]
  });
}

/* ===== Slash Commands ===== */
const commands = [
  new SlashCommandBuilder()
    .setName("say")
    .setDescription("Bot nói thay bạn")
    .addStringOption(opt =>
      opt.setName("text").setDescription("Nội dung").setRequired(true)
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages),

  new SlashCommandBuilder()
    .setName("kick")
    .setDescription("Kick thành viên")
    .addUserOption(opt =>
      opt.setName("user").setDescription("Người bị kick").setRequired(true)
    )
    .setReasonable
    .setDefaultMemberPermissions(PermissionFlagsBits.KickMembers),

  new SlashCommandBuilder()
    .setName("mute")
    .setDescription("Mute (timeout) thành viên")
    .addUserOption(opt =>
      opt.setName("user").setDescription("Người bị mute").setRequired(true)
    )
    .addIntegerOption(opt =>
      opt
        .setName("minutes")
        .setDescription("Số phút mute")
        .setRequired(true)
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers)
].map(cmd => cmd.toJSON());

/* ===== Register Commands ===== */
const rest = new REST({ version: "10" }).setToken(process.env.BOT_TOKEN);

async function registerCommands() {
  await rest.put(
    Routes.applicationCommands(process.env.CLIENT_ID),
    { body: commands }
  );
  console.log("Admin commands registered");
}

/* ===== Ready ===== */
client.once("ready", async () => {
  console.log("Bot online:", client.user.tag);
  await registerCommands();
  updatePresence();
});

/* ===== Interaction Handler ===== */
client.on("interactionCreate", async interaction => {
  if (!interaction.isChatInputCommand()) return;

  const cmd = interaction.commandName;

  /* ---- SAY ---- */
  if (cmd === "say") {
    const text = interaction.options.getString("text");
    await interaction.reply({ content: "✅ Sent!", ephemeral: true });
    return interaction.channel.send(text);
  }

  /* ---- KICK ---- */
  if (cmd === "kick") {
    const user = interaction.options.getUser("user");
    const member = await interaction.guild.members.fetch(user.id);

    if (!member.kickable)
      return interaction.reply({
        content: "❌ Không thể kick người này",
        ephemeral: true
      });

    await member.kick();
    return interaction.reply(`👢 Đã kick **${user.tag}**`);
  }

  /* ---- MUTE ---- */
  if (cmd === "mute") {
    const user = interaction.options.getUser("user");
    const minutes = interaction.options.getInteger("minutes");
    const member = await interaction.guild.members.fetch(user.id);

    if (!member.moderatable)
      return interaction.reply({
        content: "❌ Không thể mute người này",
        ephemeral: true
      });

    await member.timeout(minutes * 60 * 1000);
    return interaction.reply(
      `🔇 Đã mute **${user.tag}** trong ${minutes} phút`
    );
  }
});

/* ===== Login + Web ===== */
client.login(process.env.BOT_TOKEN);
app.listen(PORT, () => console.log("Server running on port", PORT));
