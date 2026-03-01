/**
 * OpenFang-Termux - Main entry point
 */

import {
  configureTermux,
  getInstallStatus,
  installProot,
  installUbuntu,
  setupProotOpenFang,
  runInProot
} from './installer.js';
import { isAndroid } from './bionic-bypass.js';
import { spawn } from 'child_process';

const VERSION = '1.6.1';

function printBanner() {
  console.log(`
╔═══════════════════════════════════════════╗
║     OpenFang-Termux v${VERSION}              ║
║     Agent Operating System for Android    ║
╚═══════════════════════════════════════════╝
`);
}

function printHelp() {
  console.log(`
Usage: openfangx <command> [args...]

Commands:
  setup       Full installation (proot + Ubuntu + OpenFang)
  status      Check installation status
  start       Start OpenFang daemon (inside proot)
  shell       Open Ubuntu shell with OpenFang ready
  help        Show this help message

  Any other command is passed directly to openfang in proot:
    openfangx init           → openfang init
    openfangx start         → openfang start
    openfangx doctor        → openfang doctor
    openfangx hand list     → openfang hand list
    openfangx <anything>    → openfang <anything>

Examples:
  openfangx setup             # First-time setup
  openfangx start            # Start daemon
  openfangx init             # Initialize config
  openfangx shell            # Enter Ubuntu shell
`);
}

async function runSetup() {
  console.log('Starting OpenFang setup for Termux...\n');
  console.log('This will install: proot-distro → Ubuntu → OpenFang\n');

  if (!isAndroid()) {
    console.log('Warning: This package is designed for Android/Termux.');
    console.log('Some features may not work on other platforms.\n');
  }

  let status = getInstallStatus();

  // Step 1: Install proot-distro
  console.log('[1/4] Checking proot-distro...');
  if (!status.proot) {
    console.log('  Installing proot-distro...');
    installProot();
  } else {
    console.log('  ✓ proot-distro installed');
  }
  console.log('');

  // Step 2: Install Ubuntu
  console.log('[2/4] Checking Ubuntu in proot...');
  status = getInstallStatus();
  if (!status.ubuntu) {
    console.log('  Installing Ubuntu (this takes a while)...');
    installUbuntu();
  } else {
    console.log('  ✓ Ubuntu installed');
  }
  console.log('');

  // Step 3: Setup OpenFang in Ubuntu
  console.log('[3/4] Setting up OpenFang in Ubuntu...');
  status = getInstallStatus();
  if (!status.openFangInProot) {
    setupProotOpenFang();
  } else {
    console.log('  ✓ OpenFang already installed in proot');
  }
  console.log('');

  // Step 4: Configure Termux wake-lock
  console.log('[4/4] Configuring Termux...');
  configureTermux();
  console.log('');

  // Done
  console.log('═══════════════════════════════════════════');
  console.log('Setup complete!');
  console.log('');
  console.log('Next steps:');
  console.log('  1. Run init: openfangx init');
  console.log('     → Configure your API keys');
  console.log('  2. Start daemon:  openfangx start');
  console.log('');
  console.log('Dashboard: http://127.0.0.1:4200');
  console.log('═══════════════════════════════════════════');
}

function showStatus() {
  // Quick loading while checking proot
  process.stdout.write('Checking installation status...');
  const status = getInstallStatus();
  process.stdout.write('\r' + ' '.repeat(35) + '\r');

  console.log('Installation Status:\n');

  console.log('Termux:');
  console.log(`  proot-distro:     ${status.proot ? '✓ installed' : '✗ missing'}`);
  console.log(`  Ubuntu (proot):   ${status.ubuntu ? '✓ installed' : '✗ not installed'}`);
  console.log('');

  if (status.ubuntu) {
    console.log('Inside Ubuntu:');
    console.log(`  OpenFang:         ${status.openFangInProot ? '✓ installed' : '✗ not installed'}`);
    console.log('');
  }

  if (status.proot && status.ubuntu && status.openFangInProot) {
    console.log('Status: ✓ Ready to run!');
    console.log('');
    console.log('Commands:');
    console.log('  openfangx start       # Start daemon');
    console.log('  openfangx init       # Initialize/configure');
    console.log('  openfangx shell      # Enter Ubuntu shell');
  } else {
    console.log('Status: ✗ Setup incomplete');
    console.log('Run: openfangx setup');
  }
}

