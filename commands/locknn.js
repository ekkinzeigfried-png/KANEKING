const fs = require("fs");
const path = require("path");
module.exports = {
name: "locknn",
description: "locknn on [nick] / off",
async execute(api, event, args) {
const p = path.join(__dirname, "config", "locknn.json");
if (!fs.existsSync(path.join(__dirname, "config"))) fs.mkdirSync(path.join(__dirname, "config"), { recursive: true });
if (!fs.existsSync(p)) fs.writeFileSync(p, JSON.stringify({}), "utf8");
const cfg = JSON.parse(fs.readFileSync(p, "utf8"));
const s = args[0]?.toLowerCase()?.trim();
if (s == "on") {
let lockNick = args.slice(1).join(" ").trim();
const info = await new Promise((res) => { api.getThreadInfo(event.threadID, (e, i) => res(e ? null : i)); setTimeout(() => res(null), 4000); });
const nicks = {};
if (info?.nicknames) { for (let id in info.nicknames) nicks[id] = info.nicknames[id]; }
if (info?.participantIDs) { for (let id of info.participantIDs) { if (!(id in nicks)) nicks[id] = lockNick || ""; } }
if (!lockNick) {
const vals = Object.values(nicks).filter(v => v);
lockNick = vals[0] || "hi";
}
for (let id in nicks) { if (!nicks[id]) nicks[id] = lockNick; }
if (lockNick) { for (let id in nicks) nicks[id] = lockNick; }
cfg[event.threadID] = { status: true, nicknames: nicks, lockNick };
fs.writeFileSync(p, JSON.stringify(cfg, null, 2), "utf8");
return api.sendMessage("ge", event.threadID);
} else {
cfg[event.threadID] = { status: false, nicknames: {}, lockNick: "" };
fs.writeFileSync(p, JSON.stringify(cfg, null, 2), "utf8");
return api.sendMessage("ge", event.threadID);
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
const oldNick = locked.nicknames?.[target] ?? locked.lockNick ?? "";
if (newNick === oldNick) return;
const fn = api.changeNickname || api.nickname;
await new Promise((res) => { try { fn.call(api, oldNick || "", event.threadID, target, () => res()); } catch { res(); } setTimeout(res, 2000); });
api.sendMessage("ge", event.threadID);
} catch (e) { console.log("locknn err", e.message); }
}
};
module.exports.onStart = module.exports.execute;
