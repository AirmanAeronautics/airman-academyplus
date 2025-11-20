# Database Setup Guide

## Option 1: Local PostgreSQL (Recommended for Development)

### Install PostgreSQL via Homebrew

```bash
# Install PostgreSQL
brew install postgresql@16

# Start PostgreSQL service
brew services start postgresql@16

# Add to PATH (add to ~/.zshrc or ~/.bash_profile)
echo 'export PATH="/opt/homebrew/opt/postgresql@16/bin:$PATH"' >> ~/.zshrc
source ~/.zshrc
```

### Create Database

```bash
# Create database
createdb skynet_plus

# Or using psql
psql postgres -c "CREATE DATABASE skynet_plus;"
```

### Update .env

```bash
# Update DATABASE_URL in .env
DATABASE_URL="postgresql://$(whoami)@localhost:5432/skynet_plus?schema=public"
```

### Run Migration

```bash
npm run db:migrate
```

---

## Option 2: Supabase (Cloud Database)

### Get Connection String

1. Go to https://supabase.com/dashboard
2. Select your project (ID: vmzlvvbvidhtvcgqarou)
3. Go to Settings → Database
4. Copy the "Connection string" (URI format)

### Update .env

```bash
# Update DATABASE_URL with Supabase connection string
DATABASE_URL="postgresql://postgres:[YOUR-PASSWORD]@db.vmzlvvbvidhtvcgqarou.supabase.co:5432/postgres"
```

### Run Migration

```bash
npm run db:migrate
```

---

## Option 3: Docker (Alternative)

```bash
# Run PostgreSQL in Docker
docker run --name skynet-postgres \
  -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_DB=skynet_plus \
  -p 5432:5432 \
  -d postgres:16

# Update .env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/skynet_plus?schema=public"

# Run migration
npm run db:migrate
```

---

## Verify Connection

After setup, test the connection:

```bash
# Test connection
npm run db:migrate:check

# Or manually
psql "$DATABASE_URL" -c "SELECT version();"
```

