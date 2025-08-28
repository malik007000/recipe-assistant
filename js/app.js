import { RecipeAI } from './ai-functions.js';

class RecipeApp {
    constructor() {
        this.ai = new RecipeAI();
        this.currentRecipe = null;
        this.init();
    }

    init() {
        this.createUI();
        this.bindEvents();
        this.addAnimations();
    }

    createUI() {
        const app = document.getElementById('app');
        app.innerHTML = `
            <header class="header">
                <nav class="nav container">
                    <div class="logo">Recipe Assistant AI</div>
                    <button class="btn btn-secondary" id="savedRecipes">
                        <i data-lucide="bookmark"></i>
                        Saved Recipes
                    </button>
                </nav>
            </header>

            <main class="container" style="margin-top: 40px;">
                <div class="hero-section fade-in" style="text-align: center; margin-bottom: 60px;">
                    <h1 style="font-size: 3rem; margin-bottom: 16px; color: var(--text);">
                        AI-Powered Recipe Generator
                    </h1>
                    <p style="font-size: 1.2rem; color: var(--secondary); max-width: 600px; margin: 0 auto;">
                        Transform your available ingredients into delicious meals with AI assistance
                    </p>
                </div>

                <div class="grid grid-2">
                    <div class="card slide-in">
                        <h3 style="margin-bottom: 20px; display: flex; align-items: center; gap: 8px;">
                            <i data-lucide="edit-3"></i>
                            Enter Ingredients
                        </h3>
                        
                        <div class="input-group">
                            <input type="text" class="input" id="ingredients" 
                                   placeholder="e.g., chicken, tomatoes, basil, pasta">
                        </div>

                        <div class="input-group">
                            <input type="text" class="input" id="dietary" 
                                   placeholder="Dietary restrictions (optional)">
                        </div>

                        <div class="input-group">
                            <select class="input" id="cuisine">
                                <option value="">Any cuisine</option>
                                <option value="italian">Italian</option>
                                <option value="mexican">Mexican</option>
                                <option value="asian">Asian</option>
                                <option value="mediterranean">Mediterranean</option>
                            </select>
                        </div>

                        <button class="btn btn-primary ripple-effect" id="generateBtn" style="width: 100%;">
                            <i data-lucide="chef-hat"></i>
                            Generate Recipe
                        </button>
                    </div>

                    <div class="card slide-in">
                        <h3 style="margin-bottom: 20px; display: flex; align-items: center; gap: 8px;">
                            <i data-lucide="camera"></i>
                            Or Upload Image
                        </h3>
                        
                        <div class="upload-area" id="uploadArea" style="
                            border: 2px dashed #E2E8F0;
                            border-radius: var(--border-radius);
                            padding: 40px;
                            text-align: center;
                            cursor: pointer;
                            transition: var(--transition);
                        ">
                            <i data-lucide="upload" style="width: 48px; height: 48px; color: var(--secondary); margin-bottom: 16px;"></i>
                            <p style="color: var(--secondary);">Click to upload ingredient photo</p>
                            <input type="file" id="imageInput" accept="image/*" style="display: none;">
                        </div>
                    </div>
                </div>

                <div id="recipeResult" class="card" style="margin-top: 40px; display: none;">
                    <!-- Recipe will be displayed here -->
                </div>

                <div id="loading" class="card" style="margin-top: 40px; display: none; text-align: center;">
                    <div class="loading-spinner" style="margin: 0 auto 16px;"></div>
                    <p>AI is creating your perfect recipe...</p>
                </div>
            </main>
        `;

        // Initialize Lucide icons
        lucide.createIcons();
    }

