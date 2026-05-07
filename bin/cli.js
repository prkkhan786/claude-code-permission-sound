#!/usr/bin/env node

import { execSync } from "child_process";
import { existsSync, mkdirSync, readFileSync, writeFileSync, copyFileSync } from "fs";
import { homedir } from "os";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const HOME = homedir();
const CLAUDE_DIR = join(HOME, ".claude");
const HOOKS_DIR = join(CLAUDE_DIR, "hooks");
const SETTINGS_PATH = join(CLAUDE_DIR, "settings.json");
const HOOK_DEST = join(HOOKS_DIR, "permission-sound.sh");
const HOOK_SRC = join(__dirname, "..", "hooks", "permission-sound.sh");

const [,, command] = process.argv;

if (command === "install") install();
else if (command === "uninstall") uninstall();
else {
  console.log("Usage:");
  console.log("  npx claude-code-permission-sound install");
  console.log("  npx claude-code-permission-sound uninstall");
}

function install() {
  // 1. Create ~/.claude/hooks/ if needed
  mkdirSync(HOOKS_DIR, { recursive: true });

  // 2. Copy hook script
  copyFileSync(HOOK_SRC, HOOK_DEST);
  execSync(`chmod +x "${HOOK_DEST}"`);
  console.log(`✓ Hook script installed → ${HOOK_DEST}`);

  // 3. Read or create settings.json
  let settings = {};
  if (existsSync(SETTINGS_PATH)) {
    try { settings = JSON.parse(readFileSync(SETTINGS_PATH, "utf8")); }
    catch { console.error("✗ Could not parse settings.json"); process.exit(1); }
  }

  // 4. Patch in our hook (non-destructive — preserves existing hooks)
  settings.hooks ??= {};
  settings.hooks.PermissionRequest ??= [];

  const alreadyInstalled = settings.hooks.PermissionRequest
    .some(group => group.hooks?.some(h => h.command?.includes("permission-sound")));

  if (alreadyInstalled) {
    console.log("✓ Hook already registered in settings.json");
  } else {
    settings.hooks.PermissionRequest.push({
      matcher: "*",
      hooks: [{
        type: "command",
        command: HOOK_DEST,
        timeout: 3000
      }]
    });
    writeFileSync(SETTINGS_PATH, JSON.stringify(settings, null, 2));
    console.log(`✓ settings.json updated → ${SETTINGS_PATH}`);
  }

  console.log("\n🎵 Done! Claude Code will now play a sound on every permission request.");
}

function uninstall() {
  // Remove hook entry from settings.json
  if (existsSync(SETTINGS_PATH)) {
    let settings = JSON.parse(readFileSync(SETTINGS_PATH, "utf8"));
    if (settings.hooks?.PermissionRequest) {
      settings.hooks.PermissionRequest = settings.hooks.PermissionRequest
        .filter(group => !group.hooks?.some(h => h.command?.includes("permission-sound")));
      writeFileSync(SETTINGS_PATH, JSON.stringify(settings, null, 2));
      console.log("✓ Removed from settings.json");
    }
  }
  // Remove script
  if (existsSync(HOOK_DEST)) {
    execSync(`rm "${HOOK_DEST}"`);
    console.log("✓ Removed hook script");
  }
  console.log("🔇 Uninstalled.");
}