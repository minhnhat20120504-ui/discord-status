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
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers
  ]
});

// ================== CONFIG ==================
// 👉 Điền ROLE ID bạn muốn auto cấp ở đây
const AUTO_ROLE_ID = "1407180885224325150";

// ================== SLASH COMMANDS ==================
const commands = [
  new SlashCommandBuilder().setName("help").setDescription("📜 Danh sách lệnh"),
  new SlashCommandBuilder().setName("ping").setDescription("🏓 Kiểm tra ping bot"),

  new SlashCommandBuilder()
    .setName("say")
    .setDescription("💬 Bot nói thay bạn")
    .addStringOption(o =>
      o.setName("message").setDescription("Nội dung").setRequired(true)
    ),

  new SlashCommandBuilder()
    .setName("kick")
    .setDescription("👢 Kick thành viên")
    .addUserOption(o =>
      o.setName("user").setDescription("Người cần kick").setRequired(true)
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.KickMembers),

  new SlashCommandBuilder()
    .setName("mute")
    .setDescription("🔇 Timeout thành viên")
    .addUserOption(o =>
      o.setName("user").setDescription("Người cần mute").setRequired(true)
    )
    .addIntegerOption(o =>
      o.setName("minutes").setDescription("Số phút").setRequired(true)
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers),

  new SlashCommandBuilder()
    .setName("ban")
    .setDescription("🔨 Ban thành viên")
    .addUserOption(o =>
      o.setName("user").setDescription("Người cần ban").setRequired(true)
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers),

  new SlashCommandBuilder()
    .setName("clear")
    .setDescription("🧹 Xoá nhiều tin nhắn")
    .addIntegerOption(o =>
      o.setName("amount").setDescription("1-100").setRequired(true)
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages),

  // ===== NEW =====
  new SlashCommandBuilder()
    .setName("serverinfo")
    .setDescription("📊 Thông tin server"),

  new SlashCommandBuilder()
    .setName("userinfo")
    .setDescription("👤 Thông tin user")
    .addUserOption(o =>
      o.setName("user").setDescription("Người cần xem").setRequired(false)
    )
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

// ================== AUTO ROLE ==================
client.on("guildMemberAdd", async member => {
  try {
    const role = member.guild.roles.cache.get(AUTO_ROLE_ID);
    if (!role) return;
    await member.roles.add(role);
    console.log(`✅ Đã cấp role cho ${member.user.tag}`);
  } catch (err) {
    console.error("❌ Lỗi auto role:", err);
  }
});

// ================== INTERACTIONS ==================
client.on("interactionCreate", async interaction => {
  if (!interaction.isChatInputCommand()) return;
  const { commandName } = interaction;

  if (commandName === "help") {
    const embed = new EmbedBuilder()
      .setColor("#5865F2")
      .setTitle("📜 Danh sách lệnh")
      .setDescription(`
**/help** → Danh sách lệnh
**/ping** → Ping bot
**/say** → Bot nói
**/kick** → Kick
**/mute** → Mute
**/ban** → Ban
**/clear** → Xoá chat

📊 **/serverinfo**
👤 **/userinfo**
      `)
      .setFooter({ text: "Pham Minh Nhat Bot" })
      .setTimestamp();

    return interaction.reply({ embeds: [embed] });
  }

  if (commandName === "ping") {
    return interaction.reply(`🏓 Pong! ${client.ws.ping}ms`);
  }

  if (commandName === "say") {
    const msg = interaction.options.getString("message");
    return interaction.reply({ content: msg });
  }

  if (commandName === "kick") {
    const user = interaction.options.getUser("user");
    const member = await interaction.guild.members.fetch(user.id);
    await member.kick();
    return interaction.reply(`👢 Đã kick **${user.tag}**`);
  }

  if (commandName === "mute") {
    const user = interaction.options.getUser("user");
    const minutes = interaction.options.getInteger("minutes");
    const member = await interaction.guild.members.fetch(user.id);
    await member.timeout(minutes * 60 * 1000);
    return interaction.reply(`🔇 Đã mute **${user.tag}** trong ${minutes} phút`);
  }

  if (commandName === "ban") {
    const user = interaction.options.getUser("user");
    const member = await interaction.guild.members.fetch(user.id);
    await member.ban();
    return interaction.reply(`🔨 Đã ban **${user.tag}**`);
  }

  if (commandName === "clear") {
    const amount = interaction.options.getInteger("amount");
    if (amount < 1 || amount > 100)
      return interaction.reply({ content: "❌ Chỉ được xoá từ 1 đến 100!", ephemeral: true });

    await interaction.channel.bulkDelete(amount, true);
    return interaction.reply({ content: `🧹 Đã xoá ${amount} tin nhắn`, ephemeral: true });
  }

  // ===== SERVER INFO =====
  if (commandName === "serverinfo") {
    const guild = interaction.guild;
    const members = await guild.members.fetch();
    const humanCount = members.filter(m => !m.user.bot).size;

    const embed = new EmbedBuilder()
      .setColor("#00FFAA")
      .setTitle(`📊 Thông tin server: ${guild.name}`)
      .setThumbnail(guild.iconURL({ dynamic: true }))
      .addFields(
        { name: "📅 Ngày tạo", value: `<t:${Math.floor(guild.createdTimestamp / 1000)}:F>` },
        { name: "👥 Thành viên (không bot)", value: `${humanCount}` }
      )
      .setFooter({ text: "Pham Minh Nhat Bot" })
      .setTimestamp();

    return interaction.reply({ embeds: [embed] });
  }

  // ===== USER INFO =====
  if (commandName === "userinfo") {
    const user = interaction.options.getUser("user") || interaction.user;
    const member = await interaction.guild.members.fetch(user.id);

    const embed = new EmbedBuilder()
      .setColor("#00BFFF")
      .setTitle("👤 Thông tin người dùng")
      .setThumbnail(user.displayAvatarURL({ dynamic: true }))
      .addFields(
        { name: "Tên", value: user.tag, inline: true },
        { name: "ID", value: user.id, inline: true },
        { name: "Ngày tạo", value: `<t:${Math.floor(user.createdTimestamp / 1000)}:R>` },
        { name: "Ngày vào server", value: `<t:${Math.floor(member.joinedTimestamp / 1000)}:R>` }
      )
      .setFooter({ text: "Pham Minh Nhat Bot" })
      .setTimestamp();

    return interaction.reply({ embeds: [embed] });
  }
});

// ================== LOGIN ==================
client.login(process.env.BOT_TOKEN);

// ================== WEB ==================
app.listen(PORT, () => {
  console.log("🌐 Server running on port", PORT);
});
