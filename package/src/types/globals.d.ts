interface Env extends Cloudflare.Env {}

declare var Response: {
  prototype: Response;
  new (body?: BodyInit | null, init?: ResponseInit): Response;
  error(): Response;
  redirect(url: string, status?: number): Response;
  json(any: any, maybeInit?: ResponseInit | Response): Response;
};
