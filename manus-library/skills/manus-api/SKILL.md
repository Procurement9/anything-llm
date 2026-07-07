---
name: manus-api
description: Manage tasks, projects, and other data in Manus via API, build OAuth2 third-party integrations, or create Manus tasks programmatically to build services or workflows that need agentic capabilities.
---

# Manus API Integration Guide

Use this skill when building or troubleshooting integrations that call the Manus API, automate Manus agents, retrieve generated results, manage projects/files/webhooks/connectors/agents/usage, request structured JSON outputs, publish websites created by Manus tasks, or implement OAuth2 authorization for third-party apps.

This file is the **routing and decision guide**. Keep implementation details in the embedded official docs under `docs/`. When a user asks for exact request bodies, response schemas, validation rules, rate limits, or endpoint-specific edge cases, open the relevant `docs/v2/*.mdx` file instead of relying on this overview.

**Version policy.** Use **API v2** for all new work. Use `docs/v1/` only when the user is maintaining an existing v1 integration, because v1 is deprecated.

**Base URL.** Send requests to `https://api.manus.ai`. Authenticate with either `x-manus-api-key: <key>` (for your own integrations) or `Authorization: Bearer <access_token>` (for third-party OAuth2 apps acting on behalf of a user). Successful responses use an `ok: true` envelope; failures use `ok: false` with `error.code`, `error.message`, and `request_id`. API keys are managed from the Manus API integration settings. Some endpoints are **API Key only** and do not accept standard OAuth tokens (trusted team/public apps can access all endpoints) — each endpoint doc notes the supported auth methods.

---

## 1. Documentation Routing

Prefer reading the smallest relevant document before answering detailed implementation questions. For endpoint-specific parameters, open `docs/v2/<endpoint>.mdx`; for the full schema, inspect `docs/v2/openapi_v2.json`.

| User intent | Read first |
| --- | --- |
| Create, continue, stop, delete, or inspect tasks | `docs/v2/task-lifecycle.mdx`, then the relevant `task.*.mdx` file |
| Require JSON output that an application can parse | `docs/v2/structured-output.mdx` |
| Publish or manage a website built by an agent | `docs/v2/website.mdx`, then the relevant `website.*.mdx` file |
| Upload or reference user files | `docs/v2/file.upload.mdx`, `docs/v2/file.detail.mdx`, `docs/v2/file.delete.mdx` |
| Configure real-time callbacks | `docs/v2/webhooks-overview.mdx`, `docs/v2/webhooks-security.mdx` |
| Add durable instructions/persona | `docs/v2/project.create.mdx`, `docs/v2/project.list.mdx` |
| Use connectors, skills, agents, or browser clients | `docs/v2/connectors.mdx`, `docs/v2/connector.list.mdx`, `docs/v2/skill.list.mdx`, `docs/v2/agents-overview.mdx`, `docs/v2/browser.onlineList.mdx` |
| Inspect usage, quotas, or logs | `docs/v2/usage.list.mdx`, `docs/v2/usage.teamStatistic.mdx`, `docs/v2/usage.teamLog.mdx`, `docs/v2/rate-limits.mdx` |
| Build a third-party OAuth2 app or authorize on behalf of users | `docs/v2/oauth.mdx`, `docs/v2/authentication.mdx` |

---

## 2. Endpoint Map

Use this map for orientation only. Open the endpoint file for concrete request/response details.

| Group | Purpose | Representative endpoints |
| --- | --- | --- |
| **Tasks** | Agent task lifecycle and multi-turn conversation. | `task.create`, `task.sendMessage`, `task.listMessages`, `task.confirmAction`, `task.stop` |
| **Projects** | Durable shared instructions and organization. | `project.create`, `project.list` |
| **Files** | Upload, inspect, and delete files used by tasks. | `file.upload`, `file.detail`, `file.delete` |
| **Webhooks** | Production-grade task lifecycle notifications. | `webhook.create`, `webhook.list`, `webhook.delete`, `webhook.publicKey` |
| **Connectors and Skills** | Control third-party app access and skill availability. | `connector.list`, `skill.list` |
| **Agents** | List, inspect, and update custom IM agents. | `agent.list`, `agent.detail`, `agent.update` |
| **Usage** | Retrieve usage records and team statistics. | `usage.list`, `usage.teamStatistic`, `usage.teamLog` |
| **Website** | Inspect, publish, version, and update websites built by Manus tasks. | `website.status`, `website.listCheckpoints`, `website.publish`, `website.update` |

---

## 3. Core Integration Decisions

**Choose the right auth method.** Use an API key (`x-manus-api-key`) for your own integrations and scripts. Use OAuth2 when building a third-party app that acts on behalf of team users — OAuth2 requires a Team account. Standard OAuth apps use scoped access (`create_task`, `manage_all_tasks`, `create_project`, `use_connectors`, `use_my_browsers`), while trusted team/public apps bypass all scope restrictions and can access every endpoint like an API key. For standard OAuth apps, `agent.*`, `webhook.*`, `usage.*`, and `website.*` endpoints are API Key only. OAuth apps come in three types: `team` (standard scoped), `trusted_team` (full access, same-team only), and `trusted_public` (full access, cross-team, partners only). Read `docs/v2/oauth.mdx` before implementing OAuth2.

