import { Client, GatewayIntentBits, ActivityType } from "discord.js";

const client = new Client({
  intents: [GatewayIntentBits.Guilds]
});

const activities = [
  { name: "pmnx.pages.dev", type: ActivityType.Playing },
  { name: "phamminhnhat__", type: ActivityType.Watching },
  { name: "[ HEAVEN IS HERE ]", type: ActivityType.Listening },
  { name: "Discord.com", type: ActivityType.Playing }
];

let index = 0;

client.once("ready", () => {
  console.log("Bot online:", client.user.tag);

  // set ngay lần đầu
  client.user.setPresence({
    status: "online",
    activities: [activities[0]]
  });

  // đổi activity mỗi 3 giây
  setInterval(() => {
    index = (index + 1) % activities.length;

    client.user.setPresence({
      status: "online", // online | idle | dnd
      activities: [activities[index]]
    });
  }, 3000);
});

client.login(process.env.BOT_TOKEN);



