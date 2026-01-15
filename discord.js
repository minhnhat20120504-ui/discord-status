import { ActivityType } from "discord.js";

client.user.setPresence({
  activities: [{
    name: "Hello",
    type: ActivityType.Playing
  }],
  status: "online"
});
