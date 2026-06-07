const fs = require('node:fs');
const path = require('node:path');

const htmlFiles = ['index.html', 'conferences.html'];

const checks = [
  {
    name: 'has html lang attribute',
    test: html => /<html[^>]*\slang=["'][^"']+["'][^>]*>/i.test(html),
  },
  {
    name: 'has skip-to-content link',
    test: html =>
      /<a[^>]*class=["'][^"']*skip-link[^"']*["'][^>]*href=["']#main-content["'][^>]*>/i.test(html),
  },
  {
    name: 'has main landmark target',
    test: html => /<main[^>]*id=["']main-content["'][^>]*>/i.test(html),
  },
  {
    name: 'has labeled primary navigation',
    test: html => /<nav[^>]*aria-label=["']Primary["'][^>]*>/i.test(html),
  },
];

const failures = [];

for (const relativeFile of htmlFiles) {
  const absoluteFile = path.resolve(__dirname, '..', relativeFile);
  const html = fs.readFileSync(absoluteFile, 'utf8');

  for (const check of checks) {
    if (!check.test(html)) {
      failures.push(`${relativeFile}: ${check.name}`);
    }
  }
}

if (failures.length > 0) {
  console.error('Accessibility structure checks failed:');
  failures.forEach(failure => console.error(`- ${failure}`));
  process.exit(1);
}

console.log('Accessibility structure checks passed.');
