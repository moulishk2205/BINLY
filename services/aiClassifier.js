const axios = require('axios');
const config = require('../config/config');

class AIClassifier {
    async classifyWaste(imageData) {
        try {
            // In production, call ML service
            // For demo, return simulated classification
            
            if (config.mlService.url && process.env.NODE_ENV === 'production') {
                const response = await axios.post(`${config.mlService.url}/classify`, {
                    image: imageData
                });
                return response.data;
            }
            
            // Demo classification
            return this.simulateClassification();
        } catch (error) {
            console.error('Classification error:', error);
            // Fallback to simulation
            return this.simulateClassification();
        }
    }
    
    simulateClassification() {
        const categories = [
            {
                category: 'recyclable_plastic',
                subcategory: 'PET bottle',
                confidence: 94.5,
                disposalInstructions: [
                    'Clean and dry the plastic item',
                    'Remove any labels if possible',
                    'Place in the DRY/RECYCLABLE bin',
                    'This will be collected by your waste picker'
                ],
                compostingTip: null,
                hazardWarning: null
            },
            {
                category: 'wet_waste',
                subcategory: 'Vegetable scraps',
                confidence: 92.3,
                disposalInstructions: [
                    'Place in WET WASTE bin',
                    'Can be composted at home',
                    'Keep separate from dry waste'
                ],
                compostingTip: 'Excellent for home composting! Chop into small pieces for faster decomposition.',
                hazardWarning: null
            },
            {
                category: 'dry_waste',
                subcategory: 'Paper waste',
                confidence: 88.7,
                disposalInstructions: [
                    'Place in DRY WASTE bin',
                    'Can be recycled',
                    'Remove any plastic coating if present'
                ],
                compostingTip: null,
                hazardWarning: null
            },
            {
                category: 'ewaste',
                subcategory: 'Electronic device',
                confidence: 91.2,
                disposalInstructions: [
                    'DO NOT place in regular bins',
                    'Store separately for E-waste collection',
                    'Contact collector for special pickup',
                    'Contains valuable recyclable materials'
                ],
                compostingTip: null,
                hazardWarning: 'Contains hazardous materials. Requires special handling.'
            },
            {
                category: 'hazardous',
                subcategory: 'Battery',
                confidence: 96.8,
                disposalInstructions: [
                    'HAZARDOUS WASTE - Special handling required',
                    'Store in separate sealed container',
                    'Contact municipal authorities for disposal',
                    'Never throw in regular waste'
                ],
                compostingTip: null,
                hazardWarning: '⚠️ HAZARDOUS: Contains toxic materials that can contaminate soil and water'
            }
        ];
        
        // Return random category for demo
        const randomCategory = categories[Math.floor(Math.random() * categories.length)];
        
        return {
            ...randomCategory,
            timestamp: new Date().toISOString(),
            modelVersion: '1.0-demo'
        };
    }
    
    // Get waste category metadata
    getCategoryInfo(category) {
        const info = {
            wet_waste: {
                name: 'Wet Waste',
                description: 'Organic biodegradable waste',
                icon: '🍃',
                color: '#10b981'
            },
            dry_waste: {
                name: 'Dry Waste',
                description: 'Non-biodegradable recyclable waste',
                icon: '🗑️',
                color: '#3b82f6'
            },
            recyclable_plastic: {
                name: 'Recyclable Plastic',
                description: 'Plastic items that can be recycled',
                icon: '♻️',
                color: '#f59e0b'
            },
            recyclable_paper: {
                name: 'Recyclable Paper',
                description: 'Paper and cardboard items',
                icon: '📄',
                color: '#8b5cf6'
            },
            recyclable_metal: {
                name: 'Recyclable Metal',
                description: 'Metal items and containers',
                icon: '🔩',
                color: '#6b7280'
            },
            ewaste: {
                name: 'E-Waste',
                description: 'Electronic waste requiring special handling',
                icon: '🔌',
                color: '#ef4444'
            },
            hazardous: {
                name: 'Hazardous Waste',
                description: 'Toxic waste requiring careful disposal',
                icon: '⚠️',
                color: '#dc2626'
            }
        };
        
        return info[category] || info.dry_waste;
    }
}

module.exports = new AIClassifier();