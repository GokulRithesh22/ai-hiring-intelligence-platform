export const EMAIL_AUTOMATION_TRIGGERS = [
  "application.received",
  "interview.invitation",
  "interview.completed",
  "candidate.shortlisted",
  "candidate.rejected"
] as const;

export type EmailAutomationTrigger = (typeof EMAIL_AUTOMATION_TRIGGERS)[number];

export interface EmailRecipient {
  email: string;
  name?: string;
}

export interface EmailMessage {
  to: EmailRecipient[];
  from: EmailRecipient;
  subject: string;
  html: string;
  text: string;
  replyTo?: EmailRecipient;
  cc?: EmailRecipient[];
  bcc?: EmailRecipient[];
  tags?: string[];
  metadata?: Record<string, string>;
  templateId?: string;
  templateModel?: Record<string, string | number | boolean | null>;
}

export interface EmailDeliveryResult {
  provider: string;
  messageId: string;
  acceptedAt: string;
}

export interface EmailAutomationContext {
  candidateId: string;
  candidateName: string;
  recipientEmail: string;
  recipientName?: string;
  applicationId?: string;
  jobId?: string;
  jobTitle?: string;
  companyName?: string;
  portalUrl?: string;
  interviewUrl?: string;
  interviewScheduledAt?: string;
  joiningTimeline?: string;
  salaryExpectation?: string;
  relocationPreference?: string;
  rejectionReason?: string;
  metadata?: Record<string, string>;
}

export interface EmailTemplateContent {
  subject: string;
  html: string;
  text: string;
}

export interface TriggeredEmailResult {
  trigger: EmailAutomationTrigger;
  message: EmailMessage;
  delivery: EmailDeliveryResult;
}
