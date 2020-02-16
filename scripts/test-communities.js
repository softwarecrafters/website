const glob = require("glob");
const path = require("path");
const fs = require("fs");

const Ajv = require("ajv");
const communitySchema = require("../communities_schema.json");

const ajv = new Ajv({ extendRefs: true, schemaId: "id" });
ajv.addMetaSchema(require("ajv/lib/refs/json-schema-draft-04.json"));

const validate = ajv.compile(communitySchema);

const communityFiles = glob.sync(
  path.resolve(__dirname, "../communities/") + "/*.json"
);

let failed = false;

console.log("Testing community files");
communityFiles.forEach(file => {
  const baseName = path.basename(file);
  const isValid = validate(JSON.parse(fs.readFileSync(file)));

  if (!isValid) {
    failed = true;
    console.error(`X ${baseName}`);
    console.error(JSON.stringify(validate.errors, undefined, 2));
    console.error("\n");
  } else {
    console.log(`✓ ${baseName}`);
  }
});

if (failed) {
  process.exit(1);
}