    bindEvents() {
        // Generate recipe button
        document.getElementById('generateBtn').addEventListener('click', () => {
            this.generateRecipe();
        });

        // Image upload
        const uploadArea = document.getElementById('uploadArea');
        const imageInput = document.getElementById('imageInput');

        uploadArea.addEventListener('click', () => imageInput.click());
        uploadArea.addEventListener('dragover', (e) => {
            e.preventDefault();
            uploadArea.style.borderColor = 'var(--primary)';
        });
        uploadArea.addEventListener('dragleave', () => {
            uploadArea.style.borderColor = '#E2E8F0';
        });
        
        imageInput.addEventListener('change', (e) => {
            this.handleImageUpload(e.target.files[0]);
        });
    }

    async generateRecipe() {
        const ingredients = document.getElementById('ingredients').value.trim();
        if (!ingredients) return;

        this.showLoading(true);

        const dietary = document.getElementById('dietary').value;
        const cuisine = document.getElementById('cuisine').value;

        const recipe = await this.ai.generateRecipe(ingredients, dietary, cuisine);
        
        this.showLoading(false);
        
        if (recipe) {
            this.displayRecipe(recipe);
            this.currentRecipe = recipe;
        } else {
            this.showError('Failed to generate recipe. Please try again.');
        }
    }

    async handleImageUpload(file) {
        if (!file) return;

        const reader = new FileReader();
        reader.onload = async (e) => {
            const base64 = e.target.result.split(',')[1];
            this.showLoading(true);

            const ingredients = await this.ai.analyzeImage(base64);
            this.showLoading(false);

            if (ingredients) {
                document.getElementById('ingredients').value = ingredients;
                this.generateRecipe();
            }
        };
        reader.readAsDataURL(file);
    }

    displayRecipe(recipe) {
        const resultDiv = document.getElementById('recipeResult');
        resultDiv.innerHTML = `
            <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 24px;">
                <h2 style="color: var(--text); flex: 1;">${recipe.title}</h2>
                <button class="btn btn-primary" id="saveRecipe">
                    <i data-lucide="heart"></i>
                    Save Recipe
                </button>
            </div>

            <div class="grid grid-2" style="margin-bottom: 24px;">
                <div>
                    <p><strong>Prep Time:</strong> ${recipe.prep_time}</p>
                    <p><strong>Cook Time:</strong> ${recipe.cook_time}</p>
                </div>
                <div>
                    <p><strong>Servings:</strong> ${recipe.servings}</p>
                </div>
            </div>

            <div class="grid grid-2">
                <div>
                    <h4 style="margin-bottom: 12px; color: var(--primary);">Ingredients</h4>
                    <ul style="list-style: none; padding: 0;">
                        ${recipe.ingredients.map(ing => `
                            <li style="padding: 8px 0; border-bottom: 1px solid #F1F5F9;">
                                <i data-lucide="check" style="width: 16px; height: 16px; color: var(--accent);"></i>
                                ${ing}
                            </li>
                        `).join('')}
                    </ul>
                </div>
                <div>
                    <h4 style="margin-bottom: 12px; color: var(--primary);">Instructions</h4>
                    <ol style="padding-left: 20px;">
                        ${recipe.instructions.map(step => `
                            <li style="padding: 8px 0; line-height: 1.6;">${step}</li>
                        `).join('')}
                    </ol>
                </div>
            </div>
        `;

        resultDiv.style.display = 'block';
        resultDiv.classList.add('fade-in');
        lucide.createIcons();

        // Save recipe event
        document.getElementById('saveRecipe').addEventListener('click', async () => {
            const saved = await this.ai.saveRecipe(recipe);
            if (saved) {
                this.showSuccess('Recipe saved successfully!');
            }
        });
    }

    showLoading(show) {
        const loading = document.getElementById('loading');
        loading.style.display = show ? 'block' : 'none';
    }

    showError(message) {
        // Implement toast notification
        console.error(message);
    }

    showSuccess(message) {
        // Implement toast notification
        console.log(message);
    }

    addAnimations() {
        // Intersection Observer for scroll animations
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('fade-in');
                }
            });
        });

        document.querySelectorAll('.card').forEach(card => {
            observer.observe(card);
        });
    }
}

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new RecipeApp();
});
