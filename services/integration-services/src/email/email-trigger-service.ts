import type { EmailProvider } from "./email-provider.js";
import type {
  EmailAutomationContext,
  EmailAutomationTrigger,
  EmailMessage,
  EmailRecipient,
  EmailTemplateContent,
  TriggeredEmailResult
} from "./types.js";

export interface EmailTriggerServiceOptions {
  provider: EmailProvider;
  from: EmailRecipient;
  replyTo?: EmailRecipient;
  companyName: string;
  templateIds?: Partial<Record<EmailAutomationTrigger, string>>;
}

export class EmailTriggerService {
  constructor(private readonly options: EmailTriggerServiceOptions) {}

  async dispatch(
    trigger: EmailAutomationTrigger,
    context: EmailAutomationContext
  ): Promise<TriggeredEmailResult> {
    const content = this.render(trigger, context);
    const message: EmailMessage = {
      to: [
        {
          email: context.recipientEmail,
          name: context.recipientName ?? context.candidateName
        }
      ],
      from: this.options.from,
      replyTo: this.options.replyTo,
      subject: content.subject,
      html: content.html,
      text: content.text,
      tags: [trigger],
      templateId: this.options.templateIds?.[trigger],
      templateModel: {
        candidateName: context.candidateName,
        jobTitle: context.jobTitle ?? "",
        companyName: context.companyName ?? this.options.companyName,
        portalUrl: context.portalUrl ?? "",
        interviewUrl: context.interviewUrl ?? "",
        interviewScheduledAt: context.interviewScheduledAt ?? "",
        joiningTimeline: context.joiningTimeline ?? "",
        salaryExpectation: context.salaryExpectation ?? "",
        relocationPreference: context.relocationPreference ?? "",
        rejectionReason: context.rejectionReason ?? ""
      },
      metadata: {
        candidateId: context.candidateId,
        applicationId: context.applicationId ?? "",
        jobId: context.jobId ?? "",
        ...context.metadata
      }
    };

    const delivery = await this.options.provider.send(message);
    return { trigger, message, delivery };
  }

  private render(
    trigger: EmailAutomationTrigger,
    context: EmailAutomationContext
  ): EmailTemplateContent {
    const companyName = context.companyName ?? this.options.companyName;
    const jobTitle = context.jobTitle ?? "your application";
    const portalLink = context.portalUrl
      ? `<p>You can review your application here: <a href="${context.portalUrl}">${context.portalUrl}</a></p>`
      : "";
    const interviewLink = context.interviewUrl
      ? `<p>Your interview link: <a href="${context.interviewUrl}">${context.interviewUrl}</a></p>`
      : "";

    switch (trigger) {
      case "application.received":
        return {
          subject: `Application received for ${jobTitle}`,
          html: `<p>Hi ${context.candidateName},</p><p>We received your application for ${jobTitle} at ${companyName}.</p>${portalLink}<p>We will keep you updated as your application moves through screening.</p>`,
          text: `Hi ${context.candidateName},\n\nWe received your application for ${jobTitle} at ${companyName}.\n${context.portalUrl ? `Review your application: ${context.portalUrl}\n` : ""}\nWe will keep you updated as your application moves through screening.`
        };
      case "interview.invitation":
        return {
          subject: `Interview invitation for ${jobTitle}`,
          html: `<p>Hi ${context.candidateName},</p><p>You have been invited to complete an AI interview for ${jobTitle} at ${companyName}.</p><p>Scheduled start: ${context.interviewScheduledAt ?? "As soon as you're ready"}</p>${interviewLink}${portalLink}<p>Please complete the interview before the deadline listed in your portal.</p>`,
          text: `Hi ${context.candidateName},\n\nYou have been invited to complete an AI interview for ${jobTitle} at ${companyName}.\nScheduled start: ${context.interviewScheduledAt ?? "As soon as you're ready"}\n${context.interviewUrl ? `Interview link: ${context.interviewUrl}\n` : ""}${context.portalUrl ? `Portal: ${context.portalUrl}\n` : ""}\nPlease complete the interview before the deadline listed in your portal.`
        };
      case "interview.completed":
        return {
          subject: `Interview completed for ${jobTitle}`,
          html: `<p>Hi ${context.candidateName},</p><p>Thank you for completing the AI interview for ${jobTitle} at ${companyName}.</p>${portalLink}<p>Our team will review your responses and follow up with next steps.</p>`,
          text: `Hi ${context.candidateName},\n\nThank you for completing the AI interview for ${jobTitle} at ${companyName}.\n${context.portalUrl ? `Portal: ${context.portalUrl}\n` : ""}\nOur team will review your responses and follow up with next steps.`
        };
      case "candidate.shortlisted":
        return {
          subject: `You have been shortlisted for ${jobTitle}`,
          html: `<p>Hi ${context.candidateName},</p><p>Great news. You have been shortlisted for ${jobTitle} at ${companyName}.</p>${portalLink}<p>We will reach out soon with the next stage of the hiring process.</p>`,
          text: `Hi ${context.candidateName},\n\nGreat news. You have been shortlisted for ${jobTitle} at ${companyName}.\n${context.portalUrl ? `Portal: ${context.portalUrl}\n` : ""}\nWe will reach out soon with the next stage of the hiring process.`
        };
      case "candidate.rejected":
        return {
          subject: `Update on your ${jobTitle} application`,
          html: `<p>Hi ${context.candidateName},</p><p>Thank you for your interest in ${jobTitle} at ${companyName}. We will not be moving forward with your application at this time.</p><p>${context.rejectionReason ?? "We appreciate the time you invested in the process."}</p>${portalLink}`,
          text: `Hi ${context.candidateName},\n\nThank you for your interest in ${jobTitle} at ${companyName}. We will not be moving forward with your application at this time.\n${context.rejectionReason ?? "We appreciate the time you invested in the process."}\n${context.portalUrl ? `Portal: ${context.portalUrl}\n` : ""}`
        };
      default: {
        const exhaustiveTrigger: never = trigger;
        throw new Error(`Unsupported email automation trigger: ${exhaustiveTrigger}`);
      }
    }
  }
}
