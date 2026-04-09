import { createTimestamp, createPrefixedId } from "../../shared/id.js";
import type { EmailProvider } from "../email-provider.js";
import type { EmailDeliveryResult, EmailMessage } from "../types.js";

export interface MockEmailRecord {
  message: EmailMessage;
  delivery: EmailDeliveryResult;
}

export class MockEmailProvider implements EmailProvider {
  readonly sentMessages: MockEmailRecord[] = [];

  async send(message: EmailMessage): Promise<EmailDeliveryResult> {
    const delivery: EmailDeliveryResult = {
      provider: "mock",
      messageId: createPrefixedId("email"),
      acceptedAt: createTimestamp()
    };

    this.sentMessages.push({ message, delivery });
    return delivery;
  }
}
