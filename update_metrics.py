import json
import sys
from pathlib import Path
from datetime import datetime, timezone
from scholarly import scholarly, ProxyGenerator

# ---- CONFIGURATION ----
AUTHOR_ID = "uMwPCy0AAAAJ"

OUTPUT_PATH = Path("metrics.json")
# ------------------------


def setup_proxy():
    """Setup free proxies to prevent Google Scholar IP blocks on GitHub Actions."""
    try:
        pg = ProxyGenerator()
        # Free proxies helps bypass basic IP blocking
        success = pg.FreeProxies()
        if success:
            scholarly.use_proxy(pg)
            print("Successfully configured free proxies.")
    except Exception as e:
        print(f"Warning: Could not set up proxy: {e}")


def fetch_scholar_metrics(author_id: str):
    setup_proxy()

    print(f"Fetching metrics for author ID: {author_id}...")
    author = scholarly.search_author_id(author_id)
    author = scholarly.fill(author, sections=['basics', 'indices'])

    metrics = {
        "citations": author.get("citedby", 0),
        "h_index": author.get("hindex", 0),
        "i10_index": author.get("i10index", 0),
    }
    return metrics


def main():
    try:
        metrics = fetch_scholar_metrics(AUTHOR_ID)
    except Exception as e:
        print(f"Error fetching Scholar metrics: {e}", file=sys.stderr)
        # Exit with non-zero code to fail the workflow explicitly if desired,
        # or handle gracefully to prevent breaking website builds.
        sys.exit(1)

    # Add updatedAt field in ISO format (UTC)
    metrics["updatedAt"] = datetime.now(timezone.utc).strftime("%Y-%m-%d")

    # Ensure parent directory exists
    OUTPUT_PATH.parent.mkdir(parents=True, exist_ok=True)

    with OUTPUT_PATH.open("w", encoding="utf-8") as f:
        json.dump(metrics, f, ensure_ascii=False, indent=2)

    print(f"Successfully wrote metrics to {OUTPUT_PATH.resolve()}:")
    print(json.dumps(metrics, indent=2))


if __name__ == "__main__":
    main()