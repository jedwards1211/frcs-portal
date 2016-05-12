'use strict'

var os = require('os')
var ifaces = os.networkInterfaces()

var defaultInterfaces = ['en1', 'en0', 'wlan0', 'eth0', 'eth1']

function getHostIP(interfaces) {
  interfaces = interfaces || defaultInterfaces

  for (var i = 0; i < interfaces.length; i++) {
    var ifname = interfaces[i]
    var iface = ifaces[ifname]
    if (iface) {
      for (var k = 0; k < iface.length; k++) {
        if (iface[k].family === 'IPv4') {
          return iface[k].address
        }
      }
    }
  }
}

module.exports = getHostIP
module.exports.defaultInterfaces = defaultInterfaces

/* eslint-disable no-console */

if (!module.parent) {
  console.log(getHostIP())
}
