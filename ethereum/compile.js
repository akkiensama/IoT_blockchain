const solc = require('solc');
const fs = require('fs-extra');
const path = require('path');

const buildJsonPath = path.resolve(__dirname, 'build');

fs.removeSync(buildJsonPath);

const containerPath = path.resolve(__dirname, 'contracts', 'Container.sol');

const source = fs.readFileSync(containerPath, 'utf8');

const output = solc.compile(source, 1).contracts;

fs.ensureDirSync(buildJsonPath);

for (contract in output) {
    fs.outputJsonSync(
        path.resolve(buildJsonPath, contract.replace(':','') + '.json'),//tao duong dan
        output[contract]// cho noi dung vao
    );
}
