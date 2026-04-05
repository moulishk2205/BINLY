import numpy as np
from PIL import Image
import random

class WasteClassifier:
    def __init__(self):
        self.categories = [
            {
                'category': 'wet_waste',
                'subcategory': 'Vegetable scraps',
                'disposal_instructions': [
                    'Place in WET WASTE bin',
                    'Can be composted at home',
                    'Keep separate from dry waste'
                ],
                'composting_tip': 'Excellent for home composting! Chop into small pieces for faster decomposition.',
                'hazard_warning': None
            },
            {
                'category': 'dry_waste',
                'subcategory': 'Paper waste',
                'disposal_instructions': [
                    'Place in DRY WASTE bin',
                    'Can be recycled',
                    'Remove any plastic coating if present'
                ],
                'composting_tip': None,
                'hazard_warning': None
            },
            {
                'category': 'recyclable_plastic',
                'subcategory': 'PET bottle',
                'disposal_instructions': [
                    'Clean and dry the plastic item',
                    'Remove any labels if possible',
                    'Place in the DRY/RECYCLABLE bin',
                    'This will be collected by your waste picker'
                ],
                'composting_tip': None,
                'hazard_warning': None
            },
            {
                'category': 'recyclable_metal',
                'subcategory': 'Aluminum can',
                'disposal_instructions': [
                    'Rinse the container',
                    'Crush if possible to save space',
                    'Place in RECYCLABLE bin',
                    'High value recyclable material'
                ],
                'composting_tip': None,
                'hazard_warning': None
            },
            {
                'category': 'ewaste',
                'subcategory': 'Electronic device',
                'disposal_instructions': [
                    'DO NOT place in regular bins',
                    'Store separately for E-waste collection',
                    'Contact collector for special pickup',
                    'Contains valuable recyclable materials'
                ],
                'composting_tip': None,
                'hazard_warning': 'Contains hazardous materials. Requires special handling.'
            },
            {
                'category': 'hazardous',
                'subcategory': 'Battery',
                'disposal_instructions': [
                    'HAZARDOUS WASTE - Special handling required',
                    'Store in separate sealed container',
                    'Contact municipal authorities for disposal',
                    'Never throw in regular waste'
                ],
                'composting_tip': None,
                'hazard_warning': '⚠️ HAZARDOUS: Contains toxic materials that can contaminate soil and water'
            }
        ]
        
        print("✓ Waste Classifier Model loaded (Demo Mode)")
    
    def preprocess_image(self, image):
        """Preprocess image for classification"""
        image = image.resize((224, 224))
        
        img_array = np.array(image)
        
        img_array = img_array / 255.0
        
        return img_array
    
    def predict(self, image):
        """Predict waste category"""
        processed = self.preprocess_image(image)
        
        category = random.choice(self.categories)
        confidence = random.uniform(85.0, 98.0)
        
        return {
            **category,
            'confidence': round(confidence, 1),
            'model_version': '1.0-demo',
            'timestamp': None
        }
    
    def get_category_info(self, category_name):
        """Get detailed info about a waste category"""
        for cat in self.categories:
            if cat['category'] == category_name:
                return cat
        return None
    

