const ZWave = require('openzwave-shared');
const os = require('os');
const zwavedriverpaths = {
  "darwin": '/dev/cu.usbmodem1411',
  "linux": '/dev/ttyAMA0',
  "windows": '\\\\.\\COM3'
}
let nodes = [];

class ZwaveLock {

  constructor() {
    this.nodes = nodes;
    this.homeid = null;
    this.controller = this.init();
  }

  init() {
    return new ZWave({
      ConsoleOutput: false,
      NetworkKey: '0x02,0x02,0x03,0x03,0x05,0x06,0x07,0x08,0x09,0x0A,0x0B,0x0C,0x0D,0x0E,0x0F,0x10'
    });
  }

  connect() {
    console.log("connecting to " + zwavedriverpaths[os.platform()]);
    this.controller.connect(zwavedriverpaths[os.platform()]);
    this.listenForEvents();
  }

  listenForEvents() {
    this.controller.on('driver ready', (home_id) => {
      this.homeid = home_id;
      console.log('scanning homeid=0x%s...', this.homeid.toString(16));
    });
    
    this.controller.on('driver failed', () => {
      console.log('failed to start driver');
      this.controller.disconnect();
      process.exit();
    });
    
    this.controller.on('node added', (nodeid) => {
      this.nodes[nodeid] = {
        manufacturer: '',
        manufacturerid: '',
        product: '',
        producttype: '',
        productid: '',
        type: '',
        name: '',
        loc: '',
        classes: {},
        ready: false,
      };
    });
    
    this.controller.on('node event', (nodeid, data) => {
      console.log('node%d event: Basic set %d', nodeid, data);
    });
    
    this.controller.on('value added', (nodeid, comclass, value) => {
      if (!this.nodes[nodeid]['classes'][comclass]) {
        this.nodes[nodeid]['classes'][comclass] = {};
      }
      this.nodes[nodeid]['classes'][comclass][value.index] = value;
    });
    
    this.controller.on('value changed', (nodeid, comclass, value) => {
      if (this.nodes[nodeid]['ready']) {
        console.log('node%d: changed: %d:%s:%s->%s', nodeid, comclass,
          value['label'],
          this.nodes[nodeid]['classes'][comclass][value.index]['value'],
          value['value']);
      }
      this.nodes[nodeid]['classes'][comclass][value.index] = value;
    });
    
    this.controller.on('value removed', (nodeid, comclass, index) => {
      if (this.nodes[nodeid]['classes'][comclass] &&
        this.nodes[nodeid]['classes'][comclass][index])
        delete this.nodes[nodeid]['classes'][comclass][index];
    });
    
    this.controller.on('node ready', (nodeid, nodeinfo) => {
      this.nodes[nodeid]['manufacturer'] = nodeinfo.manufacturer;
      this.nodes[nodeid]['manufacturerid'] = nodeinfo.manufacturerid;
      this.nodes[nodeid]['product'] = nodeinfo.product;
      this.nodes[nodeid]['producttype'] = nodeinfo.producttype;
      this.nodes[nodeid]['productid'] = nodeinfo.productid;
      this.nodes[nodeid]['type'] = nodeinfo.type;
      this.nodes[nodeid]['name'] = nodeinfo.name;
      this.nodes[nodeid]['loc'] = nodeinfo.loc;
      this.nodes[nodeid]['ready'] = true;
      console.log('node%d: %s, %s', nodeid,
        nodeinfo.manufacturer ? nodeinfo.manufacturer : 'id=' + nodeinfo.manufacturerid,
        nodeinfo.product ? nodeinfo.product : 'product=' + nodeinfo.productid +
        ', type=' + nodeinfo.producttype);
      console.log('node%d: name="%s", type="%s", location="%s"', nodeid,
        nodeinfo.name,
        nodeinfo.type,
        nodeinfo.loc);
      for (let comclass in this.nodes[nodeid]['classes']) {
        switch (comclass) {
          case 0x25: // COMMAND_CLASS_SWITCH_BINARY
          case 0x26: // COMMAND_CLASS_SWITCH_MULTILEVEL
            this.controller.enablePoll(nodeid, comclass);
            break;
        }
        var values = this.nodes[nodeid]['classes'][comclass];
        console.log('node%d: class %d', nodeid, comclass);
        for (let idx in values)
          console.log('node%d:   %s=%s', nodeid, values[idx]['label'], values[
            idx]['value']);
      }
    });
    
    this.controller.on('notification', (nodeid, notif) => {
      switch (notif) {
        case 0:
          console.log('node%d: message complete', nodeid);
          break;
        case 1:
          console.log('node%d: timeout', nodeid);
          break;
        case 2:
          console.log('node%d: nop', nodeid);
          break;
        case 3:
          console.log('node%d: node awake', nodeid);
          break;
        case 4:
          console.log('node%d: node sleep', nodeid);
          break;
        case 5:
          console.log('node%d: node dead', nodeid);
          break;
        case 6:
          console.log('node%d: node alive', nodeid);
          break;
      }
    });
    
    this.controller.on('scan complete', () => {
      console.log('====> scan complete');
      this.controller.requestAllConfigParams(3);
    });
    
    this.controller.on('controller command', (n, rv, st, msg) => {
      console.log(
        'controller commmand feedback: %s node==%d, retval=%d, state=%d', msg,
        n, rv, st);
    });

    process.on('SIGINT', () => {
      console.log('disconnecting...');
      this.controller.disconnect(zwavedriverpaths[os.platform()]);
      process.exit();
    });
  }
}

module.exports = ZwaveLock;