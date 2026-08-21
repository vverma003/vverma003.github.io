import json
from scholarly import scholarly

SCHOLAR_ID = "uMwPCy0AAAAJ&hl=en" # Replace with your Scholar ID

try:
    author = scholarly.search_author_id(SCHOLAR_ID)
    filled_author = scholarly.fill(author, sections=["indices"])

    metrics_data = {
        "citations": filled_author.get("citedby", 0),
        "h_index": filled_author.get("hindex", 0),
        "i10_index": filled_author.get("i10index", 0),
    }

    with open("metrics.json", "w") as f:
        json.dump(metrics_data, f, indent=2)

    print("Successfully generated metrics.json:", metrics_data)

except Exception as e:
    print(f"Error fetching Scholar metrics: {e}")