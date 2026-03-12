const { execSync } = require('child_process');
try {
  execSync('npm run build', { stdio: 'inherit' });
  console.log("Local build succeeded!");
} catch (e) {
  console.error("Local build failed");
}
