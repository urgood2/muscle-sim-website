#!/bin/bash
# sync-kanban-to-roadmap.sh
# Syncs Obsidian Kanban to Hugo data/roadmap.json for the demo page
#
# Kanban columns mapping:
#   "In Progress" → "CURRENT FOCUS"
#   "TODO"        → "COMING NEXT"
#   "Done"        → "DONE"
#   (Waiting On, Abandoned are excluded from public roadmap)

set -euo pipefail

# ═══════════════════════════════════════════════════════════════════════════════
# Configuration
# ═══════════════════════════════════════════════════════════════════════════════

KANBAN_FILE="/Users/joshuashin/Documents/Bramses-opinionated/Surviorslike Kanban.md"
ROADMAP_JSON="/Users/joshuashin/conductor/repos/muscle-sim-website/data/roadmap.json"
SYNC_STATE_DIR="$HOME/.kanban-sync"
HASH_FILE="$SYNC_STATE_DIR/last-roadmap-kanban-hash"
LOG_FILE="$SYNC_STATE_DIR/roadmap-sync.log"

mkdir -p "$SYNC_STATE_DIR"
mkdir -p "$(dirname "$ROADMAP_JSON")"

log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $*" | tee -a "$LOG_FILE"
}

notify() {
    if command -v terminal-notifier &> /dev/null; then
        terminal-notifier -title "Roadmap Sync" -message "$1" -sound default
    fi
}

# ═══════════════════════════════════════════════════════════════════════════════
# Parse Kanban and Extract Tasks (using jq for proper JSON)
# ═══════════════════════════════════════════════════════════════════════════════

parse_kanban() {
    local kanban_file="$1"

    # Read file and process with awk to extract sections
    local content
    content=$(awk '
        BEGIN { in_front=0; in_settings=0 }
        /^---$/ && !in_front { in_front=1; next }
        /^---$/ && in_front { in_front=0; next }
        in_front { next }
        /^%% kanban:settings/ { in_settings=1; next }
        in_settings { next }
        { print }
    ' "$kanban_file")

    # Extract tasks for each section
    local todo_tasks=""
    local inprogress_tasks=""
    local done_tasks=""
    local current_section=""

    while IFS= read -r line; do
        # Detect section headers
        if [[ "$line" =~ ^##[[:space:]]+(.*) ]]; then
            current_section="${BASH_REMATCH[1]}"
            continue
        fi

        # Parse task items
        if [[ "$line" =~ ^-[[:space:]]\[[[:space:]x]\][[:space:]]+(.*) ]]; then
            local task="${BASH_REMATCH[1]}"

            # Clean up for public display - remove file paths
            task=$(echo "$task" | sed 's|/Users/[^ ]*||g' | sed 's/^[[:space:]]*//;s/[[:space:]]*$//')

            # Skip empty tasks
            [[ -z "$task" ]] && continue

            case "$current_section" in
                "TODO")
                    todo_tasks+="$task"$'\n'
                    ;;
                "In Progress")
                    inprogress_tasks+="$task"$'\n'
                    ;;
                "Done")
                    done_tasks+="$task"$'\n'
                    ;;
            esac
        fi
    done <<< "$content"

    # Use jq to build proper JSON
    local timestamp
    timestamp=$(date -u +"%Y-%m-%dT%H:%M:%SZ")

    # Convert newline-separated strings to JSON arrays
    local inprogress_json todo_json done_json

    if [[ -n "$inprogress_tasks" ]]; then
        inprogress_json=$(echo -n "$inprogress_tasks" | grep -v '^$' | jq -R -s 'split("\n") | map(select(length > 0))')
    else
        inprogress_json="[]"
    fi

    if [[ -n "$todo_tasks" ]]; then
        todo_json=$(echo -n "$todo_tasks" | grep -v '^$' | jq -R -s 'split("\n") | map(select(length > 0))')
    else
        todo_json="[]"
    fi

    if [[ -n "$done_tasks" ]]; then
        done_json=$(echo -n "$done_tasks" | grep -v '^$' | jq -R -s 'split("\n") | map(select(length > 0))')
    else
        done_json="[]"
    fi

    # Build final JSON with jq
    jq -n \
        --arg ts "$timestamp" \
        --arg src "Surviorslike Kanban.md" \
        --argjson current "$inprogress_json" \
        --argjson todo "$todo_json" \
        --argjson done "$done_json" \
        '{
            lastSynced: $ts,
            source: $src,
            columns: {
                current: {
                    title: "CURRENT FOCUS",
                    items: $current
                },
                todo: {
                    title: "COMING NEXT",
                    items: $todo
                },
                done: {
                    title: "DONE",
                    items: $done
                }
            }
        }'
}

# ═══════════════════════════════════════════════════════════════════════════════
# Check if Kanban Changed
# ═══════════════════════════════════════════════════════════════════════════════

check_kanban_changed() {
    local current_hash
    current_hash=$(cat "$KANBAN_FILE" 2>/dev/null | shasum -a 256 | cut -d' ' -f1)

    if [[ -f "$HASH_FILE" ]]; then
        local stored_hash
        stored_hash=$(cat "$HASH_FILE")
        [[ "$stored_hash" == "$current_hash" ]] && return 1
    fi

    echo "$current_hash" > "$HASH_FILE"
    return 0
}

# ═══════════════════════════════════════════════════════════════════════════════
# Main
# ═══════════════════════════════════════════════════════════════════════════════

main() {
    local force_sync=false
    [[ "${1:-}" == "--force" ]] && force_sync=true

    # Check jq is available
    if ! command -v jq &> /dev/null; then
        log "ERROR: jq not installed. Run: brew install jq"
        exit 1
    fi

    if [[ ! -f "$KANBAN_FILE" ]]; then
        log "ERROR: Kanban file not found: $KANBAN_FILE"
        exit 1
    fi

    if ! $force_sync && ! check_kanban_changed; then
        log "Kanban unchanged, skipping roadmap sync"
        exit 0
    fi

    log "Syncing Kanban to roadmap.json..."

    local json_output
    json_output=$(parse_kanban "$KANBAN_FILE")

    echo "$json_output" > "$ROADMAP_JSON"

    log "Roadmap synced successfully to: $ROADMAP_JSON"
    notify "Roadmap synced to website"

    # Print task counts
    local current_count todo_count done_count
    current_count=$(echo "$json_output" | jq '.columns.current.items | length')
    todo_count=$(echo "$json_output" | jq '.columns.todo.items | length')
    done_count=$(echo "$json_output" | jq '.columns.done.items | length')
    log "Summary: Current=$current_count, Coming=$todo_count, Done=$done_count"
}

main "$@"
