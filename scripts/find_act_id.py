import urllib.request
import re

for act_id in range(145, 165):
    url = f"https://bdlaws.minlaw.gov.bd/act-{act_id}.html"
    try:
        req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
        raw = urllib.request.urlopen(req, timeout=3).read()
        text = raw.decode('utf-16', errors='ignore')
        title = re.findall(r'<title>(.*?)</title>', text)
        title_str = title[0] if title else "No title"
        print(f"act-{act_id}: {title_str.strip()}")
        if "Sale of Goods" in title_str:
            print(f"FOUND SALE OF GOODS: act-{act_id}")
            break
    except Exception as e:
        print(f"act-{act_id}: {e}")
