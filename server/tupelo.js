const tupelo = require('tupelo-client');
const fs = require('fs');
const assert = require('assert');

class Tupelo {

  constructor() {
    this.localIdentifierPath = './.timestamper-identifiers';
    this.TUPELO_HOST = 'localhost:50051';
    this.CHAIN_TREE_STAMP_PATH = 'timestamper/stamps';
    this.STAMP_SEPARATOR = ',,';
    this.NOTE_SEPARATOR = '-:';
  }

  identifierObj(keyAddr, chainId) {
    assert.notEqual(keyAddr, null);
    assert.notEqual(chainId, null);
    return {
      keyAddr,
      chainId,
    };
  }

  dataFileExists() {
    return fs.existsSync(this.localIdentifierPath);
  };

  writeIdentifierFile(configObj) {
    const data = JSON.stringify(configObj);
    fs.writeFileSync(this.localIdentifierPath, data);
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

  stampsToArray(stamps) {
    return stamps.split(',,').map(stamp => stamp.replace(this.NOTE_SEPARATOR + 'undefined', '')).filter(stamp => stamp);
  }

  async register(creds) {
    const client = this.connect(creds);
    await client.register();
    const {keyAddr,} = await client.generateKey();
    const {chainId,} = await client.createChainTree(keyAddr);
    const obj = this.identifierObj(keyAddr, chainId);
    this.writeIdentifierFile(obj);
  }

  async stamp(creds, notes, threshold) {
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
