# OpenSTEM Research 🔬🌐

**The Open Scientific Catalog & Collaboration Platform for Global STEM Discovery.**

OpenSTEM Research is an open-access platform designed to index recent high-impact scientific research papers, enable verified researcher portfolios, synthesize AI-driven hypotheses, connect niche researchers, and guide scholars on joining world-class research teams.

---

## 🌟 Core Pillars

1. **Global Research Papers Repository (Last 6 Months & 1 Year Recency Focus)**
   - Curated and growing repository of peer-reviewed breakthroughs across Quantum Computing, Biotechnology & CRISPR, Clean Energy, Materials Science, AI & Robotics, Aerospace, and Mathematics.
   - Rapid-filtering by recency window: **Last 6 Months**, **Last 1 Year**, and **All Archive**.
   - Built-in ingestion pipeline to add and publish new papers day by day.
   - Citation metrics, DOIs, and direct open-access preprint/PDF links.

2. **Researcher Portfolio Builder**
   - Verified researcher identity with ORCID iD, lead institution, department, and research statement.
   - Academic impact tracking: published works, total citations, and h-index.
   - Interactive profile editor and publication manager.

3. **Autonomous AI Idea & Hypothesis Studio**
   - AI-augmented hypothesis engine (Gemini / OpenAI API ready).
   - Formulates:
     - Unresolved Literature Gaps
     - Falsifiable Research Hypotheses
     - Experimental Methodologies & Required Equipment
     - Benchmark Datasets and Target Publication Venues

4. **Research Mate (Niche Matchmaker)**
   - Connect with fellow STEM researchers, PhDs, and Professors by exact specialization (e.g. *Quantum Error Correction*, *In Vivo CRISPR Delivery*, *Perovskite Passivation*).
   - 1-click collaboration inquiry proposal system.

5. **Global Research Teams & World Laboratories**
   - In-depth directory of elite STEM research groups (CERN QTI, MIT CSAIL, Max Planck Institute, DeepMind Science, Oxford Nanomaterials).
   - Details on what each lab actually does, current active priorities, open vacancies, and step-by-step guidance on how to apply and join their teams.

---

## 🎨 Design Philosophy

- **Scholarly Aesthetic**: Inspired by the clean, spacious, and dignified layout of [OpenAlex](https://openalex.org/).
- **Delicate Background**: Subtle academic dot-matrix canvas with soft radial lighting.
- **Typography**: Clean display typography using **Dosis**, body text in crisp **Inter**, and scientific identifiers/metrics in **JetBrains Mono**.
- **Dark & Light Mode**: Built-in toggle between light paper aesthetic and midnight dark mode.

---

## 🚀 Quickstart (Running Locally)

### Prerequisites
- Python 3.9+
- Flask (`pip install -r requirements.txt`)

### Run the Application
```bash
git clone https://github.com/karim8siam/openstemresearch.git
cd openstemresearch
pip install -r requirements.txt
python3 server.py
```

Open your browser at:
```
http://127.0.0.1:5055
```

---

## 📂 Project Structure

```
openstemresearch/
├── server.py              # Flask backend, SQLite database, and REST APIs
├── openstem.db            # SQLite database with papers, portfolios, and labs
├── requirements.txt       # Python dependencies
├── .gitignore             # Git ignore configuration
├── README.md              # Project documentation
├── static/
│   ├── css/
│   │   └── style.css      # OpenAlex-inspired scholarly design & theme variables
│   └── js/
│       └── app.js         # Interactive client-side controller
└── templates/
    └── index.html         # Main web application layout & modals
```

---

## 📜 Roadmap & Next Steps
- [ ] Automated web scrapers & arXiv / PubMed / Crossref bulk ingest pipeline
- [ ] Direct Gemini 3.8 / OpenAI API key integration for real-time hypothesis generation
- [ ] User authentication (ORCID OAuth & University email verification)
- [ ] Collaborative whiteboard & lab grant co-drafting
