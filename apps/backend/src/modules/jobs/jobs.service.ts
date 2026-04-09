import type {
  CreateJobInput,
  Job,
  JobIntakeAnswer,
  ManagerDashboardData,
  ManagerJobCreationMode,
  ManagerJobDescriptionVariant,
  ManagerJobDraftRequest,
  ManagerJobDraftResponse,
  ManagerJobFeedbackAction,
  ManagerJobIntelligenceDetail
} from "@ai-hiring/shared-types";

import { generateJobDescription } from "@ai-hiring/ai-services";
import { ApiError } from "../../lib/http";
import { semanticScreeningService } from "../applications/semantic-screening.service";
import { jobsRepository } from "./jobs.repository";

export class JobsService {
  async listJobs() {
    return jobsRepository.list();
  }

  async getJobById(jobId: string) {
    const job = await jobsRepository.findById(jobId);

    if (!job) {
      throw new ApiError(404, "Job not found");
    }

    return job;
  }

  async createJob(input: CreateJobInput, createdBy: string) {
    const job = await jobsRepository.create(input, createdBy);
    await this.refreshStructuredAnalysis(job.id);
    return this.getJobById(job.id);
  }

  async saveIntake(jobId: string, answers: JobIntakeAnswer[]) {
    const job = await jobsRepository.updateIntake(jobId, answers);

    if (!job) {
      throw new ApiError(404, "Job not found");
    }

    await this.refreshStructuredAnalysis(jobId);
    return this.getJobById(jobId);
  }

  async generateDescription(jobId: string) {
    const job = await this.getJobById(jobId);
    const result = await generateJobDescription({
      title: job.title,
      intakeAnswers: job.intakeAnswers
    });

    await jobsRepository.updateDescription(jobId, result.description);
    await this.refreshStructuredAnalysis(jobId);
    return this.getJobById(jobId);
  }

  async submitForApproval(jobId: string) {
    const job = await jobsRepository.updateStatus(jobId, "PENDING_HR_APPROVAL");

    if (!job) {
      throw new ApiError(404, "Job not found");
    }

    return job;
  }

  async updateJob(
    jobId: string,
    input: Partial<CreateJobInput> & { generatedDescription?: string | null }
  ) {
    const job = await jobsRepository.update(jobId, {
      title: input.title,
      department: input.department ?? null,
      location: input.location ?? null,
      employmentType: input.employmentType,
      minExperienceYears: input.minExperienceYears ?? null,
      salaryMin: input.salaryMin ?? null,
      salaryMax: input.salaryMax ?? null,
      currency: input.currency ?? null,
      joiningTimeline: input.joiningTimeline ?? null,
      relocationRequired: input.relocationRequired,
      generatedDescription: input.generatedDescription ?? undefined
    });

    if (!job) {
      throw new ApiError(404, "Job not found");
    }

    await this.refreshStructuredAnalysis(job.id);
    return this.getJobById(job.id);
  }

  async publishJob(jobId: string) {
    return this.requireUpdatedStatus(jobId, "PUBLISHED");
  }

  async pauseJob(jobId: string) {
    return this.requireUpdatedStatus(jobId, "PAUSED");
  }

  async closeJob(jobId: string) {
    return this.requireUpdatedStatus(jobId, "CLOSED");
  }

  async getRecruiterDashboard(
    currentUserId: string,
    scope: "all" | "mine" = "all"
  ): Promise<ManagerDashboardData> {
    const jobs = await jobsRepository.listDashboardJobs(scope === "mine" ? currentUserId : undefined);

    return {
      summary: {
        activeJobDescriptions: jobs.filter((job) => !["CLOSED", "PAUSED"].includes(job.status)).length,
        totalApplicants: jobs.reduce((sum, job) => sum + job.applicantsCount, 0),
        shortlistedCandidates: jobs.reduce((sum, job) => sum + job.shortlistedCount, 0),
        pendingApproval: jobs.filter((job) => job.status === "DRAFT").length
      },
      jobs
    };
  }

