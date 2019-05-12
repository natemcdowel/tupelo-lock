const express = require('express');
const bodyParser = require("body-parser");
const Tupelo = require('./tupelo');
const ZwaveLock = require('./zwave');
const Mailer = require('./mailer');
const config = require('./config.json');
const lockoutTime = config.lockout_time;
const port = config.server_port;
const creds = config.creds;
const zwaveDevice = config.zwave_device;
const nodemailer = require('nodemailer');

class TupeloServer {

  constructor() {
    this.lockStatus = false;
    this.setupExpress();
    this.tupelo = new Tupelo();
    this.zwave = new ZwaveLock();
    this.mailer = new Mailer();
    this.zwave.connect();
    this.zwave.listenForEvents();
  }

  setupExpress() {
    this.app = express();
    this.app.use( bodyParser.json() );
    this.app.use( bodyParser.urlencoded({extended: true}) );
  }

  start() {
    this.listen();
    this.handleRequests();
  }

  listen() {
    this.app.listen(port, () => console.log('Tupelo server running on port ' + port + '..'));
    this.app.use((req, res, next) => {
      res.header("Access-Control-Allow-Origin", "*");
      res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
      next();
    });
  }

  handleRequests() {
    this.listenForAccess();
    this.listenForStatus();
    this.listenForRegister();
    this.listenForStamp();
    this.listenForTally();
  }

  isFirstStamp(stamps) {
    return !!(stamps.length === 1);
  }

  stampIsValid(stamps) {
    return !!(
      stamps.length > 1 &&
      Date.now() < (stamps[0] + lockoutTime)
    )
  }

  listenForAccess() {
    this.app.get('/access', (req, res) => {
      this.success(res, {authorized: this.tupelo.checkForAccess(req.query.code)});
    });
  }

  listenForStatus() {
    this.app.get('/status', (req, res) => {
      this.setLockStatus();
      this.success(res, {locked: this.lockStatus});
    });
  }

  listenForRegister() {
    this.app.get('/register', (req, res) => {
      creds.walletName = req.query.email;
      this.tupelo.register(creds).then(
        success => {
          this.mailer.sendMail(req.query.email, success.userId);
          this.success(res, {registered: success});
        },
        error => {
          this.error(res, {error: error})
        }
      );
    });
  }

  listenForStamp() {
    this.app.get('/stamp', (req, res) => {
      this.tupelo.stamp(creds).then(
        stamps => {
          if (this.isFirstStamp(stamps) || this.stampIsValid(stamps)) {
            this.changeLock(res);
          } else {
            this.error(res, {error: 'Your session time has expired'})
          }
        },
        error => {
          this.error(res, {error: 'Could not change lock'});
        }
      );
    });
  }

  listenForTally() {
    this.app.get('/tally', (req, res) => {
      this.tupelo.printTally(creds).then(
        success => this.success(res, {tallies: success}),
        error => this.error(res, {error: error})
      );
    });
  }

  changeLock(res) {
    let sent = false;
    this.toggleLock();
    this.zwave.controller.on('value changed', () => {
      if (!sent) {
        sent = true;
        this.setLockStatus();
        this.success(res, {locked: this.lockStatus});
      }
    });
  }

  setLockStatus() {
    this.lockStatus = this.findLock().classes[zwaveDevice.class][zwaveDevice.index].value;
  }

  findLock() {
    return this.zwave.nodes.find(node => node && node.type && node.type.indexOf('Lock') > -1);
  }

  toggleLock() {
    return this.zwave.controller.setValue(
      zwaveDevice.nodeId,
      zwaveDevice.class,
      1,
      zwaveDevice.index,
      this.lockStatus ? false : true
    );
  }

  success(res, message) {
    return res.status(200).send(message);
  }

  error(res, message) {
    return res.status(400).send(message);
  }
}

let server = new TupeloServer();
server.start();
