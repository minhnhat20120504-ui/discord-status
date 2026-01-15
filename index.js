import { Client, GatewayIntentBits, ActivityType } from "discord.js";

const client = new Client({
  intents: [GatewayIntentBits.Guilds]
});

client.once("ready", () => {
  console.log("Bot online:", client.user.tag);

  client.user.setPresence({
    status: "online", // online | idle | dnd | invisible
    activities: [
      {
        name: "pmnx.pages.dev",
        type: ActivityType.Playing
      }
    ]
  });
});

client.login(process.env.BOT_TOKEN);
