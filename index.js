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

import { DisTube } from "distube";
import { SpotifyPlugin } from "@distube/spotify";
import { SoundCloudPlugin } from "@distube/soundcloud";
import { YtDlpPlugin } from "@distube/yt-dlp";

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
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildVoiceStates
  ]
});

// ================== MUSIC SYSTEM ==================
const distube = new DisTube(client, {
  emitNewSongOnly: true,
  leaveOnStop: true,
  leaveOnEmpty: true,
  plugins: [
    new SpotifyPlugin({ emitEventsAfterFetching: true }),
    new SoundCloudPlugin(),
    new YtDlpPlugin()
  ]
});

// ================== SLASH COMMANDS ==================
const commands = [
  new SlashCommandBuilder().setName("help").setDescription("📜 Xem danh sách lệnh"),

  new SlashCommandBuilder().setName("ping").setDescription("🏓 Kiểm tra độ trễ bot"),

  new SlashCommandBuilder()
    .setName("say")
    .setDescription("💬 Bot nói thay bạn")
    .addStringOption(o =>
      o.setName("message").setDescription("Nội dung cần bot nói").setRequired(true)
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
    .setDescription("🔇 Mute (timeout) thành viên")
    .addUserOption(o =>
      o.setName("user").setDescription("Người cần mute").setRequired(true)
    )
    .addIntegerOption(o =>
      o.setName("minutes").setDescription("Số phút mute").setRequired(true)
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
      o.setName("amount").setDescription("Số tin nhắn cần xoá (1-100)").setRequired(true)
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages),

  // ===== MUSIC =====
  new SlashCommandBuilder()
    .setName("play")
    .setDescription("🎵 Phát nhạc (YouTube / Spotify / tìm kiếm)")
    .addStringOption(o =>
      o.setName("query").setDescription("Tên bài hoặc link").setRequired(true)
    ),

  new SlashCommandBuilder().setName("pause").setDescription("⏸️ Tạm dừng nhạc"),
  new SlashCommandBuilder().setName("resume").setDescription("▶️ Tiếp tục phát nhạc"),
  new SlashCommandBuilder().setName("skip").setDescription("⏭️ Bỏ qua bài hiện tại"),
  new SlashCommandBuilder().setName("stop").setDescription("⏹️ Dừng nhạc và xoá hàng đợi"),

  new SlashCommandBuilder()
    .setName("loop")
    .setDescription("🔁 Bật/tắt lặp")
    .addStringOption(o =>
      o.setName("mode")
        .setDescription("Chế độ loop")
        .setRequired(true)
        .addChoices(
          { name: "Tắt", value: "off" },
          { name: "Lặp bài", value: "song" },
          { name: "Lặp hàng đợi", value: "queue" }
        )
    ),

  new SlashCommandBuilder()
    .setName("userinfo")
    .setDescription("👤 Xem thông tin người dùng")
    .addUserOption(o =>
      o.setName("user").setDescription("Người cần xem (bỏ trống = bạn)").setRequired(false)
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

// ================== INTERACTIONS ==================
client.on("interactionCreate", async interaction => {
  if (!interaction.isChatInputCommand()) return;

  const { commandName } = interaction;

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

🎵 **Nhạc**
**/play** → Phát nhạc (YouTube / Spotify)
**/pause** → Tạm dừng
**/resume** → Tiếp tục
**/skip** → Bỏ qua bài
**/stop** → Dừng nhạc
**/loop** → Lặp bài / hàng đợi

👤 **/userinfo** → Xem thông tin người dùng

━━━━━━━━━━━━━━━
🔗 Support server:
https://discord.gg/P9yeTvwKjB

👑 Người làm bot:
phamminhnhat__

🌐 Website:
https://pmnx.pages.dev
      `)
      .setFooter({ text: "Pham Minh Nhat Bot" })
      .setTimestamp();

    return interaction.reply({ embeds: [embed] });
  }

  if (commandName === "ping") {
    return interaction.reply(`🏓 Pong! Latency: ${client.ws.ping}ms`);
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
      return interaction.reply({ content: "❌ Chỉ được xoá từ 1 đến 100 tin nhắn!", ephemeral: true });

    await interaction.channel.bulkDelete(amount, true);
    return interaction.reply({ content: `🧹 Đã xoá ${amount} tin nhắn`, ephemeral: true });
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
        { name: "Ngày tạo tài khoản", value: `<t:${Math.floor(user.createdTimestamp / 1000)}:R>`, inline: false },
        { name: "Ngày vào server", value: `<t:${Math.floor(member.joinedTimestamp / 1000)}:R>`, inline: false }
      )
      .setFooter({ text: "Pham Minh Nhat Bot" })
      .setTimestamp();

    return interaction.reply({ embeds: [embed] });
  }

  // ===== MUSIC =====
  if (commandName === "play") {
    const query = interaction.options.getString("query");
    const voiceChannel = interaction.member.voice.channel;
    if (!voiceChannel)
      return interaction.reply({ content: "❌ Bạn phải vào voice trước!", ephemeral: true });

    await interaction.reply("🔎 Đang tìm nhạc...");
    distube.play(voiceChannel, query, {
      member: interaction.member,
      textChannel: interaction.channel,
      interaction
    });
  }

  if (commandName === "pause") {
    const queue = distube.getQueue(interaction.guildId);
    if (!queue) return interaction.reply("❌ Không có nhạc đang phát!");
    queue.pause();
    return interaction.reply("⏸️ Đã tạm dừng nhạc");
  }

  if (commandName === "resume") {
    const queue = distube.getQueue(interaction.guildId);
    if (!queue) return interaction.reply("❌ Không có nhạc đang phát!");
    queue.resume();
    return interaction.reply("▶️ Tiếp tục phát nhạc");
  }

  if (commandName === "skip") {
    const queue = distube.getQueue(interaction.guildId);
    if (!queue) return interaction.reply("❌ Không có nhạc!");
    await queue.skip();
    return interaction.reply("⏭️ Đã bỏ qua bài");
  }

  if (commandName === "stop") {
    const queue = distube.getQueue(interaction.guildId);
    if (!queue) return interaction.reply("❌ Không có nhạc!");
    queue.stop();
    return interaction.reply("⏹️ Đã dừng nhạc và xoá hàng đợi");
  }

  if (commandName === "loop") {
    const mode = interaction.options.getString("mode");
    const queue = distube.getQueue(interaction.guildId);
    if (!queue) return interaction.reply("❌ Không có nhạc!");

    let loopMode = 0;
    if (mode === "song") loopMode = 1;
    if (mode === "queue") loopMode = 2;

    queue.setRepeatMode(loopMode);

    const modeText = loopMode === 0 ? "Tắt" : loopMode === 1 ? "Lặp bài" : "Lặp hàng đợi";
    return interaction.reply(`🔁 Loop: **${modeText}**`);
  }
});

// ================== MUSIC EVENTS ==================
distube.on("playSong", (queue, song) => {
  queue.textChannel.send(`🎶 Đang phát: **${song.name}** (${song.formattedDuration})`);
});

distube.on("addSong", (queue, song) => {
  queue.textChannel.send(`➕ Đã thêm: **${song.name}**`);
});

distube.on("error", (channel, error) => {
  console.error(error);
  if (channel) channel.send("❌ Có lỗi khi phát nhạc!");
});

// ================== LOGIN ==================
client.login(process.env.BOT_TOKEN);

// ================== WEB ==================
app.listen(PORT, () => {
  console.log("🌐 Server running on port", PORT);
});
