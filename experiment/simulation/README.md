# Vision Transformer (ViT) Virtual Lab Demo

This folder contains a clean, self-contained demo of the Vision Transformer experiment for DEI DL Virtual Labs.

## Structure

```
demo/
├── index.html           # Landing page - start here
├── notebook/            # Interactive notebook experiment
│   ├── index.html
│   ├── css/
│   ├── js/
│   └── data/
└── simulation/          # Visual simulations
    ├── index.html
    ├── script.js
    ├── style.css
    └── assets/
```

## Getting Started

1. **Open the landing page**: Open `demo/index.html` in your browser
2. **Choose your path**:
   - **Interactive Notebook**: Step through the ViT training process with different configurations
   - **Visual Simulations**: Explore patch extraction, attention maps, and transformer architecture

## Features

### Interactive Notebook
- Experiment with different ViT model variants (Small, Tiny)
- Adjust patch sizes (8×8, 16×16)
- Control fine-tuning strategies (freeze/unfreeze blocks)
- View training metrics and visualizations
- Download experiment results

### Visual Simulations
1. **Patchify & Embedding**: See how images are split into patches and converted to vectors
2. **Attention Maps**: Visualize self-attention mechanisms across layers and heads
3. **Transformer Architecture**: Trace data flow through the transformer encoder

## Navigation

Each page includes navigation buttons to easily switch between:
- Home (landing page)
- Notebook
- Simulations

## Updates Made

### Simulation Page (`simulation/index.html`)
- ✅ Moved intuitive reasoning sections **above** interactive demos
- ✅ Updated footer: "Built for **DEI DL Virtual Labs** - ViT Experiment with ♥"
- ✅ Added navigation buttons (Home, View Notebook)

### Notebook Page (`notebook/index.html`)
- ✅ Added navigation buttons (Home, View Simulations)
- ✅ Updated footer to match branding

### Landing Page (`index.html`)
- ✅ Clean, minimal, educational white theme
- ✅ Clear navigation to both notebook and simulations
- ✅ Feature highlights
- ✅ Consistent branding

## Running Locally

To run the demo locally:

```bash
# Navigate to the demo folder
cd demo

# Start a simple HTTP server
python3 -m http.server 8000

# Open in browser
# http://localhost:8000
```

## Technologies Used

- **HTML5** - Structure
- **CSS3** - Styling (Tailwind CSS for simulations, vanilla CSS for landing page)
- **JavaScript** - Interactivity
- **Chart.js** - Data visualizations
- **GSAP** - Animations
- **KaTeX** - Mathematical notation

## Credits

Built for **DEI DL Virtual Labs** - Vision Transformer Experiment with ♥
