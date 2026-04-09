# Integration Services

Typed integration layer for the AI Hiring Intelligence Platform.

## Included modules

- LinkedIn job payload generation with external-application enforcement
- Email automation trigger service with pluggable providers
- Cloud object storage abstraction for resumes and interview artifacts
- Centralized environment loading and provider factories

## Provider support

- LinkedIn: `external`, `mock`
- Email: `resend`, `mock`
- Storage: `s3`, `mock`

## Notes

- LinkedIn publishing APIs are partner-gated. This package prepares validated external-apply payloads and draft objects that can be handed to a partner publishing workflow.
- Storage uses an S3-compatible adapter via AWS SDK v3.
- Email uses Resend via the REST API to avoid coupling the integration layer to a larger application framework.
