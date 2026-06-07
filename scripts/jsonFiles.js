const path = require('path');
const fs = require('fs');

const listJsonFiles = directory =>
    fs
        .readdirSync(directory)
        .filter(file => file.endsWith('.json'))
        .sort((a, b) => a.localeCompare(b))
        .map(file => path.join(directory, file));

const readJson = file => JSON.parse(fs.readFileSync(file, 'utf8'));

module.exports = {
    listJsonFiles,
    readJson,
};
