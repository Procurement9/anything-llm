#!/bin/bash
# generate_filing_package.sh
# Converts all Richardson defense markdown documents to PDF and packages them
# Usage: bash generate_filing_package.sh [output_dir]

OUTPUT_DIR="${1:-/home/ubuntu}"
DATE=$(date +%Y%m%d)
PACKAGE_NAME="Richardson_Defense_${DATE}.zip"

echo "=== Richardson Defense Filing Package Generator ==="
echo "Output directory: $OUTPUT_DIR"
echo ""

# Convert all markdown files to PDF
DOCS=(
    "Motion_to_Quash_Warrant_Richardson"
    "Motion_to_Suppress_Richardson"
    "Motion_to_Dismiss_Richardson"
    "Notice_of_Intent_to_Sue_Richardson"
    "Strategic_Legal_Memo_Richardson"
    "Affidavit_of_Truth_Richardson"
    "Court_Filing_Guide_Richardson"
)

PDF_FILES=()
for doc in "${DOCS[@]}"; do
    MD_FILE="$OUTPUT_DIR/${doc}.md"
    PDF_FILE="$OUTPUT_DIR/${doc}.pdf"
    if [ -f "$MD_FILE" ]; then
        echo "Converting: $doc.md -> $doc.pdf"
        manus-md-to-pdf "$MD_FILE" "$PDF_FILE"
        if [ -f "$PDF_FILE" ]; then
            PDF_FILES+=("$PDF_FILE")
            echo "  ✓ Created: $doc.pdf"
        else
            echo "  ✗ Failed: $doc.pdf"
        fi
    else
        echo "  - Skipping: $doc.md (not found)"
    fi
done

echo ""
echo "=== Creating ZIP package ==="
cd "$OUTPUT_DIR"
zip -j "$PACKAGE_NAME" "${PDF_FILES[@]}" 2>/dev/null
if [ -f "$PACKAGE_NAME" ]; then
    echo "✓ Package created: $OUTPUT_DIR/$PACKAGE_NAME"
    echo "  Files included: ${#PDF_FILES[@]}"
else
    echo "✗ Failed to create package"
fi

echo ""
echo "=== Done ==="
