import os
import sys
import json
import re
import hashlib
import urllib.request
import urllib.parse
from datetime import datetime
from bs4 import BeautifulSoup

USER_AGENT = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'

def get_hash(text: str) -> str:
    return hashlib.sha256(text.encode('utf-8')).hexdigest()[:12]

def fetch_url(url: str) -> str:
    req = urllib.request.Request(url, headers={'User-Agent': USER_AGENT})
    try:
        with urllib.request.urlopen(req, timeout=15) as resp:
            return resp.read().decode('utf-8', errors='ignore')
    except Exception as e:
        print(f"Error fetching {url}: {e}")
        return ""

def clean_text(text: str) -> str:
    if not text:
        return ""
    text = re.sub(r'\s+', ' ', text)
    return text.strip()

def extract_topics(text: str):
    keywords = [
        "ROHP", "RNCP", "Orthomolecular Medicine", "Clinical Nutrition", 
        "Sports Nutrition", "Functional Medicine", "Dr. James Meschino",
        "Metabolism", "Theories of Aging", "Neurology", "Metabolic Diseases",
        "Systemic Health", "Reproductive Health", "Weight Management", 
        "Cancer Prevention", "Gastrointestinal Diseases", "Functional Assessment",
        "Assessment Toolkit", "Brain Development", "Omega-3", "CoQ10", 
        "Glutathione", "Melatonin", "Antioxidants", "Free Radicals",
        "Cardiovascular Health", "Diabetes Management", "Immune System",
        "Healthcare Professionals", "Chiropractors", "Nurses", "Continuing Education"
    ]
    found = []
    text_lower = text.lower()
    for kw in keywords:
        if kw.lower() in text_lower:
            found.append(kw)
    return found

