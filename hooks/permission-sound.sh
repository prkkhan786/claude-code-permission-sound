#!/usr/bin/env bash
# Plays a notification sound when Claude Code requests permissions.

if command -v afplay >/dev/null 2>&1; then
  afplay "/System/Library/Sounds/Glass.aiff"
elif command -v paplay >/dev/null 2>&1; then
  paplay /usr/share/sounds/freedesktop/stereo/complete.oga
else
  printf "\a"
fi
