import { registerApiTests } from "./helpers/api-contract.js";
import { waitForServer } from "./helpers/wait-for-server.js";
import { execSync } from "node:child_process";
import { after, before, describe } from "node:test";

const imageName = "allure-testops-ci-integration-template:test";

describe("docker image", () => {
  let containerId = "";
  let baseUrl = "";

  before(async () => {
    try {
      execSync("docker info", { stdio: "ignore" });
    } catch {
      throw new Error("Docker is not available. Start Docker Desktop or run `npm run test:docker` in CI.");
    }

    execSync(`docker build -t ${imageName} .`, { stdio: "inherit" });

    containerId = execSync(`docker run -d -p 127.0.0.1::3000 ${imageName}`, { encoding: "utf8" }).trim();

    const portMapping = execSync(`docker port ${containerId} 3000/tcp`, { encoding: "utf8" }).trim();
    const port = portMapping.split(":").at(-1);

    if (!port) {
      throw new Error(`Failed to resolve published port for container ${containerId}`);
    }

    baseUrl = `http://127.0.0.1:${port}`;
    await waitForServer(baseUrl);
  });

  after(() => {
    if (containerId) {
      execSync(`docker rm -f ${containerId}`, { stdio: "ignore" });
    }
  });

  registerApiTests(() => baseUrl);
});
