import json
import sys
from scholarly import scholarly, ProxyGenerator

# Initialize free proxies to prevent Google from blocking GitHub Actions IPs
pg = ProxyGenerator()
success = pg.FreeProxies()
if success:
    scholarly.use_proxy(pg)

SCHOLAR_ID = "uMwPCy0AAAAJ&hl" # Replace with your Scholar ID

try:
    print(f"Fetching metrics for Scholar ID: {SCHOLAR_ID}")
    author = scholarly.search_author_id(SCHOLAR_ID)
    filled_author = scholarly.fill(author, sections=["indices"])

    metrics_data = {
        "citations": filled_author.get("citedby", 0),
        "h_index": filled_author.get("hindex", 0),
        "i10_index": filled_author.get("i10index", 0),
    }

    print(f"Successfully retrieved data: {metrics_data}")

    with open("metrics.json", "w") as f:
        json.dump(metrics_data, f, indent=2)

except Exception as e:
    print(f"Error executing scholarly script: {e}")
    # Force the workflow step to fail so GitHub sends you an email alert on failure
    sys.exit(1)