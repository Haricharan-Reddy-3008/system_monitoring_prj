import urllib.request
import json

try:
    req = urllib.request.Request("http://localhost:8000/api/metrics/4b1fdef7-fccf-44dd-ab87-cfc395d95f3f")
    with urllib.request.urlopen(req) as response:
        result = json.loads(response.read().decode())
        print("Metrics found:", result["count"])
except Exception as e:
    print(e)
