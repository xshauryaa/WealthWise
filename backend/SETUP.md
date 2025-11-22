# WealthWise Backend - Setup Guide

## 🎉 Scaffolding Complete!

Your production-grade modular monolith backend has been successfully scaffolded following Google's Engineering Guidelines.

## 📦 What's Been Created

### Configuration Files
- ✅ `package.json` - All dependencies configured
- ✅ `tsconfig.json` - TypeScript configuration with strict mode
- ✅ `drizzle.config.ts` - Drizzle ORM configuration
- ✅ `.gitignore` - Proper ignore patterns

### Core Infrastructure (`src/`)

#### Config (`src/config/`)
- ✅ `env.ts` - Type-safe environment variable validation with Zod
- ✅ `db.ts` - Drizzle ORM + Neon database connection
- ✅ `cron.ts` - Render keep-alive cron job

#### Database (`src/db/`)
- ✅ `schema.ts` - Centralized database schema (users & transactions tables)
- ✅ `migrations/` - Directory for Drizzle migrations

#### Middleware (`src/middleware/`)
- ✅ `clerkAuth.ts` - Clerk session verification with extended types
- ✅ `auth.ts` - Role/permission authorization middleware
- ✅ `validate.ts` - Zod validation middleware (HOF)
- ✅ `error.ts` - Global error handler with Zod error formatting

#### Modules (`src/modules/`)
All 6 modules scaffolded with 4 files each:

