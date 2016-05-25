var {app, BrowserWindow} = require("electron");

var mainWindow;
app.on("ready", () => {
	mainWindow = new BrowserWindow({
		width: 600,
		// transparent: true,
		// frame: false,
		height: 500,
		icon: "app/dist/img/icon1.png"
	}).on("closed", () => mainWindow = null);

	mainWindow.loadURL(`file://${__dirname}/app/index.html`);
}).on("window-all-closed", app.quit);