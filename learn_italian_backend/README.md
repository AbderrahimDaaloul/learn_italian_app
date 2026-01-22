# Learn Italian Backend

A simple Express + PostgreSQL API to store Italian/English word translations.

## Prerequisites
- Node.js 18+
- PostgreSQL running locally and accessible with the credentials in `.env`

## Setup
```bash
npm install
npm run init-db
npm run seed
```
This creates the database, creates the table, and populates it with ~600 common Italian words.


## Run
Development (auto-restart on changes):
```bash
npm run dev
```
Production:
```bash
npm start
```

## Healthcheck
```bash
curl http://127.0.0.1:5000/health
```

## API
- List all words
```bash
curl http://127.0.0.1:5000/api/words
```
- Add a new word
```bash
curl -X POST http://127.0.0.1:5000/api/words \
  -H "Content-Type: application/json" \
  -d '{"italian_word":"ciao","english_word":"hello"}'
```

## Environment
Edit `.env` if needed:
```
PORT=5000
DB_HOST=localhost
DB_PORT=5432
DB_NAME=translations_db
DB_USER=postgres
DB_PASSWORD=admin
```