def run_site_ingestion(root_dir: str):
    data_dir = os.path.join(root_dir, "data")
    site_dir = os.path.join(data_dir, "processed", "site")
    sitemap_dir = os.path.join(data_dir, "site-map")
    assets_dir = os.path.join(data_dir, "assets")
    knowledge_dir = os.path.join(data_dir, "knowledge")
    
    os.makedirs(site_dir, exist_ok=True)
    os.makedirs(sitemap_dir, exist_ok=True)
    os.makedirs(assets_dir, exist_ok=True)
    os.makedirs(knowledge_dir, exist_ok=True)
    
    # Authoritative URLs to index comprehensively
    core_urls = [
        {"url": "https://gim-academy.com/", "type": "page", "category": "Home", "title": "GIMA Homepage"},
        {"url": "https://gim-academy.com/rohp-certification/", "type": "program", "category": "ROHP Certification", "title": "ROHP / RNCP Qualifying Program"},
        {"url": "https://gim-academy.com/101-course-details/", "type": "course", "category": "Core Curriculum", "course": "Course 101", "title": "Course 101: Essentials of Metabolism and Theories of Aging"},
        {"url": "https://gim-academy.com/102-course-details/", "type": "course", "category": "Core Curriculum", "course": "Course 102", "title": "Course 102: Nutritional Medicine in Neurology"},
        {"url": "https://gim-academy.com/103-course-details/", "type": "course", "category": "Core Curriculum", "course": "Course 103", "title": "Course 103: Nutritional Medicine In Metabolic Diseases"},
        {"url": "https://gim-academy.com/104-course-details/", "type": "course", "category": "Core Curriculum", "course": "Course 104", "title": "Course 104: Nutritional Medicine in Systemic Health Problems"},
        {"url": "https://gim-academy.com/105-course-details/", "type": "course", "category": "Core Curriculum", "course": "Course 105", "title": "Course 105: Nutritional Medicine in Reproductive Health, Weight Management and Sports Nutrition"},
        {"url": "https://gim-academy.com/106-course-details/", "type": "course", "category": "Core Curriculum", "course": "Course 106", "title": "Course 106: Nutritional Medicine in Cancer, Gastrointestinal Diseases and Functional Assessment"},
        {"url": "https://gim-academy.com/free-courses/", "type": "free_courses_index", "category": "Free Courses", "title": "Free Online Nutrition Courses"},
        {"url": "https://gim-academy.com/theories-of-aging-course-details/", "type": "free_course", "category": "Free Courses", "course": "Theories of Aging", "title": "Free Course: Theories of Aging"},
        {"url": "https://gim-academy.com/nutritional-medicine-in-brain-development-course-details/", "type": "free_course", "category": "Free Courses", "course": "Nutritional Medicine in Brain Development", "title": "Free Course: Nutritional Medicine in Brain Development"},
        {"url": "https://gim-academy.com/about/", "type": "about", "category": "Brand", "title": "About Global Integrative Medicine Academy"},
        {"url": "https://gim-academy.com/faqs/", "type": "faqs", "category": "Support", "title": "Frequently Asked Questions"},
        {"url": "https://gim-academy.com/nutrition-certification-for-healthcare-professionals/", "type": "audience_page", "category": "Specialization", "title": "Nutrition Certification for Healthcare Professionals"},
        {"url": "https://gim-academy.com/nutrition-certification-for-chiropractors/", "type": "audience_page", "category": "Specialization", "title": "Nutrition Certification for Chiropractors"},
        {"url": "https://gim-academy.com/nutrition-certification-for-nurses/", "type": "audience_page", "category": "Specialization", "title": "Nutrition Certification for Nurses"},
        {"url": "https://gim-academy.com/assessment-toolkit/", "type": "resource", "category": "Clinical Resources", "title": "Assessment Toolkit for Healthcare Professionals"}
    ]
    
    # Also fetch selected high-impact blog articles from the live site
    sample_blogs = [
        "https://gim-academy.com/blog/three-important-anti-aging-supplements/",
        "https://gim-academy.com/blog/five-important-anti-aging-supplements-to-consider-after-age-35/",
        "https://gim-academy.com/blog/reishi-mushroom-extract-and-immune-support/",
        "https://gim-academy.com/blog/natural-heavy-metal-detoxification-a-review/",
        "https://gim-academy.com/blog/higher-omega-3-fat-status-linked-to-better-brain-blood-flow/",
        "https://gim-academy.com/blog/compelling-data-about-diabetes-and-lifestyle-management/",
        "https://gim-academy.com/blog/vitamin-d-and-omega-3-fats-in-the-prevention-of-depression/",
        "https://gim-academy.com/blog/how-melatonin-benefits-the-human-body/",
        "https://gim-academy.com/blog/health-benefits-of-coq10-supplementation/",
        "https://gim-academy.com/blog/lifestyle-change-shown-to-reverse-aging-of-our-cells/"
    ]
    
    for b_url in sample_blogs:
        b_slug = b_url.strip('/').split('/')[-1]
        b_title = b_slug.replace('-', ' ').title()
        core_urls.append({
            "url": b_url,
            "type": "blog",
            "category": "Clinical Research Blog",
            "title": b_title
        })
    
    discovered_routes = []
    registered_assets = []
    knowledge_items = []
    
    # Standard GIMA Brand Assets discovered
    default_brand_assets = [
        {
            "id": "asset-logo-main",
            "name": "GIMA Official Logo",
            "category": "Logos",
            "url": "https://gim-academy.com/wp-content/uploads/2023/11/GLOBAL_IMA_LOGO_ALT_ALT-1-1600x362-1.png",
            "aspectRatio": "16:4",
            "description": "Primary high-resolution Global Integrative Medicine Academy logo with gold emblem and deep navy typography."
        },
        {
            "id": "asset-favicon",
            "name": "GIMA Emblem Favicon",
            "category": "Logos",
            "url": "https://gim-academy.com/wp-content/uploads/2023/11/gima-favicon.png",
            "aspectRatio": "1:1",
            "description": "Square official GIMA emblem icon (192x192)."
        },
        {
            "id": "asset-instructor-dr-meschino",
            "name": "Dr. James Meschino (Lead Instructor)",
            "category": "Instructor imagery",
            "url": "https://gim-academy.com/wp-content/plugins/gima-course-details/assets/images/dr-meschino.png",
            "aspectRatio": "1:1",
            "description": "Dr. James Meschino, DC, MS, ROHP - Academic Director and Lead Faculty for GIMA ROHP Certification."
        },
        {
            "id": "asset-online-training",
            "name": "Online Clinical Training Banner",
            "category": "Course imagery",
            "url": "https://gim-academy.com/wp-content/plugins/gima-course-details/assets/images/Online-Training.jpg",
            "aspectRatio": "16:9",
            "description": "Professional training banner featuring clinical healthcare practitioner engaging with digital learning."
        }
    ]
    registered_assets.extend(default_brand_assets)
    
    print(f"Ingesting {len(core_urls)} authoritative public routes...")
    
    for item in core_urls:
        url = item["url"]
        print(f"Crawling: {url}")
        html = fetch_url(url)
        if not html:
            continue
        
        soup = BeautifulSoup(html, 'html.parser')
        
        # Remove scripts, styles
        for tag in soup(['script', 'style', 'noscript', 'svg']):
            tag.decompose()
        
        h1 = soup.find('h1')
        page_title = h1.get_text(strip=True) if h1 else item.get("title", "")
        
        # Meta description
        meta_desc = ""
        meta_tag = soup.find('meta', attrs={'name': 'description'})
        if meta_tag and meta_tag.get('content'):
            meta_desc = meta_tag['content'].strip()
        
        # Collect headings
        headings = []
        for h in soup.find_all(['h2', 'h3', 'h4']):
            htxt = clean_text(h.get_text())
            if htxt and len(htxt) < 150 and htxt not in headings:
                headings.append(htxt)
        
        # Main text content extraction
        # Focus on entry-content, post-content, or main container
        content_elem = soup.find(['article', 'main']) or soup.find(class_=re.compile(r'(content|elementor-section-wrap|post)'))
        if content_elem:
            raw_text = content_elem.get_text(separator=' ', strip=True)
        else:
            raw_text = soup.body.get_text(separator=' ', strip=True) if soup.body else ""
        
        clean_body = clean_text(raw_text)
        content_hash = get_hash(clean_body)
        topics = extract_topics(clean_body + " " + page_title)
        
        # Collect images from page
        for img in soup.find_all('img'):
            src = img.get('src') or img.get('data-src')
            alt = img.get('alt') or page_title
            if src and src.startswith('http') and not any(x in src.lower() for x in ['gravatar', 'pixel', 'analytics', 'emoji', 'common-icon']):
                asset_id = f"asset-{get_hash(src)}"
                if not any(a["id"] == asset_id for a in registered_assets):
                    category = "Course imagery" if "course" in url else ("Instructor imagery" if "instructor" in src.lower() or "meschino" in src.lower() else "Website imagery")
                    registered_assets.append({
                        "id": asset_id,
                        "name": alt[:60],
                        "category": category,
                        "url": src,
                        "sourceUrl": url,
                        "description": f"Extracted from {page_title}"
                    })
        
        doc_record = {
            "id": f"web-{content_hash}",
            "sourceType": "website",
            "sourceUrl": url,
            "sourceTitle": page_title,
            "metaDescription": meta_desc,
            "contentType": item.get("type", "page"),
            "category": item.get("category", "General"),
            "course": item.get("course", None),
            "headings": headings[:12],
            "topics": topics,
            "contentHash": content_hash,
            "summary": clean_body[:500] + "..." if len(clean_body) > 500 else clean_body,
            "bodyLength": len(clean_body),
            "createdAt": datetime.utcnow().isoformat() + "Z",
            "updatedAt": datetime.utcnow().isoformat() + "Z"
        }
        
        # Save individual page json
        slug = url.strip('/').split('/')[-1] or "home"
        safe_slug = re.sub(r'[^a-zA-Z0-9_\-]', '_', slug)
        with open(os.path.join(site_dir, f"{safe_slug}.json"), 'w', encoding='utf-8') as f:
            json.dump(doc_record, f, indent=2, ensure_ascii=False)
        
        knowledge_items.append(doc_record)
        discovered_routes.append({
            "url": url,
            "title": page_title,
            "type": item["type"],
            "category": item["category"],
            "hash": content_hash
        })
    
    # Save routes index
    with open(os.path.join(sitemap_dir, "routes.json"), 'w', encoding='utf-8') as f:
        json.dump(discovered_routes, f, indent=2, ensure_ascii=False)
        
    # Save asset registry
    with open(os.path.join(assets_dir, "asset-registry.json"), 'w', encoding='utf-8') as f:
        json.dump(registered_assets, f, indent=2, ensure_ascii=False)
        
    # Save site knowledge index
    with open(os.path.join(knowledge_dir, "site-knowledge-index.json"), 'w', encoding='utf-8') as f:
        json.dump(knowledge_items, f, indent=2, ensure_ascii=False)
        
    print(f"\nSite ingestion complete: {len(knowledge_items)} pages indexed, {len(registered_assets)} assets registered.")

if __name__ == "__main__":
    root = sys.argv[1] if len(sys.argv) > 1 else r"E:\OFFICE-TECHFORBS\GIMA-PWA-AI"
    run_site_ingestion(root)
