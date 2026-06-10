"use strict";
const path = require("path");
const { app } = require("electron");

app.setPath("userData", path.join(app.getPath("appData"), "Selycord"));
app.setAppUserModelId("com.squirrel.Discord.Discord");

require(path.join(__dirname, "dist", "desktop", "patcher.js"));