# School Management API

A RESTful API built with **Node.js**, **Express.js**, and **MySQL** that lets you manage schools and retrieve them sorted by proximity to any location.

---

## Features

- `POST /addSchool` — Add a school with full input validation
- `GET /listSchools` — Fetch all schools sorted by distance from a user's coordinates (Haversine formula)
- Auto-creates the `schools` table on first boot
- Input validation via `express-validator`
- Security headers via `helmet`, CORS enabled, HTTP logging via `morgan`
- Consistent JSON response shape with meaningful error messages

---

## Project Structure

```
school-management-api/
├── server.js                   # Entry point — boots server & DB
├── src/
│   ├── app.js                  # Express app setup
│   ├── config/
│   │   └── db.js               # MySQL pool, testConnection, initSchema
│   ├── routes/
│   │   └── schools.js          # /addSchool  and  /listSchools
│   ├── middleware/
│   │   └── errorHandler.js     # Global error handler
│   └── utils/
│       └── distance.js         # Haversine distance calculation
├── docs/
│   ├── schema.sql              # Manual DB setup + optional seed data
│   └── School_Management_API.postman_collection.json
├── .env.example
├── .gitignore
└── package.json
```

---

## Quick Start

### 1. Clone & install

```bash
git clone <your-repo-url>
cd school-management-api
npm install
```

### 2. Configure environment

```bash
cp .env.example .env
# Open .env and set your MySQL credentials
```

`.env` fields:

| Variable      | Default             | Description                |
|---------------|---------------------|----------------------------|
| `PORT`        | `3000`              | HTTP port                  |
| `NODE_ENV`    | `development`       | Environment                |
| `DB_HOST`     | `localhost`         | MySQL host                 |
| `DB_PORT`     | `3306`              | MySQL port                 |
| `DB_USER`     | `root`              | MySQL username             |
| `DB_PASSWORD` | —                   | MySQL password             |
| `DB_NAME`     | `school_management` | Database name              |

### 3. Set up the database

**Option A** — Let the server auto-create the table:
```bash
# Just start the server; initSchema() runs on boot
npm start
```

**Option B** — Run the SQL script manually:
```bash
mysql -u root -p < docs/schema.sql
```

### 4. Start the server

```bash
npm start          # production
npm run dev        # development with auto-reload (nodemon)
```

---

## API Reference

### Health Check

```
GET /
```

**Response 200:**
```json
{
  "status": "ok",
  "message": "School Management API is running",
  "version": "1.0.0",
  "endpoints": {
    "addSchool": "POST /addSchool",
    "listSchools": "GET /listSchools?latitude=<lat>&longitude=<lng>"
  }
}
```

---

### POST /addSchool

Add a new school to the database.

**Request Body (JSON):**

| Field       | Type   | Required | Constraints                    |
|-------------|--------|----------|-------------------------------|
| `name`      | string | ✅       | Non-empty, max 255 chars       |
| `address`   | string | ✅       | Non-empty, max 500 chars       |
| `latitude`  | float  | ✅       | Number between -90 and 90      |
| `longitude` | float  | ✅       | Number between -180 and 180    |

**Example Request:**
```bash
curl -X POST http://localhost:3000/addSchool \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Delhi Public School",
    "address": "Sector 45, Noida, UP 201301",
    "latitude": 28.5706,
    "longitude": 77.3261
  }'
```

**Response 201:**
```json
{
  "success": true,
  "message": "School added successfully",
  "data": {
    "id": 1,
    "name": "Delhi Public School",
    "address": "Sector 45, Noida, UP 201301",
    "latitude": 28.5706,
    "longitude": 77.3261,
    "created_at": "2025-06-01T10:00:00.000Z"
  }
}
```

**Response 422 (validation error):**
```json
{
  "success": false,
  "message": "Validation failed",
  "errors": [
    { "field": "latitude", "message": "Latitude is required" }
  ]
}
```

---

### GET /listSchools

Fetch all schools sorted by proximity to the given coordinates.

**Query Parameters:**

| Parameter   | Type  | Required | Constraints                 |
|-------------|-------|----------|-----------------------------|
| `latitude`  | float | ✅       | Number between -90 and 90   |
| `longitude` | float | ✅       | Number between -180 and 180 |

**Example Request:**
```bash
curl "http://localhost:3000/listSchools?latitude=28.5355&longitude=77.3910"
```

**Response 200:**
```json
{
  "success": true,
  "count": 2,
  "userLocation": {
    "latitude": 28.5355,
    "longitude": 77.391
  },
  "data": [
    {
      "id": 1,
      "name": "Delhi Public School",
      "address": "Sector 45, Noida, UP 201301",
      "latitude": 28.5706,
      "longitude": 77.3261,
      "created_at": "2025-06-01T10:00:00.000Z",
      "distance_km": 6.34
    }
  ]
}
```

---

## Distance Algorithm

Proximity sorting uses the **Haversine formula** — the standard method for computing great-circle distance between two points on Earth's surface given their lat/lng:

```
a = sin²(Δlat/2) + cos(lat1) × cos(lat2) × sin²(Δlng/2)
d = 2R × atan2(√a, √(1−a))    where R = 6371 km
```

Implemented in `src/utils/distance.js`.

---

## Deployment

### Render / Railway / Fly.io

1. Push code to GitHub
2. Create a new Web Service pointing to your repo
3. Set environment variables in the hosting dashboard
4. Start command: `npm start`

### Environment on production

Set `NODE_ENV=production` — this suppresses stack traces in error responses.

---

## Postman Collection

Import `docs/School_Management_API.postman_collection.json` into Postman.

The collection includes:
- Health check
- Add school — success, missing fields, invalid coordinates
- List schools — success with sorted output, missing params

Set the `baseUrl` collection variable to your deployed URL.
