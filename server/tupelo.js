const tupelo = require('tupelo-client');
const fs = require('fs');
const assert = require('assert');
const config = require('./config.json');

class Tupelo {

  constructor() {
    this.localIdentifierPath = './validKeys.json';
    this.TUPELO_HOST = config.tupelo_host;
    this.CHAIN_TREE_STAMP_PATH = 'timestamper/stamps';
    this.STAMP_SEPARATOR = ',,';
    this.NOTE_SEPARATOR = '-:';
  }

  identifierObj(keyAddr, chainId) {
    assert.notEqual(keyAddr, null);
    assert.notEqual(chainId, null);
    const userId = this.makeUserId(6);
    return {
      keyAddr,
      chainId,
      userId
    };
  }

  dataFileExists() {
    return fs.existsSync(this.localIdentifierPath);
  };

  writeValidKeys(validKeys, configObj) {
    validKeys.push(configObj);
    fs.writeFileSync(this.localIdentifierPath, JSON.stringify(validKeys, 2));
  }

  writeIdentifierFile(configObj) {
    try {
      let validKeys = require('.' + this.localIdentifierPath);
      this.writeValidKeys(validKeys, configObj);
    } catch(error) {
      let validKeys = [];
      this.writeValidKeys(validKeys, configObj);
    }
  }

  readIdentifierFile() {
    const raw = fs.readFileSync(this.localIdentifierPath);
    return JSON.parse(raw);
  }

  currentTime() {
    return new Date().getTime().toString();
  }

  connect(creds) {
    return tupelo.connect(this.TUPELO_HOST, creds);
  }

  checkForAccess(code) {
    try {
      const validKeys = require('.' + this.localIdentifierPath);
      return !!(validKeys.find(keys => keys.userId === code));
    } catch(error) {
      return false;
    }
  }

  stampsToArray(stamps) {
    return stamps.split(',,').map(stamp => stamp.replace(this.NOTE_SEPARATOR + 'undefined', '')).filter(stamp => stamp);
  }

  makeUserId(length) {
    let result = '';
    let characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let charactersLength = characters.length;
    for ( let i = 0; i < length; i++ ) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
  }

  async register(creds) {
    const client = this.connect(creds);
    await client.register();
    const {keyAddr,} = await client.generateKey();
    const {chainId,} = await client.createChainTree(keyAddr);
    const obj = this.identifierObj(keyAddr, chainId);
    this.writeIdentifierFile(obj);
    return obj;
  }

  async stamp(creds, notes) {
    if (!this.dataFileExists()) {
      console.error('Error: you must register before you can record stamps.');
      process.exit(1);
    }

    const identifiers = this.readIdentifierFile();
    const client = this.connect(creds);
    const time = this.currentTime();
    const entry = time + this.NOTE_SEPARATOR + notes;
    const {data,} = await client.resolveData(identifiers.chainId, this.CHAIN_TREE_STAMP_PATH);
    let stamps;

    if (data) {
      stamps = data + this.STAMP_SEPARATOR + entry;
    } else {
      stamps = entry;
    }

    await client.setData(identifiers.chainId, identifiers.keyAddr, this.CHAIN_TREE_STAMP_PATH, stamps);

    return this.stampsToArray(stamps);
  }

  async printTally(creds) {
    if (!this.dataFileExists()) {
      console.error('Error: you must register before you can print stamp tallies.');
      process.exit(1);
    }

    const identifiers = this.readIdentifierFile();
    const client = this.connect(creds);
    const {data,} = await client.resolveData(identifiers.chainId, this.CHAIN_TREE_STAMP_PATH);
    const tally = data[0];

    if (tally) {
      console.log('----Timestamps----');
      console.log(tally.replace(new RegExp(STAMP_SEPARATOR, 'g'), '\n'));
    } else {
      console.log('----No Stamps-----');
    }
  }
}

module.exports = Tupelo;
