# Home Staff Services — Next.js theme & admin

A complete, uploadable Next.js App Router project for **homestaffservices.com**, based on the approved emerald, ivory and gold homepage artwork. This is a Node.js website, not a WordPress theme ZIP.

## What is included

- Responsive homepage retaining the approved section order, imagery, colours, photo cards, and typography direction.
- Four-story automatic hero carousel: cinematic image movement, staggered text entrances, soft light sweeps, gold glints, slide dots, previous/next controls, pause control, touch swipes, hover/focus pause and reduced-motion support. Service stories follow the active cook, driver and care service images.
- Sticky navigation, desktop services menu, scroll reveals, scroll progress, subtle floating graphics, card hover effects, mobile hiring dock, reduced-motion support and keyboard-accessible forms.
- Six editable service pages, four editable city pages, about, contact, work application, privacy and hiring terms pages.
- Real persistent hiring enquiries and job applications, with confirmation and validation.
- Password-protected `/admin`: overview, search/filter enquiries, status tracking, private notes, delete, CSV export, homepage editor, service/area creation and editing, FAQ editor, image uploads and contact/SEO settings.
- `/admin/preview`: safe public design demonstration using explicitly labelled sample data. It does not read the live database and cannot modify live records. Remove `app/admin/preview` before building if you do not want this optional demonstration route.
- Dynamic metadata, canonical service/city URLs, XML sitemap, robots.txt, organisation JSON-LD and index blocking for admin pages.
- SQLite data storage and local uploaded-image delivery. No paid external CMS or authentication service is required.

## Requirements

**Node.js 22.13+ (Node 24 LTS recommended), npm, and a writable persistent disk.** Suitable for a VPS or hosting with a Node.js application feature. Ordinary PHP-only / WordPress hosting cannot execute this project.

The supplied SQLite architecture is intended for **one persistent Node.js instance**. Do not deploy unchanged to ephemeral serverless hosts or horizontally scaled instances. Those require migrating the data and uploads to managed storage. Node may emit an experimental SQLite warning; this does not prevent operation.

## Install and run locally

```bash
npm ci
cp .env.example .env.local
npm run setup-admin
npm run dev
```

Visit `http://localhost:3000`, `/admin/login`, or `/admin/preview`.

`setup-admin` asks for your email and a password of at least 12 characters. Password entry is visible in the terminal: use a private terminal. No default administrator or shared password is shipped. Running the command for an existing email resets its password and revokes its sessions.

## Upload to Node.js hosting

1. Extract the ZIP into your Node.js application folder. Set the hosting Node version to 24.
2. Run `npm ci` from that folder.
3. Copy `.env.example` to `.env.local`. Set `DATA_DIR` to a writable persistent directory outside the release folder if you replace deployments. Set the site URL to `https://homestaffservices.com`.
4. Run `npm run setup-admin` once in the same application folder and with the same `DATA_DIR`.
5. Run `npm run build`.
6. Start the application with `npm start` (default port 3000), or the hosting provider's equivalent startup command. A different port can be set with `PORT`.
7. Point the domain to the hosting server and configure HTTPS using the host's domain/SSL tools or reverse proxy.
8. Open `https://homestaffservices.com/admin/login`. In **Settings**, add your real email, phone, WhatsApp and canonical URL. Review services and cities; save changes.
9. Submit a test hiring request and work application. Verify them in the admin inbox and then remove the test records.

For an HTTP-only local production test, set `COOKIE_SECURE=false`; remove this override when the real domain uses HTTPS. Production sessions otherwise require secure cookies. Keep your data directory private and outside `public`.

### VPS / process manager example

```bash
npm ci
npm run setup-admin
npm run build
# If PM2 is installed on your server:
pm2 start npm --name homestaffservices -- start
pm2 save
```

Configure Nginx, Caddy or your host's reverse proxy to forward HTTPS requests to `127.0.0.1:3000`, preserving the original `Host` and `Origin` headers. Request-origin checks depend on the correct public Host header. Use one app instance for SQLite. Restrict inbound traffic to your proxy and apply edge rate limiting to `/api/enquiries` and `/api/admin/login` where your host supports it.

### Docker option

```bash
docker compose up -d --build
docker compose exec website npm run setup-admin
```

The supplied Compose file exposes the app only to the local server on port 3000 and persists records/uploads in a named volume. Put an HTTPS reverse proxy in front of it. Rebuilding the container preserves the volume.

## Content & photos

The default site reuses selected image regions from the approved generated artwork through SVG view boxes. This preserves the same photographic compositions without creating staff profiles. The artwork is AI-generated and illustrative; it does not depict your real staff or office. At large display sizes its original resolution is a visual limitation. Replace images with your own high-resolution photographs in **Admin → Media**, then select them in **Homepage** or **Services** to improve quality while retaining the layout. No external image servers, API keys or remote image URLs are required.