  async getRecruiterJobIntelligence(jobId: string): Promise<ManagerJobIntelligenceDetail> {
    const job = await jobsRepository.findDashboardJob(jobId);

    if (!job) {
      throw new ApiError(404, "Recruiter job dashboard not found");
    }

    const candidates = await jobsRepository.listManagerJobCandidates(jobId);

    return {
      job,
      candidates
    };
  }

  async createRecruiterDraft(
    input: ManagerJobDraftRequest,
    createdBy: string
  ): Promise<ManagerJobDraftResponse> {
    return this.createManagerDraft(input, createdBy);
  }

  async refineRecruiterDescription(
    jobId: string,
    selectedVariantId: string,
    feedback: ManagerJobFeedbackAction
  ): Promise<ManagerJobDraftResponse> {
    const job = await this.getJobById(jobId);
    const variants = this.buildManagerVariants({
      title: job.title,
      location: job.location,
      experienceLevel:
        job.minExperienceYears != null ? `${job.minExperienceYears}+ years` : null,
      salaryRange: this.formatPersistedSalaryRange(job),
      joiningTimeline: job.joiningTimeline,
      relocationRequired: job.relocationRequired,
      intakeAnswers: job.intakeAnswers,
      baseDescription: job.generatedDescription,
      focusAreas: this.getFocusAreas(job),
      mode: "STRUCTURED_INPUT",
      feedback
    });

    const selectedVariant = variants.find((variant) => variant.id === selectedVariantId) ?? variants[0];

    await jobsRepository.updateDescription(jobId, selectedVariant.description);
    await this.refreshStructuredAnalysis(jobId);

    return {
      job: (await this.getJobById(jobId)) as Job,
      variants,
      selectedVariantId: selectedVariant.id
    };
  }

  async getManagerDashboard(createdBy: string): Promise<ManagerDashboardData> {
    return this.getRecruiterDashboard(createdBy, "mine");
  }

  async getManagerJobIntelligence(
    jobId: string,
    createdBy: string
  ): Promise<ManagerJobIntelligenceDetail> {
    const job = await jobsRepository.findDashboardJob(jobId, createdBy);

    if (!job) {
      throw new ApiError(404, "Manager job dashboard not found");
    }

    const candidates = await jobsRepository.listManagerJobCandidates(jobId);

    return {
      job,
      candidates
    };
  }

  async createManagerDraft(
    input: ManagerJobDraftRequest,
    createdBy: string
  ): Promise<ManagerJobDraftResponse> {
    const seededDescription = await generateJobDescription({
      title: input.title,
      intakeAnswers: input.intakeAnswers
    });

    const variants = this.buildManagerVariants({
      title: input.title,
      location: input.location ?? null,
      experienceLevel:
        input.minExperienceYears != null ? `${input.minExperienceYears}+ years` : null,
      salaryRange: this.formatSalaryRange(input),
      joiningTimeline: input.joiningTimeline ?? null,
      relocationRequired: input.relocationRequired ?? false,
      intakeAnswers: input.intakeAnswers,
      baseDescription: seededDescription.description,
      focusAreas: seededDescription.interviewFocusAreas,
      mode: input.mode
    });

    const selectedVariant = variants[0];
    const job = await jobsRepository.create(
      this.mapManagerDraftToCreateJobInput(input, selectedVariant.description),
      createdBy
    );

    await this.refreshStructuredAnalysis(job.id);

    return {
      job: (await this.getJobById(job.id)) as Job,
      variants,
      selectedVariantId: selectedVariant.id
    };
  }

