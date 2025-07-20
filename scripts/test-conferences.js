const path = require('path');
const fs = require('fs');

const Ajv = require('ajv');
const conferenceSchema = require('../conferences_schema.json');

const ajv = new Ajv({ schemaId: 'id' });
ajv.addMetaSchema(require('ajv/lib/refs/json-schema-draft-07.json'));

const validate = ajv.compile(conferenceSchema);

const conferencesDir = path.resolve(__dirname, '../conferences/');
const conferenceFiles = fs
  .readdirSync(conferencesDir)
  .filter((file) => file.endsWith('.json'))
  .map((file) => path.join(conferencesDir, file));

let failed = false;

console.log('Testing conference files');
conferenceFiles.forEach((file) => {
  const baseName = path.basename(file);
  const isValid = validate(JSON.parse(fs.readFileSync(file)));

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
