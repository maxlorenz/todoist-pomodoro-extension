#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🔍 Verifying Todoist Pomodoro Extension...\n');

// Check required files
const requiredFiles = [
  'manifest.json',
  'src/content/content.js',
  'src/content/content.css', 
  'src/popup/popup.html',
  'src/popup/popup.js',
  'src/popup/popup.css',
  'src/background/background.js',
  'assets/icon16.png',
  'assets/icon32.png',
  'assets/icon48.png',
  'assets/icon128.png'
];

let allFilesExist = true;

console.log('📁 Checking required files:');
requiredFiles.forEach(file => {
  const exists = fs.existsSync(file);
  console.log(`  ${exists ? '✅' : '❌'} ${file}`);
  if (!exists) allFilesExist = false;
});

// Check manifest.json structure
console.log('\n📋 Checking manifest.json:');
try {
  const manifest = JSON.parse(fs.readFileSync('manifest.json', 'utf8'));
  
  const requiredFields = ['manifest_version', 'name', 'version', 'permissions', 'content_scripts', 'action', 'background'];
  requiredFields.forEach(field => {
    const exists = manifest[field] !== undefined;
    console.log(`  ${exists ? '✅' : '❌'} ${field}`);
    if (!exists) allFilesExist = false;
  });
  
  // Check manifest version
  if (manifest.manifest_version === 3) {
    console.log('  ✅ Using Manifest V3 (latest)');
  } else {
    console.log('  ⚠️  Not using Manifest V3');
  }
  
} catch (error) {
  console.log('  ❌ Invalid manifest.json');
  allFilesExist = false;
}

// Check file sizes
console.log('\n📊 File sizes:');
requiredFiles.forEach(file => {
  if (fs.existsSync(file)) {
    const stats = fs.statSync(file);
    const size = stats.size;
    const sizeKB = (size / 1024).toFixed(1);
    console.log(`  📄 ${file}: ${sizeKB} KB`);
  }
});

// Final result
console.log('\n' + '='.repeat(50));
if (allFilesExist) {
  console.log('🎉 Extension verification PASSED!');
  console.log('\n📝 Next steps:');
  console.log('1. Open Chrome and go to chrome://extensions/');
  console.log('2. Enable "Developer mode" (top right toggle)');
  console.log('3. Click "Load unpacked" and select this folder');
  console.log('4. Navigate to app.todoist.com and click on a task!');
  console.log('\n💡 Tip: Check docs/INSTALLATION.md for detailed instructions');
} else {
  console.log('❌ Extension verification FAILED!');
  console.log('Some required files are missing. Please check the errors above.');
}

console.log('='.repeat(50));