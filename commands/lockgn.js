const fs = require("fs");
const path = require("path");
module.exports = {
name: "lockgn",
description: "lockgn on [name] / off",
async execute(api, event, args) {
const p = path.join(__dirname, "config", "lockgn.json");
if (!fs.existsSync(path.join(__dirname, "config"))) fs.mkdirSync(path.join(__dirname, "config"), { recursive: true });
if (!fs.existsSync(p)) fs.writeFileSync(p, JSON.stringify({}), "utf8");
const cfg = JSON.parse(fs.readFileSync(p, "utf8"));
if (!cfg[event.threadID]) cfg[event.threadID] = { status: false, name: "" };
const s = args[0]?.toLowerCase()?.trim();
if (s == "on") {
let name = args.slice(1).join(" ").trim();
if (!name) {
const info = await new Promise((res) => { api.getThreadInfo(event.threadID, (e, i) => res(e ? null : i)); setTimeout(() => res(null), 4000); });
name = info?.name || info?.threadName || "";
}
if (!name) return;
cfg[event.threadID] = { status: true, name };
fs.writeFileSync(p, JSON.stringify(cfg, null, 2), "utf8");
return api.sendMessage("ge", event.threadID);
} else {
cfg[event.threadID].status = false;
fs.writeFileSync(p, JSON.stringify(cfg, null, 2), "utf8");
return api.sendMessage("🔓 ge", event.threadID);
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
const fn = api.changeThreadTitle || api.setTitle || api.changeThreadName;
await new Promise((res) => { try { fn.call(api, locked.name, event.threadID, () => res()); } catch { res(); } setTimeout(res, 2000); });
api.sendMessage("ge", event.threadID);
} catch (e) { console.log("lockgn err", e.message); }
}
};
module.exports.onStart = module.exports.execute;
