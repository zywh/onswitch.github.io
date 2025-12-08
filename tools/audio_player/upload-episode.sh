#!/bin/bash
# =====================================================
# Upload Episode to Cloudflare R2
# Uploads an audio file and updates the manifest.json
# =====================================================

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# =====================================================
# Configuration - Set these or use environment variables
# =====================================================
# Load from .env file if it exists
if [ -f ".env" ]; then
  export $(grep -v '^#' .env | xargs)
fi

R2_ACCOUNT_ID="${R2_ACCOUNT_ID:-}"
R2_ACCESS_KEY_ID="${R2_ACCESS_KEY_ID:-}"
R2_SECRET_ACCESS_KEY="${R2_SECRET_ACCESS_KEY:-}"
R2_BUCKET_NAME="${R2_BUCKET_NAME:-youtube-audio}"
R2_PUBLIC_URL="${R2_PUBLIC_URL:-}"
R2_ENDPOINT="${R2_ENDPOINT:-https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com}"

# =====================================================
# Parse Arguments
# =====================================================
AUDIO_FILE=""
TITLE=""
DESCRIPTION=""
DATE=""
DURATION=""
THUMBNAIL=""
EPISODE_ID=""

print_usage() {
  echo "Usage: $0 [options]"
  echo ""
  echo "Required:"
  echo "  --audio FILE       Path to the audio file (mp3)"
  echo "  --title TITLE      Episode title (Chinese)"
  echo ""
  echo "Optional:"
  echo "  --description DESC Episode description"
  echo "  --date DATE        Publication date (YYYY-MM-DD, default: today)"
  echo "  --duration DUR     Duration string (e.g., '15:32')"
  echo "  --thumbnail FILE   Path to thumbnail image"
  echo "  --id ID            Custom episode ID (default: auto-generated)"
  echo ""
  echo "Environment variables (or set in .env file):"
  echo "  R2_ACCOUNT_ID      Cloudflare account ID"
  echo "  R2_ACCESS_KEY_ID   R2 API access key"
  echo "  R2_SECRET_ACCESS_KEY R2 API secret key"
  echo "  R2_BUCKET_NAME     R2 bucket name"
  echo "  R2_PUBLIC_URL      Public URL prefix for the bucket"
}

while [[ $# -gt 0 ]]; do
  case $1 in
    --audio)
      AUDIO_FILE="$2"
      shift 2
      ;;
    --title)
      TITLE="$2"
      shift 2
      ;;
    --description)
      DESCRIPTION="$2"
      shift 2
      ;;
    --date)
      DATE="$2"
      shift 2
      ;;
    --duration)
      DURATION="$2"
      shift 2
      ;;
    --thumbnail)
      THUMBNAIL="$2"
      shift 2
      ;;
    --id)
      EPISODE_ID="$2"
      shift 2
      ;;
    --help|-h)
      print_usage
      exit 0
      ;;
    *)
      echo -e "${RED}Unknown option: $1${NC}"
      print_usage
      exit 1
      ;;
  esac
done

# =====================================================
# Validation
# =====================================================
if [ -z "$AUDIO_FILE" ] || [ -z "$TITLE" ]; then
  echo -e "${RED}Error: --audio and --title are required${NC}"
  print_usage
  exit 1
fi

if [ ! -f "$AUDIO_FILE" ]; then
  echo -e "${RED}Error: Audio file not found: $AUDIO_FILE${NC}"
  exit 1
fi

if [ -z "$R2_ACCOUNT_ID" ] || [ -z "$R2_ACCESS_KEY_ID" ] || [ -z "$R2_SECRET_ACCESS_KEY" ]; then
  echo -e "${RED}Error: R2 credentials not set${NC}"
  echo "Set R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, and R2_SECRET_ACCESS_KEY"
  exit 1
fi

if [ -z "$R2_PUBLIC_URL" ]; then
  echo -e "${RED}Error: R2_PUBLIC_URL not set${NC}"
  exit 1
fi

# Default values
DATE="${DATE:-$(date +%Y-%m-%d)}"
EPISODE_ID="${EPISODE_ID:-${DATE}-$(echo "$TITLE" | tr ' ' '-' | tr -cd '[:alnum:]-' | head -c 50)}"

# =====================================================
# Check for required tools
# =====================================================
check_command() {
  if ! command -v "$1" &> /dev/null; then
    echo -e "${RED}Error: $1 is required but not installed${NC}"
    exit 1
  fi
}

check_command aws
check_command jq

# =====================================================
# Configure AWS CLI for R2 (S3 compatible)
# =====================================================
export AWS_ACCESS_KEY_ID="$R2_ACCESS_KEY_ID"
export AWS_SECRET_ACCESS_KEY="$R2_SECRET_ACCESS_KEY"
export AWS_DEFAULT_REGION="auto"

S3_ENDPOINT="--endpoint-url $R2_ENDPOINT"

