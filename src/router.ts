import type { IncomingMessage, ServerResponse } from "node:http";

export type RequestContext = {
  params: Record<string, string>;
  query: URLSearchParams;
  readJson: <T>() => Promise<T>;
};

export type RouteHandler = (req: IncomingMessage, res: ServerResponse, ctx: RequestContext) => void | Promise<void>;

type Route = {
  method: string;
  pattern: RegExp;
  paramNames: string[];
  handler: RouteHandler;
};

const pathPattern = (path: string, paramNames: string[]): RegExp => {
  const source = path.replace(/:([^/]+)/g, (_, name: string) => {
    paramNames.push(name);

    return "([^/]+)";
  });

  return new RegExp(`^${source}$`);
};

const readJsonBody = async <T>(req: IncomingMessage): Promise<T> => {
  const chunks: Buffer[] = [];

  for await (const chunk of req) {
    chunks.push(typeof chunk === "string" ? Buffer.from(chunk) : chunk);
  }

  const body = Buffer.concat(chunks).toString("utf8");

  return (body ? JSON.parse(body) : {}) as T;
};

export class Router {
  private readonly routes: Route[] = [];

  get(path: string, handler: RouteHandler): void {
    this.add("GET", path, handler);
  }

  post(path: string, handler: RouteHandler): void {
    this.add("POST", path, handler);
  }

  async handle(req: IncomingMessage, res: ServerResponse): Promise<void> {
    const url = new URL(req.url ?? "/", `http://${req.headers.host ?? "localhost"}`);
    const method = req.method ?? "GET";

    for (const route of this.routes) {
      if (route.method !== method) {
        continue;
      }

      const match = url.pathname.match(route.pattern);

      if (!match) {
        continue;
      }

      const params: Record<string, string> = {};

      route.paramNames.forEach((name, index) => {
        params[name] = decodeURIComponent(match[index + 1] ?? "");
      });

      await route.handler(req, res, {
        params,
        query: url.searchParams,
        readJson: <T>() => readJsonBody<T>(req),
      });

      return;
    }

    json(res, { error: "Not Found" }, 404);
  }

  private add(method: string, path: string, handler: RouteHandler): void {
    const paramNames: string[] = [];

    this.routes.push({
      method,
      pattern: pathPattern(path, paramNames),
      paramNames,
      handler,
    });
  }
}

export const json = (res: ServerResponse, data: unknown, status = 200): void => {
  res.writeHead(status, { "content-type": "application/json" });
  res.end(JSON.stringify(data));
};

export const logRequest = (req: IncomingMessage): void => {
  console.info(`${req.method} ${req.url}`);
};
