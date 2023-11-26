"use strict";

function Spi(client) {
  const spi = require("spi-device");

  this.devices = {};
  this.intervalId = null;
  const spiConfig = {
    mode: spi.MODE0,
    speedHz: 1000000,
    maxSpeedHz: 1000000,
    delay: 0,
    bitsPerWord: 8,
    chipSelectHigh: false,
  };

  this.getVoltageValue = function (channel) {
    return new Promise((resolve, reject) => {
      // Check if device channel is open
      const device = this.devices[channel < 8 ? 0 : 1];
      if (!device) {
        return reject(
          new Error("SPI Device not working for channel " + channel)
        );
      }

      // Buffers
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

      // Send and receive SPI data
      device.transfer(message, (err, message) => {
        if (err) {
          console.warn("SPI", `Error transmitting :\n ${err}`);
          return reject(err);
        }

        // Calculate Tension
        const rawValue = ((rxBuffer[1] & 0x03) << 8) | rxBuffer[2];
        const voltageValue = (rawValue / 1023.0) * 9.9;

        resolve(voltageValue);
      });
    });
  };

  this.start = function () {
    console.log("SPI", "Starting..");

    this.devices[0] = spi.open(0, 0, spiConfig, (err) => {
      if (err) console.warn("SPI", `Error opening device 0:\n ${err}`);
    });
    this.devices[1] = spi.open(0, 1, spiConfig, (err) => {
      if (err) console.warn("SPI", `Error opening device 1:\n ${err}`);
    });

    this.intervalId = setInterval(async () => {
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
          console.log("SPI", `Trigger ${entry} ${msg}`);
          client.commander.trigger(`${msg}`);
        }
      }
    }, 1000); //Polling rate
  };
  this.clear = function () {
    // Stop interval
    if (this.intervalId != null) {
      clearInterval(this.intervalId);
      this.intervalId = null; // Reset Interval
    }
    // Close SPI connections
    Object.values(this.devices).forEach((device) => {
      device.close((err) => {
        if (err) console.warn("SPI", `Error when closing connection:\n ${err}`);
      });
    });
  };
}
