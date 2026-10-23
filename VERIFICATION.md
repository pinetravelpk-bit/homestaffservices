# Verification — 21 October 2026

- Next.js production build: passed with TypeScript checks and no build warnings.
- Backend integration suite: 41 checks passed against an isolated production server.
- Browser: homepage hero, photographic service cards and about layout inspected against the approved image.
- Browser: matching administration overview inspected; Homepage tab navigation, field editing and saved-state feedback checked in the sample-data preview.
- Browser: hiring form submitted successfully; confirmation displayed; the saved database record was verified and then removed.
- Backend checks include public routes, missing-service 404, admin redirects, protected APIs, request-origin checks, form validation, honeypot rejection, enquiry/application persistence, failed and successful login, session cookies, notes/status persistence, content saving reflected on the public homepage, invalid slug rejection, JSON export, image upload/serving, SVG rejection, logout and session invalidation.

The live domain has not been deployed or configured. Real phone, email and WhatsApp details must be entered in admin Settings. Notification delivery is not configured. Native mobile-device testing was not performed; responsive breakpoints and reduced-motion styles are included. Default photographs are the AI-generated artwork from the approved design, with the resolution limitations explained in README.md.

## Hero slider update

Both Next.js builds (download and hosted design preview) passed after the carousel update. Browser checks confirmed slide buttons, next-slide navigation, animated copy/photo transitions and the original colour scheme. Four service stories are available by default. Automatic progression uses a 6.5 second dwell, with hover, focus, hidden-tab and reduced-motion pause conditions.
