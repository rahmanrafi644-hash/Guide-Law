# GUIDE LAW
### Your AI Assistant for Bangladeshi Business Law
*Academic Project & Live Competition Entry — United International University (UIU)*

---

## 🏛️ Project Overview
**Guide Law** is an AI-powered legal research and scenario analysis assistant specialized in **Bangladeshi Business Law**. Grounded primarily in the five core commercial statutes of Bangladesh, Guide Law empowers students, faculty, and judges to test hypothetical business disputes, verify section-level citations, and validate AI reasoning against authentic statutory enactments.

---

## 📚 The Five Primary Statutory Authorities
1. **The Contract Act, 1872** (Act No. IX of 1872)
2. **The Sale of Goods Act, 1930** (Act No. III of 1930)
3. **The Negotiable Instruments Act, 1881** (Act No. XXVI of 1881)
4. **The Partnership Act, 1932** (Act No. IX of 1932)
5. **The Companies Act, 1994** (Act No. 18 of 1994)

All statutes are parsed with preserved legal hierarchy (Act $\rightarrow$ Chapter/Part $\rightarrow$ Section $\rightarrow$ Subsections & Illustrations) and indexed locally for instant retrieval.

---

## ⚡ Key Capabilities
- **Hierarchical Statutory Grounding**: Every answer is rooted in verbatim statutory text, preventing hallucinated sections or non-existent subsections.
- **IRAC Structured Analysis**:
  - 📌 **Legal Issue**
  - ⚖️ **Applicable Law**
  - 📜 **Relevant Provision(s)**
  - 🔍 **Legal Rule & Interpretation**
  - 🏢 **Application to the Facts**
  - 🛡️ **Possible Remedies & Legal Consequences**
  - ⚠️ **Missing Facts / Incomplete Information**
  - ✅ **Direct Conclusion**
  - 📚 **Verified Citations**
- **Interactive Source Drawer**: Click any citation badge to slide out the authentic section text, PDF source reference, and a button to view/download the original official PDF.
- **Statutes Knowledge Library**: Search and browse across 811+ statutory provisions in real-time.
- **Mobile-First QR Experience**: Optimized for judges scanning the competition X-banner with smartphones.

---

## 🚀 Running Locally

```bash
# 1. Install dependencies
npm install

# 2. Add your Groq API Key to .env.local
GROQ_API_KEY=gsk_...

# 3. Start development server
npm run dev

# 4. Open in browser
http://localhost:3000
```

---

## 🌐 Deploying to Vercel

1. Push this repository to GitHub or GitLab.
2. Go to [Vercel Dashboard](https://vercel.com/new).
3. Import the repository.
4. Under **Environment Variables**, add:
   - Key: `GROQ_API_KEY`
   - Value: `your_groq_api_key_here`
5. Click **Deploy**. Vercel will build and serve the application with zero additional configuration.
6. Copy the deployed production URL and generate your QR code for the competition X-banner!
