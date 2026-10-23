#!/usr/bin/env bash
# One-time server setup for homestaffservices.com. Run as root on the VPS.
set -euo pipefail
APP=/var/www/homestaffservices
DATA=/var/lib/homestaffservices
REPO=https://github.com/pinetravelpk-bit/homestaffservices.git

id homestaff >/dev/null 2>&1 || useradd --system --home "$DATA" --shell /usr/sbin/nologin homestaff
mkdir -p "$DATA"
[ -d "$APP/.git" ] || git clone "$REPO" "$APP"
chown -R homestaff:homestaff "$APP" "$DATA"
chmod 700 "$DATA"

cd "$APP"
sudo -u homestaff -H env npm_config_cache="$DATA/.npm" npm ci --no-audit --no-fund
sudo -u homestaff -H env SITE_URL=https://homestaffservices.com DATA_DIR="$DATA" NEXT_TELEMETRY_DISABLED=1 npm run build

install -m 644 deploy/homestaffservices.service /etc/systemd/system/homestaffservices.service
install -m 644 deploy/proxy.conf /etc/nginx/snippets/homestaff-proxy.conf
[ -f /etc/nginx/sites-available/homestaffservices.com ] || install -m 644 deploy/nginx.conf /etc/nginx/sites-available/homestaffservices.com
ln -sf /etc/nginx/sites-available/homestaffservices.com /etc/nginx/sites-enabled/homestaffservices.com

systemctl daemon-reload
systemctl enable --now homestaffservices
nginx -t && systemctl reload nginx
echo "Done. Next: certbot --nginx -d homestaffservices.com -d www.homestaffservices.com"
