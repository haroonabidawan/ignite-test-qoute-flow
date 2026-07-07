#!/bin/sh
set -e

IMPORT_MARKER="/home/node/.n8n/.quoteflow-imported"
WORKFLOW_ID="b2c3d4e5-f6a7-8901-bcde-f12345678901"

if [ ! -f "$IMPORT_MARKER" ]; then
  echo "Importing QuoteFlow n8n credentials..."
  n8n import:credentials --input=/import/credentials.json || true
  touch "$IMPORT_MARKER"
fi

echo "Importing QuoteFlow n8n workflow..."
n8n import:workflow --input=/import/quotation-approved.json
n8n publish:workflow --id="$WORKFLOW_ID"
echo "QuoteFlow n8n workflow published."

exec n8n start
