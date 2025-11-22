# WealthWise Backend

A production-grade modular monolith backend for the WealthWise financial application, built with Node.js, Express, TypeScript, Drizzle ORM, Neon Database, and Clerk Authentication.

## 🏗️ Architecture

This backend follows a **Modular Monolith** architecture, combining the simplicity of a monolithic application with the organization of microservices.

### Tech Stack

- **Runtime**: Node.js (v18+)
- **Framework**: Express.js
- **Language**: TypeScript
- **Database**: Neon (Serverless PostgreSQL)
- **ORM**: Drizzle ORM
- **Authentication**: Clerk
- **Validation**: Zod
- **Security**: Helmet, CORS

## 📁 Project Structure

```
backend/
├── src/
│   ├── config/           # Configuration files
│   │   ├── cron.ts       # Keep-alive cron job for Render
│   │   ├── db.ts         # Database connection
│   │   └── env.ts        # Environment variable validation
│   ├── db/
│   │   ├── migrations/   # Database migrations (auto-generated)
│   │   └── schema.ts     # Centralized database schema
│   ├── middleware/       # Express middleware
│   │   ├── auth.ts       # Role/permission middleware
│   │   ├── clerkAuth.ts  # Clerk authentication
│   │   ├── error.ts      # Global error handler
│   │   └── validate.ts   # Zod validation middleware
│   ├── modules/          # Feature modules
│   │   ├── expense-tracking/
│   │   ├── ai-advisor/
│   │   ├── users/
│   │   ├── microinvesting/
│   │   ├── learning/
│   │   └── notifications/
│   ├── routes/           # Route aggregation
│   │   └── index.ts
│   └── server.ts         # Application entry point
├── .env                  # Environment variables (not committed)
├── .env.example          # Environment variables template
├── drizzle.config.ts     # Drizzle ORM configuration
├── package.json
├── tsconfig.json
└── README.md
```

### Module Structure

Each module follows a consistent 4-file pattern:

```
module-name/
├── module-name.validators.ts    # Zod validation schemas
├── module-name.routes.ts        # Express route definitions
├── module-name.controllers.ts   # Request/response handlers
└── module-name.repo.ts          # Database operations
```

## 🚀 Getting Started

### Prerequisites

- Node.js v18 or higher
- npm or yarn
- Neon database account
- Clerk account

### Installation

1. **Install dependencies**

```bash
npm install
```

2. **Set up environment variables**

Copy `.env.example` to `.env` and fill in your credentials:

```bash
cp .env.example .env
```

Required environment variables:
- `DATABASE_URL`: Neon PostgreSQL connection string
- `CLERK_PUBLISHABLE_KEY`: Your Clerk publishable key
- `CLERK_SECRET_KEY`: Your Clerk secret key
- `RENDER_EXTERNAL_URL`: (Optional) Your Render app URL for keep-alive

3. **Generate database migrations**

```bash
npm run db:generate
```

4. **Push schema to database**

```bash
npm run db:push
```

### Development

Run the development server with hot reload:

```bash
npm run dev
```

The server will start on `http://localhost:3000` (or the PORT specified in `.env`).

### Production

1. **Build the application**

```bash
npm run build
```

2. **Start the production server**

```bash
npm start
```

## 📡 API Endpoints

Base URL: `http://localhost:3000/api/v1`

### Health Check

- `GET /health` - Server health status

### API Info

- `GET /api/v1` - API information and available endpoints

### Modules

- `GET /api/v1/expense-tracking` - Expense tracking endpoints
- `GET /api/v1/ai-advisor` - AI financial advisor endpoints
- `GET /api/v1/users` - User management endpoints
- `GET /api/v1/microinvesting` - Microinvesting endpoints
- `GET /api/v1/learning` - Financial learning endpoints
- `GET /api/v1/notifications` - Notifications endpoints

## 🔐 Authentication

This API uses Clerk for authentication. Include the session token in the Authorization header:

```
Authorization: Bearer <clerk_session_token>
```

Protected routes will return `401 Unauthorized` without a valid token.

## 🗄️ Database

### Drizzle Commands

```bash
# Generate migrations from schema changes
npm run db:generate

# Push schema directly to database (development)
npm run db:push

# Run migrations
npm run db:migrate

# Open Drizzle Studio (database GUI)
npm run db:studio
```

### Schema

The database schema is centralized in `src/db/schema.ts`. Key tables:

- **users**: User profiles synced from Clerk
- **transactions**: Financial transactions (expenses, income, investments)

## 🛠️ Scripts

```json
{
  "dev": "Development server with hot reload",
  "build": "Compile TypeScript to JavaScript",
  "start": "Run production server",
  "db:generate": "Generate Drizzle migrations",
  "db:push": "Push schema to database",
  "db:migrate": "Run database migrations",
  "db:studio": "Open Drizzle Studio",
  "type-check": "Check TypeScript types without compiling",
  "lint": "Run ESLint"
}
```

## 🔒 Security Features

- **Helmet**: Sets security-related HTTP headers
- **CORS**: Configurable cross-origin resource sharing
- **Type-safe environment variables**: Validated at startup with Zod
- **Input validation**: All inputs validated with Zod schemas
- **SQL injection protection**: Drizzle ORM with parameterized queries
- **Authentication**: Clerk-based authentication with session verification

## 📊 Error Handling

The application uses a centralized error handling middleware that:

- Catches all errors across the application
- Returns consistent JSON error responses
- Formats Zod validation errors
- Includes stack traces in development mode
- Logs errors for debugging

## 🔄 Keep-Alive Cron (Render)

For Render's free tier, the application includes a keep-alive cron job that:

- Runs every 14 minutes
- Pings the `/health` endpoint
- Prevents the application from spinning down due to inactivity

Set `RENDER_EXTERNAL_URL` in your environment variables to enable this feature.

## 🚧 Development Guidelines

### Adding a New Module

1. Create a new directory in `src/modules/`
2. Add the 4 required files:
   - `module-name.validators.ts`
   - `module-name.routes.ts`
   - `module-name.controllers.ts`
   - `module-name.repo.ts`
3. Import and mount the routes in `src/routes/index.ts`

### Adding Database Tables

1. Define the table in `src/db/schema.ts`
2. Run `npm run db:generate` to create a migration
3. Run `npm run db:push` or `npm run db:migrate` to apply changes

### Type Safety

- All environment variables are validated with Zod
- All request inputs are validated with Zod
- All database queries use Drizzle's type-safe query builder
- TypeScript strict mode is enabled

## 📝 License

MIT

## 👥 Contributing

This is a production-grade template. Feel free to fork and customize for your needs.

---

Built with ❤️ following Google's Engineering Guidelines

