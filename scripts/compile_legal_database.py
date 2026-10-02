import sys
sys.stdout.reconfigure(encoding='utf-8')
import json
import os
import re

# Load both datasets
with open("scripts/sale_of_goods_extracted.json", encoding="utf-8") as f:
    soga_data = json.load(f)

with open("scripts/pdf_acts_extracted.json", encoding="utf-8") as f:
    pdf_data = json.load(f)

print(f"Loaded {len(soga_data)} SOGA sections and {len(pdf_data)} PDF sections.")

# Clean & normalize
all_sections = []
seen_keys = set()

# Keyword mappings by domain
KEYWORDS_MAP = {
    # Contract Act
    ("contract_1872", "2"): ["proposal", "offer", "acceptance", "promise", "consideration", "agreement", "contract", "reciprocal promise", "void", "voidable"],
    ("contract_1872", "10"): ["valid contract", "free consent", "competency", "lawful consideration", "lawful object", "enforceability"],
    ("contract_1872", "11"): ["competency", "capacity to contract", "minor", "age of majority", "sound mind", "disqualification"],
    ("contract_1872", "12"): ["sound mind", "unsound mind", "lunatic", "drunkenness", "rational judgment"],
    ("contract_1872", "13"): ["consent", "meeting of minds", "consensus ad idem"],
    ("contract_1872", "14"): ["free consent", "vitiating factors"],
    ("contract_1872", "15"): ["coercion", "threat", "unlawful detaining", "penal code"],
    ("contract_1872", "16"): ["undue influence", "fiduciary relation", "mental distress", "unconscionable transaction", "burden of proof"],
    ("contract_1872", "17"): ["fraud", "deceit", "active concealment", "false statement", "duty to speak", "silence"],
    ("contract_1872", "18"): ["misrepresentation", "innocent misrepresentation", "unwarranted assertion", "breach of duty"],
    ("contract_1872", "19"): ["voidability", "voidable contract", "option of party", "restitution"],
    ("contract_1872", "19A"): ["undue influence", "set aside contract"],
    ("contract_1872", "20"): ["mutual mistake", "bilateral mistake", "matter of fact", "void agreement"],
    ("contract_1872", "23"): ["unlawful consideration", "unlawful object", "forbidden by law", "public policy", "immoral", "fraudulent"],
    ("contract_1872", "25"): ["agreement without consideration", "nudum pactum", "natural love and affection", "voluntary service", "time-barred debt"],
    ("contract_1872", "27"): ["restraint of trade", "non-compete", "sale of goodwill", "trade restriction"],
    ("contract_1872", "28"): ["restraint of legal proceedings", "arbitration clause", "jurisdiction restriction"],
    ("contract_1872", "29"): ["uncertainty", "vague agreement", "void for uncertainty"],
    ("contract_1872", "30"): ["wager", "wagering agreement", "gambling"],
    ("contract_1872", "31"): ["contingent contract", "collateral event"],
    ("contract_1872", "39"): ["anticipatory breach", "refusal to perform", "renunciation", "putting an end to contract"],
    ("contract_1872", "55"): ["time of essence", "delayed performance", "failure to perform at fixed time", "voidable at option"],
    ("contract_1872", "56"): ["frustration", "subsequent impossibility", "unlawful act", "force majeure", "void contract"],
    ("contract_1872", "62"): ["novation", "rescission", "alteration", "substitution of contract"],
    ("contract_1872", "63"): ["remission", "dispense with performance", "extension of time", "accord and satisfaction"],
    ("contract_1872", "64"): ["rescission of voidable contract", "restoration of benefit"],
    ("contract_1872", "65"): ["obligation under void agreement", "doctrine of restitution", "advantage received"],
    ("contract_1872", "70"): ["quasi contract", "non-gratuitous act", "quantum meruit", "compensation for benefit"],
    ("contract_1872", "73"): ["breach of contract", "damages", "compensation for loss", "hadley v baxendale", "natural consequence", "direct loss", "remote loss"],
    ("contract_1872", "74"): ["liquidated damages", "penalty clause", "stipulation by way of penalty", "reasonable compensation"],
    ("contract_1872", "75"): ["rescission damages"],
    ("contract_1872", "124"): ["indemnity", "contract of indemnity", "save from loss"],
    ("contract_1872", "126"): ["guarantee", "contract of guarantee", "surety", "principal debtor", "creditor"],
    ("contract_1872", "128"): ["surety liability", "co-extensive liability"],
    ("contract_1872", "133"): ["discharge of surety", "variance of contract terms"],
    ("contract_1872", "134"): ["discharge of surety", "release of principal debtor"],
    ("contract_1872", "135"): ["discharge of surety", "giving time to debtor", "composition"],
    ("contract_1872", "148"): ["bailment", "bailor", "bailee", "delivery of goods"],
    ("contract_1872", "151"): ["care by bailee", "standard of care", "prudence", "negligence"],
    ("contract_1872", "170"): ["bailee lien", "particular lien"],
    ("contract_1872", "171"): ["general lien", "banker lien", "wharfinger"],
    ("contract_1872", "172"): ["pledge", "pawnor", "pawnee", "security for debt"],
    ("contract_1872", "182"): ["agency", "agent", "principal"],
    ("contract_1872", "188"): ["agent authority", "extent of authority"],
    ("contract_1872", "211"): ["agent duty to principal", "directions of principal"],
    ("contract_1872", "212"): ["agent diligence", "skill required", "agent negligence"],
    ("contract_1872", "215"): ["agent dealing on own account", "secret profit", "conflict of interest"],
    ("contract_1872", "226"): ["enforcement of agent contract", "principal bound"],
    ("contract_1872", "230"): ["agent personal liability", "undisclosed principal", "foreign principal"],

    # NI Act
    ("ni_1881", "4"): ["promissory note", "unconditional undertaking"],
    ("ni_1881", "5"): ["bill of exchange", "unconditional order"],
    ("ni_1881", "6"): ["cheque", "banker", "payable on demand", "electronic cheque"],
    ("ni_1881", "9"): ["holder in due course", "bona fide purchaser", "for consideration"],
    ("ni_1881", "30"): ["liability of drawer", "dishonour", "compensation"],
    ("ni_1881", "31"): ["liability of drawee bank", "sufficient funds", "wrongful dishonour"],
    ("ni_1881", "87"): ["material alteration", "void instrument"],
    ("ni_1881", "92"): ["dishonour by non-payment"],
    ("ni_1881", "93"): ["notice of dishonour", "mandatory notice"],
    ("ni_1881", "94"): ["mode of notice of dishonour", "written notice", "reasonable time"],
    ("ni_1881", "98"): ["notice of dishonour dispensed with"],
    ("ni_1881", "118"): ["presumptions", "presumption of consideration", "presumption of holder in due course"],
    ("ni_1881", "123"): ["cheque crossed generally", "crossing"],
    ("ni_1881", "124"): ["cheque crossed specially"],
    ("ni_1881", "130"): ["not negotiable crossing", "defect in title"],
    ("ni_1881", "138"): ["dishonour of cheque", "bounced cheque", "cheque bounce", "insufficiency of funds", "stop payment", "notice in writing", "thirty days notice", "15 days payment", "imprisonment up to two years", "twice cheque amount", "section 138 ni act"],
    ("ni_1881", "139"): ["presumption in favour of holder", "discharge of debt"],
    ("ni_1881", "140"): ["defence not allowed", "strict liability"],
    ("ni_1881", "141"): ["offences by companies", "director liability", "vicarious liability", "in charge of company"],
    ("ni_1881", "142"): ["cognizance of offences", "one month limitation", "complaint in writing"],
    ("ni_1881", "143"): ["summary trial", "magistrate first class"],
    ("ni_1881", "143A"): ["interim compensation", "twenty percent"],
    ("ni_1881", "148"): ["appellate court deposit", "20% fine"],

    # Sale of Goods Act
    ("sale_of_goods_1930", "4"): ["contract of sale", "agreement to sell", "transfer of property", "price"],
    ("sale_of_goods_1930", "12"): ["condition", "warranty", "essential stipulation", "collateral stipulation", "repudiation", "damages"],
    ("sale_of_goods_1930", "13"): ["condition treated as warranty", "waiver"],
    ("sale_of_goods_1930", "14"): ["implied undertaking as to title", "quiet possession", "free from encumbrance"],
    ("sale_of_goods_1930", "15"): ["sale by description", "correspondence with description"],
    ("sale_of_goods_1930", "16"): ["implied condition as to quality or fitness", "caveat emptor", "merchantable quality", "fitness for purpose", "latent defect", "reliance on seller skill"],
    ("sale_of_goods_1930", "16A"): ["defect disclosure"],
    ("sale_of_goods_1930", "17"): ["sale by sample", "bulk correspond with sample", "merchantability"],
    ("sale_of_goods_1930", "19"): ["property passes when intended", "transfer of ownership"],
    ("sale_of_goods_1930", "20"): ["specific goods in deliverable state"],
    ("sale_of_goods_1930", "26"): ["risk passes with property", "res perit domino"],
    ("sale_of_goods_1930", "27"): ["sale by non-owner", "nemo dat quod non habet", "mercantile agent"],
    ("sale_of_goods_1930", "31"): ["duties of seller and buyer", "delivery and payment"],
    ("sale_of_goods_1930", "37"): ["delivery of wrong quantity", "short delivery", "excess delivery"],
    ("sale_of_goods_1930", "41"): ["buyer right of examination", "inspecting goods"],
    ("sale_of_goods_1930", "42"): ["acceptance of goods"],
    ("sale_of_goods_1930", "45"): ["unpaid seller defined"],
    ("sale_of_goods_1930", "46"): ["unpaid seller rights", "lien", "stoppage in transit", "resale"],
    ("sale_of_goods_1930", "47"): ["seller lien"],
    ("sale_of_goods_1930", "50"): ["stoppage in transit", "insolvent buyer"],
    ("sale_of_goods_1930", "54"): ["resale by unpaid seller"],
    ("sale_of_goods_1930", "55"): ["suit for price"],
    ("sale_of_goods_1930", "56"): ["damages for non-acceptance"],
    ("sale_of_goods_1930", "57"): ["damages for non-delivery", "market price difference"],
    ("sale_of_goods_1930", "58"): ["specific performance"],
    ("sale_of_goods_1930", "59"): ["remedy for breach of warranty", "diminution of price", "defective goods damages"],
    ("sale_of_goods_1930", "60"): ["anticipatory repudiation"],

    # Partnership Act
    ("partnership_1932", "4"): ["partnership defined", "partners", "firm", "sharing profits", "mutual agency"],
    ("partnership_1932", "5"): ["partnership contract not status", "hindu undivided family"],
    ("partnership_1932", "6"): ["mode of determining partnership", "real relation", "profit sharing test"],
    ("partnership_1932", "7"): ["partnership at will"],
    ("partnership_1932", "9"): ["general duties of partners", "greatest common advantage", "just and faithful", "render accounts"],
    ("partnership_1932", "10"): ["duty to indemnify for fraud"],
    ("partnership_1932", "12"): ["conduct of business", "right to participate", "majority decisions", "books inspection"],
    ("partnership_1932", "13"): ["mutual rights and liabilities", "equal profits", "equal losses", "interest on advances"],
    ("partnership_1932", "14"): ["property of firm", "goodwill"],
    ("partnership_1932", "16"): ["personal profits earned by partners", "secret profits", "competing business profits", "duty to account"],
    ("partnership_1932", "18"): ["partner as agent of firm"],
    ("partnership_1932", "19"): ["implied authority of partner", "restrictions on implied authority", "arbitration restriction", "immovable property restriction"],
    ("partnership_1932", "21"): ["partner authority in emergency"],
    ("partnership_1932", "25"): ["liability of partner for acts of firm", "joint and several liability"],
    ("partnership_1932", "26"): ["liability of firm for wrongful act of partner", "tort liability"],
    ("partnership_1932", "27"): ["misapplication of money by partner"],
    ("partnership_1932", "28"): ["holding out", "ostensible partner", "estoppel"],
    ("partnership_1932", "30"): ["minor admitted to benefits of partnership", "minor not personally liable", "election on majority", "six months notice"],
    ("partnership_1932", "31"): ["introduction of partner", "consent of all partners"],
    ("partnership_1932", "32"): ["retirement of partner", "public notice requirement", "liability to third parties"],
    ("partnership_1932", "33"): ["expulsion of partner", "majority power", "good faith requirement"],
    ("partnership_1932", "34"): ["insolvency of partner"],
    ("partnership_1932", "35"): ["death of partner", "non-liability of estate"],
    ("partnership_1932", "36"): ["outgoing partner competing business", "restraint of trade"],
    ("partnership_1932", "37"): ["right of outgoing partner to share profits", "interest at 6%"],
    ("partnership_1932", "39"): ["dissolution of firm"],
    ("partnership_1932", "40"): ["dissolution by agreement"],
    ("partnership_1932", "41"): ["compulsory dissolution", "insolvency of partners", "unlawful business"],
    ("partnership_1932", "42"): ["dissolution on contingencies", "expiry of term", "completion of adventure", "death", "insolvency"],
    ("partnership_1932", "43"): ["dissolution by notice of partnership at will"],
    ("partnership_1932", "44"): ["dissolution by Court", "unsound mind", "incapacity", "prejudicial conduct", "breach of agreement", "losses", "just and equitable"],
    ("partnership_1932", "45"): ["liability for acts of partners done after dissolution", "public notice of dissolution"],
    ("partnership_1932", "48"): ["mode of settlement of accounts", "order of asset application", "payment of debts"],
    ("partnership_1932", "69"): ["effect of non-registration", "bar to suit", "unregistered firm cannot sue", "dissolution exception"],

    # Companies Act
    ("companies_1994", "4"): ["prohibition of large partnership", "maximum 10 in banking", "maximum 20 in business", "illegal association"],
    ("companies_1994", "5"): ["mode of forming company", "private company min 2", "public company min 7", "limited by shares"],
    ("companies_1994", "10"): ["alteration of memorandum"],
    ("companies_1994", "11"): ["name of company", "change of name", "undesirable name"],
    ("companies_1994", "12"): ["alteration of memorandum objects", "confirmation by Court"],
    ("companies_1994", "22"): ["effect of memorandum and articles", "binding on members"],
    ("companies_1994", "24"): ["effect of registration", "body corporate", "perpetual succession", "common seal"],
    ("companies_1994", "25"): ["conclusiveness of certificate of incorporation"],
    ("companies_1994", "28"): ["association not for profit", "dispensing with limited"],
    ("companies_1994", "38"): ["transfer of shares", "instrument of transfer"],
    ("companies_1994", "43"): ["rectification of register of members", "Court application"],
    ("companies_1994", "58"): ["restriction on purchase of own shares", "financial assistance for shares"],
    ("companies_1994", "59"): ["reduction of share capital", "special resolution", "Court confirmation"],
    ("companies_1994", "77"): ["registered office"],
    ("companies_1994", "78"): ["publication of company name"],
    ("companies_1994", "81"): ["annual general meeting", "AGM", "every calendar year", "15 months"],
    ("companies_1994", "84"): ["extraordinary general meeting", "EGM", "requisition by 10%"],
    ("companies_1994", "85"): ["provisions as to meetings", "notice 14 days", "quorum", "proxies"],
    ("companies_1994", "87"): ["special resolution", "extraordinary resolution", "three fourths majority"],
    ("companies_1994", "90"): ["directors obligatory", "min 3 public", "min 2 private", "natural person only"],
    ("companies_1994", "91"): ["appointment of directors", "election at AGM", "rotation"],
    ("companies_1994", "94"): ["disqualifications of directors", "unsound mind", "insolvent", "unpaid calls", "minor"],
    ("companies_1994", "96"): ["meeting of board of directors", "at least once every 3 months", "4 meetings yearly"],
    ("companies_1994", "97"): ["qualification shares of director"],
    ("companies_1994", "103"): ["loans to directors prohibited", "guarantee to director", "director loan exceptions", "max 50% shares"],
    ("companies_1994", "104"): ["director office of profit"],
    ("companies_1994", "105"): ["sanction of directors for contracts", "director contracts with company"],
    ("companies_1994", "106"): ["removal of directors", "extraordinary resolution"],
    ("companies_1994", "108"): ["vacation of office of director"],
    ("companies_1994", "110"): ["managing director term max 5 years"],
    ("companies_1994", "130"): ["disclosure of interest by director", "conflict of interest"],
    ("companies_1994", "131"): ["prohibition of voting by interested director", "quorum exclusion"],
    ("companies_1994", "145"): ["civil liability for misstatements in prospectus", "prospectus damages"],
    ("companies_1994", "146"): ["criminal penalty for untrue statement in prospectus"],
    ("companies_1994", "148"): ["restriction as to allotment", "minimum subscription 5%"],
    ("companies_1994", "159"): ["registration of mortgages and charges", "void against liquidator within 21 days"],
    ("companies_1994", "181"): ["books of account to be kept", "preserve for 12 years"],
    ("companies_1994", "183"): ["annual balance sheet", "profit and loss account"],
    ("companies_1994", "184"): ["board of directors report"],
    ("companies_1994", "210"): ["appointment and remuneration of auditors"],
    ("companies_1994", "212"): ["qualification of auditors", "chartered accountant", "disqualifications"],
    ("companies_1994", "213"): ["powers and duties of auditors", "true and fair view"],
    ("companies_1994", "222"): ["carrying on business with less than legal minimum", "personal liability after 6 months"],
    ("companies_1994", "228"): ["compromise with creditors and members", "scheme of arrangement"],
    ("companies_1994", "233"): ["protection of minority interest", "oppression", "prejudicial management", "Court order"],
    ("companies_1994", "241"): ["circumstances for winding up by Court", "grounds for winding up"],
    ("companies_1994", "242"): ["inability to pay debts", "statutory demand 21 days", "exceeding 500 taka"],
    ("companies_1994", "286"): ["voluntary winding up"],
    ("companies_1994", "290"): ["declaration of solvency", "members voluntary winding up"],
    ("companies_1994", "325"): ["preferential payments in winding up", "taxes", "wages", "worker compensation"],
    ("companies_1994", "331"): ["misfeasance proceedings", "damages against delinquent directors"],
    ("companies_1994", "346"): ["defunct company struck off register by Registrar"]
}

