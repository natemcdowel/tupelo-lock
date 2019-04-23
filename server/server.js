const express = require('express');
const bodyParser = require("body-parser");
const Tupelo = require('./tupelo');
const ZwaveLock = require('./zwave');
const creds = {
  walletName: 'wallet_name',
  passPhrase: 'wallet_password'
};

class TupeloServer {

  constructor() {
    this.lockStatus = false;
    this.app = express();
    this.app.use( bodyParser.json() );
    this.app.use( bodyParser.urlencoded({extended: true}) ); 
    this.tupelo = new Tupelo();
    this.zwave = new ZwaveLock();
    this.zwave.connect();
    this.zwave.listenForEvents();
  }

  start() {
    this.listen();
    this.handleRequests();
  }

  listen() {
    this.app.listen(3000, () => console.log('Tupelo server running on port ' + 3000 + '..'));
  }

  handleRequests() {

    this.app.get('/status', (req, res) => {
      this.setLockStatus();
      this.success(res, {locked: this.lockStatus});
    });

    this.app.get('/register', (req, res) => {
      this.tupelo.register(creds).then(
        success => this.success(res, {registered: success}),
        error => this.error(res, {error: error})
      );
    });

    this.app.get('/stamp', (req, res) => {
      // this.tupelo.stamp(creds).then(
      //   success => {
      //     console.log(success);
      let sent = false;
      this.toggleLock();
      this.zwave.controller.on('value changed', (nodeid, comclass, value) => {
        if (!sent) {
          sent = true;
          this.setLockStatus();
          this.success(res, {locked: this.lockStatus});
        }
      });
      //   },
      //   error => this.error(res, command)
      // );
    });

    this.app.get('/tally', (req, res) => {
      this.tupelo.printTally(creds).then(
        success => this.success(res, {tallies: success}),
        error => this.error(res, {error: error})
      );
    });
  }

  setLockStatus() {
    this.lockStatus = this.findLock().classes['98']['0'].value;
  }

  findLock() {
    return this.zwave.nodes.find(node => node && node.type && node.type.indexOf('Lock') > -1);
  }

  toggleLock() {
    return this.zwave.controller.setValue(3, 98, 1, 0, this.lockStatus ? false : true);
  }

  success(res, message) {
    return res.status(200).send(message);
  }
}

let server = new TupeloServer
server.start();
