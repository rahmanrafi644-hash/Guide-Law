import os
import sys
import json
import re
from pypdf import PdfReader

pdf_dir = "Law pdf"
files = [
    ("contract_1872", "THE INDIAN CONTRACT ACT, 1872 .pdf"),
    ("ni_1881", "negotiable_instruments_act,_1881.pdf"),
    ("partnership_1932", "The-Partnership-Act,-1932.pdf"),
    ("companies_1994", "company act 1994.pdf"),
    ("sale_of_goods_1930", "sale of goods act 1930.pdf"),
]

for key, fname in files:
    path = os.path.join(pdf_dir, fname)
    if os.path.exists(path):
        reader = PdfReader(path)
        print(f"[{key}] {fname}: {len(reader.pages)} pages")
    else:
        print(f"[{key}] NOT FOUND: {fname}")
