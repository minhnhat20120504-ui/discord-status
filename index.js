import express from "express";
import {
  Client,
  GatewayIntentBits,
  REST,
  Routes,
  SlashCommandBuilder,
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

// ===== DISCORD BOT =====
const client = new Client({
  intents: [GatewayIntentBits.Guilds]
});

// ===== SLASH COMMANDS =====
const commands = [
  new SlashCommandBuilder()
    .setName("help")
    .setDescription("📜 Xem danh sách lệnh của bot")
].map(cmd => cmd.toJSON());

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

// ===== BOT READY =====
client.once("ready", () => {
  console.log("🤖 Bot online:", client.user.tag);
});

// ===== INTERACTION =====
client.on("interactionCreate", async interaction => {
  if (!interaction.isChatInputCommand()) return;

  if (interaction.commandName === "help") {
    const embed = new EmbedBuilder()
      .setColor("#5865F2")
      .setTitle("📜 Danh sách lệnh")
      .setDescription(`
**/help** → Hiển thị bảng trợ giúp

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

    await interaction.reply({ embeds: [embed], ephemeral: false });
  }
});

// ===== LOGIN =====
client.login(process.env.BOT_TOKEN);

// ===== WEB =====
app.listen(PORT, () => {
  console.log("🌐 Server running on port", PORT);
});
