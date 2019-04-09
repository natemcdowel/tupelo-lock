process.env["NODE_TLS_REJECT_UNAUTHORIZED"] = 0;
const express = require('express');
const bodyParser = require("body-parser");
const shell = require("shelljs");
let command = '';

class TupeloServer {

  constructor() {
    this.app = express();
    this.app.use( bodyParser.json() );
    this.app.use( bodyParser.urlencoded({extended: true}) ); 
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
      
      command = 'node tupelo-client.js register wallet_name wallet_password';
      shell.exec(command);
      this.success(res);

    });

    this.app.get('/stamp', (req, res) => {

      command = 'node tupelo-client.js stamp wallet_name wallet_password -n "stamp 1"';
      shell.exec(command);
      this.success(res);

    });

    this.app.get('/tally', (req, res) => {

      command = 'node tupelo-client.js tally wallet_name wallet_password';
      shell.exec(command);
      this.success(res);

    });
  }

  success(res) {
    console.log('success');
    return res.status(200).send({success: true});
  }
}

let server = new TupeloServer
server.start();
