#!/bin/bash

set -e  # Exit on any error

echo "🔧 Setting up database migrations..."

# Check if migrate is already installed
if command -v migrate &> /dev/null; then
    echo "✅ migrate tool already installed"
else
    echo "📥 Installing migrate tool..."
    
    # Create local bin directory if it doesn't exist
    mkdir -p ~/.local/bin
    
    # Download and install migrate
    MIGRATE_VERSION="4.17.0"
    OS=$(uname -s | tr '[:upper:]' '[:lower:]')
    ARCH=$(uname -m)
    
    # Convert architecture names
    case $ARCH in
        x86_64) ARCH="amd64" ;;
        aarch64) ARCH="arm64" ;;
        armv7l) ARCH="arm" ;;
    esac
    
    MIGRATE_URL="https://github.com/golang-migrate/migrate/releases/download/v${MIGRATE_VERSION}/migrate.${OS}-${ARCH}.tar.gz"
    
    echo "Downloading from: $MIGRATE_URL"
    curl -L "$MIGRATE_URL" | tar xz -C ~/.local/bin
    chmod +x ~/.local/bin/migrate
    
    # Add to PATH if not already there
    if [[ ":$PATH:" != *":$HOME/.local/bin:"* ]]; then
        export PATH="$HOME/.local/bin:$PATH"
        echo "Added ~/.local/bin to PATH"
    fi
    
    echo "✅ migrate tool installed successfully"
fi

# Verify installation
if ! command -v migrate &> /dev/null; then
    echo "❌ migrate tool not found in PATH. Please add ~/.local/bin to your PATH"
    echo "Run: export PATH=\"\$HOME/.local/bin:\$PATH\""
    exit 1
fi

echo "🗄️ Running database migrations..."

# Build connection string from environment variables
if [ -n "$DATABASE_URL" ]; then
    DB_URL="$DATABASE_URL"
else
    # Use individual variables
    DB_URL="postgres://${PGUSER}:${PGPASSWORD}@${PGHOST}/${PGDATABASE}?sslmode=disable"
fi

echo "📍 Using database: ${PGHOST}/${PGDATABASE}"
echo "🚀 Running migrations..."

migrate -path ./migrations -database "$DB_URL" up

echo "✅ All migrations completed successfully!"