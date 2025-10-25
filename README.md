# SWT Serverless API

[![npm version](https://badge.fury.io/js/swt-serverless-api.svg)](https://badge.fury.io/js/swt-serverless-api)
[![License](https://img.shields.io/badge/license-Apache%202.0-blue.svg)](https://www.apache.org/licenses/LICENSE-2.0)

A TypeScript framework for building serverless APIs with decorators, built on top of [Hono](https://hono.dev/) and [Zod](https://zod.dev/). Perfect for Cloudflare Workers and other serverless environments.

## Features

- 🎯 **Decorator-based routing** - Express-like decorators for clean, organized code
- 🔒 **Built-in validation** - Zod schema validation for requests and responses
- 🚀 **Serverless-first** - Optimized for Cloudflare Workers and edge runtime
- 🔍 **Auto-introspection** - Automatic API documentation generation
- 🧪 **Bruno integration** - Generate Bruno API test files automatically
- ⚡ **Type-safe** - Full TypeScript support with type inference
- 🛠️ **Middleware support** - Controller and method-level middleware
- 📦 **Zero configuration** - Works out of the box

## Installation

```bash
npm install swt-serverless-api
# or
pnpm add swt-serverless-api
# or
yarn add swt-serverless-api
```

## Quick Start

### 1. Create a Controller

```typescript
import { Controller, Get, Post, Body, Param, Query } from "swt-serverless-api";
import { z } from "zod";

const createUserSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
});

const paginationSchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(10),
});

@Controller("/api/users")
export class UserController {
  @Get()
  async getUsers(
    @Query({ schema: paginationSchema })
    pagination: z.infer<typeof paginationSchema>
  ) {
    // Your logic here
    return { users: [], pagination };
  }

  @Get("/:id")
  async getUserById(
    @Param({ name: "id", schema: z.coerce.number() }) id: number
  ) {
    // Your logic here
    return { id, name: "John Doe", email: "john@example.com" };
  }

  @Post()
  async createUser(
    @Body(createUserSchema) userData: z.infer<typeof createUserSchema>
  ) {
    // Your logic here
    return { success: true, user: userData };
  }
}
```

### 2. Bootstrap Your Application

```typescript
import { WorkerEntrypoint } from "cloudflare:workers";
import "reflect-metadata";
import { buildHonoApp } from "swt-serverless-api";
import { UserController } from "./controllers/user.controller";

const app = buildHonoApp([UserController], {
  base: "/",
  enableIntrospection: true,
  introspectionPath: "/introspect",
});

export default class extends WorkerEntrypoint {
  fetch(request: Request): Response | Promise<Response> {
    return app.fetch(request, this.env, this.ctx);
  }
}
```

## API Reference

### Decorators

#### Class Decorators

##### `@Controller(basePath?, ...middlewares)`

Defines a controller class with an optional base path and middlewares.

```typescript
@Controller("/api/v1", authMiddleware, loggingMiddleware)
export class ApiController {
  // routes...
}
```

#### Method Decorators

##### HTTP Method Decorators

- `@Get(path?, ...middlewares)`
- `@Post(path?, ...middlewares)`
- `@Put(path?, ...middlewares)`
- `@Patch(path?, ...middlewares)`
- `@Delete(path?, ...middlewares)`
- `@Options(path?, ...middlewares)`
- `@All(path?, ...middlewares)`

```typescript
@Get('/users/:id')
@Post('/users', validationMiddleware)
async createUser() {
  // implementation
}
```

##### `@HttpCode(statusCode)`

Sets the HTTP status code for successful responses.

```typescript
@Post('/users')
@HttpCode(201)
async createUser() {
  // Returns 201 Created on success
}
```

##### `@Use(...middlewares)`

Adds middleware to a specific route method.

```typescript
@Get('/protected')
@Use(authMiddleware, rateLimitMiddleware)
async getProtectedData() {
  // implementation
}
```

##### `@Validate(schemas)`

Validates request data using Zod schemas.

```typescript
@Post('/users')
@Validate({
  body: createUserSchema,
  query: paginationSchema,
  headers: authHeaderSchema,
})
async createUser() {
  // implementation
}
```

#### Parameter Decorators

##### `@Body(schema?)`

Injects and validates the request body.

```typescript
async createUser(@Body(createUserSchema) userData: CreateUserInput) {
  // userData is validated and typed
}
```

##### `@Query(options)`

Injects and validates query parameters.

```typescript
async getUsers(@Query({ schema: paginationSchema }) pagination: PaginationInput) {
  // pagination is validated and typed
}

// For single query parameter
async searchUsers(@Query({ name: 'q', schema: z.string() }) query: string) {
  // query is validated and typed
}
```

##### `@Param(options)`

Injects and validates route parameters.

```typescript
async getUserById(@Param({ name: 'id', schema: z.coerce.number() }) id: number) {
  // id is validated and typed as number
}
```

##### `@Header(options)`

Injects and validates request headers.

```typescript
async protectedRoute(@Header({ name: 'authorization', schema: z.string() }) auth: string) {
  // auth header is validated and typed
}
```

### Build Options

The `buildHonoApp` function accepts various configuration options:

```typescript
interface BuildOptions {
  base?: string; // Base path for all routes
  topMiddlewares?: {
    // Global middlewares
    path: string;
    middlewares: MiddlewareHandler[];
  }[];
  onError?: ErrorHandler; // Global error handler
  notFoundHandler?: MiddlewareHandler; // 404 handler
  enableIntrospection?: boolean; // Enable API introspection
  introspectionPath?: string; // Introspection endpoint path
}
```

Example:

```typescript
const app = buildHonoApp([UserController, ProductController], {
  base: "/api/v1",
  topMiddlewares: [
    {
      path: "/api/v1/protected/*",
      middlewares: [authMiddleware],
    },
  ],
  onError: (error, c) => {
    console.error("API Error:", error);
    return c.json({ error: "Internal Server Error" }, 500);
  },
  notFoundHandler: async (c) => {
    return c.json({ message: "Endpoint not found" }, 404);
  },
  enableIntrospection: true,
  introspectionPath: "/docs",
});
```

## Advanced Usage

### Middleware

You can add middleware at different levels:

#### Global Middleware

```typescript
const app = buildHonoApp([UserController], {
  topMiddlewares: [
    {
      path: "/*",
      middlewares: [corsMiddleware, loggingMiddleware],
    },
  ],
});
```

#### Controller-level Middleware

```typescript
@Controller("/api/users", authMiddleware, rateLimitMiddleware)
export class UserController {
  // All routes in this controller will use these middlewares
}
```

#### Route-level Middleware

```typescript
@Controller("/api/users")
export class UserController {
  @Get("/profile")
  @Use(authMiddleware, profileValidationMiddleware)
  async getProfile() {
    // Only this route uses these middlewares
  }
}
```

### Error Handling

Create custom error classes and global error handlers:

```typescript
export class ApiError extends Error {
  constructor(public statusCode: number, message: string) {
    super(message);
  }
}

const app = buildHonoApp([UserController], {
  onError: (error, c) => {
    if (error instanceof ApiError) {
      return c.json({ error: error.message }, error.statusCode);
    }
    return c.json({ error: "Internal Server Error" }, 500);
  },
});
```

### Validation Schemas

Use Zod schemas for comprehensive validation:

```typescript
const createUserSchema = z.object({
  name: z.string().min(1).max(100),
  email: z.string().email(),
  age: z.number().int().min(18).optional(),
  tags: z.array(z.string()).default([]),
});

@Controller("/users")
export class UserController {
  @Post()
  @HttpCode(201)
  async createUser(
    @Body(createUserSchema) userData: z.infer<typeof createUserSchema>
  ) {
    // userData is fully validated and typed
    return { success: true, user: userData };
  }
}
```

## CLI Tools

### Bruno Test Generation

Generate Bruno API test files from your API introspection:

```bash
npx gen-bruno --url http://localhost:8787/introspect --outDir ./api-tests --baseURL http://localhost:8787
```

Options:

- `--url`: Introspection endpoint URL (default: `http://localhost:8787/introspect`)
- `--outDir`: Output directory for Bruno files (default: `./generated`)
- `--baseURL`: Base URL for API requests (default: `http://localhost:8787`)

## Introspection

Enable introspection to get automatic API documentation:

```typescript
const app = buildHonoApp([UserController], {
  enableIntrospection: true,
  introspectionPath: "/api-docs",
});
```

Visit `/api-docs` to see your API structure in JSON format, including:

- Available endpoints
- HTTP methods
- Parameter schemas
- Request/response schemas

## Examples

Check out the [example directory](./example) for a complete working example with:

- Todo CRUD operations
- Authentication middleware
- Error handling
- Bruno API tests
- Cloudflare Workers deployment

## TypeScript Configuration

Make sure your `tsconfig.json` includes:

```json
{
  "compilerOptions": {
    "experimentalDecorators": true,
    "emitDecoratorMetadata": true,
    "target": "ES2020",
    "module": "ESNext",
    "moduleResolution": "node"
  }
}
```

## Deployment

### Cloudflare Workers

1. Install Wrangler: `npm install -g wrangler`
2. Configure `wrangler.toml`:

```toml
name = "my-api"
main = "src/index.ts"
compatibility_date = "2023-10-01"

[build]
command = "npm run build"
```

3. Deploy: `wrangler deploy`

### Other Platforms

The framework works with any platform that supports Hono, including:

- Vercel Edge Functions
- Deno Deploy
- Bun
- Node.js

## Contributing

1. Fork the repository
2. Create your feature branch: `git checkout -b feature/my-feature`
3. Commit your changes: `git commit -am 'Add my feature'`
4. Push to the branch: `git push origin feature/my-feature`
5. Submit a pull request

## License

This project is licensed under the Apache License 2.0 - see the [LICENSE](LICENSE) file for details.

## Support

- 📚 [Documentation](https://github.com/quanglochuynh/swt-serverless-api)
- 🐛 [Issue Tracker](https://github.com/quanglochuynh/swt-serverless-api/issues)
- 💬 [Discussions](https://github.com/quanglochuynh/swt-serverless-api/discussions)

## Roadmap

- [ ] OpenAPI/Swagger integration
- [ ] More validation decorators
- [ ] Performance optimizations
- [ ] Additional CLI tools
- [ ] Plugin system

---

Built with ❤️ by the SW-Tech team
