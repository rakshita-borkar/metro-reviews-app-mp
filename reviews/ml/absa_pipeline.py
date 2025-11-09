from transformers import AutoTokenizer, AutoModelForSequenceClassification
import torch, pandas as pd, os

class ABSAPipeline:
    def __init__(self):
        base_dir = os.path.join(os.path.dirname(__file__), "deberta_absa_model")
        self.device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
        self.tokenizer = AutoTokenizer.from_pretrained(base_dir)
        # handles model.safetensors automatically
        self.model = AutoModelForSequenceClassification.from_pretrained(base_dir).to(self.device)

        # read labels (Excel or CSV)
        label_path = os.path.join(base_dir, "labels.csv")
        if not os.path.exists(label_path):
            # if you named it differently (like just "labels"), fix here
            label_path = os.path.join(base_dir, "labels")
        self.labels = pd.read_csv(label_path, header=None)[0].tolist()

    def predict(self, text, aspect=None):
        self.model.eval()
        if aspect:
            inputs = self.tokenizer(text, aspect, return_tensors="pt",
                                    truncation=True, padding=True, max_length=128)
        else:
            inputs = self.tokenizer(text, return_tensors="pt",
                                    truncation=True, padding=True, max_length=128)
        inputs = {k: v.to(self.device) for k, v in inputs.items()}
        with torch.no_grad():
            outputs = self.model(**inputs)
            idx = torch.argmax(outputs.logits, dim=1).item()
        return self.labels[idx]
