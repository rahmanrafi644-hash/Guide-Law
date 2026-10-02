import urllib.request
import re

req = urllib.request.Request('https://bdlaws.minlaw.gov.bd/act-141.html', headers={'User-Agent': 'Mozilla/5.0'})
content = urllib.request.urlopen(req).read().decode('utf-8', errors='ignore')
with open('scripts/act141.html', 'w', encoding='utf-8') as f:
    f.write(content)

print(f"act141.html written, length: {len(content)}")

# Look for titles and sections
sections = re.findall(r'<div[^>]*class="[^"]*law-details[^"]*"[^>]*>(.*?)</div>', content, re.DOTALL)
print("law-details count:", len(sections))

# Find lines with section headings or links
links = re.findall(r'<a[^>]+href="([^"]+)"[^>]*>(.*?)</a>', content)
print(f"Total links: {len(links)}")
for href, text in links[:15]:
    print(f"  {href} -> {text.strip()[:60]}")
