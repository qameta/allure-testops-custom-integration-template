import { createRouter } from "./app.js";
import { json, logRequest } from "./router.js";
import { createServer } from "node:http";

const port = Number(process.env.PORT) || 3000;
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

server.listen(port, () => {
  console.info(`Server is running on http://localhost:${port}`);
});
