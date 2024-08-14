const { app, BrowserWindow, dialog } = require('electron');
const { autoUpdater } = require('electron-updater');
const path = require('path');
const log = require('electron-log');

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      enableRemoteModule: true,
    },
  });

  mainWindow.loadFile('index.html');

  mainWindow.on('closed', function () {
    mainWindow = null;
  });

  // Initialize auto-updater
  autoUpdater.checkForUpdatesAndNotify();
}

app.on('ready', () => {
  createWindow();

  // Configure logging
  autoUpdater.logger = log;
  autoUpdater.logger.transports.file.level = 'info';
  log.info('App is starting...');

  // Handle update events
  autoUpdater.on('update-available', (info) => {
    log.info('Update available.');
    dialog.showMessageBox({
      type: 'info',
      title: 'Update Available',
      message: 'A new version is available. Downloading now...',
    });
  });

  autoUpdater.on('update-not-available', (info) => {
    log.info('Update not available.');
    dialog.showMessageBox({
      type: 'info',
      title: 'No Update Available',
      message: 'You are using the latest version.',
    });
  });

  autoUpdater.on('error', (err) => {
    log.error('Error in auto-updater:', err);
    dialog.showErrorBox('Error', 'An error occurred during the update process.');
  });

  autoUpdater.on('download-progress', (progress) => {
    log.info(`Download speed: ${progress.bytesPerSecond} - Downloaded ${progress.percent}%`);
  });

  autoUpdater.on('update-downloaded', (info) => {
    log.info('Update downloaded');
    dialog.showMessageBox({
      type: 'info',
      title: 'Update Ready',
      message: 'A new version has been downloaded. The application will restart to apply the update.',
    }).then(() => {
      autoUpdater.quitAndInstall();
    });
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (mainWindow === null) {
    createWindow();
  }
});