function startDaemon() {
  const status = getInstallStatus();

  if (!status.proot || !status.ubuntu) {
    console.error('proot/Ubuntu not installed. Run: openfangx setup');
    process.exit(1);
  }

  if (!status.openFangInProot) {
    console.error('OpenFang not installed in proot. Run: openfangx setup');
    process.exit(1);
  }

  // Loading animation until dashboard responds
  const frames = ['⠋', '⠙', '⠹', '⠸', '⠼', '⠴', '⠦', '⠧', '⠇', '⠏'];
  let i = 0;
  let started = false;
  const DASHBOARD_URL = 'http://127.0.0.1:4200';

  const spinner = setInterval(() => {
    if (!started) {
      process.stdout.write(`\r${frames[i++ % frames.length]} Starting OpenFang daemon...`);
    }
  }, 80);

  // Poll dashboard until it responds
  const checkDashboard = setInterval(async () => {
    if (started) return;
    try {
      const response = await fetch(DASHBOARD_URL, { method: 'HEAD', signal: AbortSignal.timeout(1000) });
      if (response.ok || response.status < 500) {
        started = true;
        clearInterval(spinner);
        clearInterval(checkDashboard);
        process.stdout.write('\r' + ' '.repeat(40) + '\r');
        console.log('✓ OpenFang daemon started!\n');
        console.log(`Dashboard: ${DASHBOARD_URL}`);
        console.log('Press Ctrl+C to stop\n');
        console.log('─'.repeat(45) + '\n');
      }
    } catch { /* ignore polling errors */ }
  }, 500);

  // Start daemon in background (suppress output until ready)
  const daemon = runInProot('openfang start');

  daemon.on('error', (err) => {
    clearInterval(spinner);
    clearInterval(checkDashboard);
    console.error('\nFailed to start daemon:', err.message);
  });

  daemon.on('close', (code) => {
    clearInterval(spinner);
    clearInterval(checkDashboard);
    if (!started) {
      console.log('\nDaemon exited before starting. Run: openfangx init');
    }
    console.log(`Daemon exited with code ${code}`);
  });
}

function runOpenfangCommand(args) {
  const status = getInstallStatus();

  if (!status.proot || !status.ubuntu || !status.openFangInProot) {
    console.error('Setup not complete. Run: openfangx setup');
    process.exit(1);
  }

  const command = args.join(' ');
  console.log(`Running: openfang ${command}\n`);

  const proc = runInProot(`openfang ${command}`);

  proc.on('error', (err) => {
    console.error('Failed to run command:', err.message);
  });
}

function openShell() {
  const status = getInstallStatus();

  if (!status.proot || !status.ubuntu) {
    console.error('proot/Ubuntu not installed. Run: openfangx setup');
    process.exit(1);
  }

  console.log('Entering Ubuntu shell...');
  console.log('Type "exit" to return to Termux\n');

  const shell = spawn('proot-distro', ['login', 'ubuntu'], {
    stdio: 'inherit'
  });

  shell.on('error', (err) => {
    console.error('Failed to open shell:', err.message);
  });
}

export async function main(args) {
  const command = args[0] || 'help';

  printBanner();

  switch (command) {
    case 'setup':
    case 'install':
      await runSetup();
      break;

    case 'status':
      showStatus();
      break;

    case 'start':
    case 'run':
      startDaemon();
      break;

    case 'shell':
    case 'ubuntu':
      openShell();
      break;

    case 'help':
    case '--help':
    case '-h':
      printHelp();
      break;

    default:
      // Pass any other command to openfang in proot
      runOpenfangCommand(args);
      break;
  }
}
