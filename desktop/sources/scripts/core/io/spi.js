"use strict";

function Spi(client) {
  const spi = require("spi-device");
  const spiConfig = {
    mode: spi.MODE0, // Correspond à spi_config.mode=0
    speedHz: 1000000, // Correspond à spi_config.speed=1000000
    maxSpeedHz: 1000000,
    delay: 0, // Correspond à spi_config.delay=0
    bitsPerWord: 8, // Correspond à spi_config.bits_per_word=8
    chipSelectHigh: false,
  };

  function getVoltageValue(channel) {
    return new Promise((resolve, reject) => {
      // Ouvrir le dispositif SPI
      const device = spi.open(
        channel < 8 ? 0 : 0,
        channel < 8 ? 0 : 1,
        spiConfig,
        (err) => {
          if (err) {
            console.error("Erreur lors de l'ouverture du dispositif SPI:", err);
            return reject(err);
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

            // Fermer le dispositif SPI
            device.close((err) => {
              if (err)
                console.error(
                  "Erreur lors de la fermeture du dispositif SPI:",
                  err
                );
            });

            resolve(voltageValue);
          });
        }
      );
    });
  }

  this.start = function () {
    console.log("SPI", "Starting..");

    setInterval(async () => {
      const voltage = await getVoltageValue(i);
      console.log(`Canal ${i}: ${voltage.toFixed(2)}V`);
    }, 1);

    // Configuration SPI
  };
  this.clear = function () {
    // this.stack = []
  };
}
