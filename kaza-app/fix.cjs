const fs = require('fs');

let r = fs.readFileSync('src/app/api/activities/search/route.ts', 'utf8');
r = r.replace(/\\`/g, '`');
fs.writeFileSync('src/app/api/activities/search/route.ts', r);

let p = fs.readFileSync('src/app/playground/page.tsx', 'utf8');
p = p.replace(/\\\//g, '/');
fs.writeFileSync('src/app/playground/page.tsx', p);

console.log('Fixed syntax errors.');
