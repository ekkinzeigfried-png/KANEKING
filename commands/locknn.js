const fs = require("fs");
const path = require("path");

module.exports = {
  name: "locknn",
  description:
    "Locks the nickname of the specified user and prevent modification.",
  async execute(api, event, args) {
    const filePath = path.join(__dirname, "config", "locknn.json");

    if (!fs.existsSync(filePath)) {
      fs.writeFileSync(filePath, JSON.stringify({}), "utf8");

      console.log("Created locknn.json");
    }

    const lockNNConfig = JSON.parse(fs.readFileSync(filePath, "utf8"));

    if (!lockNNConfig[event.threadID]) {
      console.log("ThreadID NOT FOUND WITHIN THE MEMORY");
      lockNNConfig[event.threadID] = {
        status: false,
        nicknames: {},
      };
      fs.writeFileSync(filePath, JSON.stringify(lockNNConfig, null, 2), "utf8");
    }

    const status = args[0]?.toLowerCase()?.trim();

    const threadID = event.threadID;

    console.log(status);
    console.log(threadID);

    if (status == "on") {
      console.log("Turning on...");
      const threadInfo = await api.getThreadInfo(threadID);

      lockNNConfig[threadID].nicknames = threadInfo.nicknames;
      lockNNConfig[threadID]["status"] = true;
    } else if (status === "off") {
      lockNNConfig[threadID]["status"] = false;
    }

    console.log(JSON.stringify(lockNNConfig, null, 2));

    return fs.writeFileSync(
      filePath,
      JSON.stringify(lockNNConfig, null, 2),
      "utf8",
    );
  },
};
