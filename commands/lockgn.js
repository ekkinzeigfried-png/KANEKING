const fs = require("fs");
const path = require("path");

module.exports = {
  name: "lockgn",
  description: "Locks the group name and prevent modification.",
  async execute(api, event, args) {

    const configPath = path.join(__dirname, "config", "lockgn.json")

    if(!fs.existsSync(configPath)) {
      fs.writeFileSync(configPath, JSON.stringify({}), "utf8")
    }

    const lockGNConfig = JSON.parse(fs.readFileSync(configPath, "utf8"))

    if (!lockGNConfig[event.threadID]) {
      console.log("ThreadID NOT FOUND WITHIN THE MEMORY");
      lockGNConfig[event.threadID] = {
        status: false,
        name: ""
      }
      fs.writeFileSync(configPath, JSON.stringify(lockGNConfig, null, 2), "utf8");
    }

    const status = args[0]?.toLowerCase()?.trim()


    if(status == "on") {

      const threadInfo = await api.getThreadInfo(event.threadID)

      lockGNConfig[event.threadID].name = threadInfo.name

      lockGNConfig[event.threadID].status = true

    } else {
      lockGNConfig[event.threadID].status = false
    }


    console.log(lockGNConfig)

   return fs.writeFileSync(configPath, JSON.stringify(lockGNConfig, null, 2), "utf8")

    
  }
}