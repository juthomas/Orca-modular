 'use strict'

/* global createWindow */

// const spi = require('spi-device');
const { app, BrowserWindow, Menu } = require('electron')
const path = require('path')

let isShown = true

app.win = null

// // Fonction pour obtenir la valeur de tension d'un canal SPI
// function getVoltageValue(channel) {
//   return new Promise((resolve, reject) => {
//     // Configuration SPI
//     const spiConfig = {
//       mode: spi.MODE0,  // Correspond à spi_config.mode=0
//       speedHz: 1000000, // Correspond à spi_config.speed=1000000
//       maxSpeedHz: 1000000,
//       delay: 0,         // Correspond à spi_config.delay=0
//       bitsPerWord: 8,   // Correspond à spi_config.bits_per_word=8
//       chipSelectHigh: false,
//     };

//     // Ouvrir le dispositif SPI
//     const device = spi.open(channel < 8 ? 0 : 0, channel < 8 ? 0 : 1, spiConfig, (err) => {
//       if (err) {
//         console.error("Erreur lors de l'ouverture du dispositif SPI:", err);
//         return reject(err);
//       }

//       // Préparer les buffers de transmission et de réception
//       const txBuffer = Buffer.from([0x01, (0x08 + channel) << 4, 0x00]);
//       const rxBuffer = Buffer.alloc(3);

//       const message = [{
//         sendBuffer: txBuffer,
//         receiveBuffer: rxBuffer,
//         byteLength: 3,
//         speedHz: spiConfig.speedHz
//       }];

//       // Envoyer et recevoir les données SPI
//       device.transfer(message, (err, message) => {
//         if (err) {
//           console.error("Erreur lors de la transmission SPI:", err);
//           return reject(err);
//         }

//         // Calculer la valeur de tension
//         const rawValue = ((rxBuffer[1] & 0x03) << 8) | rxBuffer[2];
//         const voltageValue = rawValue / 1023.0 * 9.9;

//         // Fermer le dispositif SPI
//         device.close((err) => {
//           if (err) console.error("Erreur lors de la fermeture du dispositif SPI:", err);
//         });

//         resolve(voltageValue);
//       });
//     });
//   });
// }

// // Utilisation de la fonction
// (async () => {
//   for (let i = 0; i < 16; i++) {
//     try {
//       const voltage = await getVoltageValue(i);
//       console.log(`Canal ${i}: ${voltage.toFixed(2)}V`);
//     } catch (err) {
//       console.error("Erreur lors de la lecture de la tension:", err);
//     }
//   }
// })();

app.on('ready', () => {
  app.win = new BrowserWindow({
    width: 780,
    height: 462,
    minWidth: 380,
    minHeight: 360,
    backgroundColor: '#000',
    fullscreen: false,
    icon: path.join(__dirname, { darwin: 'icon.icns', linux: 'icon.png', win32: 'icon.ico' }[process.platform] || 'icon.ico'),
    resizable: true,
    frame: process.platform !== 'darwin',
    skipTaskbar: process.platform === 'darwin',
    autoHideMenuBar: process.platform === 'darwin',
    webPreferences: { zoomFactor: 1.0, nodeIntegration: true, backgroundThrottling: false, sandbox:false }
  })

  app.win.loadURL(`file://${__dirname}/sources/index.html`)
  // app.inspect()

  app.win.on('closed', () => {
    app.quit()
  })

  app.win.on('hide', function () {
    isShown = false
  }
  )
  
  app.win.on('show', function () {
    isShown = true
  })

  app.on('window-all-closed', () => {
    app.quit()
  })

  app.on('activate', () => {
    if (app.win === null) {
      createWindow()
    } else {
      app.win.show()
    }
  })
  //app.allowRendererProcessReuse = true
})

app.inspect = function () {
  app.win.toggleDevTools()
}

app.toggleFullscreen = function () {
  app.win.setFullScreen(!app.win.isFullScreen())
}

app.toggleMenubar = function () {
  app.win.setMenuBarVisibility(!app.win.isMenuBarVisible())
}

app.toggleVisible = function () {
  if (process.platform !== 'darwin') {
    if (!app.win.isMinimized()) { app.win.minimize() } else { app.win.restore() }
  } else {
    if (isShown && !app.win.isFullScreen()) { app.win.hide() } else { app.win.show() }
  }
}

app.injectMenu = function (menu) {
  try {
    Menu.setApplicationMenu(Menu.buildFromTemplate(menu))
  } catch (err) {
    console.warn('Cannot inject menu.')
  }
}

