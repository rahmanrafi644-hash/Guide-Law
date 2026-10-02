import sys
sys.stdout.reconfigure(encoding='utf-8')
import urllib.request
import re

url = "https://bdlaws.minlaw.gov.bd/act-150/section-5092.html"
req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
raw = urllib.request.urlopen(req, timeout=10).read()
text = raw.decode('utf-16', errors='ignore')

# Extract section heading and body
title_match = re.search(r'<title>(.*?)</title>', text)
print("Title:", title_match.group(1) if title_match else "None")

# Find the section content div
# bdlaws typically has section title and text
clean_text = re.sub(r'<script.*?</script>', '', text, flags=re.DOTALL)
clean_text = re.sub(r'<style.*?</style>', '', clean_text, flags=re.DOTALL)
clean_text = re.sub(r'<[^>]+>', ' ', clean_text)
clean_text = re.sub(r'\s+', ' ', clean_text).strip()

print("Snippet:", clean_text[200:800])
