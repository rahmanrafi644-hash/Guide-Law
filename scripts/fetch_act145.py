import urllib.request
import re

url = "https://bdlaws.minlaw.gov.bd/act-145.html"
req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
raw = urllib.request.urlopen(req).read()
text = raw.decode('utf-16')

with open('scripts/act145_clean.html', 'w', encoding='utf-8') as f:
    f.write(text)

print("Title:", re.findall(r'<title>(.*?)</title>', text))
section_links = re.findall(r'href="([^"]*act-145/section-[^"]*)"', text)
print(f"Total section links found: {len(section_links)}")
for link in section_links[:5]:
    print("  ", link)
