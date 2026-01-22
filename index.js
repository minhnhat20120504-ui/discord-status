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
import fs from "fs";

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

// ================== AUTO ROLE STORAGE ==================
const dataFile = "./autorole.json";
if (!fs.existsSync(dataFile)) fs.writeFileSync(dataFile, "{}");
const autoRoles = JSON.parse(fs.readFileSync(dataFile, "utf8"));

function saveAutoRoles() {
  fs.writeFileSync(dataFile, JSON.stringify(autoRoles, null, 2));
}

// ================== SLASH COMMANDS ==================
const commands = [
  new SlashCommandBuilder().setName("help").setDescription("📜 Danh sách lệnh"),
  new SlashCommandBuilder().setName("ping").setDescription("🏓 Ping bot"),

  new SlashCommandBuilder()
    .setName("say")
    .setDescription("💬 Bot nói")
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
    .setDescription("🧹 Xoá chat")
    .addIntegerOption(o =>
      o.setName("amount").setDescription("1-100").setRequired(true)
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages),

  new SlashCommandBuilder()
    .setName("serverinfo")
    .setDescription("📊 Thông tin server"),

  new SlashCommandBuilder()
    .setName("autorole")
    .setDescription("🎭 Tự động cấp role cho member mới")
    .addRoleOption(o =>
      o.setName("role").setDescription("Role muốn auto cấp").setRequired(false)
    )
    .addStringOption(o =>
      o.setName("mode")
        .setDescription("Tắt auto role")
        .setRequired(false)
        .addChoices({ name: "off", value: "off" })
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageRoles),

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
    console.log("🧹 Đang xoá lệnh cũ...");
    await rest.put(Routes.applicationCommands(process.env.CLIENT_ID), { body: [] });

    console.log("📤 Đang đăng slash commands mới...");
    await rest.put(Routes.applicationCommands(process.env.CLIENT_ID), {
      body: commands
    });

    console.log("✅ Slash commands đã đăng xong!");
  } catch (e) {
    console.error("❌ Lỗi đăng lệnh:", e);
  }
})();

// ================== BOT READY ==================
client.once("ready", () => {
  console.log("🤖 Bot online:", client.user.tag);
});

// ================== AUTO ROLE EVENT ==================
client.on("guildMemberAdd", async member => {
  const roleId = autoRoles[member.guild.id];
  if (!roleId) return;

  try {
    const role = member.guild.roles.cache.get(roleId);
    if (role) await member.roles.add(role);
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
**/help**
**/ping**
**/say**
**/kick**
**/mute**
**/ban**
**/clear**

📊 **/serverinfo**
🎭 **/autorole**
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

  if (commandName === "serverinfo") {
    const guild = interaction.guild;
    const members = await guild.members.fetch();
    const humans = members.filter(m => !m.user.bot).size;

    const embed = new EmbedBuilder()
      .setColor("#00FFAA")
      .setTitle(`📊 ${guild.name}`)
      .setThumbnail(guild.iconURL({ dynamic: true }))
      .addFields(
        { name: "📅 Ngày tạo", value: `<t:${Math.floor(guild.createdTimestamp / 1000)}:F>` },
        { name: "👥 Thành viên (không bot)", value: `${humans}` }
      )
      .setFooter({ text: "Pham Minh Nhat Bot" })
      .setTimestamp();

    return interaction.reply({ embeds: [embed] });
  }

  if (commandName === "autorole") {
    const role = interaction.options.getRole("role");
    const mode = interaction.options.getString("mode");
    const guildId = interaction.guild.id;

    if (mode === "off") {
      delete autoRoles[guildId];
      saveAutoRoles();
      return interaction.reply("❌ Đã tắt auto role cho server này.");
    }

    if (!role)
      return interaction.reply({ content: "❌ Dùng: `/autorole @role` hoặc `/autorole off`", ephemeral: true });

    autoRoles[guildId] = role.id;
    saveAutoRoles();
    return interaction.reply(`✅ Auto role đã set thành: **${role.name}**`);
  }

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
