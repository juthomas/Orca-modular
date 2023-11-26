"use strict";

function Spi(client) {
  const spi = require("spi-device");

  this.devices = {};
  const spiConfig = {
    mode: spi.MODE0, // Correspond à spi_config.mode=0
    speedHz: 1000000, // Correspond à spi_config.speed=1000000
    maxSpeedHz: 1000000,
    delay: 0, // Correspond à spi_config.delay=0
    bitsPerWord: 8, // Correspond à spi_config.bits_per_word=8
    chipSelectHigh: false,
  };

  this.getVoltageValue = function (channel) {
    return new Promise((resolve, reject) => {
      // Vérifier si le dispositif pour le canal spécifié est ouvert
      const device = this.devices[channel < 8 ? 0 : 1];
      if (!device) {
        return reject(
          new Error("Dispositif SPI non initialisé pour le canal " + channel)
        );
      }

      // Préparer les buffers de transmission et de réception
      const txBuffer = Buffer.from([0x01, (0x08 + channel) << 4, 0x00]);
      const rxBuffer = Buffer.alloc(3);

      const message = [
        {
          sendBuffer: txBuffer,
          receiveBuffer: rxBuffer,
          byteLength: 3,
          speedHz: spiConfig.speedHz,
        },
      ];

      // Envoyer et recevoir les données SPI
      device.transfer(message, (err, message) => {
        if (err) {
          console.error("Erreur lors de la transmission SPI:", err);
          return reject(err);
        }

        // Calculer la valeur de tension
        const rawValue = ((rxBuffer[1] & 0x03) << 8) | rxBuffer[2];
        const voltageValue = (rawValue / 1023.0) * 9.9;

        resolve(voltageValue);
      });
    });
  };

  this.start = function () {
    console.log("SPI", "Starting..");

    this.devices[0] = spi.open(0, 0, spiConfig, (err) => {
      if (err)
        console.error("Erreur lors de l'ouverture du dispositif SPI:", err);
    });
    this.devices[1] = spi.open(0, 1, spiConfig, (err) => {
      if (err)
        console.error("Erreur lors de l'ouverture du dispositif SPI:", err);
    });

    setInterval(async () => {
      for (let entry = 0; entry < 4; entry++) {
        const trigger = await this.getVoltageValue(entry * 4 + 0);
        if (trigger > 1.0) {
          const glyph = client.orca.keyOf(
            parseInt((await this.getVoltageValue(entry * 4 + 1)) * 3.6, 10)
          );
          const x = client.orca.keyOf(
            parseInt((await this.getVoltageValue(entry * 4 + 2)) * 3.6, 10)
          );
          const y = client.orca.keyOf(
            parseInt((await this.getVoltageValue(entry * 4 + 3)) * 3.6, 10)
          );
          const msg = `write:${glyph};${x};${y}`;
          console.log(`Trigger ${entry} ${msg}`);
          client.commander.trigger(`${msg}`);
        }
      }
    }, 1000); //Polling rate
  };
  this.clear = function () {
    // Fermer les connexions SPI
    Object.values(this.devices).forEach((device) => {
      device.close((err) => {
        if (err)
          console.error("Erreur lors de la fermeture du dispositif SPI:", err);
      });
    });
  };
}