  async refineManagerDescription(
    jobId: string,
    createdBy: string,
    selectedVariantId: string,
    feedback: ManagerJobFeedbackAction
  ): Promise<ManagerJobDraftResponse> {
    const job = await this.getJobById(jobId);

    if (job.createdBy !== createdBy) {
      throw new ApiError(404, "Manager job draft not found");
    }

    const variants = this.buildManagerVariants({
      title: job.title,
      location: job.location,
      experienceLevel:
        job.minExperienceYears != null ? `${job.minExperienceYears}+ years` : null,
      salaryRange: this.formatPersistedSalaryRange(job),
      joiningTimeline: job.joiningTimeline,
      relocationRequired: job.relocationRequired,
      intakeAnswers: job.intakeAnswers,
      baseDescription: job.generatedDescription,
      focusAreas: this.getFocusAreas(job),
      mode: "CONVERSATIONAL_AI",
      feedback
    });

    const selectedVariant = variants.find((variant) => variant.id === selectedVariantId) ?? variants[0];

    await jobsRepository.updateDescription(jobId, selectedVariant.description);
    await this.refreshStructuredAnalysis(jobId);

    return {
      job: (await this.getJobById(jobId)) as Job,
      variants,
      selectedVariantId: selectedVariant.id
    };
  }

  private async requireUpdatedStatus(jobId: string, status: "PUBLISHED" | "PAUSED" | "CLOSED") {
    const job = await jobsRepository.updateStatus(jobId, status);

    if (!job) {
      throw new ApiError(404, "Job not found");
    }

    return job;
  }

  private async refreshStructuredAnalysis(jobId: string) {
    const job = await jobsRepository.findById(jobId);
    if (!job) {
      return;
    }

    try {
      const analysis = await semanticScreeningService.analyzeJobDescription(job);
      await jobsRepository.updateStructuredAnalysis(jobId, analysis as Record<string, unknown>);
    } catch {
      // Keep job creation non-blocking if AI analysis is temporarily unavailable.
    }
  }

  private mapManagerDraftToCreateJobInput(
    input: ManagerJobDraftRequest,
    generatedDescription: string
  ): CreateJobInput {
    return {
      title: input.title,
      department: input.department ?? null,
      location: input.location ?? null,
      employmentType: input.employmentType ?? "FULL_TIME",
      minExperienceYears: input.minExperienceYears ?? null,
      salaryMin: input.salaryMin ?? null,
      salaryMax: input.salaryMax ?? null,
      currency: input.currency ?? null,
      joiningTimeline: input.joiningTimeline ?? null,
      relocationRequired: input.relocationRequired ?? false,
      intakeAnswers: input.intakeAnswers,
      generatedDescription
    };
  }

