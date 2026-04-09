import mammoth from "mammoth";
import pdfParse from "pdf-parse";

import { ApiError } from "./http";

export async function extractResumeText(file: Express.Multer.File): Promise<string> {
  if (file.mimetype === "application/pdf") {
    const parsed = await pdfParse(file.buffer);
    return normalizeExtractedText(parsed.text);
  }

  if (
    file.mimetype ===
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
  ) {
    const parsed = await mammoth.extractRawText({ buffer: file.buffer });
    return normalizeExtractedText(parsed.value);
  }

  if (file.mimetype === "text/plain") {
    return normalizeExtractedText(file.buffer.toString("utf8"));
  }

  throw new ApiError(400, "Unsupported resume format. Use PDF, DOCX, or TXT.");
}

function normalizeExtractedText(value: string): string {
  const normalized = value.replace(/\u0000/g, " ").replace(/\s+/g, " ").trim();

  if (normalized.length < 40) {
    throw new ApiError(400, "Resume text extraction failed or produced too little content.");
  }

  return normalized;
}
