import json
import sys
from scholarly import scholarly, ProxyGenerator

# Initialize free proxies to bypass Google IP blocks
pg = ProxyGenerator()
success = pg.FreeProxies()
if success:
    scholarly.use_proxy(pg)

SCHOLAR_ID = "uMwPCy0AAAAJ&hl" # Replace with your Scholar ID

try:
    print(f"Searching for Scholar ID: {SCHOLAR_ID}")
    author = scholarly.search_author_id(SCHOLAR_ID)
    filled_author = scholarly.fill(author, sections=["indices"])

    metrics_data = {
        "citations": filled_author.get("citedby", 0),
        "h_index": filled_author.get("hindex", 0),
        "i10_index": filled_author.get("i10index", 0),
    }

    # Verify we actually got valid numbers
    if metrics_data["citations"] == 0 and metrics_data["h_index"] == 0:
        print("Warning: Fetched 0 for all metrics. Google might be rate-limiting.")

    with open("metrics.json", "w") as f:
        json.dump(metrics_data, f, indent=2)

    print("Updated metrics.json successfully:", metrics_data)

except Exception as e:
    print(f"Error fetching Google Scholar data: {e}")
    sys.exit(1) # Fail job so GitHub Actions alerts you