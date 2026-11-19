module.exports = {
  name: "nn",
  description: "nn",
  async execute(api, event, args) {
    const threadID = event.threadID;
    const nn = args.join(" ");
    if (!nn) return api.sendMessage("Lagyan mo, hal: nn hi", threadID);
    api.sendMessage("ge", threadID);
    let ids = event.participantIDs || [];
    if (!ids.length) {
      const info = await new Promise((res) => {
        api.getThreadInfo(threadID, (e, i) => res(e ? null : i));
        setTimeout(() => res(null), 4000);
      });
      ids = info?.participantIDs || [event.senderID];
    }
    const setNick = api.changeNickname || api.nickname;
    for (let id of ids) {
      await new Promise((r) => {
        let d = false;
        const f = () => { if (!d) { d = true; r(); } };
        try { setNick.call(api, nn, threadID, id, f); } catch { f(); }
        setTimeout(f, 1000);
      });
      await new Promise(r => setTimeout(r, 300));
    }
  }
};
module.exports.onStart = module.exports.execute;
