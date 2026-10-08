import os
import sys
import json
from datetime import datetime

def build_master_index(root_dir: str):
    data_dir = os.path.join(root_dir, "data")
    free_courses_index_file = os.path.join(data_dir, "free-courses", "theories-of-aging-index.json")
    site_index_file = os.path.join(data_dir, "knowledge", "site-knowledge-index.json")
    assets_file = os.path.join(data_dir, "assets", "asset-registry.json")
    
    pdf_items = []
    if os.path.exists(free_courses_index_file):
        with open(free_courses_index_file, 'r', encoding='utf-8') as f:
            pdf_items = json.load(f)
            
    site_items = []
    if os.path.exists(site_index_file):
        with open(site_index_file, 'r', encoding='utf-8') as f:
            site_items = json.load(f)
            
    # Unify all knowledge items
    master_items = []
    
    # PDF items have high retrieval priority for Free Courses & Anti-Aging
    for p in pdf_items:
        master_items.append({
            "id": p.get("id"),
            "sourceType": "pdf",
            "sourceUrl": p.get("sourceUrl"),
            "sourceTitle": p.get("sourceTitle"),
            "contentType": "free_course_pdf",
            "course": p.get("course", "Theories of Aging"),
            "subject": p.get("subject", "Anti-Aging and Orthomolecular Nutrition"),
            "category": "Free Courses",
            "pageNumber": 1,
            "pageCount": p.get("pageCount", 1),
            "documentName": p.get("documentName"),
            "imageUrl": "https://gim-academy.com/wp-content/plugins/gima-course-details/assets/images/Online-Training.jpg",
            "topics": p.get("topics", []),
            "summary": p.get("summary", ""),
            "pagePreviews": p.get("pagePreviews", []),
            "createdAt": p.get("createdAt"),
            "updatedAt": p.get("updatedAt"),
            "priority": 100 # High priority for Free Courses
        })
        
    for s in site_items:
        master_items.append({
            "id": s.get("id"),
            "sourceType": "website",
            "sourceUrl": s.get("sourceUrl"),
            "sourceTitle": s.get("sourceTitle"),
            "contentType": s.get("contentType"),
            "course": s.get("course"),
            "subject": s.get("category"),
            "category": s.get("category"),
            "pageNumber": None,
            "documentName": None,
            "imageUrl": "https://gim-academy.com/wp-content/uploads/2023/11/GLOBAL_IMA_LOGO_ALT_ALT-1-1600x362-1.png",
            "topics": s.get("topics", []),
            "summary": s.get("summary", ""),
            "headings": s.get("headings", []),
            "createdAt": s.get("createdAt"),
            "updatedAt": s.get("updatedAt"),
            "priority": 80
        })
        
    master_index_file = os.path.join(data_dir, "knowledge", "master-knowledge-index.json")
    with open(master_index_file, 'w', encoding='utf-8') as f:
        json.dump(master_items, f, indent=2, ensure_ascii=False)
        
    # Generate verified GIMA Brand Configuration
    brand_config = {
        "brandName": "Global Integrative Medicine Academy",
        "acronym": "GIMA",
        "tagline": "Online Nutrition Certification for Regulated Healthcare Professionals",
        "accreditationDesignations": [
            "ROHP (Registered Orthomolecular Health Practitioner)",
            "RNCP (Registered Nutritional Consultant Practitioner)"
        ],
        "corePrograms": [
            {
                "id": "rohp-main",
                "name": "ROHP / RNCP Qualifying Program",
                "description": "Advanced Nutritional Medicine and Sports Nutrition Specialist Program for Healthcare Professionals.",
                "totalModules": 6,
                "capstoneModule": "Module 7: Clinical Case Studies & Final Assignment"
            }
        ],
        "curriculumCourses": [
            {
                "code": "101",
                "title": "Course 101: Essentials of Metabolism and Theories of Aging",
                "focus": "Cellular metabolism, mitochondrial function, free radicals, antioxidants, theories of biological aging, cellular senescence."
            },
            {
                "code": "102",
                "title": "Course 102: Nutritional Medicine in Neurology",
                "focus": "Neurodegenerative disorders, cognitive health, neurotransmitters, blood-brain barrier, brain development."
            },
            {
                "code": "103",
                "title": "Course 103: Nutritional Medicine In Metabolic Diseases",
                "focus": "Insulin resistance, Type 2 diabetes, metabolic syndrome, dyslipidemia, cardiovascular risk biomarkers."
            },
            {
                "code": "104",
                "title": "Course 104: Nutritional Medicine in Systemic Health Problems",
                "focus": "Autoimmune conditions, chronic inflammation, musculoskeletal disorders, immune system optimization."
            },
            {
                "code": "105",
                "title": "Course 105: Nutritional Medicine in Reproductive Health, Weight Management and Sports Nutrition",
                "focus": "Hormonal balance, athletic performance, body composition, ergogenic aids, sports supplementation."
            },
            {
                "code": "106",
                "title": "Course 106: Nutritional Medicine in Cancer, Gastrointestinal Diseases and Functional Assessment",
                "focus": "Oncology nutrition support, gut microbiome, intestinal permeability, clinical nutritional assessment protocols."
            },
            {
                "code": "MOD-7",
                "title": "Module 7: Clinical Case Studies and Final Practice Assignment",
                "focus": "Real-world patient case evaluations, integrative dietary protocols, orthomolecular supplementation regimens."
            }
        ],
        "freeCourses": [
            {
                "id": "free-toa",
                "title": "Theories of Aging",
                "description": "Comprehensive biological and nutritional examination of aging mechanisms, cellular senescence, and intervention strategies.",
                "associatedPdfCount": 12,
                "instructor": "Dr. James Meschino, DC, MS, ROHP"
            },
            {
                "id": "free-brain",
                "title": "Nutritional Medicine in Brain Development",
                "description": "Role of micronutrients, essential fatty acids, and metabolic precursors in neurological development and neuroprotection.",
                "instructor": "Dr. James Meschino, DC, MS, ROHP"
            }
        ],
        "keyPersonnel": [
            {
                "name": "Dr. James Meschino",
                "credentials": "DC, MS, ROHP",
                "role": "Academic Director and Master Instructor",
                "bio": "Renowned authority in nutritional medicine, anti-aging biology, and author of comprehensive clinical nutrition curricula."
            }
        ],
        "colorPalette": {
            "primaryNavy": "#1e3a5f",
            "secondaryNavy": "#0f233a",
            "accentGold": "#d4af37",
            "warmGold": "#e5a93b",
            "clinicalTeal": "#0d9488",
            "backgroundCream": "#faf9f6",
            "surfaceWhite": "#ffffff",
            "borderSubtle": "#e2e8f0",
            "textPrimary": "#0f172a",
            "textMuted": "#64748b"
        },
        "typography": {
            "fontFamily": "Inter, system-ui, -apple-system, sans-serif",
            "headingFont": "Inter, sans-serif",
            "editorialSerif": "Newsreader, Georgia, serif"
        },
        "complianceRules": [
            "Distinguish clearly between established nutritional science and marketing assertions.",
            "Do not fabricate medical cures or unsupported therapeutic claims.",
            "Always state GIMA programs are designed specifically for licensed/regulated Healthcare Professionals.",
            "Emphasize evidence-based clinical studies and peer-reviewed research."
        ],
        "approvedCTAs": [
            "Enroll in ROHP Certification",
            "Explore Free Course Material",
            "Download Clinical Toolkit",
            "Advance Your Practice with GIMA",
            "Get Certified in Clinical Nutrition",
            "Start Free Module Today"
        ]
    }
    
    brand_file = os.path.join(data_dir, "metadata", "gima-brand.json")
    os.makedirs(os.path.dirname(brand_file), exist_ok=True)
    with open(brand_file, 'w', encoding='utf-8') as f:
        json.dump(brand_config, f, indent=2, ensure_ascii=False)
        
    print(f"Master index created with {len(master_items)} total knowledge records.")
    print("GIMA Brand Configuration saved.")

if __name__ == "__main__":
    root = sys.argv[1] if len(sys.argv) > 1 else r"E:\OFFICE-TECHFORBS\GIMA-PWA-AI"
    build_master_index(root)
