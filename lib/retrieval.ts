import { StatutorySection, CitationItem } from "./types";
import rawData from "./data/legal_knowledge_base.json";

// Cast JSON data into StatutorySection array
export const ALL_STATUTES: StatutorySection[] = rawData as StatutorySection[];

// Common English stopwords for legal queries
const STOPWORDS = new Set([
  "a", "an", "the", "and", "or", "but", "if", "because", "as", "what", "which",
  "this", "that", "these", "those", "then", "just", "so", "than", "such", "both",
  "through", "about", "for", "is", "of", "while", "during", "to", "from", "in",
  "out", "on", "off", "again", "further", "then", "once", "here", "there", "when",
  "where", "why", "how", "all", "any", "both", "each", "few", "more", "most",
  "other", "some", "no", "nor", "not", "only", "own", "same", "so", "than", "too",
  "very", "can", "will", "would", "should", "could", "did", "does", "having", "do"
]);

// Clean and tokenize string
export function tokenize(str: string): string[] {
  return (str || "")
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter(w => w.length > 2 && !STOPWORDS.has(w));
}

// Check for explicit section references in user prompt
export function extractExplicitSectionQuery(query: string): { actFilter?: string; sectionNum?: string }[] {
  const matches: { actFilter?: string; sectionNum?: string }[] = [];
  const qLower = query.toLowerCase();

  // Pattern: "section 138", "s. 73", "sec 16", "section 103"
  const secRegex = /(?:section|sec|s\.)\s*([0-9]{1,3}[A-Za-z]?)/gi;
  let match;
  while ((match = secRegex.exec(qLower)) !== null) {
    const secNum = match[1].toUpperCase();
    let actFilter: string | undefined = undefined;

    if (qLower.includes("cheque") || qLower.includes("dishonour") || qLower.includes("negotiable") || qLower.includes("promissory")) {
      actFilter = "ni_1881";
    } else if (qLower.includes("goods") || qLower.includes("buyer") || qLower.includes("seller") || qLower.includes("warranty")) {
      actFilter = "sale_of_goods_1930";
    } else if (qLower.includes("partner") || qLower.includes("firm")) {
      actFilter = "partnership_1932";
    } else if (qLower.includes("director") || qLower.includes("company") || qLower.includes("shares") || qLower.includes("agm")) {
      actFilter = "companies_1994";
    } else if (qLower.includes("contract") || qLower.includes("agreement") || qLower.includes("breach") || qLower.includes("damages")) {
      actFilter = "contract_1872";
    }

    matches.push({ actFilter, sectionNum: secNum });
  }

  return matches;
}

