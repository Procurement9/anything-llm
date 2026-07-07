---
name: criminal-defense-workflow
description: >
  End-to-end pro se criminal defense document preparation, case intelligence gathering,
  and court filing workflow for South Carolina and Georgia state criminal matters.
  Use for: drafting and formatting court-ready motions, affidavits, and notices;
  checking Gmail and Google Drive for new case evidence; identifying certified mail
  records and green card return receipts; building legally sound Fourth Amendment
  and due process arguments; managing multi-jurisdiction cases; and creating
  reusable filing packages with proper SC/GA court caption blocks, heading boxes,
  and certificates of service. Designed specifically for matters involving
  Michael Renee Richardson-El (also known as Michael-Rene of the
  Garris-Ganis-Ganus-Bryant=Richardson-Bey-EL) across Bamberg County SC,
  Taliaferro County GA, and related proceedings.
---

# Criminal Defense Workflow Skill

## Client Profile

| Field | Value |
|-------|-------|
| **Legal Name** | Michael Renee Richardson-El |
| **Also Known As** | Michael-Rene of the Garris-Ganis-Ganus-Bryant=Richardson-Bey-EL |
| **Email** | ministryestateandtrust@gmail.com |
| **Contact** | Lorinda Montgomery (associate) |
| **Procurement Agency** | MRREL U.D / MRREL U.D 2 (email senders) |

---

## Active Cases

### Case 1 — Bamberg County, South Carolina (PRIMARY)

| Field | Value |
|-------|-------|
| **Court** | Bamberg County General Sessions Court, Second Judicial Circuit |
| **Incident #** | 25-09-004496 |
| **Charges** | Possession with Intent to Distribute (controlled substance); K9 alert |
| **Solicitor** | Deputy Solicitor David Miller, Second Judicial Circuit |
| **Court Date** | May 12, 2026 at 9:00 AM — Bamberg County Civic Center, 2477 Main Highway, Bamberg, SC |
| **Status** | Possible bench warrant active (missed May 12 hearing) |
| **Key Evidence Issue** | K9 alert reliability; stop duration under *Rodriguez v. US* |

**Strongest Legal Arguments (in priority order):**
1. Fourth Amendment — unlawful extension of traffic stop beyond its mission (*Rodriguez v. United States*, 575 U.S. 348 (2015))
2. K9 unreliability — insufficient foundation for probable cause (*Florida v. Harris*, 568 U.S. 237 (2013))
3. Insufficient evidence for "intent to distribute" (*State v. James*, 362 S.C. 557 (2004))
4. Exclusionary rule — suppression of all tainted evidence (*Mapp v. Ohio*, 367 U.S. 643 (1961))
5. Civil rights damages — 42 U.S.C. § 1983 (proper replacement for fee-schedule counterclaims)

**CRITICAL WARNING:** Courts have consistently rejected and sanctioned UCC 1-308, sovereign citizen, natural man/legal fiction, and unilateral fee-schedule arguments in criminal proceedings. See *State of Ohio v. Ryan J. Few* (Franklin County, May 26, 2026) — Judge Lynch denied pro se status specifically because of these filings. Do NOT include these arguments in any court filing.

---

### Case 2 — Taliaferro County, Georgia (SECONDARY)

| Field | Value |
|-------|-------|
| **Court** | Taliaferro County Probate Court |
| **Citation #** | E05960158 |
| **Charge** | Driving While License Suspended or Revoked (GA Code 40-5-121) |
| **Date of Offense** | March 27, 2026 |
| **Officer** | MCMURTRY, LEVI DOUGL — Badge #0933 — GSPE\POST 17 |
| **Court Date** | April 23, 2026 at 10:00 AM — 113 Monument Street, Crawfordville, GA 30631 |
| **Phone** | PAY.JUSTICE-ONE.US 678-359-2783 |
| **Status** | FTA (Failure to Appear) — possible warrant active |
| **Vehicle** | 2024 Toyota Camry Silver, TX plate VBT4501 |

---

## Document Workflow

### Step 1 — Check Gmail and Drive for New Information

1. Navigate to `https://mail.google.com/mail/u/0/#inbox` (account: ministryestateandtrust@gmail.com)
2. Search for: `has:attachment subject:(FTA OR BSC OR Bamberg OR certified OR court OR hearing)`
3. Search for: `USPS OR certified OR "return receipt" OR "green card" OR "tracking number"`
4. Check for any new emails from: Lorinda Montgomery, Royce Few, MRREL U.D, court clerks, or solicitor's office
5. Download all attachment PDFs and images to `/home/ubuntu/certified_mail_evidence/`
6. Check Google Drive via `gws drive files list` for any new documents

