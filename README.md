<div align="center">

<img src="docs/media/booking.gif" alt="Booking a class: open the course list, pick Salsa Foundations, choose the Thursday session, enter a name, email and phone, confirm, and the new dancer appears under Who's coming" width="820">

# Dance Booking System

**Class booking for a community dance studio: browse courses, pick a session and enrol in a minute, while organisers run the timetable, the bookings and the accounts.**

[![Live demo](https://img.shields.io/badge/demo-live-FF5C8A?logo=render&logoColor=white)](https://dance-booking-system.onrender.com/)
[![CI](https://github.com/Bogdusik/Dance-Booking-System/actions/workflows/ci.yml/badge.svg)](https://github.com/Bogdusik/Dance-Booking-System/actions/workflows/ci.yml)
![Node.js](https://img.shields.io/badge/Node.js-Express_4-339933?logo=nodedotjs&logoColor=white)
![Mustache](https://img.shields.io/badge/views-Mustache-FFB547)
![NeDB](https://img.shields.io/badge/database-NeDB-5C6BC0)
![Docker](https://img.shields.io/badge/Docker-ready-2496ED?logo=docker&logoColor=white)

[Live demo](https://dance-booking-system.onrender.com/) · [Features](#features) · [Architecture](#architecture) · [Run it locally](#run-it-locally)

</div>

> **Try the organiser side:** log in as `organiser` / `dance-demo`. The demo runs on Render's free tier, so the first request can take about 30 seconds while it wakes up, and the data resets on every deploy. All courses, venues and people in it are made up.

## Features

<table>
  <tr>
    <td width="50%"><img src="docs/media/home.png" alt="Home page: headline 'Find your rhythm, book your spot', course and session counts, and a Coming up list of the next four sessions with dates and prices"></td>
    <td width="50%"><img src="docs/media/course.png" alt="Salsa Foundations course page: gradient header with duration and enrolment count, a class schedule with Book buttons, and a Save your place card"></td>
  </tr>
  <tr>
    <td><b>Browse.</b> Every course shows its length, how many sessions it has, the next date and the lowest price.</td>
    <td><b>Book.</b> Each session has its own Book button that opens the form with that session already selected. No account needed.</td>
  </tr>
  <tr>
    <td><img src="docs/media/dashboard.png" alt="Organiser dashboard: totals for courses, sessions and enrolments, forms to add a course and a session, and a table of sessions with booking counts and Edit and Delete buttons"></td>
    <td><img src="docs/media/participants.png" alt="Participants by session: each session with its date, venue and number of dancers, followed by a table of names, emails and phone numbers"></td>
  </tr>
  <tr>
    <td><b>Run the studio.</b> Organisers add courses and sessions, edit or cancel them, and see how many people booked each one.</td>
    <td><b>Know who's coming.</b> Contact details for every booking, grouped by session. Visitors only see names.</td>
  </tr>
</table>

<img src="docs/media/mobile.png" alt="The same app on a phone: home page, course schedule and the enrolment form" width="100%">

**Mobile-first layout:** the same pages on a 390 px phone screen.

### Roles

| | Visitor or member | Organiser |
|---|:---:|:---:|
| Browse courses and sessions | ✓ | ✓ |
| Enrol in a session | ✓ | ✓ |
| See participants' names | ✓ | ✓ |
| See participants' emails and phone numbers | | ✓ |
| Add, edit and delete courses and sessions | | ✓ |
| Manage accounts | | ✓ |

## Architecture

```mermaid
flowchart LR
  B[Browser] -->|HTML forms| M[Express middleware<br/>Helmet CSP · session · flash]
  M --> R[Routes<br/>public · auth · organiser]
  R --> V[express-validator]
  V --> C[Controllers]
  C --> D[(NeDB files<br/>users · courses<br/>classes · enrolments)]
  C --> T[Mustache views<br/>+ shared partials]
  T --> B
```

- **Server-rendered:** Express renders Mustache templates that share head, navigation and footer partials. The only client script is a small CSP-safe file for delete confirmations and fading messages.
- **Access control:** `isAuthenticated` and `isOrganiser` middleware protect the organiser routes. Passwords are hashed with bcrypt, and sessions use `httpOnly` cookies that are `secure` in production.
- **Validation:** every form goes through `express-validator` before it reaches a controller. Errors come back as flash messages on the same page.
- **Storage:** NeDB keeps each collection in a file under `db/`, so there is no database server to run. Deleting a course also removes its sessions and their enrolments.

## Tech stack

| Layer | Tools |
|---|---|
| Server | Node.js, Express 4, express-session, connect-flash, compression |
| Views | Mustache (mustache-express), hand-written CSS with no framework |
| Data | NeDB (`@seald-io/nedb`), file-based |
| Security | Helmet with a strict Content Security Policy, bcryptjs, express-validator |
| Logging | Winston |
| Tests | Mocha, Chai, Supertest |
| Delivery | Docker, Docker Compose, GitHub Actions (Node 20 and 22), Render |

## Run it locally

```bash
git clone https://github.com/Bogdusik/Dance-Booking-System.git
cd Dance-Booking-System
npm install
cp .env.example .env
npm start                 # http://localhost:3000
```

The repository ships with demo data. To rebuild it from scratch, run `npm run seed`. Then log in as `organiser` / `dance-demo`, or as one of the members `maya` and `leo` with the same password.

With Docker:

```bash
docker compose up -d      # http://localhost:3000
```

### Tests

```bash
npm test
```

36 integration tests cover authentication, access control, course and session management, enrolment and error pages. They use separate `test-*.db` files, so your demo data is left alone.

## Project structure

```
Dance-Booking-System/
├── app.js                 # Express setup: Helmet CSP, sessions, flash, nav state, routes
├── routes/                # index (public + enrolment), auth, organiser
├── controllers/           # course, organiser and auth logic
├── models/                # NeDB datastores
├── middlewares/           # auth guards, central error handler, async wrapper
├── utils/                 # validators, date and price formatting, logger
├── views/                 # Mustache pages
│   └── partials/          # head, nav, footer, course card
├── public/                # style.css, app.js, favicon
├── scripts/seed.js        # rebuilds db/ with fictional demo data
├── db/                    # NeDB data files
└── tests/                 # Mocha + Supertest suites
```

## What I learned

- **Server-side rendering without a framework:** shared layouts with Mustache partials, and view models prepared in the controllers so the templates stay logic-free.
- **Role-based access:** route-level guards and showing different data to visitors and organisers from the same page.
- **Content Security Policy in practice:** a strict `script-src 'self'` silently blocked inline `onsubmit` confirmations until the logic moved into a static script.
- **Validation and testing:** express-validator chains shared between the create and edit routes, with regression tests for the bugs they caught.
- **Containers and CI:** a Docker image for deployment and a GitHub Actions matrix across Node versions.