1. **expense-tracking/** - Personal finance tracking
   - validators.ts, routes.ts, controllers.ts, repo.ts

2. **ai-advisor/** - AI-powered financial advice
   - validators.ts, routes.ts, controllers.ts, repo.ts

3. **users/** - User management & profiles
   - validators.ts, routes.ts, controllers.ts, repo.ts

4. **microinvesting/** - Investment tracking & round-ups
   - validators.ts, routes.ts, controllers.ts, repo.ts

5. **learning/** - Financial education & courses
   - validators.ts, routes.ts, controllers.ts, repo.ts

6. **notifications/** - User notifications system
   - validators.ts, routes.ts, controllers.ts, repo.ts

#### Routes (`src/routes/`)
- ✅ `index.ts` - Main router aggregating all modules

#### Entry Point
- ✅ `server.ts` - Express app initialization & startup

## 🚀 Next Steps

### 1. Install Dependencies

```bash
cd backend
npm install
```

### 2. Set Up Environment Variables

Create a `.env` file in the `backend/` directory:

```bash
# Copy template (if you have one)
# Or create manually with these variables:

DATABASE_URL=postgresql://user:pass@host/db?sslmode=require
CLERK_PUBLISHABLE_KEY=pk_test_xxxxx
CLERK_SECRET_KEY=sk_test_xxxxx
PORT=3000
NODE_ENV=development
RENDER_EXTERNAL_URL=https://your-app.onrender.com  # Optional
```

**Getting Credentials:**
- **Neon Database**: https://neon.tech (free tier available)
- **Clerk Auth**: https://clerk.dev (free tier available)

### 3. Set Up Database

```bash
# Generate initial migration from schema
npm run db:generate

# Push schema to Neon database
npm run db:push
```

### 4. Run Development Server

```bash
npm run dev
```

Your server will start at `http://localhost:3000`

### 5. Test the API

**Health Check:**
```bash
curl http://localhost:3000/health
```

**API Info:**
```bash
curl http://localhost:3000/api/v1
```

**Test Protected Endpoint (requires Clerk token):**
```bash
curl -H "Authorization: Bearer <clerk_token>" \
  http://localhost:3000/api/v1/users/me
```

## 🛠️ Development Workflow

### Adding Business Logic to Modules

Each module is currently scaffolded with placeholder responses. To implement:

1. **Repository (`*.repo.ts`)**: Add database queries using Drizzle
2. **Controllers (`*.controllers.ts`)**: Add business logic
3. **Validators (`*.validators.ts`)**: Refine Zod schemas
4. **Routes (`*.routes.ts`)**: Add more endpoints as needed

### Example: Implementing Expense Creation

**1. Update Repository (`expense-tracking.repo.ts`):**
```typescript
async createExpense(userId: string, data: CreateExpenseInput) {
  return await this.db.insert(transactions).values({
    userId: parseInt(userId),
    type: 'expense',
    category: data.category,
    amount: data.amount.toString(),
    description: data.description,
    date: data.date || new Date(),
  }).returning();
}
```

**2. Update Controller (`expense-tracking.controllers.ts`):**
```typescript
export const createExpense = async (req, res, next) => {
  try {
    const repo = new ExpenseTrackingRepository(db);
    const expense = await repo.createExpense(req.auth.userId, req.body);
    res.status(201).json({ success: true, data: expense });
  } catch (error) {
    next(error);
  }
};
```

### Adding New Database Tables

1. Define in `src/db/schema.ts`
2. Run `npm run db:generate`
3. Run `npm run db:push`

### Adding New Modules

1. Create directory in `src/modules/`
2. Add 4 files (validators, routes, controllers, repo)
3. Import route in `src/routes/index.ts`

## 🔐 Authentication Flow

1. Frontend gets Clerk session token
2. Frontend sends token in `Authorization: Bearer <token>` header
3. `clerkAuth` middleware verifies token
4. User info attached to `req.auth`
5. Controllers access `req.auth.userId` for user-specific operations

## 📊 Available Scripts

```bash
npm run dev          # Development server with hot reload
npm run build        # Compile TypeScript to JavaScript
npm start            # Production server
npm run db:generate  # Generate Drizzle migrations
npm run db:push      # Push schema directly to database
npm run db:migrate   # Run migrations
npm run db:studio    # Open Drizzle Studio (database GUI)
npm run type-check   # Check TypeScript types
npm run lint         # Run ESLint
```

## 🏗️ Architecture Highlights

### Type Safety
- ✅ Strict TypeScript configuration
- ✅ Zod runtime validation
- ✅ Drizzle type-safe ORM
- ✅ Extended Express types for auth

### Security
- ✅ Helmet for HTTP headers
- ✅ CORS configuration
- ✅ Clerk authentication
- ✅ Input validation on all endpoints
- ✅ SQL injection protection (parameterized queries)

### Error Handling
- ✅ Centralized error handler
- ✅ Zod validation error formatting
- ✅ Development/production error modes
- ✅ Async error catching

### Code Organization
- ✅ Modular structure
- ✅ Separation of concerns
- ✅ Consistent file patterns
- ✅ Easy to extend and maintain

## 📚 Resources

- **Express**: https://expressjs.com
- **TypeScript**: https://www.typescriptlang.org
- **Drizzle ORM**: https://orm.drizzle.team
- **Neon Database**: https://neon.tech/docs
- **Clerk Auth**: https://clerk.dev/docs
- **Zod**: https://zod.dev

## 🐛 Troubleshooting

### Database Connection Issues
- Verify `DATABASE_URL` is correct
- Check Neon dashboard for connection string
- Ensure SSL mode is included in connection string

### Clerk Authentication Issues
- Verify both publishable and secret keys
- Check token format (should be `Bearer <token>`)
- Verify token is not expired

### TypeScript Errors
```bash
npm run type-check
```

### Port Already in Use
Change `PORT` in `.env` or kill the process:
```bash
lsof -ti:3000 | xargs kill
```

## ✅ Quality Checklist

Before deploying:
- [ ] All environment variables configured
- [ ] Database schema pushed to Neon
- [ ] Clerk authentication tested
- [ ] Health endpoint responding
- [ ] No TypeScript errors (`npm run type-check`)
- [ ] CORS configured for production domain
- [ ] Error handling tested
- [ ] Keep-alive cron configured (if using Render)

## 🚢 Deployment

### Render (Recommended for Free Tier)

1. Connect your GitHub repository
2. Set build command: `npm install && npm run build`
3. Set start command: `npm start`
4. Add environment variables in Render dashboard
5. Deploy!

### Environment Variables for Production
```
DATABASE_URL=<neon_connection_string>
CLERK_PUBLISHABLE_KEY=<clerk_publishable_key>
CLERK_SECRET_KEY=<clerk_secret_key>
PORT=3000
NODE_ENV=production
RENDER_EXTERNAL_URL=<your_render_url>
```

## 🎯 What's Next?

1. **Implement Business Logic**: Add real functionality to each module
2. **Extend Database Schema**: Add tables for all features
3. **Add Tests**: Implement unit and integration tests
4. **API Documentation**: Add Swagger/OpenAPI documentation
5. **Logging**: Implement structured logging (e.g., Winston)
6. **Rate Limiting**: Add rate limiting middleware
7. **Caching**: Implement Redis caching layer
8. **WebSockets**: Add real-time features if needed

---

**Your production-grade backend foundation is ready! Start building! 🚀**

