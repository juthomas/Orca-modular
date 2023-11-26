"use strict";

function Spi(client) {
  const spi = require("spi-device");
  this.start = function () {
      console.log("SPI", "Starting..");
    };
  this.clear = function () {
    // this.stack = []
  };
}
