import sys
sys.stdout.reconfigure(encoding='utf-8')
import urllib.request
import re
import json
import time

url_index = "https://bdlaws.minlaw.gov.bd/act-150.html"
req = urllib.request.Request(url_index, headers={'User-Agent': 'Mozilla/5.0'})
raw = urllib.request.urlopen(req, timeout=15).read()
html_index = raw.decode('utf-16', errors='ignore')

section_links = re.findall(r'href="([^"]*act-150/section-[^"]*)"', html_index)
print(f"Found {len(section_links)} section links.")

sections_data = []

for idx, link in enumerate(section_links):
    full_url = "https://bdlaws.minlaw.gov.bd" + link if link.startswith("/") else link
    try:
        req = urllib.request.Request(full_url, headers={'User-Agent': 'Mozilla/5.0'})
        s_raw = urllib.request.urlopen(req, timeout=10).read()
        s_text = s_raw.decode('utf-16', errors='ignore')
        
        # Extract title from <title> tag
        title_match = re.search(r'<title>(.*?)</title>', s_raw.decode('utf-16', errors='ignore'))
        page_title = title_match.group(1).strip() if title_match else ""
        
        # Look for section number and title in page_title e.g. "The Sale of Goods Act, 1930 | 16. Implied conditions as to quality or fitness"
        sec_num = ""
        sec_title = ""
        if "|" in page_title:
            parts = page_title.split("|", 1)[1].strip()
            # e.g. "16. Implied conditions as to quality or fitness" or "16A. Seller to inform..."
            m = re.match(r'^(\d+[A-Z]?)\.\s*(.*)', parts)
            if m:
                sec_num = m.group(1)
                sec_title = m.group(2).strip()
            else:
                sec_title = parts
        
        # Clean text
        clean = re.sub(r'<script.*?</script>', '', s_text, flags=re.DOTALL)
        clean = re.sub(r'<style.*?</style>', '', clean, flags=re.DOTALL)
        
        # Try to find the specific content block
        # Look for the section text
        # bdlaws usually places the section text after "Act, 1930" or chapter name
        clean_text = re.sub(r'<[^>]+>', ' ', clean)
        clean_text = re.sub(r'\s+', ' ', clean_text).strip()
        
        # Find chapter if present in the text
        chapter_match = re.search(r'(Chapter\s+[IVXLCDM]+\s+[A-Z\s,]+)', clean_text)
        chapter = chapter_match.group(1).strip() if chapter_match else "General"
        
        # Extract the core section text: find where section starts e.g. "16. (1)" or "16."
        sec_text = ""
        if sec_num:
            pos = clean_text.find(f"{sec_num}. ")
            if pos != -1:
                # Find end of section text before footer like "Footnote" or "Laws of Bangladesh" or "Copyright"
                tail = clean_text[pos:]
                end_markers = ["Next Section", "Previous Section", "Back to Index", "Laws of Bangladesh", "Website Help"]
                end_pos = len(tail)
                for em in end_markers:
                    p = tail.find(em)
                    if p != -1 and p < end_pos and p > 20:
                        end_pos = p
                sec_text = tail[:end_pos].strip()
            else:
                sec_text = clean_text
        else:
            sec_text = clean_text
            
        sections_data.append({
            "actId": "sale_of_goods_1930",
            "actName": "The Sale of Goods Act, 1930",
            "chapter": chapter,
            "sectionNumber": sec_num,
            "sectionTitle": sec_title,
            "text": sec_text,
            "sourcePdf": "sale of goods act 1930.pdf",
            "sourceUrl": full_url
        })
        if idx % 10 == 0 or idx == len(section_links) - 1:
            print(f"Processed {idx+1}/{len(section_links)}: Section {sec_num} - {sec_title}")
    except Exception as e:
        print(f"Error fetching {full_url}: {e}")
    time.sleep(0.05)

with open("scripts/sale_of_goods_extracted.json", "w", encoding="utf-8") as f:
    json.dump(sections_data, f, indent=2, ensure_ascii=False)

print(f"Saved {len(sections_data)} sections of Sale of Goods Act to scripts/sale_of_goods_extracted.json")
