class RecipeAI {
    constructor() {
        this.apiKey = 'AIzaSyDJK3y2WY_Sgs0uPz4NZn9QccvSlDGKtSU'; 
    }

    async generateRecipe(ingredients, dietary = '', cuisine = '') {
        const prompt = `Create a detailed recipe using these ingredients: ${ingredients}. 
        Dietary restrictions: ${dietary}. 
        Cuisine preference: ${cuisine}. 
        Format: JSON with title, ingredients, instructions, prep_time, cook_time, servings.`;

        try {
            const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${this.apiKey}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    contents: [{
                        parts: [{
                            text: prompt
                        }]
                    }]
                })
            });

            const data = await response.json();
            const recipeText = data.candidates[0].content.parts[0].text;
            
            // Extract JSON from response
            const jsonMatch = recipeText.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
                return JSON.parse(jsonMatch[0]);
            }
            
            return null;
        } catch (error) {
            console.error('AI Recipe Generation Error:', error);
            return null;
        }
    }

    async analyzeImage(imageBase64) {
        const prompt = "Identify all food ingredients in this image. Return as comma-separated list.";

        try {
            const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-pro-vision:generateContent?key=${this.apiKey}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    contents: [{
                        parts: [
                            { text: prompt },
                            {
                                inline_data: {
                                    mime_type: "image/jpeg",
                                    data: imageBase64
                                }
                            }
                        ]
                    }]
                })
            });

            const data = await response.json();
            return data.candidates[0].content.parts[0].text;
        } catch (error) {
            console.error('Image Analysis Error:', error);
            return null;
        }
    }

    async saveRecipe(recipe) {
        try {
            // Initialize Firestore if not already done
            if (!window.db) {
                window.db = firebase.firestore();
            }
            
            await window.db.collection('recipes').add({
                ...recipe,
                createdAt: new Date(),
                likes: 0
            });
            return true;
        } catch (error) {
            console.error('Save Recipe Error:', error);
            return false;
        }
    }
}

// Make available globally
window.RecipeAI = RecipeAI;
