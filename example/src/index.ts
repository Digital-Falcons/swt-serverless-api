import { WorkerEntrypoint } from 'cloudflare:workers';
import 'reflect-metadata';
import { buildHonoApp } from 'swt-serverless-api';
import { TodoController } from './features/todos/todo.controller';
import { AuthMiddleware } from './middlewares/auth.middleware';
import { ErrorMiddleware } from './middlewares/error.middleware';

const app = buildHonoApp([TodoController], {
	base: '/',
	topMiddlewares: [
		{
			path: '/int/*',
			middlewares: [AuthMiddleware],
		},
	],
	notFoundHandler: async (c) => {
		return c.json({ message: 'Resource Not Found' }, 404);
	},
	onError: ErrorMiddleware,
	enableIntrospection: true,
	introspectionPath: '/introspect',
});

export default class extends WorkerEntrypoint {
	declare env: Env;

	fetch(request: Request): Response | Promise<Response> {
		return app.fetch(request, this.env, this.ctx);
	}
}
