import { createTimestamp } from "../../shared/id.js";
import type { EmailProvider } from "../email-provider.js";
import type { EmailDeliveryResult, EmailMessage } from "../types.js";

export interface ResendEmailProviderOptions {
  apiKey: string;
  endpoint?: string;
}

interface ResendSendResponse {
  id?: string;
  error?: {
    message?: string;
  };
}

export class ResendEmailProvider implements EmailProvider {
  private readonly endpoint: string;

  constructor(private readonly options: ResendEmailProviderOptions) {
    this.endpoint = options.endpoint ?? "https://api.resend.com/emails";
  }

  async send(message: EmailMessage): Promise<EmailDeliveryResult> {
    const response = await fetch(this.endpoint, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${this.options.apiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        from: formatRecipient(message.from),
        to: message.to.map(formatRecipient),
        cc: message.cc?.map(formatRecipient),
        bcc: message.bcc?.map(formatRecipient),
        reply_to: message.replyTo ? formatRecipient(message.replyTo) : undefined,
        subject: message.subject,
        html: message.html,
        text: message.text,
        tags: message.tags?.map((tag) => ({ name: "trigger", value: tag })),
        headers: message.templateId
          ? {
              "X-Email-Template": message.templateId
            }
          : undefined
      })
    });

    const payload = (await response.json()) as ResendSendResponse;

    if (!response.ok || !payload.id) {
      throw new Error(
        `Resend email send failed: ${payload.error?.message ?? response.statusText}`
      );
    }

    return {
      provider: "resend",
      messageId: payload.id,
      acceptedAt: createTimestamp()
    };
  }
}

function formatRecipient(recipient: { email: string; name?: string }): string {
  return recipient.name ? `${recipient.name} <${recipient.email}>` : recipient.email;
}
