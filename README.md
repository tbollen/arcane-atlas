# Arcane Atlas
Arcane Atlas is an open-source SvelteKit application designed to help users explore and manage collections of magical items, spells, and lore. It features user authentication, database integration, and a responsive UI. 

Help us improve Arcane Atlas by contributing code, reporting issues, or suggesting new features!
#

### Feeling generous? 
Consider sponsoring the project on Ko-fi: [https://ko-fi.com/thomasbollen](https://ko-fi.com/thomasbollen)

## Setup Instructions

Follow these steps to get Arcane Atlas running locally for development or testing. This guide will help you configure environment variables, set up your database, install dependencies, and start the application. After completing these steps, you'll have a working local instance of Arcane Atlas.

### 1. Copy and Configure Environment Variables

Copy the example environment file to `.env`:
```bash
cp .example.env .env
```
Edit `.env` and define the following variables:
- `BASE_URL`: The base URL for your app (e.g., `http://localhost:5173`).
- `DATABASE_URL`: Connection string for your PostgreSQL database. Format: `postgresql://USER:PASSWORD@HOST:PORT/DATABASE?schema=SCHEMA`.
- `BETTER_AUTH_SECRET`: Any crypto-safe key for authentication.
- `BETTER_AUTH_URL`: Base URL of your app (default: `http://localhost:5173`).
- `RESEND_API_KEY`: Your Resend email API key (for sending transactional emails).
- `RESEND_DOMAIN`: Domain extension for sending emails (e.g., `resend.dev`).
- `DISCORD_CLIENT_ID` / `DISCORD_CLIENT_SECRET`: Discord OAuth credentials for social login.
- `GITHUB_CLIENT_ID` / `GITHUB_CLIENT_SECRET`: GitHub OAuth credentials for social login.


### 2. Start the Database (Docker)

Arcane Atlas uses PostgreSQL as its database. If you don't have PostgreSQL installed locally, you can use Docker Compose to quickly spin up a database container.

To start the database using Docker Compose:
```bash
cd development-server
docker-compose up -d
```
This will run the database in the background. Make sure the `DATABASE_URL` in your `.env` matches the credentials in your Docker Compose setup.


### 3. Install Dependencies

Install all required Node.js packages for the project. This ensures you have all the libraries needed to run and develop Arcane Atlas.

In the project root, run:
```bash
npm install
```

### 4. Set Up Prisma

Prisma is an ORM (Object-Relational Mapping) tool that makes it easy to interact with your database in a type-safe way. It generates a client library based on your database schema.

Generate the Prisma client (required after cloning, or when the schema changes):
```bash
npx prisma generate
```

If you are setting up the project for the first time or want a clean slate, use:
```bash
npx prisma db push
```
This command pushes your current Prisma schema directly to the database, creating all tables and columns as defined, without using migration history. It's ideal for local development or resetting your database structure quickly.

Alternatively, if you want to apply migration history (recommended for production or collaborative development), run:
```bash
npx prisma migrate dev
```
This command applies all database migrations, creating the necessary tables and columns as defined in the Prisma schema files.


### 5. Start the Development Server

This command starts the SvelteKit development server, allowing you to view and work on Arcane Atlas locally.

Run:
```bash
npm run dev
```
Or use the provided `launch.json` for VS Code to start and debug the server.

---
To create a production version of your app:

```bash
npm run build
```

You can preview the production build with `npm run preview`.

> To deploy your app, you may need to install an [adapter](https://kit.svelte.dev/docs/adapters) for your target environment.