### Step 2 — Identify and Catalog Evidence

Save all certified mail records, green card return receipts, and postal tracking records to:
`/home/ubuntu/certified_mail_evidence/`

For each piece of postal evidence, record: tracking number, date mailed, date delivered/signed, recipient name and address, and description of the document mailed.

### Step 3 — Draft Court Documents

All documents must use the SC General Sessions caption format. See `references/sc_caption_template.md`.

**Required documents for Bamberg County SC case:**
1. Motion to Quash Bench Warrant (file FIRST if warrant is active)
2. Motion to Suppress Evidence (Fourth Amendment / Rodriguez / Harris)
3. Motion to Dismiss for Insufficient Evidence (State v. James)
4. Notice of Intent to Sue under 42 U.S.C. § 1983 (civil rights damages)
5. Certificate of Service (required for every filing)

**Required documents for Taliaferro County GA case:**
1. Motion to Quash Bench Warrant (if FTA warrant is active)
2. Motion in Limine or Motion to Dismiss (license status challenge)

### Step 4 — Format for Court Filing

Every document must include:
- Court caption block in a bordered box (see template)
- Case number and incident number
- Proper party designations (STATE OF SC v. MICHAEL RENEE RICHARDSON-EL)
- Numbered paragraphs
- Signature block with "Respectfully submitted" and date line
- Certificate of Service at the end

### Step 5 — Convert and Package

```bash
# Convert all markdown documents to PDF
for doc in /home/ubuntu/*.md; do
    manus-md-to-pdf "$doc" "${doc%.md}.pdf"
done

# Package into ZIP
cd /home/ubuntu && zip -j Richardson_Defense_$(date +%Y%m%d).zip *.pdf *.docx
```

### Step 6 — Update Skills File

After each session, update this skill with new case developments, new evidence found, new hearing dates, and status of filed motions.

---

## Key Contacts

| Name | Role | Contact |
|------|------|---------|
| Lorinda Montgomery | Associate / Family Contact | ministryestateandtrust@gmail.com (CC) |
| Royce Few | Co-defendant associate | Sends transcripts and mandamus documents |
| David Miller | Deputy Solicitor, 2nd Circuit SC | Bamberg County prosecution |
| MCMURTRY, LEVI DOUGL | Arresting Officer, Taliaferro GA | Badge #0933, GSPE\POST 17 |

---

## Evidence Log

| Date | Document | Source | Location |
|------|----------|--------|----------|
| Jun 25, 2026 | Taliaferro County Traffic Citation E05960158 | Gmail attachment (MRREL U.D) | `/home/ubuntu/certified_mail_evidence/Taliaferro_County_Traffic_Citation_MICHAEL_RICHARDSON.png` |
| May 6, 2026 | Court Appearance Notice — May 12 Bamberg | Gmail (Lorinda Montgomery) | `/home/ubuntu/gmail-attachments/19dfcfee2023d2c7/` |
| May 26, 2026 | Ryan Few Court Transcript (Franklin County OH) | Gmail (Royce Few) | `/home/ubuntu/gmail-attachments/19f042201326db99/FEW 5-26-26 COPY.pdf` |
| Jun 27, 2026 | Jurisdiction and Venue PDF | Gmail (MRREL U.D) | Attachment: I. JURISDICTION AND VENUE.pdf |
| Jun 27, 2026 | BSC Memorandum in Support | Gmail (MRREL U.D 2) | Attachment: MEMORANDUM IN SUPPORT.pdf |
| May 19, 2026 | Complete Filing Package Bamberg County | Gmail (self) | Attachment: COMPLETE_FILING_PACKAGE__BAMBERG_COUNTY.docx |

---

## Related Cases (Ryan Few — Ohio)

Ryan Few's case in Franklin County, Ohio (*State of Ohio v. Ryan J. Few*) is a parallel matter handled by Royce Few and the same procurement agency network. The May 26, 2026 transcript is critical strategic intelligence: Judge Lynch explicitly rejected all UCC/sovereignty arguments and nearly denied pro se status. This is the clearest available warning about what NOT to file in Michael's cases.

---

## Reference Files

- `references/sc_caption_template.md` — South Carolina General Sessions court caption format
- `references/ga_caption_template.md` — Georgia Probate/Superior Court caption format
- `references/case_law_index.md` — Key cases and statutes for both matters
- `references/evidence_checklist.md` — Evidence gathering and cataloging checklist
