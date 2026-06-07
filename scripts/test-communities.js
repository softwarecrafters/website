const path = require('path');
const fs = require('fs');

const Ajv = require('ajv');
const communitySchema = require('../communities_schema.json');
const { listJsonFiles, readJson } = require('./jsonFiles');

const ajv = new Ajv({ schemaId: 'id' });
ajv.addMetaSchema(require('ajv/lib/refs/json-schema-draft-07.json'));

const validate = ajv.compile(communitySchema);

const communitiesDir = path.resolve(__dirname, '../communities');
const communityFiles = listJsonFiles(communitiesDir);

let failed = false;

console.log('Testing community files');
communityFiles.forEach(file => {
  const baseName = path.basename(file);
  const isValid = validate(readJson(file));

  if (!isValid) {
    failed = true;
    console.error(`X ${baseName}`);
    console.error(JSON.stringify(validate.errors, undefined, 2));
    console.error('\n');
  } else {
    console.log(`✓ ${baseName}`);
  }
});

if (failed) {
  process.exit(1);
}
