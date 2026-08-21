import json
import urllib.request

# OpenAlex uses ORCID or author names, or you can query directly by your ORCID ID
ORCID_ID = "0000-0002-4552-5025"  # e.g., "0000-0002-1825-0097"
url = f"https://api.openalex.org/authors/https://orcid.org/{ORCID_ID}"

req = urllib.request.Request(
    url, 
    headers={'User-Agent': 'mailto:yourname@domain.com'} # OpenAlex requests an email for polite API usage
)

try:
    with urllib.request.urlopen(req) as response:
        data = json.loads(response.read().decode())
        
        metrics_data = {
            "citations": data.get("cited_by_count", 0),
            "h_index": data.get("summary_stats", {}).get("h_index", 0),
            "i10_index": data.get("summary_stats", {}).get("i10_index", 0)
        }

        with open("metrics.json", "w") as f:
            json.dump(metrics_data, f, indent=2)

        print("Successfully generated metrics via OpenAlex:", metrics_data)

except Exception as e:
    print(f"Error fetching from OpenAlex: {e}")
    raise e