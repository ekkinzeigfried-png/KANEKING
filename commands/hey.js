module.exports = {
    name: "hey",
    description: "Toggle auto-bilang 1-10 pag di nag-chat ng 5 seconds",
    async execute(api, event, args, extras) {
        const { targetTrollMode } = extras;
        const threadID = event.threadID;

        if (!global.heyTimers) global.heyTimers = new Map();
        if (!global.heyIntervals) global.heyIntervals = new Map();

        const sub = args.join(" ").toLowerCase();

        let threadInfo;
        try {
            threadInfo = await api.getThreadInfo(threadID);
        } catch {
            return api.sendMessage("no", threadID);
        }

        const users = threadInfo.userInfo || [];

        if (sub === "who") {
            const names = [];
            for (const key of targetTrollMode.keys()) {
                if (!key.startsWith(threadID + "_")) continue;
                const userID = key.split("_")[1];
                const user = users.find(u => u.id === userID);
                if (user?.name) names.push(user.name);
            }
            return api.sendMessage(names.length === 0 ? "no" : names.join(", "), threadID);
        }

        if (sub === "stop") {
            let stopped = false;
            for (const key of Array.from(targetTrollMode.keys())) {
                if (!key.startsWith(threadID + "_")) continue;
                if (global.heyTimers.has(key)) {
                    clearTimeout(global.heyTimers.get(key));
                    global.heyTimers.delete(key);
                }
                if (global.heyIntervals.has(key)) {
                    clearInterval(global.heyIntervals.get(key));
                    global.heyIntervals.delete(key);
                }
                targetTrollMode.delete(key); if (global.heyStartTimes) global.heyStartTimes.delete(key); if (global.heyStartTimes) global.heyStartTimes.delete(key);
                stopped = true;
            }
            return api.sendMessage(stopped ? "yes" : "no", threadID);
        }

        if (!sub) return api.sendMessage("no", threadID);

        if (!global.heyStartTimes) global.heyStartTimes = new Map();

        global.startBilangTimer = function(tID, uID, uName) {
            const k = `${tID}_${uID}`;

            if (!global.heyStartTimes.has(k)) {
                global.heyStartTimes.set(k, Date.now());
            }

            if (global.heyTimers.has(k)) clearTimeout(global.heyTimers.get(k));
            if (global.heyIntervals.has(k)) clearInterval(global.heyIntervals.get(k));

            const timer = setTimeout(() => {
                let count = 1;
                const interval = setInterval(() => {
                    if (!targetTrollMode.has(k)) {
                        clearInterval(interval);
                        global.heyIntervals.delete(k);
                        global.heyStartTimes.delete(k);
                        return;
                    }
                    if (count > 10) {
                        clearInterval(interval);
                        global.heyIntervals.delete(k);
                        targetTrollMode.delete(k);

                        const startTime = global.heyStartTimes.get(k) || Date.now();
                        global.heyStartTimes.delete(k);
                        const totalMins = Math.max(1, Math.floor((Date.now() - startTime) / 60000));
                        const hrs = Math.floor(totalMins / 60);
                        const mins = totalMins % 60;

                        let durationParts = [];
                        if (hrs > 0) durationParts.push(hrs === 1 ? "1 hour" : `${hrs} hours`);
                        if (mins > 0) durationParts.push(mins === 1 ? "1 minute" : `${mins} minutes`);
                        const durationStr = durationParts.length > 0 ? durationParts.join(" ") : "1 minute";

                        const firstName = uName ? uName.trim().split(/\s+/)[0] : "Target";
                        api.sendMessage(`me win\nlose: ${firstName}\nduration: ${durationStr}`, tID);
                        return;
                    }
                    api.sendMessage(`${count}?`, tID);
                    count++;
                }, 7000);

                global.heyIntervals.set(k, interval);
                global.heyTimers.delete(k);
            }, 300000);

            global.heyTimers.set(k, timer);
        };

        const nameInputs = sub.split(",").map(n => n.trim()).filter(Boolean);
        let success = false;

        for (const input of nameInputs) {
            const matches = users.filter(
                u => u.name && u.name.toLowerCase().includes(input)
            );

            if (matches.length !== 1) continue;

            const target = matches[0];
            const targetKey = `${threadID}_${target.id}`;

            if (targetTrollMode.has(targetKey)) {
                targetTrollMode.delete(targetKey);
                if (global.heyTimers.has(targetKey)) {
                    clearTimeout(global.heyTimers.get(targetKey));
                    global.heyTimers.delete(targetKey);
                }
                if (global.heyIntervals.has(targetKey)) {
                    clearInterval(global.heyIntervals.get(targetKey));
                    global.heyIntervals.delete(targetKey);
                }
                success = true;
                continue;
            }

            targetTrollMode.set(targetKey, target.name);
            success = true;
            // hintayin muna mag chat ang target
        }

        return api.sendMessage(success ? "yes" : "no", threadID);
    }
};
