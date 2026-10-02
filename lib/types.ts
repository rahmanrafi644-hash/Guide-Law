export interface StatutorySection {
  id: string;
  actId: "contract_1872" | "sale_of_goods_1930" | "ni_1881" | "partnership_1932" | "companies_1994";
  actName: string;
  chapter: string;
  sectionNumber: string;
  sectionTitle: string;
  text: string;
  sourcePdf: string;
  sourcePageRange: string;
  legalKeywords: string[];
}

// Server-side only: used to validate citations. Never sent to the browser.
export interface CitationItem {
  id: string;
  actName: string;
  sectionNumber: string;
  sectionTitle: string;
  chapter: string;
  sourcePdf: string;
  sourcePageRange: string;
  snippet: string;
  verified: boolean;
}

export interface ChatMessage {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  timestamp: number;
}

export interface Chat {
  id: string;
  title: string;
  messages: ChatMessage[];
  createdAt: number;
  updatedAt: number;
}

export interface ScenarioExample {
  title: string;
  subtitle: string;
  actName: string;
  icon: string;
  query: string;
}
