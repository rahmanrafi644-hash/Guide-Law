import sys
sys.stdout.reconfigure(encoding='utf-8')
import os
import json
import re
from pypdf import PdfReader

pdf_dir = "Law pdf"

def parse_contract_act():
    path = os.path.join(pdf_dir, "THE INDIAN CONTRACT ACT, 1872 .pdf")
    reader = PdfReader(path)
    # Pages 10 to 53 (0-indexed 9 to 52)
    pages_text = []
    for idx in range(9, len(reader.pages)):
        text = reader.pages[idx].extract_text()
        pages_text.append({"page": idx + 1, "text": text})

    full_corpus = "\n\n".join([f"---PAGE_{p['page']}---\n{p['text']}" for p in pages_text])
    
    # We find sections: e.g. "1. Short title", "10. What agreements are contracts", "73. Compensation for loss or damage..."
    # Regex matching section number and title
    pattern = r'\n(?P<sec_num>\d+[A-Z]?)\.\s*(?P<title>[A-Za-z][^\n.—–]+?)[.—–-]'
    
    matches = list(re.finditer(pattern, full_corpus))
    sections = []
    
    for i, m in enumerate(matches):
        sec_num = m.group('sec_num')
        title = m.group('title').strip()
        start = m.start()
        end = matches[i+1].start() if i + 1 < len(matches) else len(full_corpus)
        sec_chunk = full_corpus[start:end]
        
        # Find page number
        page_match = re.search(r'---PAGE_(\d+)---', full_corpus[:start])
        pages_in_sec = re.findall(r'---PAGE_(\d+)---', sec_chunk)
        page_start = page_match.group(1) if page_match else "10"
        page_str = f"Page {page_start}" if not pages_in_sec else f"Pages {page_start}-{pages_in_sec[-1]}" if page_start != pages_in_sec[-1] else f"Page {page_start}"
        
        # Clean out page markers from text
        clean_text = re.sub(r'---PAGE_\d+---\n?', '', sec_chunk).strip()
        
        # Find chapter
        chap_matches = list(re.finditer(r'(CHAPTER\s+[IVXLCDM]+[^\n]*\n[^\n]*)', full_corpus[:start]))
        chapter = chap_matches[-1].group(1).replace('\n', ' ').strip() if chap_matches else "Preliminary"
        
        sections.append({
            "actId": "contract_1872",
            "actName": "The Contract Act, 1872",
            "chapter": chapter,
            "sectionNumber": sec_num,
            "sectionTitle": title,
            "text": clean_text,
            "sourcePdf": "THE INDIAN CONTRACT ACT, 1872 .pdf",
            "sourcePageRange": page_str
        })
    print(f"Contract Act parsed: {len(sections)} sections")
    return sections

def parse_ni_act():
    path = os.path.join(pdf_dir, "negotiable_instruments_act,_1881.pdf")
    reader = PdfReader(path)
    # Pages 8 to 32 (0-indexed 7 to 31)
    pages_text = []
    for idx in range(7, len(reader.pages)):
        text = reader.pages[idx].extract_text()
        pages_text.append({"page": idx + 1, "text": text})

    full_corpus = "\n\n".join([f"---PAGE_{p['page']}---\n{p['text']}" for p in pages_text])
    pattern = r'\n(?P<sec_num>\d+[A-Z]?)\.\s*(?P<title>[A-Za-z][^\n.—–]+?)[.—–-]'
    
    matches = list(re.finditer(pattern, full_corpus))
    sections = []
    
    for i, m in enumerate(matches):
        sec_num = m.group('sec_num')
        title = m.group('title').strip()
        start = m.start()
        end = matches[i+1].start() if i + 1 < len(matches) else len(full_corpus)
        sec_chunk = full_corpus[start:end]
        
        page_match = re.search(r'---PAGE_(\d+)---', full_corpus[:start])
        pages_in_sec = re.findall(r'---PAGE_(\d+)---', sec_chunk)
        page_start = page_match.group(1) if page_match else "8"
        page_str = f"Page {page_start}" if not pages_in_sec else f"Pages {page_start}-{pages_in_sec[-1]}" if page_start != pages_in_sec[-1] else f"Page {page_start}"
        
        clean_text = re.sub(r'---PAGE_\d+---\n?', '', sec_chunk).strip()
        
        chap_matches = list(re.finditer(r'(CHAPTER\s+[IVXLCDM]+[^\n]*\n[^\n]*)', full_corpus[:start]))
        chapter = chap_matches[-1].group(1).replace('\n', ' ').strip() if chap_matches else "Preliminary"
        
        sections.append({
            "actId": "ni_1881",
            "actName": "The Negotiable Instruments Act, 1881",
            "chapter": chapter,
            "sectionNumber": sec_num,
            "sectionTitle": title,
            "text": clean_text,
            "sourcePdf": "negotiable_instruments_act,_1881.pdf",
            "sourcePageRange": page_str
        })
    print(f"NI Act parsed: {len(sections)} sections")
    return sections