# Add SOGA sections
for s in soga_data:
    sec_num = str(s.get("sectionNumber", "")).strip()
    key = ("sale_of_goods_1930", sec_num)
    kw = KEYWORDS_MAP.get(key, [])
    # Add words from title
    title_words = [w.lower() for w in re.findall(r'[A-Za-z]{3,}', s.get("sectionTitle", ""))]
    combined_kw = list(set(kw + title_words))
    
    sec_id = f"SOGA_1930_S{sec_num}"
    if sec_id in seen_keys:
        continue
    seen_keys.add(sec_id)
    
    all_sections.append({
        "id": sec_id,
        "actId": "sale_of_goods_1930",
        "actName": "The Sale of Goods Act, 1930",
        "chapter": s.get("chapter", "General"),
        "sectionNumber": sec_num,
        "sectionTitle": s.get("sectionTitle", f"Section {sec_num}"),
        "text": s.get("text", "").strip(),
        "sourcePdf": "sale of goods act 1930.pdf",
        "sourcePageRange": f"Sections 1-66 (bdlaws official)",
        "legalKeywords": combined_kw
    })

# Add PDF sections
for s in pdf_data:
    act_id = s.get("actId")
    sec_num = str(s.get("sectionNumber", "")).strip()
    key = (act_id, sec_num)
    kw = KEYWORDS_MAP.get(key, [])
    title_words = [w.lower() for w in re.findall(r'[A-Za-z]{3,}', s.get("sectionTitle", ""))]
    combined_kw = list(set(kw + title_words))
    
    prefix = {
        "contract_1872": "CA_1872",
        "ni_1881": "NIA_1881",
        "partnership_1932": "PA_1932",
        "companies_1994": "CA_1994"
    }.get(act_id, "ACT")
    
    sec_id = f"{prefix}_S{sec_num}"
    if sec_id in seen_keys:
        continue
    seen_keys.add(sec_id)
    
    all_sections.append({
        "id": sec_id,
        "actId": act_id,
        "actName": s.get("actName"),
        "chapter": s.get("chapter", ""),
        "sectionNumber": sec_num,
        "sectionTitle": s.get("sectionTitle", f"Section {sec_num}"),
        "text": s.get("text", "").strip(),
        "sourcePdf": s.get("sourcePdf"),
        "sourcePageRange": s.get("sourcePageRange", ""),
        "legalKeywords": combined_kw
    })

# Ensure destination directory exists
os.makedirs("lib/data", exist_ok=True)
dest_path = "lib/data/legal_knowledge_base.json"

with open(dest_path, "w", encoding="utf-8") as f:
    json.dump(all_sections, f, indent=2, ensure_ascii=False)

print(f"Successfully compiled {len(all_sections)} verified statutory sections into {dest_path}!")

# Count by Act
counts = {}
for sec in all_sections:
    counts[sec['actName']] = counts.get(sec['actName'], 0) + 1

for act, count in counts.items():
    print(f" - {act}: {count} sections")
