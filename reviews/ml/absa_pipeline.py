# reviews/ml/absa_pipeline.py
from transformers import AutoTokenizer, AutoModelForSequenceClassification 
import torch, pandas as pd, os
from collections import defaultdict

# =======================
# Aspects Keywords Dictionary
# =======================
ASPECTS_KEYWORDS = {
    "Metro Station Connectivity": [
        # Core terms
        "connectivity", "connect", "connected", "connecting", "link", "linked", "linking", "reach", "accessible",
        "interchange", "transfer", "junction", "hub", "integration", "integrated", "access", "connection",
        "seamless", "direct", "cross", "bridge", "mesh", "grid", "unified", "intersect", "intersection"
    ],

    "Metro station infrastructure": [
        # Core terms
        "infrastructure", "facility", "facilities", "platform", "lift", "elevator", "escalator", "washroom",
        "toilet", "restroom", "parking", "seating", "waiting", "amenities", "shelter", "canopy",
        "lighting", "ventilation", "AC", "air-conditioning", "CCTV", "security", "accessibility",
        "wheelchair", "disabled", "braille", "tactile", "kiosk", "display", "announcement", "retail",
        "ATM", "water", "charging", "design", "architecture", "modern", "upgrade", "maintenance"
    ],

    "General Safety": [
        # Core terms
        "safety", "safe", "secure", "security", "accident", "hazard", "danger", "dangerous", "risk",
        "risky", "protection", "emergency", "fire", "surveillance", "monitoring", "CCTV", "patrol",
        "guard", "equipment", "protocol", "measures", "guidelines", "audit", "inspection", "alert",
        "warning", "panic", "exit", "response", "management", "prevention", "awareness", "training"
    ],

    "Crowd management": [
        # Core terms
        "crowd", "crowded", "overcrowded", "packed", "congestion", "congested", "density", "rush",
        "peak", "management", "control", "flow", "handling", "dispersal", "distribution", "monitoring",
        "bottleneck", "choke", "surge", "pressure", "jam-packed", "sardine", "capacity", "load",
        "analytics", "counting", "optimization", "dynamics", "stampede", "mass",  "boarding", "behavior", "behaviour", "commuter", "commuters", "passenger", "passengers", "queue",
        "discipline", "etiquette", "pushing", "rush"
    ],

    "Ticketing system": [
        # Core terms
        "ticketing", "ticket", "tickets", "machine", "token", "tokens", "automated", "system",
        "validation", "collection", "gate", "gates", "barrier", "barriers", "turnstile", "entry",
        "exit", "pass", "recharge", "top-up", "vending", "counter", "booth", "kiosk"
    ],

    "Women's Safety": [
        # Core terms
        "women", "woman", "female", "ladies", "girl", "girls", "safety", "harassment", "unsafe",
        "security", "molestation", "assault", "abuse", "threat", "intimidation", "stalking",
        "catcalling", "inappropriate", "uncomfortable", "vulnerable", "protection", "safe",
        "travel", "commute", "commuting", "coach", "compartment", "reserved", "dedicated"
    ],

    "Metro frequency": [
        # Core terms
        "frequency", "frequent", "interval", "gap", "time", "timing", "timings", "schedule", "scheduled",
        "arrival", "departure", "wait", "waiting", "delay", "punctual", "on-time", "regular",
        "irregular", "consistent", "inconsistent", "headway", "service", "operation", "running",
        "timetable", "minutes", "seconds", "hours", "peak", "off-peak", "non-peak"
    ],

    "Staff behavior": [
        # Core terms
        "staff", "employee", "employees", "personnel", "worker", "workers", "conductor", "driver",
        "security", "guard", "officer", "behavior", "behaviour", "attitude", "helpful", "rude",
        "polite", "courteous", "friendly", "unfriendly", "assistance", "help", "support", "service",
        "customer", "professional", "unprofessional", "conduct", "manner", "response", "interaction"
    ],

    "Cleanliness": [
        # Core terms
        "clean", "cleanliness", "dirty", "filthy", "garbage", "trash", "litter", "waste", "hygiene",
        "hygienic", "unhygienic", "dusty", "dust", "tidy", "untidy", "neat", "mess", "messy",
        "sanitation", "sanitized", "maintained", "maintenance", "housekeeping", "cleaning",
        "sweeping", "mopping", "spotless", "pristine", "fresh", "stale", "odor", "smell"
    ],
}