def parse_partnership_act():
    path = os.path.join(pdf_dir, "The-Partnership-Act,-1932.pdf")
    reader = PdfReader(path)
    # Pages 6 to 30 (0-indexed 5 to 29)
    pages_text = []
    for idx in range(5, len(reader.pages)):
        text = reader.pages[idx].extract_text()
        pages_text.append({"page": idx + 1, "text": text})

    full_corpus = "\n\n".join([f"---PAGE_{p['page']}---\n{p['text']}" for p in pages_text])
    
    pattern = r'\n(?P<sec_num>\d+[A-Z]?)\.\s*(?:\([0-9]+\)\s*)?(?P<rest>[^\n]+)'
    
    matches = list(re.finditer(pattern, full_corpus))
    sections = []
    
    sec_titles = {}
    for idx in range(0, 5):
        t = reader.pages[idx].extract_text()
        for sm in re.finditer(r'(\d+[A-Z]?)\.\s+([^\n\d]+)', t):
            s_n = sm.group(1).strip()
            s_t = sm.group(2).strip()
            if s_n not in sec_titles and len(s_t) > 2:
                sec_titles[s_n] = s_t
                
    for i, m in enumerate(matches):
        sec_num = m.group('sec_num')
        try:
            val = int(re.sub(r'\D', '', sec_num))
            if val < 1 or val > 74:
                continue
        except:
            continue
            
        start = m.start()
        end = matches[i+1].start() if i + 1 < len(matches) else len(full_corpus)
        sec_chunk = full_corpus[start:end]
        
        page_match = re.search(r'---PAGE_(\d+)---', full_corpus[:start])
        pages_in_sec = re.findall(r'---PAGE_(\d+)---', sec_chunk)
        page_start = page_match.group(1) if page_match else "6"
        page_str = f"Page {page_start}" if not pages_in_sec else f"Pages {page_start}-{pages_in_sec[-1]}" if page_start != pages_in_sec[-1] else f"Page {page_start}"
        
        clean_text = re.sub(r'---PAGE_\d+---\n?', '', sec_chunk).strip()
        title = sec_titles.get(sec_num, f"Section {sec_num}")
        
        chap_matches = list(re.finditer(r'(CHAPTER\s+[IVXLCDM]+[^\n]*\n[^\n]*)', full_corpus[:start]))
        chapter = chap_matches[-1].group(1).replace('\n', ' ').strip() if chap_matches else "General"
        
        sections.append({
            "actId": "partnership_1932",
            "actName": "The Partnership Act, 1932",
            "chapter": chapter,
            "sectionNumber": sec_num,
            "sectionTitle": title,
            "text": clean_text,
            "sourcePdf": "The-Partnership-Act,-1932.pdf",
            "sourcePageRange": page_str
        })
    print(f"Partnership Act parsed: {len(sections)} sections")
    return sections

def parse_companies_act():
    path = os.path.join(pdf_dir, "company act 1994.pdf")
    reader = PdfReader(path)
    pages_text = []
    for idx in range(len(reader.pages)):
        text = reader.pages[idx].extract_text()
        pages_text.append({"page": idx + 1, "text": text})

    full_corpus = "\n\n".join([f"---PAGE_{p['page']}---\n{p['text']}" for p in pages_text])
    
    pattern = r'\n(?P<sec_num>\d+[A-Z]?)\.\s*(?P<title>[A-Za-z][^\n—–-]+?)(?:[—–-]|(?=\n|\())'
    
    matches = list(re.finditer(pattern, full_corpus))
    sections = []
    
    for i, m in enumerate(matches):
        sec_num = m.group('sec_num')
        title = m.group('title').strip()
        try:
            val = int(re.sub(r'\D', '', sec_num))
            if val < 1 or val > 404:
                continue
        except:
            continue
            
        start = m.start()
        end = matches[i+1].start() if i + 1 < len(matches) else len(full_corpus)
        sec_chunk = full_corpus[start:end]
        
        page_match = re.search(r'---PAGE_(\d+)---', full_corpus[:start])
        pages_in_sec = re.findall(r'---PAGE_(\d+)---', sec_chunk)
        page_start = page_match.group(1) if page_match else "1"
        page_str = f"Page {page_start}" if not pages_in_sec else f"Pages {page_start}-{pages_in_sec[-1]}" if page_start != pages_in_sec[-1] else f"Page {page_start}"
        
        clean_text = re.sub(r'---PAGE_\d+---\n?', '', sec_chunk).strip()
        
        part_matches = list(re.finditer(r'(PART\s*[-–]\s*[IVXLCDM]+[^\n]*)', full_corpus[:start]))
        part = part_matches[-1].group(1).replace('\n', ' ').strip() if part_matches else "General"
        
        sections.append({
            "actId": "companies_1994",
            "actName": "The Companies Act, 1994",
            "chapter": part,
            "sectionNumber": sec_num,
            "sectionTitle": title,
            "text": clean_text,
            "sourcePdf": "company act 1994.pdf",
            "sourcePageRange": page_str
        })
    print(f"Companies Act parsed: {len(sections)} sections")
    return sections

if __name__ == "__main__":
    c_sec = parse_contract_act()
    ni_sec = parse_ni_act()
    p_sec = parse_partnership_act()
    co_sec = parse_companies_act()
    
    all_pdf_sections = c_sec + ni_sec + p_sec + co_sec
    with open("scripts/pdf_acts_extracted.json", "w", encoding="utf-8") as f:
        json.dump(all_pdf_sections, f, indent=2, ensure_ascii=False)
    print(f"Total PDF sections extracted: {len(all_pdf_sections)}")
