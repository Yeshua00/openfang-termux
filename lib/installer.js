/**
 * OpenFang Installer - Handles environment setup for Termux
 */

import { execSync, spawn } from 'child_process';
import fs from 'fs';
import path from 'path';

const HOME = process.env.HOME || '/data/data/com.termux/files/home';
const BASHRC = path.join(HOME, '.bashrc');
const ZSHRC = path.join(HOME, '.zshrc');
const PROOT_ROOTFS = '/data/data/com.termux/files/usr/var/lib/proot-distro/installed-rootfs';
const PROOT_UBUNTU_ROOT = path.join(PROOT_ROOTFS, 'ubuntu', 'root');

export function checkDependencies() {
  const deps = {
    node: false,
    npm: false,
    git: false,
    proot: false,
    rustc: false
  };

  try {
    execSync('node --version', { stdio: 'pipe' });
    deps.node = true;
  } catch { /* not installed */ }

  try {
    execSync('npm --version', { stdio: 'pipe' });
    deps.npm = true;
  } catch { /* not installed */ }

  try {
    execSync('git --version', { stdio: 'pipe' });
    deps.git = true;
  } catch { /* not installed */ }

  try {
    execSync('which proot-distro', { stdio: 'pipe' });
    deps.proot = true;
  } catch { /* not installed */ }

  try {
    execSync('rustc --version', { stdio: 'pipe' });
    deps.rustc = true;
  } catch { /* not installed */ }

  return deps;
}

export function installTermuxDeps() {
  console.log('Installing Termux dependencies...');

  const packages = ['nodejs-lts', 'git', 'openssh', 'curl'];

  try {
    execSync('pkg update -y', { stdio: 'inherit' });
    execSync(`pkg install -y ${packages.join(' ')}`, { stdio: 'inherit' });
    return true;
  } catch (err) {
    console.error('Failed to install Termux packages:', err.message);
    return false;
  }
}

export function configureTermux() {
  console.log('Configuring Termux for background operation...');

  // Create wake-lock script
  const wakeLockScript = path.join(HOME, '.openfang', 'wakelock.sh');
  const wakeLockContent = `#!/bin/bash
# Keep Termux awake while OpenFang runs
termux-wake-lock
trap "termux-wake-unlock" EXIT
exec "$@"
`;

  fs.writeFileSync(wakeLockScript, wakeLockContent, 'utf8');
  fs.chmodSync(wakeLockScript, '755');

  console.log('Wake-lock script created');
  console.log('');
  console.log('IMPORTANT: Disable battery optimization for Termux in Android settings!');

  return true;
}

export function getInstallStatus() {
  const PROOT_ROOTFS = '/data/data/com.termux/files/usr/var/lib/proot-distro/installed-rootfs';

  // Check proot-distro
  let hasProot = false;
  try {
    execSync('command -v proot-distro', { stdio: 'pipe' });
    hasProot = true;
  } catch { /* not installed */ }

  // Check if ubuntu is installed by checking rootfs directory
  let hasUbuntu = false;
  try {
    hasUbuntu = fs.existsSync(path.join(PROOT_ROOTFS, 'ubuntu'));
  } catch { /* check failed */ }

  // Check if openfang exists in proot ubuntu
  let hasOpenFangInProot = false;
  if (hasUbuntu) {
    try {
      execSync('proot-distro login ubuntu -- bash -c "command -v openfang"', { stdio: 'pipe', timeout: 15000 });
      hasOpenFangInProot = true;
    } catch { /* not installed */ }
  }

  // Check for OpenFang binary directly
  let hasOpenFangBinary = false;
  if (hasUbuntu) {
    try {
      const binPath = path.join(PROOT_UBUNTU_ROOT, '.local', 'bin', 'openfang');
      hasOpenFangBinary = fs.existsSync(binPath);
    } catch { /* check failed */ }
  }

  return {
    proot: hasProot,
    ubuntu: hasUbuntu,
    openFangInProot: hasOpenFangInProot || hasOpenFangBinary,
    // Legacy (for termux-native mode)
    openFang: (() => {
      try {
        execSync('command -v openfang', { stdio: 'pipe' });
        return true;
      } catch { return false; }
    })()
  };
}

export function installProot() {
  console.log('Installing proot-distro...');
  try {
    execSync('pkg install -y proot-distro', { stdio: 'inherit' });
    return true;
  } catch (err) {
    console.error('Failed to install proot-distro:', err.message);
    return false;
  }
}

export function installUbuntu() {
  console.log('Installing Ubuntu in proot (this may take a while)...');
  try {
    execSync('proot-distro install ubuntu', { stdio: 'inherit' });
    return true;
  } catch (err) {
    console.error('Failed to install Ubuntu:', err.message);
    return false;
  }
}

export function setupProotOpenFang() {
  console.log('Setting up OpenFang in Ubuntu...');

  const setupScript = `
    apt update && apt upgrade -y
    apt install -y curl wget git
    
    mkdir -p /root/.local/bin
    
    curl -fsSL https://github.com/RightNow-AI/openfang/releases/latest/download/openfang-linux-x64.tar.gz -o /tmp/openfang.tar.gz
    tar -xzf /tmp/openfang.tar.gz -C /root/.local/bin/
    chmod +x /root/.local/bin/openfang
    rm /tmp/openfang.tar.gz
    
    echo 'export PATH="$HOME/.local/bin:$PATH"' >> /root/.bashrc
  `;

  try {
    execSync(`proot-distro login ubuntu -- bash -c '${setupScript}'`, { stdio: 'inherit' });
    return true;
  } catch (err) {
    console.error('Failed to setup OpenFang:', err.message);
    return false;
  }
}
  console.log('Setting up OpenFang in Ubuntu...');

  // Install curl and dependencies first
  const setupScript = `
    apt update && apt upgrade -y
    apt install -y curl wget git build-essential
    
    # Install OpenFang via official installer
    curl -fsSL https://openfang.sh/install | sh
  `;

  try {
    execSync(`proot-distro login ubuntu -- bash -c '${setupScript}'`, { stdio: 'inherit' });
    return true;
  } catch (err) {
    console.error('Failed to setup OpenFang:', err.message);
    return false;
  }
}

export function runInProot(command) {
  return spawn('proot-distro', ['login', 'ubuntu', '--', 'bash', '-c', command], {
    stdio: 'inherit'
  });
}

export function runInProotWithCallback(command, onFirstOutput) {
  let firstOutput = true;

  const proc = spawn('proot-distro', ['login', 'ubuntu', '--', 'bash', '-c', command], {
    stdio: ['inherit', 'pipe', 'pipe']
  });

  proc.stdout.on('data', (data) => {
    if (firstOutput) {
      firstOutput = false;
      onFirstOutput();
    }
    process.stdout.write(data);
  });

  proc.stderr.on('data', (data) => {
    if (firstOutput) {
      firstOutput = false;
      onFirstOutput();
    }
    // Filter out harmless proot warnings
    const str = data.toString();
    if (!str.includes('proot warning') && !str.includes("can't sanitize")) {
      process.stderr.write(data);
    }
  });

  return proc;
}