  private buildManagerVariants(input: {
    title: string;
    location: string | null;
    experienceLevel: string | null;
    salaryRange: string | null;
    joiningTimeline: string | null;
    relocationRequired: boolean;
    intakeAnswers: JobIntakeAnswer[];
    baseDescription: string;
    focusAreas: string[];
    mode: ManagerJobCreationMode;
    feedback?: ManagerJobFeedbackAction;
  }): ManagerJobDescriptionVariant[] {
    const businessProblem =
      this.pickAnswer(input.intakeAnswers, ["problem", "solve"]) ??
      "Define the highest-value business problem this hire should solve in the next 12 months.";
    const skillList = this.toList(
      this.pickAnswer(input.intakeAnswers, ["skill", "domain"]) ??
        "Cross-functional execution, analytical rigor, stakeholder communication"
    );
    const responsibilityList = this.toList(
      this.pickAnswer(input.intakeAnswers, ["responsibilit", "outcome"]) ??
        "Own hiring-critical initiatives, align cross-functional teams, and deliver measurable outcomes"
    );
    const hiringContext = [
      input.experienceLevel ? `${input.experienceLevel} ownership` : null,
      input.salaryRange,
      input.joiningTimeline ? `Target start: ${input.joiningTimeline}` : null,
      input.location ? `Location: ${input.location}` : null,
      input.relocationRequired ? "Relocation or office travel required" : "Flexible on relocation"
    ]
      .filter(Boolean)
      .join(" | ");

    const focusAreas = input.focusAreas.length
      ? input.focusAreas
      : ["Business impact", "Execution depth", "Cross-functional collaboration"];
    const feedbackApplied = input.feedback ? [input.feedback] : [];

    const variants: ManagerJobDescriptionVariant[] = [
      {
        id: "balanced-brief",
        label: "Balanced Brief",
        tone: "Balanced and approval-ready",
        summary: `A polished JD optimized for HR approval and manager review. ${this.feedbackSummary(input.feedback)}`,
        responsibilities: this.applyFeedbackToResponsibilities(
          responsibilityList.map((item) => `Own ${item.toLowerCase()}`),
          input.feedback
        ),
        focusAreas,
        description: this.composeDescription({
          title: input.title,
          intro: `This ${input.mode === "STRUCTURED_INPUT" ? "structured-input" : "conversation-led"} draft centers the role on ${businessProblem.toLowerCase()}.`,
          businessProblem,
          responsibilities: this.applyFeedbackToResponsibilities(
            responsibilityList.map((item) => `Own ${item.toLowerCase()}`),
            input.feedback
          ),
          skills: skillList,
          focusAreas,
          hiringContext,
          feedback: input.feedback,
          style: "balanced"
        }),
        feedbackApplied
      },
      {
        id: "execution-sprint",
        label: "Execution Sprint",
        tone: "Sharper and execution-heavy",
        summary: `A more direct version that clarifies day-one priorities and execution scope. ${this.feedbackSummary(input.feedback)}`,
        responsibilities: this.applyFeedbackToResponsibilities(
          responsibilityList.map((item, index) =>
            `Deliver ${index === 0 ? "first-quarter momentum by " : ""}${item.toLowerCase()}`
          ),
          input.feedback
        ),
        focusAreas,
        description: this.composeDescription({
          title: input.title,
          intro: `This variation emphasizes the first two quarters of execution, decision velocity, and operating cadence.`,
          businessProblem,
          responsibilities: this.applyFeedbackToResponsibilities(
            responsibilityList.map((item, index) =>
              `Deliver ${index === 0 ? "first-quarter momentum by " : ""}${item.toLowerCase()}`
            ),
            input.feedback
          ),
          skills: skillList,
          focusAreas,
          hiringContext,
          feedback: input.feedback,
          style: "execution"
        }),
        feedbackApplied
      },
      {
        id: "outcome-scorecard",
        label: "Outcome Scorecard",
        tone: "Outcome-led and measurable",
        summary: `A version tuned for measurable outcomes, candidate clarity, and better screening alignment. ${this.feedbackSummary(input.feedback)}`,
        responsibilities: this.applyFeedbackToResponsibilities(
          responsibilityList.map((item) => `Translate ${item.toLowerCase()} into measurable business outcomes`),
          input.feedback
        ),
        focusAreas,
        description: this.composeDescription({
          title: input.title,
          intro: `This variation frames the role around outcomes, success measures, and clearer candidate expectations.`,
          businessProblem,
          responsibilities: this.applyFeedbackToResponsibilities(
            responsibilityList.map((item) => `Translate ${item.toLowerCase()} into measurable business outcomes`),
            input.feedback
          ),
          skills: skillList,
          focusAreas,
          hiringContext,
          feedback: input.feedback,
          style: "outcomes"
        }),
        feedbackApplied
      }
    ];

    return variants;
  }

  private composeDescription(input: {
    title: string;
    intro: string;
    businessProblem: string;
    responsibilities: string[];
    skills: string[];
    focusAreas: string[];
    hiringContext: string;
    feedback?: ManagerJobFeedbackAction;
    style: "balanced" | "execution" | "outcomes";
  }) {
    const feedbackLine = this.feedbackNarrative(input.feedback);
    const responsibilities = input.responsibilities.map((item) => `- ${item}`).join("\n");
    const skills = input.skills.map((item) => `- ${item}`).join("\n");
    const focusAreas = input.focusAreas.map((item) => `- ${item}`).join("\n");

    return [
      input.title,
      "",
      input.intro,
      feedbackLine,
      "",
      "Business problem",
      input.businessProblem,
      "",
      input.hiringContext ? `Hiring context: ${input.hiringContext}` : null,
      "",
      "Core responsibilities",
      responsibilities,
      "",
      input.style === "outcomes" ? "Success signals" : "Required skills",
      skills,
      "",
      "Manager interview focus areas",
      focusAreas
    ]
      .filter(Boolean)
      .join("\n");
  }

