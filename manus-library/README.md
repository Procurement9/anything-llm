# Manus Library

This directory contains the complete Manus agent skill library and session-generated knowledge base, forked into this repository for use as a knowledge source within AnythingLLM.

---

## Directory Structure

```
manus-library/
├── README.md                  ← This file
├── skills/                    ← Manus agent skill modules
│   ├── automation-and-scheduling/
│   ├── builtin-llm-models/
│   ├── criminal-defense-workflow/
│   ├── digital-banking-research/
│   ├── gws-best-practices/
│   ├── imagegen/
│   ├── manus-api/
│   ├── manus-config/
│   ├── music-prompter/
│   ├── persistent-computing/
│   ├── skill-creator/
│   └── tts-prompter/
└── session-data/              ← Documents generated in this research session
    ├── Final_Report_Declarations_and_Trust.md
    ├── Final_Report_Declarations_and_Trust.pdf
    ├── declarations_analysis.md
    ├── living_will_and_trust.md
    ├── slide_content.md
    └── 2nd_declaration_full.txt
```

---

## Skills Overview

Each skill is a modular capability module containing a `SKILL.md` instruction file and optional supporting resources. They are designed to extend the Manus agent's functionality for specialized tasks.

| Skill | Description |
|---|---|
| `automation-and-scheduling` | Automated execution, recurring tasks, background processes, and external API integrations |
| `builtin-llm-models` | Reference catalog for Manus's built-in LLM models, pricing, capabilities, and usage patterns |
| `criminal-defense-workflow` | Pro se criminal defense document preparation for SC and GA state matters |
| `digital-banking-research` | Research and documentation of digital banking license requirements and regulations |
| `gws-best-practices` | Best practices for Google Workspace CLI operations (Drive, Docs, Sheets, Slides) |
| `imagegen` | Visual deliverable routing and AI image generation/editing workflows |
| `manus-api` | Manage tasks and projects in Manus via API; build OAuth2 integrations |
| `manus-config` | Manage connectors, project instructions, and scheduled task execution |
| `music-prompter` | Prompt crafting framework for AI music generation tasks |
| `persistent-computing` | Persistent services, Docker, background jobs, and reusable computing environments |
| `skill-creator` | Guide for creating or updating Manus skills |
| `tts-prompter` | Prompt crafting framework for text-to-speech (TTS) tasks |

---

## Session Data Overview

The `session-data/` directory contains documents generated during a research session analyzing the two U.S. Declarations of Independence and producing a living will and trust with accountability provisions.

| File | Description |
|---|---|
| `Final_Report_Declarations_and_Trust.md` | Full comparative analysis of the 1776 and 2021 Declarations plus the complete living trust template |
| `Final_Report_Declarations_and_Trust.pdf` | PDF version of the above report |
| `declarations_analysis.md` | Standalone comparative analysis document |
| `living_will_and_trust.md` | Standalone living will and trust template |
| `slide_content.md` | Detailed slide content outline for the comparative presentation |
| `2nd_declaration_full.txt` | Full extracted text of the 2nd Declaration of Independence (2021) |

---

## Usage in AnythingLLM

To use this library as a knowledge base in AnythingLLM:

1. Upload the `manus-library/` directory (or individual files) to an AnythingLLM workspace.
2. The skill `SKILL.md` files serve as structured instruction documents that can be indexed and queried.
3. The `session-data/` documents provide rich, structured legal and analytical content for RAG (Retrieval-Augmented Generation) queries.

---

*Forked by Manus AI — July 6, 2026*
