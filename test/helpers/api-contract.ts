import assert from "node:assert/strict";
import { test } from "node:test";

export const registerApiTests = (getBaseUrl: () => string): void => {
  test("GET /server/info returns an empty JSON object", async () => {
    const response = await fetch(`${getBaseUrl()}/server/info`);

    assert.equal(response.status, 200);
    assert.equal(response.headers.get("content-type"), "application/json");
    assert.deepEqual(await response.json(), {});
  });

  test("GET /me returns an empty JSON object", async () => {
    const response = await fetch(`${getBaseUrl()}/me`);

    assert.equal(response.status, 200);
    assert.deepEqual(await response.json(), {});
  });

  test("GET /job returns an empty JSON array", async () => {
    const response = await fetch(`${getBaseUrl()}/job`);

    assert.equal(response.status, 200);
    assert.deepEqual(await response.json(), []);
  });

  test("GET /job/:id returns an empty JSON object", async () => {
    const response = await fetch(`${getBaseUrl()}/job/ci`);

    assert.equal(response.status, 200);
    assert.deepEqual(await response.json(), {});
  });

  test("GET /issue/:key returns an empty JSON object", async () => {
    const response = await fetch(`${getBaseUrl()}/issue/ABC-1`);

    assert.equal(response.status, 200);
    assert.deepEqual(await response.json(), {});
  });

  test("POST /job/:id/start accepts a JSON body", async () => {
    const response = await fetch(`${getBaseUrl()}/job/ci/start`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ jobRunId: 1, launchId: 2, tests: [], parameters: {}, username: "qa" }),
    });

    assert.equal(response.status, 200);
    assert.deepEqual(await response.json(), {});
  });

  test("GET /job/:id/:buildNumber returns an empty JSON object", async () => {
    const response = await fetch(`${getBaseUrl()}/job/ci/42`);

    assert.equal(response.status, 200);
    assert.deepEqual(await response.json(), {});
  });

  test("GET /missing returns 404 JSON", async () => {
    const response = await fetch(`${getBaseUrl()}/missing`);

    assert.equal(response.status, 404);
    assert.deepEqual(await response.json(), { error: "Not Found" });
  });
};
