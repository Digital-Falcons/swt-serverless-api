import { WorkerEntrypoint } from 'cloudflare:workers';
import 'reflect-metadata';
import { buildHonoApp, createBearerAuthMiddleware } from 'swt-serverless-api';
import { TodoController } from './features/todos/todo.controller';

const app = buildHonoApp([TodoController], {
	base: '/',
	topMiddlewares: [
		{
			path: '/int/*',
			middlewares: [
				createBearerAuthMiddleware('BEARER_TOKEN'),
				(c, next) => {
					c.set('appId', 'clgt');
					return next();
				},
			],
		},
	],
	notFoundHandler: async (c) => {
		return c.json({ message: 'Resource Not Found' }, 404);
	},
	enableIntrospection: true,
	introspectionPath: '/introspect',
});

export default class extends WorkerEntrypoint {
	declare env: Env;

	fetch(request: Request): Response | Promise<Response> {
		return app.fetch(request, this.env, this.ctx);
	}
}