class ABSAPipeline:
    def __init__(self):
        base_dir = os.path.join(os.path.dirname(__file__), "deberta_absa_model")
        self.device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
        self.tokenizer = AutoTokenizer.from_pretrained(base_dir)
        self.model = AutoModelForSequenceClassification.from_pretrained(base_dir).to(self.device)
        label_path = os.path.join(base_dir, "labels.csv")
        labels = pd.read_csv(label_path, header=None).squeeze()
        # Remove any empty or numeric entries, keep only alphabetic labels
        self.labels = [str(l).strip() for l in labels if str(l).strip() and str(l).strip().isalpha()]

    def detect_aspects(self, text):
        """Rule-based aspect detection using keywords"""
        text_lower = text.lower()
        matched = []
        for aspect, keywords in ASPECTS_KEYWORDS.items():
            for kw in keywords:
                if kw.lower() in text_lower:
                    matched.append(aspect)
                    break
        if not matched:
            matched.append("General")
        return matched

    def predict_aspect_sentiment(self, text, aspect):
        """Aspect-specific sentiment prediction"""
        self.model.eval()
        inputs = self.tokenizer(
            text, aspect,
            padding=True,
            truncation=True,
            max_length=128,
            return_tensors="pt"
        ).to(self.device)
        
        with torch.no_grad():
            outputs = self.model(**inputs)
            idx = torch.argmax(outputs.logits, dim=1).item()
        return self.labels[idx]

# initialize once
absa = ABSAPipeline()

def get_aspect_sentiments(texts, aspects=None):
    if aspects is None:
        aspects = list(ASPECTS_KEYWORDS.keys())
    
    # Limit processing to avoid timeout - process max 50 reviews
    # This significantly speeds up the response
    if len(texts) > 50:
        texts = texts[:50]
    
    aspect_scores = defaultdict(lambda: {"Positive": 0, "Negative": 0, "Neutral": 0, "count": 0})
    
    for text in texts:
        if not text or not text.strip():
            continue
        
        # Detect aspects in the text using keyword matching
        detected_aspects = absa.detect_aspects(text)
        
        # Predict sentiment for each detected aspect
        for aspect in detected_aspects:
            try:
                label = absa.predict_aspect_sentiment(text, aspect)
                # Normalize label to match dictionary keys
                if not label or label == "0":
                    label = "Neutral"
                else:
                    label = str(label).strip().capitalize()
                    # Map to expected labels
                    if label not in ["Positive", "Negative", "Neutral"]:
                        label = "Neutral"
                
                aspect_scores[aspect][label] += 1
                aspect_scores[aspect]["count"] += 1
            except Exception as e:
                # If ML prediction fails, default to Neutral to avoid breaking the API
                aspect_scores[aspect]["Neutral"] += 1
                aspect_scores[aspect]["count"] += 1
    
    result = {}
    for aspect, scores in aspect_scores.items():
        total = scores["count"]
        if total == 0:
            continue
        pos_pct = int(scores["Positive"] / total * 100)
        neg_pct = int(scores["Negative"] / total * 100)
        neut_pct = int(scores["Neutral"] / total * 100)
        dominant = max(["Positive", "Negative", "Neutral"], key=lambda x: scores[x])
        result[aspect] = {
            "sentiment": dominant,
            "percentage": pos_pct if dominant=="Positive" else neg_pct if dominant=="Negative" else neut_pct,
            "trend": "stable"
        }
    return result
