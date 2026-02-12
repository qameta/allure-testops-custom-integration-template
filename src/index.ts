/* eslint-disable @typescript-eslint/no-unused-vars */
import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { logger } from "hono/logger";
import type {
  ExtIssueCreate,
  ExtIssueLink,
  ExtIssueType,
  ExtJob,
  ExtJobRun,
  ExtJobStartRequest,
  ExtProject,
  ExtServerInfo,
  ExtTestLink,
  ExtUser,
} from "./model.js";

const port = Number(process.env.PORT) || 3000;
const app = new Hono();
app.use(logger());

app.get("/server/info", async (c) => {
  const res: ExtServerInfo = {} as ExtServerInfo;

  return c.json(res);
});

app.get("/me", async (c) => {
  const res: ExtUser = {} as ExtUser;

  return c.json(res);
});

app.get("/job", async (c) => {
  const query = c.req.query("query");
  const res: ExtJob[] = [];

  return c.json(res);
});

app.get("/job/:id", async (c) => {
  const jobId = c.req.param("id");
  const res: ExtJob = {} as ExtJob;

  return c.json(res);
});

app.post("/job/:id/start", async (c) => {
  const jobId = c.req.param("id");
  const body: ExtJobStartRequest = await c.req.json();
  const res: ExtJobRun = {} as ExtJobRun;

  return c.json(res);
});

app.get("/job/:id/:buildNumber", async (c) => {
  const jobId = c.req.param("id");
  const buildNumber = c.req.param("buildNumber");
  const res: ExtJobRun = {} as ExtJobRun;

  return c.json(res);
});

app.post("/job/:id/:buildNumber/stop", async (c) => {
  const jobId = c.req.param("id");
  const buildNumber = c.req.param("buildNumber");
  const res: ExtJobRun = {} as ExtJobRun;

  return c.json(res);
});

app.get("/issue", async (c) => {
  const search = c.req.query("search");
  const res: ExtIssueLink[] = [];

  return c.json(res);
});

app.get("/issue/:key", async (c) => {
  const key = c.req.param("key");
  const res: ExtIssueLink = {} as ExtIssueLink;

  return c.json(res);
});

app.get("/project", async (c) => {
  const search = c.req.query("search");
  const res: ExtProject[] = [];

  return c.json(res);
});

app.get("/issuetype", async (c) => {
  const projectKey = c.req.query("projectKey");
  const res: ExtIssueType[] = [];

  return c.json(res);
});

app.get("/issuefield", async (c) => {
  const projectKey = c.req.query("projectKey");
  const issueTypeId = c.req.query("issueTypeId");
  const res: unknown[] = [];

  return c.json(res);
});

app.post("/issue", async (c) => {
  const projectKey = c.req.query("projectKey");
  const issueTypeId = c.req.query("issueTypeId");
  const body: ExtIssueCreate = await c.req.json();
  const res: ExtIssueLink = {} as ExtIssueLink;

  return c.json(res);
});

app.get("/testcase/:testCaseKey", async (c) => {
  const testCaseKey = c.req.param("testCaseKey");
  const res: ExtTestLink = {} as ExtTestLink;

  return c.json(res);
});

serve(
  {
    fetch: app.fetch,
    port,
  },
  (info) => {
    console.info(`Server is running on http://localhost:${info.port}`);
  },
);
