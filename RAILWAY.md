# Railway Deployment Guide

## Automatic Environment Variables

When you add a PostgreSQL service in Railway, it automatically injects these environment variables:

- `PGHOST` - PostgreSQL host
- `PGPORT` - PostgreSQL port (usually 5432)
- `PGUSER` - PostgreSQL username
- `PGPASSWORD` - PostgreSQL password
- `PGDATABASE` - PostgreSQL database name
- `DATABASE_URL` - Complete connection string (if provided)

## Migration Process

1. **Automatic Migration**: The `postbuild` script runs migrations after build
2. **Manual Migration**: Use `npm run migrate:up` to run migrations manually
3. **Migration Script**: `scripts/migrate.js` handles Railway's environment variables

## Deployment Steps

1. **Add PostgreSQL Service**:

   - Go to Railway dashboard
   - Click "New Service" → "Database" → "PostgreSQL"
   - Railway will automatically link it to your app

2. **Deploy Your App**:

   - Push your code to GitHub
   - Railway will automatically:
     - Install dependencies (`npm ci`)
     - Build the project (`npm run build`)
     - Run migrations (`npm run postbuild`)
     - Start the server (`npm start`)

3. **Health Check**:
   - Railway will check `/health` endpoint
   - Returns `{"status": "ok", "timestamp": "..."}`

## Environment Variables

Railway automatically sets:

- `PORT` - Port for your application
- `NODE_ENV` - Set to "production" in railway.toml

## Manual Migration Commands

```bash
# Run migrations
npm run migrate:up

# Check migration version
npm run migrate:version

# Rollback migrations
npm run migrate:down
```

## Troubleshooting

1. **Migration Fails**: Check Railway logs for database connection issues
2. **Build Fails**: Ensure all dependencies are in package.json
3. **Start Fails**: Check if `dist/index.js` exists after build
4. **Health Check Fails**: Verify the `/health` endpoint returns 200 OK
