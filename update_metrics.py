import json
import requests

ORCID_ID = "0000-0002-4552-5025"
url = f"https://api.openalex.org/authors/https://orcid.org/{ORCID_ID}"

headers = {
    'User-Agent': 'mailto:vishwajeet.verma@tcd.ie'  # OpenAlex polite pool requirement
}

try:
    response = requests.get(url, headers=headers, timeout=10)
    response.raise_for_status()
    data = response.json()

    # Extract metrics from OpenAlex payload
    metrics_data = {
        "citations": data.get("cited_by_count", 0),
        "h_index": data.get("summary_stats", {}).get("h_index", 0),
        "i10_index": data.get("summary_stats", {}).get("i10_index", 0)
    }

    with open("metrics.json", "w") as f:
        json.dump(metrics_data, f, indent=2)

    print("Successfully generated metrics.json via OpenAlex:", metrics_data)

except Exception as e:
    print(f"Error fetching metrics from OpenAlex: {e}")
    raise e