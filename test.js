const { app, BrowserWindow, session } = require("electron");
const path = require("path");

const createWindow = () => {
    const mainWindow = new BrowserWindow({
        width: 800,
        height: 600,
        autoHideMenuBar: true,
        webPreferences: {
            preload: path.join(__dirname, "js", "preload.js"),
            contextIsolation: false,
            webviewTag: true,
            nodeIntegration: true,
        },
    });

    mainWindow.loadURL("file://" + __dirname + "/html/download.html?callback=https%3A%2F%2Fyoutube.com%2F#AqjB8DGt85U");
    // mainWindow.webContents.openDevTools()
};

app.whenReady().then(() => {
    createWindow();

    app.on("activate", () => {
        // On macOS it's common to re-create a window in the app when the
        // dock icon is clicked and there are no other windows open.
        if (BrowserWindow.getAllWindows().length === 0) createWindow();
    });
});

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on("window-all-closed", () => {
    if (process.platform !== "darwin") app.quit();
});
