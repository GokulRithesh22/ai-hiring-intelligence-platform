import { asyncHandler } from "../../lib/http";
import { emailEventsService } from "./email-events.service";

export const emailEventsController = {
  list: asyncHandler(async (_request, response) => {
    response.json({ items: await emailEventsService.list() });
  })
};
