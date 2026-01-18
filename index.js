import express from "express";
import { Client, GatewayIntentBits, ActivityType } from "discord.js";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;
app.use(express.json());
app.use(express.static(__dirname));

const client = new Client({
  intents: [GatewayIntentBits.Guilds]
});

let current = {
  text: "pmnx.pages.dev",
  emoji: "🔥",
  type: ActivityType.Playing
};

function updatePresence(){
  client.user.setPresence({
    status: "online",
    activities: [{
      name: `${current.emoji} ${current.text}`,
      type: current.type
    }]
  });
}

app.post("/set-status", (req,res)=>{
  const { text, emoji, type } = req.body;
  current.text = text || current.text;
  current.emoji = emoji || current.emoji;
  current.type = ActivityType[type] ?? ActivityType.Playing;
  updatePresence();
  res.sendStatus(200);
});

app.get("/", (req,res)=>{
  res.sendFile(path.join(__dirname,"index.html"));
});

client.once("ready", ()=>{
  console.log("🤖 Bot online:", client.user.tag);
  updatePresence();
});

client.login(process.env.BOT_TOKEN);

app.listen(PORT, ()=>{
  console.log("🌐 Dashboard running on port", PORT);
});
