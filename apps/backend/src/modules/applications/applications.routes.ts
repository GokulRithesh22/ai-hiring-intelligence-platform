import { Router } from "express";

import { requireAuth } from "../../middleware/auth";
import { applicationsController } from "./applications.controller";

export const applicationsRouter = Router();

applicationsRouter.get("/", requireAuth, applicationsController.listApplications);
applicationsRouter.get("/:applicationId", requireAuth, applicationsController.getApplication);
applicationsRouter.post("/", applicationsController.createApplication);
applicationsRouter.post("/:applicationId/screen-resume", applicationsController.screenResume);
applicationsRouter.post(
  "/:applicationId/evaluate-qualification",
  applicationsController.evaluateQualification
);
applicationsRouter.post("/:applicationId/start-interview", applicationsController.startInterview);
applicationsRouter.post("/:applicationId/shortlist", requireAuth, applicationsController.shortlist);
applicationsRouter.post("/:applicationId/reject", requireAuth, applicationsController.reject);
