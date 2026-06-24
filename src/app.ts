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
import { Router, json } from "./router.js";

export const createRouter = (): Router => {
  const router = new Router();

  router.get("/server/info", async (_req, res) => {
    json(res, {} as ExtServerInfo);
  });

  router.get("/me", async (_req, res) => {
    json(res, {} as ExtUser);
  });

  router.get("/job", async (_req, res) => {
    json(res, [] as ExtJob[]);
  });

  router.get("/job/:id", async (_req, res) => {
    json(res, {} as ExtJob);
  });

  router.post("/job/:id/start", async (_req, res, { readJson }) => {
    await readJson<ExtJobStartRequest>();
    json(res, {} as ExtJobRun);
  });

  router.get("/job/:id/:buildNumber", async (_req, res) => {
    json(res, {} as ExtJobRun);
  });

  router.post("/job/:id/:buildNumber/stop", async (_req, res) => {
    json(res, {} as ExtJobRun);
  });

  router.get("/issue", async (_req, res) => {
    json(res, [] as ExtIssueLink[]);
  });

  router.get("/issue/:key", async (_req, res) => {
    json(res, {} as ExtIssueLink);
  });

  router.get("/project", async (_req, res) => {
    json(res, [] as ExtProject[]);
  });

  router.get("/issuetype", async (_req, res) => {
    json(res, [] as ExtIssueType[]);
  });

  router.get("/issuefield", async (_req, res) => {
    json(res, [] as unknown[]);
  });

  router.post("/issue", async (_req, res, { readJson }) => {
    await readJson<ExtIssueCreate>();
    json(res, {} as ExtIssueLink);
  });

  router.get("/testcase/:testCaseKey", async (_req, res) => {
    json(res, {} as ExtTestLink);
  });

  return router;
};
