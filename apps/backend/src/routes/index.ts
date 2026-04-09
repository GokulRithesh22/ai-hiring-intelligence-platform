import { Router } from "express";

import { applicationsRouter } from "../modules/applications/applications.routes";
import { authRouter } from "../modules/auth/auth.routes";
import { candidateInsightsRouter } from "../modules/candidate-insights/candidate-insights.routes";
import { candidatesRouter } from "../modules/candidates/candidates.routes";
import { dashboardRouter } from "../modules/dashboard/dashboard.routes";
import { emailEventsRouter } from "../modules/email-events/email-events.routes";
import { healthRouter } from "../modules/health/health.routes";
import { hrApprovalsRouter } from "../modules/hr-approvals/hr-approvals.routes";
import { interviewSessionsRouter } from "../modules/interview-sessions/interview-sessions.routes";
import { jobsRouter } from "../modules/jobs/jobs.routes";
import { publicJobsRouter } from "../modules/public-jobs/public-jobs.routes";
import { voiceInterviewsRouter } from "../modules/voice-interviews/voice-interviews.routes";

export const apiRouter = Router();

apiRouter.use("/health", healthRouter);
apiRouter.use("/auth", authRouter);
apiRouter.use("/jobs", jobsRouter);
apiRouter.use("/hr/approvals", hrApprovalsRouter);
apiRouter.use("/candidates", candidatesRouter);
apiRouter.use("/applications", applicationsRouter);
apiRouter.use("/interview-sessions", interviewSessionsRouter);
apiRouter.use("/candidate-insights", candidateInsightsRouter);
apiRouter.use("/email-events", emailEventsRouter);
apiRouter.use("/dashboard", dashboardRouter);
apiRouter.use("/public/jobs", publicJobsRouter);
apiRouter.use("/voice/interview", voiceInterviewsRouter);
