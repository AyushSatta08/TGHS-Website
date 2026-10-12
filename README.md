# TGHS Applicant Tracking System

A small full-stack ATS prototype for recording candidates, reviewing applications, and moving candidates through a hiring pipeline. It uses React and Vite in the browser and Node.js, Express, and Mongoose on the server.

## Requirements

- Node.js 20 or newer
- MongoDB running locally or a MongoDB connection string

## Run locally

1. Copy `.env.example` to `.env` and set `MONGODB_URI`.
2. Install packages with `npm install`.
3. Start both the API and React app with `npm run dev`.
4. Open the Vite URL shown in the terminal (normally `http://localhost:5173`).

The API runs on port 4000 by default. Set `PORT` to change it. The client reads `VITE_API_URL` and defaults to `http://localhost:4000`.

## Prototype workflow

Add an applicant with name, email, role, and optional notes. The dashboard shows the pipeline, supports status changes, and allows filtering by status or searching by name, email, or role. Applications are stored in MongoDB. The API validates required fields and email format and returns consistent JSON errors.

## API

| Method | Path | Purpose |
| --- | --- | --- |
| GET | `/api/health` | Server and database readiness |
| GET | `/api/applications` | List applications; optional `status` and `q` query parameters |
| POST | `/api/applications` | Create an application |
| PATCH | `/api/applications/:id` | Update status or notes |
| DELETE | `/api/applications/:id` | Delete an application |

The prototype does not include authentication or authorization yet. Add those before using real applicant data.

## Project notes

- [Merge conflict practice and resolution strategies](docs/MERGE_CONFLICTS.md)
- [Progress update and architecture overview](docs/PROGRESS.md)
