#!/bin/sh
set -eu

# OpenFang Installer
# https://openfang.sh

REPO="RightNow-AI/openfang"
INSTALL_DIR="$HOME/.openfang"
BIN_DIR="$HOME/.openfang/bin"
BINARY="openfang"

main() {
  need_cmd curl
  need_cmd tar
  need_cmd uname

  _os="$(uname -s)"
  _arch="$(uname -m)"

  case "$_os" in
    Linux)
      case "$_arch" in
        x86_64|amd64)  _target="x86_64-unknown-linux-gnu" ;;
        aarch64|arm64) _target="aarch64-unknown-linux-gnu" ;;
        *)             err "Unsupported architecture: $_arch" ;;
      esac
      ;;
    Darwin)
      case "$_arch" in
        x86_64|amd64)  _target="x86_64-apple-darwin" ;;
        aarch64|arm64) _target="aarch64-apple-darwin" ;;
        *)             err "Unsupported architecture: $_arch" ;;
      esac
      ;;
    *)
      err "Unsupported OS: $_os"
      ;;
  esac

  _url="https://github.com/${REPO}/releases/latest/download/openfang-${_target}.tar.gz"

  say "Detected: $_os $_arch -> $_target"
  say "Downloading from: $_url"

  _tmpdir="$(mktemp -d 2>/dev/null || mktemp -d -t openfang)"
  trap 'rm -rf "$_tmpdir"' EXIT

  _code=$(curl -fsSL -w "%{http_code}" "$_url" -o "${_tmpdir}/openfang.tar.gz") || true
  if [ "$_code" = "404" ]; then
    err "Release not found for ${_target}"
  fi
  if [ ! -f "${_tmpdir}/openfang.tar.gz" ] || [ "$(wc -c < "${_tmpdir}/openfang.tar.gz")" -lt 1000 ]; then
    err "Download failed (HTTP ${_code})"
  fi

  say "Extracting..."
  tar -xzf "${_tmpdir}/openfang.tar.gz" -C "$_tmpdir"

  _bin="$(find "$_tmpdir" -name "$BINARY" -type f -perm +111 2>/dev/null | head -1)"
  if [ -z "$_bin" ]; then
    _bin="$(find "$_tmpdir" -name "$BINARY" -type f | head -1)"
  fi
  if [ -z "$_bin" ]; then
    err "Could not find openfang binary in archive"
  fi

  mkdir -p "$BIN_DIR"
  cp "$_bin" "${BIN_DIR}/$BINARY"
  chmod +x "${BIN_DIR}/$BINARY"

  if "${BIN_DIR}/$BINARY" --version >/dev/null 2>&1; then
    _ver=$("${BIN_DIR}/$BINARY" --version 2>/dev/null || echo "unknown")
    say "Installed: $_ver"
  else
    say "Installed to: ${BIN_DIR}/$BINARY"
  fi

  add_to_path

  say ""
  say "OpenFang installed successfully!"
  say ""
  say "  Run: openfang init"
  say "  Docs: https://openfang.sh/docs"
  say ""
}

add_to_path() {
  case ":$PATH:" in
    *":${BIN_DIR}:"*) return ;;
  esac

  _line="export PATH=\"${BIN_DIR}:\$PATH\""

  _profile=""
  if [ -n "${SHELL:-}" ]; then
    case "$SHELL" in
      */zsh)  _profile="$HOME/.zshrc" ;;
      */bash)
        if [ -f "$HOME/.bashrc" ]; then
          _profile="$HOME/.bashrc"
        else
          _profile="$HOME/.bash_profile"
        fi ;;
      *)      _profile="$HOME/.profile" ;;
    esac
  else
    _profile="$HOME/.profile"
  fi

  if [ -n "$_profile" ] && [ -f "$_profile" ]; then
    if ! grep -q "/.openfang/bin" "$_profile" 2>/dev/null; then
      printf "\n# OpenFang\n%s\n" "$_line" >> "$_profile"
    fi
  fi
}

say() {
  printf "  \033[1;36mopenfang\033[0m %s\n" "$1"
}

err() {
  printf "  \033[1;36mopenfang\033[0m \033[1;31merror:\033[0m %s\n" "$1" >&2
  exit 1
}

need_cmd() {
  if ! command -v "$1" >/dev/null 2>&1; then
    err "need '$1' (command not found)"
  fi
}

main
#
# OpenClaw-Termux Installer
# One-liner: curl -fsSL https://raw.githubusercontent.com/mithun50/openclaw-termux/main/install.sh | bash
#

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}"
echo "╔═══════════════════════════════════════════╗"
echo "║     OpenClaw-Termux Installer            ║"
echo "║     AI Gateway for Android                ║"
echo "╚═══════════════════════════════════════════╝"
echo -e "${NC}"

# Check if running in Termux
if [ ! -d "/data/data/com.termux" ] && [ -z "$TERMUX_VERSION" ]; then
    echo -e "${YELLOW}Warning:${NC} Not running in Termux - some features may not work"
fi

# Update and install packages
echo -e "\n${BLUE}[1/2]${NC} Installing required packages..."
pkg update -y
pkg install -y nodejs-lts git proot-distro

echo -e "  ${GREEN}✓${NC} Node.js $(node --version)"
echo -e "  ${GREEN}✓${NC} npm $(npm --version)"
echo -e "  ${GREEN}✓${NC} git installed"
echo -e "  ${GREEN}✓${NC} proot-distro installed"

# Install openclaw-termux from npm
echo -e "\n${BLUE}[2/2]${NC} Installing openclaw-termux..."
npm install -g openclaw-termux

echo -e "\n${GREEN}═══════════════════════════════════════════${NC}"
echo -e "${GREEN}Installation complete!${NC}"
echo -e "${GREEN}═══════════════════════════════════════════${NC}"
echo ""
echo -e "${YELLOW}Next steps:${NC}"
echo "  1. Run setup:      openclawx setup"
echo "  2. Run onboarding: openclawx onboarding"
echo "     → Select 'Loopback (127.0.0.1)' when asked!"
echo "  3. Start gateway:  openclawx start"
echo ""
echo -e "Dashboard: ${BLUE}http://127.0.0.1:18789${NC}"
echo ""
echo -e "${YELLOW}Tip:${NC} Disable battery optimization for Termux in Android settings"
echo ""
