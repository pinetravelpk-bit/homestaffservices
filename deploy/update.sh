#!/usr/bin/env bash
# Pull the latest code from GitHub, rebuild and restart. Run as root on the VPS.
set -euo pipefail
APP=/var/www/homestaffservices
DATA=/var/lib/homestaffservices
cd "$APP"
sudo -u homestaff git pull --ff-only
sudo -u homestaff -H env npm_config_cache="$DATA/.npm" npm ci --no-audit --no-fund
sudo -u homestaff -H env SITE_URL=https://homestaffservices.com DATA_DIR="$DATA" NEXT_TELEMETRY_DISABLED=1 npm run build
systemctl restart homestaffservices
echo "Updated and restarted."
