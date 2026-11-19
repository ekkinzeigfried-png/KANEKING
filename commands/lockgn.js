const fs = require("fs");
const path = require("path");
module.exports = {
  name: "lockgn",
  description: "lockgn on / off",
  async execute(api, event, args) {
    const p = path.join(__dirname, "config", "lockgn.json");
    if (!fs.existsSync(path.join(__dirname, "config"))) fs.mkdirSync(path.join(__dirname, "config"), { recursive: true });
    if (!fs.existsSync(p)) fs.writeFileSync(p, JSON.stringify({}), "utf8");
    const cfg = JSON.parse(fs.readFileSync(p, "utf8"));
    if (!cfg[event.threadID]) cfg[event.threadID] = { status: false, name: "" };
    const s = args[0]?.toLowerCase()?.trim();
    if (s == "on") {
      const info = await new Promise((res) => {
        api.getThreadInfo(event.threadID, (e, i) => res(e ? null : i));
        setTimeout(() => res(null), 4000);
      });
      const cur = info?.name || info?.threadName || "";
      cfg[event.threadID] = { status: true, name: cur };
      fs.writeFileSync(p, JSON.stringify(cfg, null, 2), "utf8");
      return api.sendMessage(`🔒 LockGN ON - naka-lock na sa: ${cur}`, event.threadID);
    } else {
      cfg[event.threadID].status = false;
      fs.writeFileSync(p, JSON.stringify(cfg, null, 2), "utf8");
      return api.sendMessage("🔓 LockGN OFF", event.threadID);
    }
  },
  async onEvent(api, event) {
    try {
      if (event.type !== "log:thread-name" && event.logMessageType !== "log:thread-name") return;
      const p = path.join(__dirname, "config", "lockgn.json");
      if (!fs.existsSync(p)) return;
      const cfg = JSON.parse(fs.readFileSync(p, "utf8"));
      const locked = cfg[event.threadID];
      if (!locked?.status || !locked?.name) return;
      const newName = event.logMessageData?.name;
      if (newName === locked.name) return;
      const fn = api.changeThreadTitle || api.setTitle;
      await new Promise((res) => {
        try { fn.call(api, locked.name, event.threadID, () => res()); } catch { res(); }
        setTimeout(res, 2000);
      });
      api.sendMessage(`🔒 Bawal palitan! Binalik ko sa: ${locked.name}`, event.threadID);
    } catch (e) { console.log("lockgn err", e.message); }
  }
};
module.exports.onStart = module.exports.execute;
