import express from "express";
import {
  Client,
  GatewayIntentBits,
  REST,
  Routes,
  SlashCommandBuilder,
  PermissionFlagsBits
} from "discord.js";
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

/* ====== SLASH COMMANDS ====== */
const commands = [
  new SlashCommandBuilder()
    .setName("ping")
    .setDescription("Check bot ping"),

  new SlashCommandBuilder()
    .setName("say")
    .setDescription("Bot nói thay bạn")
    .addStringOption(opt =>
      opt.setName("text").setDescription("Nội dung").setRequired(true)
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

  new SlashCommandBuilder()
    .setName("kick")
    .setDescription("Kick thành viên")
    .addUserOption(opt =>
      opt.setName("user").setDescription("Người cần kick").setRequired(true)
    )
    .addStringOption(opt =>
      opt.setName("reason").setDescription("Lý do")
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.KickMembers),

  new SlashCommandBuilder()
    .setName("mute")
    .setDescription("Mute (timeout) thành viên")
    .addUserOption(opt =>
      opt.setName("user").setDescription("Người cần mute").setRequired(true)
    )
    .addIntegerOption(opt =>
      opt.setName("minutes").setDescription("Số phút").setRequired(true)
    )
    .addStringOption(opt =>
      opt.setName("reason").setDescription("Lý do")
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers),

  new SlashCommandBuilder()
    .setName("unmute")
    .setDescription("Gỡ mute")
    .addUserOption(opt =>
      opt.setName("user").setDescription("Người cần unmute").setRequired(true)
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers)
].map(c => c.toJSON());

/* ====== REGISTER COMMANDS ====== */
const rest = new REST({ version: "10" }).setToken(process.env.BOT_TOKEN);

async function registerCommands() {
  try {
    console.log("⏳ Đang đăng lệnh...");
    await rest.put(
      Routes.applicationCommands(process.env.CLIENT_ID),
      { body: commands }
    );
    console.log("✅ Đăng lệnh thành công!");
  } catch (e) {
    console.error(e);
  }
}

/* ====== BOT READY ====== */
client.once("ready", () => {
  console.log("🤖 Bot online:", client.user.tag);
  registerCommands();
});

/* ====== INTERACTIONS ====== */
client.on("interactionCreate", async interaction => {
  if (!interaction.isChatInputCommand()) return;

  const { commandName } = interaction;

  if (commandName === "ping") {
    return interaction.reply(`🏓 Pong! ${client.ws.ping}ms`);
  }

  if (commandName === "say") {
    const text = interaction.options.getString("text");
    return interaction.reply({ content: text });
  }

  if (commandName === "kick") {
    const user = interaction.options.getUser("user");
    const reason = interaction.options.getString("reason") || "No reason";

    const member = await interaction.guild.members.fetch(user.id);
    await member.kick(reason);

    return interaction.reply(`👢 Đã kick ${user.tag}`);
  }

  if (commandName === "mute") {
    const user = interaction.options.getUser("user");
    const minutes = interaction.options.getInteger("minutes");
    const reason = interaction.options.getString("reason") || "No reason";

    const member = await interaction.guild.members.fetch(user.id);
    await member.timeout(minutes * 60 * 1000, reason);

    return interaction.reply(`🔇 Đã mute ${user.tag} trong ${minutes} phút`);
  }

  if (commandName === "unmute") {
    const user = interaction.options.getUser("user");

    const member = await interaction.guild.members.fetch(user.id);
    await member.timeout(null);

    return interaction.reply(`🔊 Đã unmute ${user.tag}`);
  }
});

/* ====== LOGIN ====== */
client.login(process.env.BOT_TOKEN);

app.listen(PORT, () => {
  console.log("🌐 Web running on port", PORT);
});