**Choose the right task flow.** For a new independent job, call `task.create`. For an ongoing thread or conversation, store the `task_id` and call `task.sendMessage` on later turns. For direct messaging to the default IM agent, `task.sendMessage` supports the shortcut `task_id: "agent-default-main_task"`.

**Use projects for durable behavior.** If the integration needs a persistent persona, formatting rule, or reusable instruction, create or reuse a Project and pass `project_id` when creating tasks. Do not duplicate large system-style instructions into every user message if a project is the cleaner abstraction.

**Use webhooks for production result delivery.** Polling `task.listMessages` is acceptable for scripts and prototypes, but production systems should prefer webhooks and verify signatures with the webhook public key. Still implement idempotency and retries because webhook delivery can be repeated by clients or infrastructure.

**Handle waiting states correctly.** If the agent asks the user a normal question, answer with `task.sendMessage`. If the agent is waiting for an action confirmation such as sending an email or deploying something, use `task.confirmAction` instead. Read `task-lifecycle.mdx` and `task.confirmAction.mdx` before automating confirmations.

**Pick agent profile intentionally.** `task.create` and `task.sendMessage` support `agent_profile` values such as standard, lite, and max profiles. Use the endpoint docs for the exact enum and default behavior; note that follow-up turns can override the current profile, while omitting the field keeps the current profile.

**Attach tools through message fields.** Use `message.connectors` for connector IDs, `message.enable_skills` to control available skills, and `message.force_skills` when a skill must be invoked. Use `connector.list` and `skill.list` to discover IDs.

---

## 4. Structured Output Guidance

Use **Structured Output** when the integration needs machine-parseable JSON rather than human-facing prose. Before writing schemas or code, read `docs/v2/structured-output.mdx`.

Remember only the routing-level behavior here: pass `structured_output_schema` to `task.create` or `task.sendMessage`; extraction runs after the agent finishes; schemas are **arm once, fire once** and can be re-armed on later turns; results appear in `task.listMessages` as `structured_output_result` or in webhooks as `task_stopped.task_detail.structured_output`. Always check `success` before trusting `value`.

---

## 5. Known Limits (as of 2026-06)

These are confirmed from the official website. Always verify at `https://open.manus.ai` as they may change.

**File upload (`file.upload`):**
- Max **512 MB** per file; max **10 GB** total storage per account. Exceeding either returns `QuotaExceededError`.
- Upload URL expires in **3 minutes**. Files are deleted **48 hours** after upload.
- Prohibited types: `.exe`, `.sh`, `.bat`, `.dmg` and other executables/scripts.

**File attachment in tasks (`task.create` / `task.sendMessage`):**
- `file_id` (pre-uploaded via `file.upload`): no additional limit beyond the 512 MB upload cap.
- `file_url` (URL Manus downloads): capped at **20 MB**.
- `file_data` (inline base64): capped at **20 MB** decoded (~26.7 MB of base64 text).
- No hard limit on the number of attachments per message.

---

## 6. Minimal Implementation Pattern

A typical closed-loop integration follows this sequence: upload files if needed with `file.upload`; create or reuse a project for durable instructions; call `task.create`; deliver results through webhooks or poll `task.listMessages`; continue with `task.sendMessage` if the conversation needs another turn; and use `task.confirmAction` only for explicit action confirmations.

For structured-output tasks, add a post-task step that reads either the `structured_output_result` event or the webhook `structured_output` field.

---

## References

Open these files for authoritative details:

| Topic | File |
| --- | --- |
| Full OpenAPI specification | `docs/v2/openapi_v2.json` |
| Task lifecycle and polling | `docs/v2/task-lifecycle.mdx`, `docs/v2/task.listMessages.mdx` |
| Task creation and follow-up turns | `docs/v2/task.create.mdx`, `docs/v2/task.sendMessage.mdx` |
| Structured output | `docs/v2/structured-output.mdx` |
| Website publishing | `docs/v2/website.mdx`, `docs/v2/website.status.mdx`, `docs/v2/website.publish.mdx`, `docs/v2/website.listCheckpoints.mdx`, `docs/v2/website.update.mdx` |
| Webhooks | `docs/v2/webhooks-overview.mdx`, `docs/v2/webhooks-security.mdx` |
| File upload | `docs/v2/file.upload.mdx` |
| Projects, connectors, skills, agents | `docs/v2/project.create.mdx`, `docs/v2/connector.list.mdx`, `docs/v2/skill.list.mdx`, `docs/v2/agents-overview.mdx` |
| OAuth2 authorization | `docs/v2/oauth.mdx`, `docs/v2/authentication.mdx` |
