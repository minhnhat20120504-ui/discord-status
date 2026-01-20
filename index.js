import express from "express";
import {
  Client,
  GatewayIntentBits,
  ActivityType,
  REST,
  Routes,
  SlashCommandBuilder
} from "discord.js";

const app = express();
const PORT = process.env.PORT || 3000;

app.get("/", (req, res) => res.send("Bot is running 🚀"));

const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMembers]
});

/* ===== STATUS ===== */
const activities = [
  { name: "pmnx.pages.dev", type: ActivityType.Playing },
  { name: "phamminhnhat__", type: ActivityType.Watching },
  { name: "[ HEAVEN IS HERE ]", type: ActivityType.Listening },
  { name: "Pham Minh Nhat", type: ActivityType.Playing }
];

let i = 0;

function updatePresence() {
  client.user.setPresence({
    status: "online",
    activities: [activities[i]]
  });
}

/* ===== COMMANDS ===== */
const commands = [
  new SlashCommandBuilder()
    .setName("say")
    .setDescription("Bot nói thay bạn")
    .addStringOption(o =>
      o.setName("text").setDescription("Nội dung").setRequired(true)
    ),

  new SlashCommandBuilder()
    .setName("kick")
    .setDescription("Kick thành viên")
    .addUserOption(o =>
      o.setName("user").setDescription("Người bị kick").setRequired(true)
    ),

  new SlashCommandBuilder()
    .setName("mute")
    .setDescription("Mute thành viên")
    .addUserOption(o =>
      o.setName("user").setDescription("Người bị mute").setRequired(true)
    )
    .addIntegerOption(o =>
      o.setName("minutes").setDescription("Số phút").setRequired(true)
    )
].map(c => c.toJSON());

const rest = new REST({ version: "10" }).setToken(process.env.BOT_TOKEN);

async function registerCommands() {
  await rest.put(
    Routes.applicationCommands(process.env.CLIENT_ID),
    { body: commands }
  );
  console.log("Slash commands registered");
}

/* ===== READY ===== */
client.once("ready", async () => {
  console.log("Bot online:", client.user.tag);
  await registerCommands();
  updatePresence();

  setInterval(() => {
    i = (i + 1) % activities.length;
    updatePresence();
  }, 5000);
});

/* ===== COMMAND HANDLER ===== */
client.on("interactionCreate", async interaction => {
  if (!interaction.isChatInputCommand()) return;

  const cmd = interaction.commandName;

  if (cmd === "say") {
    const text = interaction.options.getString("text");
    await interaction.reply({ content: "✅ Sent", ephemeral: true });
    return interaction.channel.send(text);
  }

  if (cmd === "kick") {
    if (!interaction.member.permissions.has("KickMembers"))
      return interaction.reply({ content: "❌ Bạn không có quyền kick", ephemeral: true });

    const user = interaction.options.getUser("user");
    const member = await interaction.guild.members.fetch(user.id);
    await member.kick();
    return interaction.reply(`👢 Đã kick ${user.tag}`);
  }

  if (cmd === "mute") {
    if (!interaction.member.permissions.has("ModerateMembers"))
      return interaction.reply({ content: "❌ Bạn không có quyền mute", ephemeral: true });

    const user = interaction.options.getUser("user");
    const minutes = interaction.options.getInteger("minutes");
    const member = await interaction.guild.members.fetch(user.id);
    await member.timeout(minutes * 60 * 1000);
    return interaction.reply(`🔇 Đã mute ${user.tag} ${minutes} phút`);
  }
});

/* ===== START ===== */
client.login(process.env.BOT_TOKEN);
app.listen(PORT, () => console.log("Web running on", PORT));
