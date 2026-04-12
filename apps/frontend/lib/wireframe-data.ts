import {
  candidateProfile,
  publicJobCards,
  recruiterCandidateListDemo,
  recruiterCandidateProfileDemo
} from "@/lib/mock-data";
import type { CandidateProfileData, PublicJobCard } from "@/lib/types";

type WireframeJobDetail = {
  job: PublicJobCard;
  responsibilities: string[];
  skills: string[];
};

type WireframeJobMetric = {
  id: string;
  title: string;
  applicants: number;
  interviews: number;
  shortlisted: number;
};

const jobDetails: Record<string, Omit<WireframeJobDetail, "job">> = {
  "associate-center-manager": {
    responsibilities: [
      "Manage daily center operations.",
      "Coordinate staff and member experience.",
      "Track service quality and issue resolution."
    ],
    skills: ["Operations", "People coordination", "Member support"]
  },
  "sales-executive-cult-fit": {
    responsibilities: [
      "Follow up on leads.",
      "Convert prospects into memberships.",
      "Maintain a steady sales pipeline."
    ],
    skills: ["Sales", "Communication", "Follow-up discipline"]
  },
  "personal-trainer-gym-fitness": {
    responsibilities: [
      "Guide members through workout plans.",
      "Monitor progress and safety.",
      "Build long-term member relationships."
    ],
    skills: ["Training", "Fitness knowledge", "Coaching"]
  },
  "swimming-coach": {
    responsibilities: [
      "Run structured swimming sessions.",
      "Improve technique and confidence.",
      "Maintain pool safety standards."
    ],
    skills: ["Swimming instruction", "Safety", "Member engagement"]
  },
  "cult-fit-recruiter": {
    responsibilities: [
      "Source and screen candidates.",
      "Coordinate interviews and hiring steps.",
      "Maintain candidate communication."
    ],
    skills: ["Recruiting", "Screening", "Stakeholder coordination"]
  }
};

const recruiterJobMetrics: WireframeJobMetric[] = publicJobCards.map((job, index) => ({
  id: job.id,
  title: job.title,
  applicants: 24 - index * 3,
  interviews: 10 - index,
  shortlisted: 4 - Math.min(index, 3)
}));

const candidateExperience: Record<string, string> = {
  "demo-candidate-rahul-verma": "4 years",
  "demo-candidate-priya-nair": "5 years",
  "demo-candidate-manoj-shetty": "6 years",
  "demo-candidate-neha-arora": "5 years",
  "demo-candidate-vivek-rao": "4 years",
  "demo-candidate-sneha-kulkarni": "3 years",
  "demo-candidate-farah-khan": "3 years",
  "demo-candidate-aditi-sen": "4 years",
  "demo-candidate-karthik-iyer": "7 years",
  "demo-candidate-deepak-joshi": "2 years",
  "cand-001": "6 years"
};

export const wireframeJdVariants = [
  {
    id: "variant-1",
    title: "Version 1",
    summary: "Balanced version with a standard role summary and responsibilities."
  },
  {
    id: "variant-2",
    title: "Version 2",
    summary: "Shorter version focused on responsibilities and core skills."
  },
  {
    id: "variant-3",
    title: "Version 3",
    summary: "More structured version with clearer skill emphasis."
  }
];

export function getWireframeJobs() {
  return publicJobCards;
}

export function getWireframeJob(jobId: string): WireframeJobDetail {
  const fallback = publicJobCards[0];
  const matchedJob =
    publicJobCards.find((job) => job.id === jobId || job.slug === jobId) ?? fallback;
  const detail = jobDetails[matchedJob.id] ?? jobDetails[fallback.id];

  return {
    job: matchedJob,
    responsibilities: detail.responsibilities,
    skills: detail.skills
  };
}

export function getRecruiterDashboardJobs() {
  return recruiterJobMetrics;
}

export function getPipelineCandidates() {
  return recruiterCandidateListDemo.slice(0, 5).map((candidate) => ({
    id: candidate.id,
    name: candidate.name,
    score: candidate.candidateScore ?? candidate.resumeScore ?? 0,
    status: candidate.latestApplicationStatus?.replace(/_/g, " ") ?? "APPLIED"
  }));
}

export function getCandidateWireframeProfile(candidateId: string): CandidateProfileData {
  return recruiterCandidateProfileDemo[candidateId] ?? candidateProfile;
}

export function getCandidateExperience(candidateId: string) {
  return candidateExperience[candidateId] ?? "4 years";
}
