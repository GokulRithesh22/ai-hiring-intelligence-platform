import type { EmailDeliveryResult, EmailMessage } from "./types.js";

export interface EmailProvider {
  send(message: EmailMessage): Promise<EmailDeliveryResult>;
}
