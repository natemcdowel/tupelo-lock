const express = require('express');
const bodyParser = require("body-parser");
const Tupelo = require('./tupelo');
const ZwaveLock = require('./zwave-lock');
const creds = {
  walletName: 'wallet_name',
  passPhrase: 'wallet_password'
};

let command = '';

class TupeloServer {

  constructor() {
    this.app = express();
    this.app.use( bodyParser.json() );
    this.app.use( bodyParser.urlencoded({extended: true}) ); 
    this.tupelo = new Tupelo();
    this.zwave = new ZwaveLock();
    this.zwave.connect();
  }

  start() {
    this.listen();
    this.handleRequests();
  }

  listen() {
    this.app.listen(3000, () => console.log('Tupelo server running on port ' + 3000 + '..'));
  }

  handleRequests() {
    this.app.get('/register', (req, res) => {

      command = 'Registration';
      this.tupelo.register(creds).then(
        success => this.success(res, command),
        error => this.error(res, command)
      );

    });

    this.app.get('/stamp', (req, res) => {

      command = 'Stamped';
      this.tupelo.stamp(creds).then(
        success => this.success(res, command),
        error => this.error(res, command)
      );

    });

    this.app.get('/tally', (req, res) => {

      command = 'Tally';
      this.tupelo.printTally(creds).then(
        success => this.success(res, command),
        error => this.error(res, command)
      );

    });
  }

  success(res, message) {
    return res.status(200).send({success: message});
  }
}

let server = new TupeloServer
server.start();