The logo is a lightweight house-and-leaf SVG/CSS interpretation of the concept. Text, forms, navigation, service captions, content and dashboard are live HTML components. System Georgia and Arial provide a reliable font pairing without third-party font requests.

Phone, email and WhatsApp are intentionally blank until you supply actual contact information. The WhatsApp button is automatically enabled after saving a number. No fake ratings, reviews, customer totals, guarantees or staff profiles are included. Cities are enquiry locations, with availability confirmed individually. Review them before publishing.

## Managing the website

- **Homepage:** edit the hero headline (line breaks supported), introduction, about copy and major images.
- **Services:** add or edit service names, unique URL slugs, descriptions, duties and photos; publish/hide services.
- **Areas:** add or edit cities and neighbourhoods, local copy and URL slugs; publish/hide cities.
- **FAQs:** add or remove questions and edit answers.
- **Enquiries / Applications:** search, filter, open records, change status, record notes and export CSV. Deleting is permanent and asks for confirmation.
- **Settings:** edit contact information, brand name, canonical URL, homepage title and meta description.
- **Backup:** the JSON export contains content and enquiries, including private contact data. Store it privately. For a complete backup including images, administrator credentials and database, back up the full `DATA_DIR` using your host’s volume snapshot tool or stop the app before copying its files. Do not copy only the `.sqlite` file while WAL writes are active.

Form submissions are saved to the admin dashboard. **Email, SMS and WhatsApp notifications are not configured.** The WhatsApp button opens a user-initiated chat; it does not automatically notify you of enquiries.

## Security and operation

Administrator passwords use salted scrypt hashes. Sessions use random opaque tokens whose hashes are stored in SQLite, expire after eight hours and use HttpOnly/SameSite cookies. Protected APIs independently check sessions and all mutations check same-origin requests. Public form validation, a honeypot and persistent submission/login limits are included. Uploads require admin login and accept checked JPG/PNG/WebP signatures, max 5 MB; SVG/HTML uploads are rejected. CSV exports neutralise formula prefixes. No administrator credentials or private records are included in the ZIP.

Only one administrator is needed to operate the site. Additional admins can be created through the setup command. This release does not include granular team roles, invoicing, payment collection or notifications.

## Verification

```bash
npm run typecheck
npm run build
# Starts an isolated temporary production server and cleans up its test data:
npm run test:integration
```

The integration check covers public pages, server validation, origin checks, protected admin endpoints, login/session handling, saving/reverting content, enquiry persistence/status updates, uploads and backups. It creates temporary records and removes them before completion. It does not send email or contact real people.

## Folder guide

- `app/`: public pages, admin routes, server endpoints, robots and sitemap.
- `components/`: responsive website and dashboard UI.
- `lib/`: typed content, SQLite persistence, authentication, validation and initial copy.
- `public/images/approved-design.png`: supplied artwork.
- `scripts/`: development launcher and administrator setup.
- `data/` (created at runtime; not shipped): database and uploaded media.

Keep `package-lock.json`; use `npm ci` on the server for reproducible dependencies.

## Live deployment (homestaffservices.com)

Hosted on the Inventive Clicks VPS (72.62.193.221) behind nginx, run by systemd on `127.0.0.1:3107`.

- Code: `/var/www/homestaffservices` (cloned from this repo)
- Data and uploads: `/var/lib/homestaffservices` (keep this backed up)
- First-time setup: `bash deploy/setup.sh`, then `certbot --nginx -d homestaffservices.com -d www.homestaffservices.com`
- Create the admin login: `cd /var/www/homestaffservices && sudo -u homestaff env DATA_DIR=/var/lib/homestaffservices npm run setup-admin`
- Deploy new changes after pushing to GitHub: `bash /var/www/homestaffservices/deploy/update.sh`
- Logs: `journalctl -u homestaffservices -f`

## Photo credits

Photos in `public/images/stock/` are from [Pexels](https://www.pexels.com) under the free Pexels licence (commercial use allowed, no attribution required). Pexels photo IDs: hero 3770107, housekeeper 7641552, cook 36870973, driver 36377051, nanny 12159154, elderly-care 7551653, guard 30516935, family 36799071, office 8112161.

## Blog

- Public pages: `/blog` (all articles) and `/blog/<slug>` (one article). The 3 newest articles also show on the homepage, and published articles are added to the sitemap automatically.
- Write articles in **Admin → Blog**: title, URL slug (filled in from the title), short summary, cover image, article text with a formatting toolbar and live preview, SEO title/description with a Google preview, author and publish date.
- **Save draft** keeps an article hidden; **Publish** puts it live; **Unpublish** hides it again.
- Article text uses simple Markdown (`## Heading`, `**bold**`, `- list`, `[link](/contact)`, images). Raw HTML is shown as text, never run.
- Posts are stored in the `posts` table of the SQLite database in `DATA_DIR`, and are included in the admin JSON backup.
- Three starter articles are added once on first run; edit or delete them freely.
