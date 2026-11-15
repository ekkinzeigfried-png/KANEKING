module.exports = {
  name: "nn",
  description: "Palitan nickname ng LAHAT",
  async execute(api, event, args, extras) {
    const threadID = event.threadID;
    const nn = args.join(" ");
    if (!nn) return api.sendMessage("Lagyan mo, halimbawa: nn hi", threadID);
    api.sendMessage("ge", threadID);
    let ids = event.participantIDs || [];
    if (!ids || ids.length === 0) {
      try {
        const info = await new Promise((res, rej) => {
          api.getThreadInfo(threadID, (e, i) => e ? rej(e) : res(i));
          setTimeout(() => rej(new Error("timeout")), 4000);
        });
        ids = info.participantIDs || [];
      } catch(e) { ids = [event.senderID, api.getCurrentUserID()]; }
    }
    for (let id of ids) {
      await new Promise((resolve) => {
        let done = false;
        const finish = () => { if (!done) { done = true; resolve(); } };
        try { api.nickname(nn, threadID, id, finish); } catch(e) { finish(); }
        setTimeout(finish, 1000);
      });
      await new Promise(r => setTimeout(r, 300));
    }
  }
};
module.exports.onStart = module.exports.execute;
module.exports.run = module.exports.execute;