// Hybrid retrieval algorithm
export function retrieveRelevantSections(query: string, maxResults: number = 6): StatutorySection[] {
  const qTokens = tokenize(query);
  const qLower = query.toLowerCase();
  const explicitSecs = extractExplicitSectionQuery(query);

  const scores = new Map<string, number>();

  for (const sec of ALL_STATUTES) {
    let score = 0;
    const secNum = sec.sectionNumber.toUpperCase();

    // 1. Explicit Section Matching (Huge Boost)
    for (const exp of explicitSecs) {
      if (exp.sectionNum === secNum) {
        if (!exp.actFilter || exp.actFilter === sec.actId) {
          score += 150;
        } else {
          score += 40;
        }
      }
    }

    // 2. Act-level Contextual Boosts based on query domain
    // Check if commercial sales / defective goods / delivery dispute
    const isCommercialSale = qLower.includes("defective") || qLower.includes("goods") || 
      qLower.includes("buyer") || qLower.includes("seller") || qLower.includes("sample") || 
      qLower.includes("warranty") || qLower.includes("caveat emptor") || qLower.includes("purchased") ||
      qLower.includes("supplier") || qLower.includes("products") || qLower.includes("deliver");

    if (isCommercialSale && sec.actId === "sale_of_goods_1930") {
      score += 45;
      if (secNum === "12" || secNum === "13" || secNum === "15" || secNum === "16" || secNum === "17" || secNum === "31" || secNum === "37" || secNum === "41" || secNum === "46" || secNum === "56" || secNum === "57" || secNum === "59") {
        score += 60;
      }
    }

    if (isCommercialSale && sec.actId === "contract_1872") {
      // Commercial sales also rely on Contract Act for delay (s. 55) and damages (s. 73, 74)
      if (secNum === "55" || secNum === "73" || secNum === "74" || secNum === "39") {
        score += 55;
      }
    }

    // Check if negotiable instrument / cheque dispute
    const isChequeOrNote = qLower.includes("cheque") || qLower.includes("bounced") || 
      qLower.includes("dishonour") || qLower.includes("dishonored") || qLower.includes("promissory note") ||
      qLower.includes("bill of exchange") || qLower.includes("insufficiency of funds");

    if (isChequeOrNote && sec.actId === "ni_1881") {
      score += 50;
      if (secNum === "138" || secNum === "139" || secNum === "141" || secNum === "142" || secNum === "92" || secNum === "93" || secNum === "30") {
        score += 70;
      }
    }

    // Check if partnership dispute
    const isPartnership = qLower.includes("partner") || qLower.includes("partnership") || 
      qLower.includes("firm") || qLower.includes("holding out") || qLower.includes("expulsion") ||
      qLower.includes("co-partner") || qLower.includes("unregistered firm");

    if (isPartnership && sec.actId === "partnership_1932") {
      score += 50;
      if (secNum === "4" || secNum === "9" || secNum === "12" || secNum === "13" || secNum === "16" || secNum === "19" || secNum === "25" || secNum === "28" || secNum === "30" || secNum === "33" || secNum === "44" || secNum === "69") {
        score += 65;
      }
    }

    // Check if company law / corporate dispute (look for governance terms, not just the word "company" used as an entity noun)
    const isCompanyGovernance = qLower.includes("director") || qLower.includes("board of director") || 
      qLower.includes("shareholder") || qLower.includes("agm") || qLower.includes("egm") || 
      qLower.includes("annual general meeting") || qLower.includes("memorandum") || 
      qLower.includes("articles of association") || qLower.includes("prospectus") || 
      qLower.includes("winding up") || qLower.includes("liquidator") || qLower.includes("minority") || 
      qLower.includes("oppression") || qLower.includes("misfeasance") || qLower.includes("allotment of share") ||
      qLower.includes("lifting the veil") || qLower.includes("ultra vires") || qLower.includes("statutory meeting");

    if (isCompanyGovernance && sec.actId === "companies_1994") {
      score += 50;
      if (secNum === "4" || secNum === "5" || secNum === "12" || secNum === "81" || secNum === "90" || secNum === "91" || secNum === "103" || secNum === "105" || secNum === "106" || secNum === "108" || secNum === "130" || secNum === "145" || secNum === "181" || secNum === "233" || secNum === "241" || secNum === "242") {
        score += 70;
      }
    }

    // General contract law issues
    const isGeneralContract = qLower.includes("breach") || qLower.includes("damages") || 
      qLower.includes("compensation") || qLower.includes("frustration") || qLower.includes("impossible") || 
      qLower.includes("penalty") || qLower.includes("guarantee") || qLower.includes("surety") || 
      qLower.includes("bailment") || qLower.includes("pledge") || qLower.includes("undue influence") || 
      qLower.includes("coercion") || qLower.includes("fraud") || qLower.includes("misrepresentation") || 
      qLower.includes("void agreement") || qLower.includes("consideration") || qLower.includes("anticipatory");

    if (isGeneralContract && sec.actId === "contract_1872") {
      score += 30;
      if (secNum === "10" || secNum === "11" || secNum === "15" || secNum === "16" || secNum === "17" || secNum === "18" || secNum === "23" || secNum === "25" || secNum === "27" || secNum === "39" || secNum === "55" || secNum === "56" || secNum === "73" || secNum === "74" || secNum === "126" || secNum === "148" || secNum === "182") {
        score += 50;
      }
    }

    // 3. Keyword / Title Matching
    const titleLower = sec.sectionTitle.toLowerCase();
    for (const token of qTokens) {
      if (titleLower.includes(token)) {
        score += 12;
      }
      if (sec.legalKeywords && sec.legalKeywords.some(kw => kw.toLowerCase().includes(token))) {
        score += 8;
      }
    }

    // 4. Exact Phrase in Statutory Text
    for (let i = 0; i < qTokens.length - 1; i++) {
      const phrase = `${qTokens[i]} ${qTokens[i+1]}`;
      if (titleLower.includes(phrase)) {
        score += 20;
      } else if (sec.text.toLowerCase().includes(phrase)) {
        score += 6;
      }
    }

    // 5. Term frequency in body text
    const textLower = sec.text.toLowerCase();
    let termHits = 0;
    for (const token of qTokens) {
      if (textLower.includes(token)) {
        termHits++;
      }
    }
    score += termHits * 1.5;

    if (score > 0) {
      scores.set(sec.id, score);
    }
  }

  // Sort by highest score
  const sorted = Array.from(scores.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, maxResults)
    .map(entry => ALL_STATUTES.find(s => s.id === entry[0])!)
    .filter(Boolean);

  return sorted;
}

// Validate citations generated by AI against the actual statutory corpus
export function validateAndEnrichCitations(assistantResponse: string, retrievedSections: StatutorySection[]): CitationItem[] {
  const citations: CitationItem[] = [];
  const seenIds = new Set<string>();

  // Regex patterns to detect references:
  // e.g., "Section 138", "Section 73", "Section 16", "The Contract Act, 1872"
  const secRefRegex = /(?:Section|Sec\.|s\.)\s*([0-9]{1,3}[A-Za-z]?)(?:\s*(?:\(|clause|sub-section)\s*([0-9a-zA-Z]+)\)?)?/gi;

  let match;
  while ((match = secRefRegex.exec(assistantResponse)) !== null) {
    const secNum = match[1];

    // Find if this section number exists in our retrieved pool or global database
    let found = retrievedSections.find(s => s.sectionNumber.toLowerCase() === secNum.toLowerCase());
    
    if (!found) {
      // Look in global statutes
      found = ALL_STATUTES.find(s => s.sectionNumber.toLowerCase() === secNum.toLowerCase());
    }

    if (found && !seenIds.has(found.id)) {
      seenIds.add(found.id);
      citations.push({
        id: found.id,
        actName: found.actName,
        sectionNumber: found.sectionNumber,
        sectionTitle: found.sectionTitle,
        chapter: found.chapter,
        sourcePdf: found.sourcePdf,
        sourcePageRange: found.sourcePageRange,
        snippet: found.text.slice(0, 350) + (found.text.length > 350 ? "..." : ""),
        verified: true
      });
    }
  }

  // Also include the top retrieved sections if they were specifically mentioned or heavily relevant
  for (const ret of retrievedSections.slice(0, 3)) {
    if (!seenIds.has(ret.id) && assistantResponse.toLowerCase().includes(ret.actName.toLowerCase())) {
      seenIds.add(ret.id);
      citations.push({
        id: ret.id,
        actName: ret.actName,
        sectionNumber: ret.sectionNumber,
        sectionTitle: ret.sectionTitle,
        chapter: ret.chapter,
        sourcePdf: ret.sourcePdf,
        sourcePageRange: ret.sourcePageRange,
        snippet: ret.text.slice(0, 350) + (ret.text.length > 350 ? "..." : ""),
        verified: true
      });
    }
  }

  return citations;
}
