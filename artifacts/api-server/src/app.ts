import express, { type Express } from "express";
import cors from "cors";
import pinoHttp from "pino-http";
import router from "./routes";
import webhooksRouter from "./routes/webhooks";
import { logger } from "./lib/logger";
import { corsOptionsFromEnv } from "./lib/cors-options";
import { getWebAppBaseUrl } from "./lib/web-app-url";
import { dbErrorResponse } from "./lib/pg-errors";

const app: Express = express();

app.use(
  pinoHttp({
    logger,
    serializers: {
      req(req) {
        return {
          id: req.id,
          method: req.method,
          url: req.url?.split("?")[0],
        };
      },
      res(res) {
        return {
          statusCode: res.statusCode,
        };
      },
    },
  }),
);
app.use(cors(corsOptionsFromEnv()));
app.use(
  "/api/webhooks",
  express.raw({ type: "application/json" }),
  webhooksRouter,
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/", (_req, res) => {
  const web = getWebAppBaseUrl();
  res.json({
    service: "api-server",
    message:
      "This process serves JSON under /api only. Open the web app URL below for the storefront and admin UI.",
    webApp: web,
    adminUi: `${web}/admin`,
    api: "/api",
    health: "/api/healthz",
  });
});

app.get("/admin", (_req, res) => {
  res.redirect(302, `${getWebAppBaseUrl()}/admin`);
});

app.use("/api", router);

app.use((err: unknown, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  const mapped = dbErrorResponse(err);
  if (mapped) {
    res.status(mapped.status).json({ error: mapped.error });
    return;
  }
  logger.error({ err }, "Unhandled API error");
  const message =
    err instanceof Error && process.env.NODE_ENV === "development"
      ? err.message
      : "Something went wrong. Please try again.";
  if (!res.headersSent) {
    res.status(500).json({ error: message });
  }
});

export default app;
