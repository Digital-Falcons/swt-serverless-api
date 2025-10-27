import { type Context } from 'hono';
import { bearerAuth } from 'hono/bearer-auth';

export function createBearerAuthMiddleware(bearerTokenEnvName: string) {
	return async (c: Context, next: any) => {
		const apiKey = c.env[bearerTokenEnvName];

		const authFunction = bearerAuth({
			token: apiKey,
			invalidTokenMessage: {
				error: 'Unauthorized',
			},
		});

		await authFunction(c, next);
	};
}
