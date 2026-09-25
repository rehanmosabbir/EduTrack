import { Router } from "express";
import * as dashboardController from "../controllers/dashboard.controller.js";
import { authenticate, authorize } from "../middleware/auth.js";
import { ROLES } from "../utils/constants.js";

const activitiesRouter = Router();
activitiesRouter.use(authenticate);
activitiesRouter.get(
  "/",
  authorize(ROLES.ADMIN, ROLES.TEACHER),
  dashboardController.activities,
);

const reportsRouter = Router();
reportsRouter.use(authenticate);
reportsRouter.get(
  "/",
  authorize(ROLES.ADMIN, ROLES.TEACHER),
  dashboardController.reports,
);
reportsRouter.get(
  "/export.csv",
  authorize(ROLES.ADMIN, ROLES.TEACHER),
  dashboardController.reportsCsv,
);

export { activitiesRouter, reportsRouter };
