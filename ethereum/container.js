var web3 = require('./web3');
var Container = require('./build/Container.json');

const instance = new web3.eth.Contract(
    JSON.parse(Container.interface),
    '0xA32a45eD57Fd8899E24B2b41C294867372c9224F'
);

module.exports = instance;