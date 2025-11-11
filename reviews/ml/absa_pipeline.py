# reviews/ml/absa_pipeline.py
from transformers import AutoTokenizer, AutoModelForSequenceClassification 
import torch, pandas as pd, os
from collections import defaultdict

class ABSAPipeline:
    def __init__(self):
        base_dir = os.path.join(os.path.dirname(__file__), "deberta_absa_model")
        self.device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
        self.tokenizer = AutoTokenizer.from_pretrained(base_dir)
        self.model = AutoModelForSequenceClassification.from_pretrained(base_dir).to(self.device)
        label_path = os.path.join(base_dir, "labels.csv")
        self.labels = pd.read_csv(label_path, header=None)[0].tolist()

    def predict(self, text, aspect=None):
        self.model.eval()
        if aspect:
            inputs = self.tokenizer(text, aspect, return_tensors="pt", truncation=True, padding=True, max_length=128)
        else:
            inputs = self.tokenizer(text, return_tensors="pt", truncation=True, padding=True, max_length=128)
        inputs = {k: v.to(self.device) for k, v in inputs.items()}
        with torch.no_grad():
            outputs = self.model(**inputs)
            idx = torch.argmax(outputs.logits, dim=1).item()
        return self.labels[idx]

# initialize once
absa = ABSAPipeline()

def get_aspect_sentiments(texts, aspects=None):
    if aspects is None:
        aspects = ["Cleanliness", "Crowd", "Facilities", "Safety", "Service"]
    
    # Limit processing to avoid timeout - process max 50 reviews
    # This significantly speeds up the response
    if len(texts) > 50:
        texts = texts[:50]
    
    aspect_scores = defaultdict(lambda: {"Positive": 0, "Negative": 0, "Neutral": 0, "count": 0})
    for text in texts:
        if not text or not text.strip():
            continue
        for aspect in aspects:
            try:
                label = absa.predict(text, aspect)
                # Normalize label to match dictionary keys (capitalize first letter)
                # Handle edge cases: "0", empty string, or unexpected labels
                if not label or label == "0":
                    label = "Neutral"
                else:
                    label = label.capitalize()
                    # Map to expected labels
                    if label not in ["Positive", "Negative", "Neutral"]:
                        label = "Neutral"  # Default to Neutral for unknown labels
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
