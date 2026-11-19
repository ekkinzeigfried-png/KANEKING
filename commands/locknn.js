const fs = require("fs");
const path = require("path");
module.exports = {
  name: "locknn",
  description: "locknn on / off",
  async execute(api, event, args) {
    const p = path.join(__dirname, "config", "locknn.json");
    if (!fs.existsSync(path.join(__dirname, "config"))) fs.mkdirSync(path.join(__dirname, "config"), { recursive: true });
    if (!fs.existsSync(p)) fs.writeFileSync(p, JSON.stringify({}), "utf8");
    const cfg = JSON.parse(fs.readFileSync(p, "utf8"));
    if (!cfg[event.threadID]) cfg[event.threadID] = { status: false, nicknames: {} };
    const s = args[0]?.toLowerCase()?.trim();
    if (s == "on") {
      const info = await new Promise((res) => {
        api.getThreadInfo(event.threadID, (e, i) => res(e ? null : i));
        setTimeout(() => res(null), 4000);
      });
      const nicks = {};
      if (info?.nicknames) { for (let id in info.nicknames) nicks[id] = info.nicknames[id]; }
      else if (info?.participantIDs) { for (let id of info.participantIDs) nicks[id] = ""; }
      cfg[event.threadID] = { status: true, nicknames: nicks };
      fs.writeFileSync(p, JSON.stringify(cfg, null, 2), "utf8");
      return api.sendMessage(`🔒 LockNN ON - naka-lock na ${Object.keys(nicks).length} nicknames`, event.threadID);
    } else {
      cfg[event.threadID].status = false;
      fs.writeFileSync(p, JSON.stringify(cfg, null, 2), "utf8");
      return api.sendMessage("🔓 LockNN OFF", event.threadID);
    }
  },
  async onEvent(api, event) {
    try {
      if (event.type !== "log:thread-nickname" && event.logMessageType !== "log:thread-nickname") return;
      const p = path.join(__dirname, "config", "locknn.json");
      if (!fs.existsSync(p)) return;
      const cfg = JSON.parse(fs.readFileSync(p, "utf8"));
      const locked = cfg[event.threadID];
      if (!locked?.status) return;
      const target = event.logMessageData?.participantID;
      const newNick = event.logMessageData?.nickname;
      const oldNick = locked.nicknames?.[target];
      if (newNick === oldNick) return;
      const fn = api.changeNickname || api.nickname;
      await new Promise((res) => {
        try { fn.call(api, oldNick || "", event.threadID, target, () => res()); } catch { res(); }
        setTimeout(res, 2000);
      });
      api.sendMessage("🔒 Bawal palitan nickname! Binalik ko.", event.threadID);
    } catch (e) { console.log("locknn err", e.message); }
  }
};
module.exports.onStart = module.exports.execute;