  private applyFeedbackToResponsibilities(
    responsibilities: string[],
    feedback?: ManagerJobFeedbackAction
  ) {
    switch (feedback) {
      case "TOO_GENERIC":
        return responsibilities.map((item) => `${item} with explicit scope, ownership, and success measures`);
      case "TOO_COMPLEX":
        return responsibilities.map((item) => item.replace("Translate ", "").replace("Deliver ", "Lead "));
      case "IMPROVE_RESPONSIBILITIES":
        return responsibilities.map((item) => `${item} across planning, execution, and stakeholder communication`);
      case "MAKE_MORE_OUTCOME_FOCUSED":
        return responsibilities.map((item) => `${item} tied to pipeline, quality, or delivery outcomes`);
      default:
        return responsibilities;
    }
  }

  private feedbackNarrative(feedback?: ManagerJobFeedbackAction) {
    switch (feedback) {
      case "TOO_GENERIC":
        return "Refinement applied: tightened the language to make the scope more specific and easier to screen against.";
      case "TOO_COMPLEX":
        return "Refinement applied: simplified the copy so candidates can understand the role faster.";
      case "IMPROVE_RESPONSIBILITIES":
        return "Refinement applied: sharpened responsibility bullets to better reflect day-to-day ownership.";
      case "MAKE_MORE_OUTCOME_FOCUSED":
        return "Refinement applied: centered the draft on measurable outcomes and business impact.";
      default:
        return "";
    }
  }

  private feedbackSummary(feedback?: ManagerJobFeedbackAction) {
    if (!feedback) {
      return "";
    }

    return `Feedback applied: ${feedback
      .toLowerCase()
      .replaceAll("_", " ")
      .replace("too ", "too ")}`;
  }

  private pickAnswer(answers: JobIntakeAnswer[], keywords: string[]) {
    const normalizedKeywords = keywords.map((keyword) => keyword.toLowerCase());
    const match = answers.find((answer) =>
      normalizedKeywords.some((keyword) => answer.prompt.toLowerCase().includes(keyword))
    );

    return match?.answer ?? null;
  }

  private toList(value: string) {
    const split = value
      .split(/\n|,|;|\|/g)
      .map((item) => item.replace(/^[-•\s]+/, "").trim())
      .filter(Boolean);

    return split.length ? split.slice(0, 6) : [value.trim()];
  }

  private formatSalaryRange(input: Pick<ManagerJobDraftRequest, "salaryMin" | "salaryMax" | "currency">) {
    if (input.salaryMin == null && input.salaryMax == null) {
      return null;
    }

    return `${input.currency ?? "USD"} ${input.salaryMin ?? "Open"} - ${input.salaryMax ?? "Open"}`;
  }

  private formatPersistedSalaryRange(job: Job) {
    if (job.salaryMin == null && job.salaryMax == null) {
      return null;
    }

    return `${job.currency ?? "USD"} ${job.salaryMin ?? "Open"} - ${job.salaryMax ?? "Open"}`;
  }

  private getFocusAreas(job: Job) {
    const raw = (job.structuredAnalysis as { interviewFocusAreas?: unknown }).interviewFocusAreas;
    if (Array.isArray(raw)) {
      return raw.filter((item): item is string => typeof item === "string");
    }

    return ["Business impact", "Execution depth", "Cross-functional collaboration"];
  }
}

export const jobsService = new JobsService();
