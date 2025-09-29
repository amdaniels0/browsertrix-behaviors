#!/usr/bin/env node

/**
 * Simple test script to verify CSS expansion behaviors are properly integrated
 * Run with: node test-css-behaviors.js
 */

const fs = require('fs');
const path = require('path');

console.log('🧪 Testing CSS Expansion Behaviors Integration\n');

// Check if source files exist
const filesToCheck = [
  'src/site/css-expander.ts',
  'src/site/miller-ica.ts',
  'src/site/index.ts'
];

console.log('1. Checking source files...');
for (const file of filesToCheck) {
  const filePath = path.join(__dirname, file);
  if (fs.existsSync(filePath)) {
    console.log(`   ✅ ${file} exists`);
  } else {
    console.log(`   ❌ ${file} missing`);
    process.exit(1);
  }
}

// Check if behaviors are properly exported in index
console.log('\n2. Checking site behaviors index...');
const indexPath = path.join(__dirname, 'src/site/index.ts');
const indexContent = fs.readFileSync(indexPath, 'utf8');

if (indexContent.includes('CSSExpanderBehavior')) {
  console.log('   ✅ CSSExpanderBehavior imported');
} else {
  console.log('   ❌ CSSExpanderBehavior not imported');
}

if (indexContent.includes('MillerICABehavior')) {
  console.log('   ✅ MillerICABehavior imported');
} else {
  console.log('   ❌ MillerICABehavior not imported');
}

if (indexContent.includes('siteBehaviors = [') && 
    indexContent.match(/CSSExpanderBehavior,?\s*\n?\s*MillerICABehavior/)) {
  console.log('   ✅ Behaviors added to siteBehaviors array');
} else {
  console.log('   ❌ Behaviors not properly added to siteBehaviors array');
}

// Check TypeScript syntax
console.log('\n3. Basic TypeScript syntax check...');
try {
  // Try to parse the TypeScript files (basic check)
  const cssExpanderContent = fs.readFileSync(path.join(__dirname, 'src/site/css-expander.ts'), 'utf8');
  const millerICAContent = fs.readFileSync(path.join(__dirname, 'src/site/miller-ica.ts'), 'utf8');
  
  // Basic checks for required methods
  const requiredMethods = ['static id', 'static init()', 'static isMatch()', 'async *run('];
  
  for (const method of requiredMethods) {
    if (cssExpanderContent.includes(method) && millerICAContent.includes(method)) {
      console.log(`   ✅ Both behaviors have ${method}`);
    } else {
      console.log(`   ❌ Missing ${method} in one or both behaviors`);
    }
  }
} catch (error) {
  console.log(`   ❌ Error reading TypeScript files: ${error.message}`);
}

console.log('\n4. Checking package.json scripts...');
const packageJsonPath = path.join(__dirname, 'package.json');
if (fs.existsSync(packageJsonPath)) {
  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
  
  const requiredScripts = ['build', 'build-dev', 'test', 'lint'];
  for (const script of requiredScripts) {
    if (packageJson.scripts && packageJson.scripts[script]) {
      console.log(`   ✅ ${script} script available`);
    } else {
      console.log(`   ❌ ${script} script missing`);
    }
  }
} else {
  console.log('   ❌ package.json not found');
}

console.log('\n✨ Integration check complete!\n');

console.log('Next steps:');
console.log('1. Install dependencies: npm install -g yarn && yarn install');
console.log('2. Build behaviors: yarn build-dev');
console.log('3. Test on Miller ICA: yarn test "https://miller-ica.cmu.edu/exhibitions"');
console.log('4. Or test manually by copying dist/behaviors.js to browser console');
console.log('\nFor more details, see CSS_EXPANSION_BEHAVIORS.md');