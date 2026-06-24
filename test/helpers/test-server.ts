import { createRouter } from "../../src/app.js";
import { json, logRequest } from "../../src/router.js";
import { createServer, type Server } from "node:http";
import type { AddressInfo } from "node:net";

export type TestServer = {
  server: Server;
  baseUrl: string;
};

export const startTestServer = async (): Promise<TestServer> => {
  const router = createRouter();
  const server = createServer(async (req, res) => {
    logRequest(req);

    try {
      await router.handle(req, res);
    } catch (error) {
      console.error(error);
      json(res, { error: "Internal Server Error" }, 500);
    }
  });

  await new Promise<void>((resolve) => {
    server.listen(0, "127.0.0.1", resolve);
  });

  const address = server.address();

  if (!address || typeof address === "string") {
    throw new Error("Failed to resolve test server address");
  }

  return {
    server,
    baseUrl: `http://127.0.0.1:${(address as AddressInfo).port}`,
  };
};

export const stopTestServer = (server: Server): Promise<void> =>
  new Promise((resolve, reject) => {
    server.close((error) => {
      if (error) {
        reject(error);
        return;
      }

      resolve();
    });
  });
