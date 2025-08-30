# Deployment Troubleshooting Guide

## Current Issue

The application is failing Railway's health check at `/health` endpoint.

## Debugging Steps

### 1. Test Basic Server (Current)

- Using `npm run start:test` which runs a minimal server without database dependencies
- This will help isolate whether the issue is with the server startup or database connection

### 2. Test Full Server (Next)

- Once basic server works, switch to `npm start` in nixpacks.toml
- This runs the full application with database connection attempts

### 3. Test With Migrations (Final)

- Once full server works, switch to `npm run start:with-migrations`
- This runs migrations before starting the server

## Environment Variables Required

- `PORT` - Railway sets this automatically
- `NODE_ENV` - Set to "production" in railway.toml
- Database variables (for full server):
  - `PGHOST`, `PGPORT`, `PGUSER`, `PGPASSWORD`, `PGDATABASE`
  - Or `DATABASE_URL`

## Health Check Endpoints

- `/health` - Basic health check
- `/` - Root endpoint for connectivity test

## Logs to Check

- Application startup logs
- Database connection logs
- Health check request logs
- Any error messages

## Common Issues

1. **Database Connection**: SSL configuration, credentials, network access
2. **Port Binding**: Server not listening on correct port
3. **Migration Failures**: Database schema issues
4. **Environment Variables**: Missing or incorrect configuration
