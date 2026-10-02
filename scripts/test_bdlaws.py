import urllib.request
import urllib.parse
import re

url = "https://bdlaws.minlaw.gov.bd/act-141.html"
headers = {'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'}
req = urllib.request.Request(url, headers=headers)

try:
    with urllib.request.urlopen(req, timeout=10) as response:
        html = response.read().decode('utf-8', errors='ignore')
        print(f"Fetched successfully, length: {len(html)}")
        # Check for section links
        links = re.findall(r'href="([^"]*act-141/section-[^"]*)"', html)
        print(f"Found {len(links)} section links, sample:", links[:5])
        if not links:
            # Let's see other links or content
            links = re.findall(r'href="([^"]*section-[^"]*)"', html)
            print(f"Other section links: {len(links)}", links[:5])
except Exception as e:
    print(f"Error fetching bdlaws: {e}")
