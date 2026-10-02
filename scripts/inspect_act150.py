import urllib.request
import re

url = "https://bdlaws.minlaw.gov.bd/act-150.html"
req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
raw = urllib.request.urlopen(req, timeout=10).read()
text = raw.decode('utf-16', errors='ignore')

with open('scripts/sale_of_goods_index.html', 'w', encoding='utf-8') as f:
    f.write(text)

section_links = re.findall(r'href="([^"]*act-150/section-[^"]*)"', text)
print(f"Total section links in act-150: {len(section_links)}")
for l in section_links[:10]:
    print(" ", l)
