import { query } from "@ai-hiring/database";
import type { EmailEvent } from "@ai-hiring/shared-types";

interface EmailEventRow {
  id: string;
  application_id: string | null;
  candidate_id: string | null;
  event_type: EmailEvent["eventType"];
  recipient_email: string;
  provider_message_id: string | null;
  status: EmailEvent["status"];
  metadata: Record<string, unknown>;
  sent_at: Date | null;
  created_at: Date;
}

function mapEmailEvent(row: EmailEventRow): EmailEvent {
  return {
    id: row.id,
    applicationId: row.application_id,
    candidateId: row.candidate_id,
    eventType: row.event_type,
    recipientEmail: row.recipient_email,
    providerMessageId: row.provider_message_id,
    status: row.status,
    metadata: row.metadata ?? {},
    sentAt: row.sent_at?.toISOString() ?? null,
    createdAt: row.created_at.toISOString()
  };
}

export class EmailEventsRepository {
  async list(): Promise<EmailEvent[]> {
    const result = await query<EmailEventRow>("SELECT * FROM email_events ORDER BY created_at DESC");
    return result.rows.map(mapEmailEvent);
  }
}

export const emailEventsRepository = new EmailEventsRepository();
