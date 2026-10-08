import os
import sys
import json
import hashlib
import re
from datetime import datetime
import PyPDF2

def get_hash(content: str) -> str:
    return hashlib.sha256(content.encode('utf-8')).hexdigest()[:12]

def clean_text(text: str) -> str:
    if not text:
        return ""
    # Normalize unicode spaces and quotes
    text = text.replace('\xa0', ' ').replace('\u2019', "'").replace('\u201c', '"').replace('\u201d', '"')
    # Remove excessive blank lines
    text = re.sub(r'\n\s*\n\s*\n+', '\n\n', text)
    # Remove trailing/leading whitespaces on lines
    lines = [line.strip() for line in text.split('\n')]
    return '\n'.join(lines).strip()

def extract_topics(text: str):
    keywords = [
        "Antioxidant", "Free Radicals", "Glutathione", "Mitochondria", "Telomeres", 
        "Telomerase", "L-Carnitine", "Melatonin", "Omega-3", "Hyaluronic Acid", 
        "Skin Anti-Aging", "Reishi Mushroom", "Heavy Metal Detox", "Chelation",
        "Folic Acid", "Colorectal Cancer", "Cross-Linking", "Glycation", "AGEs",
        "Caloric Restriction", "DNA Repair", "Apoptosis", "Cellular Senescence",
        "Superoxide Dismutase", "Catalase", "CoQ10", "NAC", "N-Acetylcysteine",
        "Lipofuscin", "Dr. James Meschino", "Orthomolecular Medicine", "Metabolism"
    ]
    found = []
    text_lower = text.lower()
    for kw in keywords:
        if kw.lower() in text_lower:
            found.append(kw)
    return found

def process_all_pdfs(root_dir: str):
    pdf_base = os.path.join(root_dir, "Free-Course-PDF'S")
    out_dir = os.path.join(root_dir, "data", "processed", "pdfs")
    free_courses_dir = os.path.join(root_dir, "data", "free-courses")
    knowledge_dir = os.path.join(root_dir, "data", "knowledge")
    
    os.makedirs(out_dir, exist_ok=True)
    os.makedirs(free_courses_dir, exist_ok=True)
    os.makedirs(knowledge_dir, exist_ok=True)
    
    if not os.path.exists(pdf_base):
        print(f"Directory not found: {pdf_base}")
        return []
    
    processed_items = []
    
    for dirpath, _, filenames in os.walk(pdf_base):
        for fname in filenames:
            if not fname.lower().endswith(".pdf"):
                continue
            
            pdf_path = os.path.join(dirpath, fname)
            rel_path = os.path.relpath(pdf_path, root_dir).replace('\\', '/')
            doc_title = fname.replace('.pdf', '').replace('-', ' ').replace('_', ' ')
            # Clean up numbering
            doc_title = re.sub(r'^\d+[\.\s\-]+', '', doc_title).strip()
            
            print(f"Processing: {fname}...")
            
            try:
                with open(pdf_path, 'rb') as f:
                    reader = PyPDF2.PdfReader(f)
                    total_pages = len(reader.pages)
                    pages_data = []
                    all_text = []
                    
                    for p_num, page in enumerate(reader.pages, start=1):
                        p_text = clean_text(page.extract_text() or "")
                        if p_text:
                            # Filter out repeated common header/footer if present
                            lines = p_text.split('\n')
                            clean_lines = [
                                l for l in lines 
                                if not re.match(r'^(page\s+\d+|global\s+integrative\s+medicine\s+academy)$', l.strip(), re.I)
                            ]
                            p_clean = '\n'.join(clean_lines).strip()
                            pages_data.append({
                                "pageNumber": p_num,
                                "content": p_clean,
                                "length": len(p_clean)
                            })
                            all_text.append(p_clean)
                    
                    full_content = "\n\n--- Page Break ---\n\n".join(all_text)
                    doc_hash = get_hash(full_content)
                    topics = extract_topics(full_content)
                    
                    # Create document-level metadata
                    doc_record = {
                        "id": f"pdf-{doc_hash}",
                        "sourceType": "pdf",
                        "sourceUrl": rel_path,
                        "sourceTitle": doc_title,
                        "documentName": fname,
                        "contentType": "free_course_pdf",
                        "course": "Theories of Aging",
                        "courseCode": "FREE-TOA",
                        "subject": "Anti-Aging, Nutritional Biochemistry & Cellular Longevity",
                        "category": "Free Courses",
                        "instructor": "Dr. James Meschino, DC, MS, ROHP",
                        "pageCount": total_pages,
                        "topics": topics,
                        "contentHash": doc_hash,
                        "fileSizeBytes": os.path.getsize(pdf_path),
                        "summary": full_content[:400] + "..." if len(full_content) > 400 else full_content,
                        "pages": pages_data,
                        "fullText": full_content,
                        "createdAt": datetime.utcnow().isoformat() + "Z",
                        "updatedAt": datetime.utcnow().isoformat() + "Z"
                    }
                    
                    # Save individual document JSON
                    safe_name = re.sub(r'[^a-zA-Z0-9_\-]', '_', fname.replace('.pdf', ''))
                    doc_out_file = os.path.join(out_dir, f"{safe_name}.json")
                    with open(doc_out_file, 'w', encoding='utf-8') as df:
                        json.dump(doc_record, df, indent=2, ensure_ascii=False)
                    
                    # Also write compact summary for knowledge index (without full text to keep index agile)
                    index_record = {k: v for k, v in doc_record.items() if k not in ("pages", "fullText")}
                    index_record["pagePreviews"] = [
                        {"pageNumber": p["pageNumber"], "snippet": p["content"][:250]}
                        for p in pages_data[:5]
                    ]
                    processed_items.append(index_record)
                    print(f"  -> Extracted {total_pages} pages, {len(topics)} topics identified.")
            except Exception as e:
                print(f"Error reading {fname}: {e}")
    
    # Save combined index in data/free-courses/theories-of-aging-index.json
    free_course_index = os.path.join(free_courses_dir, "theories-of-aging-index.json")
    with open(free_course_index, 'w', encoding='utf-8') as f:
        json.dump(processed_items, f, indent=2, ensure_ascii=False)
    
    print(f"\nCompleted processing {len(processed_items)} Free Course PDFs.")
    return processed_items

if __name__ == "__main__":
    root = sys.argv[1] if len(sys.argv) > 1 else r"E:\OFFICE-TECHFORBS\GIMA-PWA-AI"
    process_all_pdfs(root)
