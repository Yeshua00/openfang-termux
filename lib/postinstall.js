/**
 * Post-install script - runs after npm install
 */

import { isAndroid } from './bionic-bypass.js';

function main() {
  console.log('\n📱 OpenFang-Termux post-install\n');

  if (!isAndroid()) {
    console.log('Not running on Android/Termux.');
    console.log('You can still use this package on other systems.\n');
    return;
  }

  console.log('✓ OpenFang-Termux installed');
  console.log('\n' + '═'.repeat(50));
  console.log('Run: openfangx setup');
  console.log('═'.repeat(50) + '\n');
}

main();
