import json
from scholarly import scholarly

# 1. Fetch author details using your Google Scholar ID
SCHOLAR_ID = "uMwPCy0AAAAJ&hl"  # Replace with your 12-character ID
author = scholarly.search_author_id(SCHOLAR_ID)
filled_author = scholarly.fill(author, sections=["indices"])

# 2. Extract key metrics
metrics_data = {
    "citations": filled_author.get("citedby", 0),
    "h_index": filled_author.get("hindex", 0),
    "i10_index": filled_author.get("i10index", 0),
}

# 3. Save to a JSON file inside your static site assets directory
with open("metrics.json", "w") as f:
    json.dump(metrics_data, f, indent=2)

print("Successfully updated metrics:", metrics_data)