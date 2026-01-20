import express from "express";
import {
  Client,
  GatewayIntentBits,
  REST,
  Routes,
  SlashCommandBuilder,
  PermissionFlagsBits,
  EmbedBuilder
} from "discord.js";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

// ================== DISCORD BOT ==================
const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMembers]
});

// ================== SLASH COMMANDS ==================
const commands = [
  // /help
  new SlashCommandBuilder()
    .setName("help")
    .setDescription("📜 Xem danh sách lệnh của bot"),

  // /ping
  new SlashCommandBuilder()
    .setName("ping")
    .setDescription("🏓 Kiểm tra độ trễ bot"),

  // /say
  new SlashCommandBuilder()
    .setName("say")
    .setDescription("💬 Bot nói thay bạn")
    .addStringOption(o =>
      o.setName("message")
        .setDescription("Nội dung cần bot nói")
        .setRequired(true)
    ),

  // /kick
  new SlashCommandBuilder()
    .setName("kick")
    .setDescription("👢 Kick thành viên")
    .addUserOption(o =>
      o.setName("user")
        .setDescription("Người cần kick")
        .setRequired(true)
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.KickMembers),

  // /mute (timeout)
  new SlashCommandBuilder()
    .setName("mute")
    .setDescription("🔇 Mute (timeout) thành viên")
    .addUserOption(o =>
      o.setName("user")
        .setDescription("Người cần mute")
        .setRequired(true)
    )
    .addIntegerOption(o =>
      o.setName("minutes")
        .setDescription("Số phút mute")
        .setRequired(true)
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers),

  // /ban
  new SlashCommandBuilder()
    .setName("ban")
    .setDescription("🔨 Ban thành viên")
    .addUserOption(o =>
      o.setName("user")
        .setDescription("Người cần ban")
        .setRequired(true)
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers),

  // /clear
  new SlashCommandBuilder()
    .setName("clear")
    .setDescription("🧹 Xoá nhiều tin nhắn")
    .addIntegerOption(o =>
      o.setName("amount")
        .setDescription("Số tin nhắn cần xoá (1-100)")
        .setRequired(true)
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages)
].map(cmd => cmd.toJSON());

// ================== REGISTER COMMANDS ==================
const rest = new REST({ version: "10" }).setToken(process.env.BOT_TOKEN);

(async () => {
  try {
    console.log("🔁 Đang đăng slash commands...");
    await rest.put(
      Routes.applicationCommands(process.env.CLIENT_ID),
      { body: commands }
    );
    console.log("✅ Đăng lệnh thành công!");
  } catch (e) {
    console.error("❌ Lỗi đăng lệnh:", e);
  }
})();

// ================== BOT READY ==================
client.once("ready", () => {
  console.log("🤖 Bot online:", client.user.tag);
});

// ================== INTERACTIONS ==================
client.on("interactionCreate", async interaction => {
  if (!interaction.isChatInputCommand()) return;

  const { commandName } = interaction;

  // ===== /help =====
  if (commandName === "help") {
    const embed = new EmbedBuilder()
      .setColor("#5865F2")
      .setTitle("📜 Danh sách lệnh")
      .setDescription(`
**/help** → Hiển thị bảng trợ giúp  
**/ping** → Kiểm tra độ trễ bot  
**/say** → Bot nói thay bạn  
**/kick** → Kick thành viên  
**/mute** → Mute (timeout) thành viên  
**/ban** → Ban thành viên  
**/clear** → Xoá nhiều tin nhắn  

━━━━━━━━━━━━━━━
🔗 **Support server:**  
https://discord.gg/P9yeTvwKjB

👑 **Người làm bot:**  
phamminhnhat__

🌐 **Website:**  
https://pmnx.pages.dev
      `)
      .setFooter({ text: "Pham Minh Nhat Bot" })
      .setTimestamp();

    return interaction.reply({ embeds: [embed] });
  }

  // ===== /ping =====
  if (commandName === "ping") {
    return interaction.reply(`🏓 Pong! Latency: ${client.ws.ping}ms`);
  }

  // ===== /say =====
  if (commandName === "say") {
    const msg = interaction.options.getString("message");
    return interaction.reply({ content: msg });
  }

  // ===== /kick =====
  if (commandName === "kick") {
    const user = interaction.options.getUser("user");
    const member = await interaction.guild.members.fetch(user.id);

    await member.kick();
    return interaction.reply(`👢 Đã kick **${user.tag}**`);
  }

  // ===== /mute =====
  if (commandName === "mute") {
    const user = interaction.options.getUser("user");
    const minutes = interaction.options.getInteger("minutes");
    const member = await interaction.guild.members.fetch(user.id);

    await member.timeout(minutes * 60 * 1000);
    return interaction.reply(`🔇 Đã mute **${user.tag}** trong ${minutes} phút`);
  }

  // ===== /ban =====
  if (commandName === "ban") {
    const user = interaction.options.getUser("user");
    const member = await interaction.guild.members.fetch(user.id);

    await member.ban();
    return interaction.reply(`🔨 Đã ban **${user.tag}**`);
  }

  // ===== /clear =====
  if (commandName === "clear") {
    const amount = interaction.options.getInteger("amount");

    if (amount < 1 || amount > 100)
      return interaction.reply({ content: "❌ Chỉ được xoá từ 1 đến 100 tin nhắn!", ephemeral: true });

    await interaction.channel.bulkDelete(amount, true);
    return interaction.reply({ content: `🧹 Đã xoá ${amount} tin nhắn`, ephemeral: true });
  }
});

// ================== LOGIN ==================
client.login(process.env.BOT_TOKEN);

// ================== WEB ==================
app.listen(PORT, () => {
  console.log("🌐 Server running on port", PORT);
});
