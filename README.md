⚡ Trollbot // Puray

> lightweight. disruptive. unapologetic.

A modular auto-reply and group control bot engineered for high-impact trolling and chat dominance.

---

🧠 Core Capabilities

- ⚙️ Automated Trigger Responses — reacts instantly to commands
- 🧬 Mass Mention Engine — target individuals or entire group chats
- 🛡️ Group Integrity Locks — enforce name & nickname states
- 🧾 Custom Message Injection — fully editable trolling payloads
- ⚡ Low Overhead — fast, minimal, and efficient

---

🎮 Command Interface

#HEY <name, name>     -> Targeted mentions
#ALL                  -> Mass mention (entire GC)
#NN                   -> Set nicknames for all users
#LOCKGN ON            -> Lock current group name
#LOCKNN ON            -> Lock all nicknames

---

🛠️ Deployment

01 — Admin Configuration

Inject your Facebook UID into:

config.json

---

02 — Session Authentication

Provide your session state:

appstate.json

«Recommended extractor: C3C UFC»

---

03 — Payload Customization

Modify trolling behavior via:

TrollingMessage.js

Extend or rewrite message arrays to adjust tone and intensity.

---

⚠️ Runtime Notes

- Elevated permissions (admin role) required for full command execution
- Lock mechanisms depend on consistent permission enforcement
- High-frequency usage may trigger moderation or removal

---

📡 Design Philosophy

control the chat.
shape the narrative.
be the noise.

---

📜 Disclaimer

This project is intended for controlled environments and entertainment use.
Operational misuse is the responsibility of the operator.
