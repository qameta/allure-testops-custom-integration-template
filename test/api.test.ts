import { registerApiTests } from "./helpers/api-contract.js";
import { startTestServer, stopTestServer } from "./helpers/test-server.js";
import type { Server } from "node:http";
import { after, before, describe } from "node:test";

describe("integration API", () => {
  let server: Server;
  let baseUrl = "";

  before(async () => {
    const testServer = await startTestServer();

    server = testServer.server;
    baseUrl = testServer.baseUrl;
  });

  after(async () => {
    await stopTestServer(server);
  });

  registerApiTests(() => baseUrl);
});
