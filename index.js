const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;

app.get('/', (req, res) => {
  res.send('Bot is running!');
});

app.listen(PORT, () => {
  console.log(`Server is listening on port ${PORT}`);
});


const login = require("al-fca");
const fs = require("fs");
const path = require("path");
try {
  appState = JSON.parse(fs.readFileSync("appstate.json", "utf8"));
} catch (err) {
  console.error("Error reading appstate.json.");
  process.exit(1);
}
const config = JSON.parse(fs.readFileSync("config.json", "utf8"));
const admins = config.admins || [];
const commands = new Map();
const trollMode = new Map();
const targetTrollMode = new Map();
const lastMessageTime = new Map();
global.heyTimers = new Map();
const processedMessages = new Set();
const trollMessages = require("./trollMessages").messages;
const commandFiles = fs.readdirSync(path.join(__dirname, "commands")).filter((file) => file.endsWith(".js"));
for (const file of commandFiles) {
  const command = require(`./commands/${file}`);
  commands.set(command.name, command);
}
login({ appState }, (err, api) => {
  if (err) return console.error(err);
  console.log("Logged in successfully!");
  const botID = api.getCurrentUserID();
  api.setOptions({ listenEvents: true, selfListen: true, online: true, forceLogin: true });
  api.listenMqtt((err, event) => {
    if (err) return console.error(err);
    const cthreadID = event.threadID;
    const lockGNPath = path.join(__dirname, "commands", "config", "lockgn.json");
    if (event.logMessageType == "log:thread-name") {
      const lockGNConfig = JSON.parse(fs.readFileSync(lockGNPath, "utf8"));
      if (lockGNConfig[cthreadID] && lockGNConfig[cthreadID].status) {
        return api.gcname(lockGNConfig[cthreadID].name, cthreadID);
      }
    }
    const locknnPath = path.join(__dirname, "commands", "config", "locknn.json");
    if (!fs.existsSync(locknnPath)) {
      fs.writeFileSync(locknnPath, JSON.stringify({}), "utf8");
    }
    if (event.logMessageType == "log:user-nickname") {
      const lockNNConfig = JSON.parse(fs.readFileSync(locknnPath, "utf8"));
      if (lockNNConfig[cthreadID] && lockNNConfig[cthreadID].status) {
        const victimID = event.logMessageData.participant_id;
        const oldUsername = lockNNConfig[cthreadID].nicknames[victimID];
        return api.nickname(oldUsername, cthreadID, victimID);
      }
    }
    if (event.senderID === botID && (event.type === "message" || event.type === "message_reply") && event.messageID) {
      setTimeout(() => {
        api.setMessageReaction("😆", event.messageID, event.threadID);
      }, 200);
    }
    if (event.messageID) {
      if (processedMessages.has(event.messageID)) return;
      processedMessages.add(event.messageID);
      setTimeout(() => processedMessages.delete(event.messageID), 60000);
    }
    if (event.type !== "message" && event.type !== "message_reply") return;
    const threadID = event.threadID;
    const senderID = event.senderID;
    const body = (event.body || "").trim();
    const hasAttachment = event.attachments && event.attachments.length > 0;
    if (!body && !hasAttachment) return;
    const args = body.split(/ +/);
    const firstWord = args.shift().toLowerCase();
    const hasPrefix = body.startsWith("/") || body.startsWith(".");
    const commandName = hasPrefix ? firstWord.slice(1) : firstWord;
    if (commands.has(commandName)) {
      if (!admins.includes(senderID)) return;
      commands.get(commandName).execute(api, event, args, { trollMode, targetTrollMode });
      return;
    }
    if (senderID === botID) return;
    const timerKey = `${threadID}_${senderID}`;
    if (targetTrollMode.has(timerKey) && typeof global.startBilangTimer === "function") {
      global.startBilangTimer(threadID, senderID, targetTrollMode.get(timerKey));
    }
    const targetKey = `${threadID}_${senderID}`;
    const casterID = trollMode.get(threadID);
    const isTargeted = (trollMode.has(threadID) && senderID !== casterID) || targetTrollMode.has(targetKey);
    if (isTargeted) {
      const now = Date.now();
      const lastTime = lastMessageTime.get(targetKey) || 0;
      const randomDelay = 3000; if (now - lastTime >= 3000) {
        lastMessageTime.set(targetKey, now);
        const isBump = body === "." || body.toLowerCase().includes("bump");
        if (hasAttachment || isBump || body) {
          let typingLoop = setInterval(() => api.sendTypingIndicator(threadID), 3000); api.sendTypingIndicator(threadID);
          setTimeout(() => {
            const randomTroll = trollMessages[Math.floor(Math.random() * trollMessages.length)];
            clearInterval(typingLoop); api.sendMessage({ body: randomTroll }, threadID, event.messageID);
          }, randomDelay);
        }
      }
    }
  });
});
