# GIMA Knowledge Ingestion Pipeline

## 1. Overview
The knowledge ingestion system creates a repeatable, local source-of-truth from two authoritative streams:
1. **Local Free-Course PDF Collection**: `E:\OFFICE-TECHFORBS\GIMA-PWA-AI\Free-Course-PDF'S`
2. **Public Website Routes**: `https://gim-academy.com/`

---

## 2. Processed Free-Course PDFs (12 Documents)

| Document Name | Pages | Extracted Topics |
|---|---|---|
| `1.-Theories-of-Aging-Powerpoint-Slides-pdf.pdf` | 177 | Free Radicals, Antioxidants, Telomeres, Glycation, Caloric Restriction |
| `Theories-of-Aging.pdf` | 20 | Cross-Linking, Cellular Senescence, Apoptosis, Superoxide Dismutase |
| `Free-Radicals-and-Antioxidants.pdf` | 21 | Oxidative stress, Lipid peroxidation, Mitochondrial decay |
| `Glutathione-Review.pdf` | 28 | Tripeptide synthesis, NAC, Phase II liver detoxification |
| `Glutathione-Reivew-Dr-Meschino.pdf` | 9 | Clinical dosing, Immune enhancement, Cellular protection |
| `Melatonin-Dr.-Meschino-Review.pdf` | 17 | Circadian rhythm, Pineal gland, Oncostatic properties, Sirtuins |
| `Heavy-Metal-Detox-with-Natural-Foods-and-Supplements...` | 5 | Chelation, Mercury, Lead, Chlorella, Cilantro, Alginate |
| `Hyluronic-acid-and-skin-anti-aging.pdf` | 5 | Dermal hydration, Fibroblast stimulation, Glycosaminoglycans |
| `L-Carnitine-Dr-Meschino-Review.pdf` | 5 | Fatty acid beta-oxidation, Acetyl-L-Carnitine, Brain energy |
| `Omega-3-fats-and-Telomeres-Dr.-Meschino.pdf` | 2 | EPA/DHA, Telomere attrition, Anti-inflammatory eicosanoids |
| `Reishi-mushroom-Dr-Meschino-Reiview.pdf` | 6 | Beta-glucans, T-cell modulation, Adaptogen, Immune health |
| `Folic-Acid-and-Colo-rectal-Cancer.pdf` | 4 | Methylation pathways, DNA integrity, Colorectal risk |

---

## 3. Ingestion Commands

```bash
# Ingest local PDFs
python scripts/ingest_pdfs.py

# Crawl public GIMA website
python scripts/ingest_site.py

# Build master unified index
python scripts/build_master_index.py
```
Outputs are saved in `data/processed/`, `data/site-map/`, `data/assets/`, and `data/knowledge/master-knowledge-index.json`.
