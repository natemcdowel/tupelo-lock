// #! /usr/bin/env node
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
    return tupelo.connect(TUPELO_HOST, creds);
  }

  async register(creds) {
    const client = connect(creds);

    await client.register();
    const {keyAddr,} = await client.generateKey();
    const {chainId,} = await client.createChainTree(keyAddr);
    const obj = identifierObj(keyAddr, chainId);
    writeIdentifierFile(obj);
  }

  async stamp(creds, notes) {
    if (!dataFileExists()) {
      console.error('Error: you must register before you can record stamps.');
      process.exit(1);
    }

    const identifiers = readIdentifierFile();
    const client = connect(creds);

    const time = currentTime();
    const entry = time + NOTE_SEPARATOR + notes;

    const {data,} = await client.resolveData(identifiers.chainId, CHAIN_TREE_STAMP_PATH);
    let stamps;
    if (data) {
      stamps = data + STAMP_SEPARATOR + entry;
    } else {
      stamps = entry;
    }

    await client.setData(identifiers.chainId, identifiers.keyAddr, CHAIN_TREE_STAMP_PATH, stamps);
  }

  async printTally(creds) {
    if (!dataFileExists()) {
      console.error('Error: you must register before you can print stamp tallies.');
      process.exit(1);
    }

    const identifiers = readIdentifierFile();
    const client = connect(creds);

    const {data,} = await client.resolveData(identifiers.chainId, CHAIN_TREE_STAMP_PATH);
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
