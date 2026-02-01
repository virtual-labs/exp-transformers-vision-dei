# Vision Transformer (ViT) on CIFAR-10 - Virtual Lab Experiment

This experiment demonstrates training Vision Transformer models on the CIFAR-10 dataset with different configurations.

## Structure

```
experiment/
└── simulation/
    ├── index.html          # Main notebook interface
    ├── css/
    │   └── main.css        # Styling (copied from RNN experiment)
    ├── js/
    │   ├── data.js         # Precomputed results for all 9 variants
    │   └── main.js         # Interactive functionality
    └── images/             # (for future use)
```

## Variants

The experiment includes 9 precomputed variants:

### Model Sizes
- **ViT-Tiny**: Smaller model (~5.7M parameters)
- **ViT-Small**: Larger model (~21.7M parameters)

### Patch Sizes
- **8×8**: More patches, finer granularity
- **16×16**: Fewer patches, coarser granularity

### Unfreeze Blocks
- **0**: Only classification head trainable (minimal fine-tuning)
- **6**: Half of transformer blocks trainable (moderate fine-tuning)
- **12**: All transformer blocks trainable (full fine-tuning)

## Features

1. **Interactive Parameter Selection**: Choose model size, patch size, and number of blocks to unfreeze
2. **Step-by-Step Execution**: Run each cell individually to see the training process
3. **Dynamic Visualizations**: Training curves update based on selected variant
4. **Progress Tracking**: Sidebar shows completion status of each step
5. **Download Results**: Export experiment results as text file

## Running Locally

```bash
# Navigate to the experiment directory
cd experiment/simulation

# Start a local server
python3 -m http.server 8080

# Open in browser
# Navigate to http://localhost:8080
```

## Experiment Steps

1. **Import Libraries & Setup**: Load required Python libraries
2. **Load CIFAR-10 Dataset**: Download and prepare the dataset
3. **Visualize Sample Images**: Display sample images from each class
4. **Model Configuration**: Select ViT variant parameters
5. **Load Pretrained ViT**: Load pretrained model from timm
6. **Freeze/Unfreeze Layers**: Configure which layers to train
7. **Training Setup**: Configure optimizer and data loaders
8. **Run Training**: Train the model for 10 epochs
9. **Plot Training Curves**: Visualize loss and accuracy
10. **Evaluate Model**: Test on held-out test set
11. **Confusion Matrix**: Analyze per-class performance

## Data Source

The precomputed results in `js/data.js` are based on actual training runs stored in the `vit_variants/` directory:

- `vit_variant_01_vit_small_patch8_224_unfreeze0.ipynb`
- `vit_variant_02_vit_small_patch8_224_unfreeze6.ipynb`
- `vit_variant_03_vit_small_patch8_224_unfreeze12.ipynb`
- `vit_variant_04_vit_small_patch16_224_unfreeze0.ipynb`
- `vit_variant_05_vit_small_patch16_224_unfreeze6.ipynb`
- `vit_variant_06_vit_small_patch16_224_unfreeze12.ipynb`
- `vit_variant_07_vit_tiny_patch16_224_unfreeze0.ipynb`
- `vit_variant_08_vit_tiny_patch16_224_unfreeze6.ipynb`
- `vit_variant_09_vit_tiny_patch16_224_unfreeze12.ipynb`

## Customization

To add actual results from your notebooks:

1. Extract training logs, losses, and accuracies from the notebooks
2. Update the values in `js/data.js`
3. Optionally add actual images to the `images/` directory
4. Update image references in the HTML

## Credits

Based on the Virtual Labs experiment format from:
https://github.com/virtual-labs/exp-rnn-dei
