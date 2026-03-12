const fs = require('fs');

const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'));
delete pkg.type;
fs.writeFileSync('package.json', JSON.stringify(pkg, null, 2));

let nCfg = fs.readFileSync('next.config.mjs', 'utf8');
nCfg = nCfg.replace(/distDir:\s*'dist',?\n?/g, '');
fs.writeFileSync('next.config.mjs', nCfg);
console.log('Fixed config');