# =====================================================
# Get audio duration if not provided
# =====================================================
if [ -z "$DURATION" ]; then
  if command -v ffprobe &> /dev/null; then
    DURATION_SECONDS=$(ffprobe -v error -show_entries format=duration -of default=noprint_wrappers=1:nokey=1 "$AUDIO_FILE" 2>/dev/null | cut -d. -f1)
    if [ -n "$DURATION_SECONDS" ]; then
      MINUTES=$((DURATION_SECONDS / 60))
      SECONDS=$((DURATION_SECONDS % 60))
      DURATION=$(printf "%d:%02d" $MINUTES $SECONDS)
      echo -e "${GREEN}Detected duration: $DURATION${NC}"
    fi
  else
    echo -e "${YELLOW}Warning: ffprobe not found, duration not auto-detected${NC}"
  fi
fi

# =====================================================
# Upload Audio File
# =====================================================
AUDIO_EXT="${AUDIO_FILE##*.}"
AUDIO_S3_PATH="episodes/${EPISODE_ID}/audio.${AUDIO_EXT}"
AUDIO_PUBLIC_URL="${R2_PUBLIC_URL}/${AUDIO_S3_PATH}"

echo -e "${YELLOW}Uploading audio file...${NC}"
aws s3 cp "$AUDIO_FILE" "s3://${R2_BUCKET_NAME}/${AUDIO_S3_PATH}" \
  $S3_ENDPOINT \
  --content-type "audio/mpeg" \
  --no-progress

echo -e "${GREEN}Audio uploaded: $AUDIO_PUBLIC_URL${NC}"

# =====================================================
# Upload Thumbnail (if provided)
# =====================================================
THUMB_PUBLIC_URL=""
if [ -n "$THUMBNAIL" ] && [ -f "$THUMBNAIL" ]; then
  THUMB_EXT="${THUMBNAIL##*.}"
  THUMB_S3_PATH="episodes/${EPISODE_ID}/thumb.${THUMB_EXT}"
  THUMB_PUBLIC_URL="${R2_PUBLIC_URL}/${THUMB_S3_PATH}"
  
  echo -e "${YELLOW}Uploading thumbnail...${NC}"
  aws s3 cp "$THUMBNAIL" "s3://${R2_BUCKET_NAME}/${THUMB_S3_PATH}" \
    $S3_ENDPOINT \
    --content-type "image/jpeg" \
    --no-progress
  
  echo -e "${GREEN}Thumbnail uploaded: $THUMB_PUBLIC_URL${NC}"
fi

# =====================================================
# Download and Update Manifest
# =====================================================
MANIFEST_PATH="/tmp/manifest-$$.json"
MANIFEST_S3_PATH="manifest.json"

echo -e "${YELLOW}Downloading current manifest...${NC}"
if aws s3 cp "s3://${R2_BUCKET_NAME}/${MANIFEST_S3_PATH}" "$MANIFEST_PATH" $S3_ENDPOINT --no-progress 2>/dev/null; then
  echo -e "${GREEN}Manifest downloaded${NC}"
else
  echo -e "${YELLOW}No existing manifest, creating new one${NC}"
  echo '{"lastUpdated":"","episodes":[]}' > "$MANIFEST_PATH"
fi

# Create new episode JSON
NEW_EPISODE=$(jq -n \
  --arg id "$EPISODE_ID" \
  --arg title "$TITLE" \
  --arg description "$DESCRIPTION" \
  --arg date "$DATE" \
  --arg duration "$DURATION" \
  --arg audioUrl "$AUDIO_PUBLIC_URL" \
  --arg thumbnail "$THUMB_PUBLIC_URL" \
  '{
    id: $id,
    title: $title,
    description: (if $description == "" then null else $description end),
    date: $date,
    duration: (if $duration == "" then null else $duration end),
    audioUrl: $audioUrl,
    thumbnail: (if $thumbnail == "" then null else $thumbnail end)
  }')

# Update manifest - add to beginning of episodes array
UPDATED_MANIFEST=$(jq \
  --argjson newEpisode "$NEW_EPISODE" \
  --arg lastUpdated "$(date -u +%Y-%m-%dT%H:%M:%SZ)" \
  '.lastUpdated = $lastUpdated | .episodes = [$newEpisode] + [.episodes[] | select(.id != $newEpisode.id)]' \
  "$MANIFEST_PATH")

echo "$UPDATED_MANIFEST" > "$MANIFEST_PATH"

# =====================================================
# Upload Updated Manifest
# =====================================================
echo -e "${YELLOW}Uploading updated manifest...${NC}"
aws s3 cp "$MANIFEST_PATH" "s3://${R2_BUCKET_NAME}/${MANIFEST_S3_PATH}" \
  $S3_ENDPOINT \
  --content-type "application/json" \
  --cache-control "max-age=60" \
  --no-progress

# Cleanup
rm -f "$MANIFEST_PATH"

echo ""
echo -e "${GREEN}✅ Upload complete!${NC}"
echo ""
echo "Episode Details:"
echo "  ID:          $EPISODE_ID"
echo "  Title:       $TITLE"
echo "  Date:        $DATE"
echo "  Duration:    ${DURATION:-'(not set)'}"
echo "  Audio URL:   $AUDIO_PUBLIC_URL"
[ -n "$THUMB_PUBLIC_URL" ] && echo "  Thumbnail:   $THUMB_PUBLIC_URL"
echo ""
echo -e "${GREEN}Manifest updated at: ${R2_PUBLIC_URL}/manifest.json${NC}"
