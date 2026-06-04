// ViT Experiment Data
// This file contains precomputed results from different ViT variants
// Auto-generated from Jupyter notebooks

const VIT_VARIANTS = {
    "vit_small_patch8_224_unfreeze0": {
        "modelName": "vit_small_patch8_224",
        "patchSize": 8,
        "unfreezeBlocks": 0,
        "trainableParams": 0,
        "totalParams": 0,
        "trainingLog": [],
        "trainLosses": [],
        "trainAccs": [],
        "testAccuracy": 0.0
    },
    "vit_small_patch8_224_unfreeze6": {
        "modelName": "vit_small_patch8_224",
        "patchSize": 8,
        "unfreezeBlocks": 6,
        "trainableParams": 0,
        "totalParams": 0,
        "trainingLog": [],
        "trainLosses": [],
        "trainAccs": [],
        "testAccuracy": 0.0
    },
    "vit_small_patch8_224_unfreeze12": {
        "modelName": "vit_small_patch8_224",
        "patchSize": 8,
        "unfreezeBlocks": 12,
        "trainableParams": 0,
        "totalParams": 0,
        "trainingLog": [],
        "trainLosses": [],
        "trainAccs": [],
        "testAccuracy": 0.0
    },
    "vit_small_patch16_224_unfreeze0": {
        "modelName": "vit_small_patch16_224",
        "patchSize": 16,
        "unfreezeBlocks": 0,
        "trainableParams": 0,
        "totalParams": 0,
        "trainingLog": [],
        "trainLosses": [],
        "trainAccs": [],
        "testAccuracy": 0.0
    },
    "vit_small_patch16_224_unfreeze6": {
        "modelName": "vit_small_patch16_224",
        "patchSize": 16,
        "unfreezeBlocks": 6,
        "trainableParams": 0,
        "totalParams": 0,
        "trainingLog": [],
        "trainLosses": [],
        "trainAccs": [],
        "testAccuracy": 0.0
    },
    "vit_small_patch16_224_unfreeze12": {
        "modelName": "vit_small_patch16_224",
        "patchSize": 16,
        "unfreezeBlocks": 12,
        "trainableParams": 0,
        "totalParams": 0,
        "trainingLog": [],
        "trainLosses": [],
        "trainAccs": [],
        "testAccuracy": 0.0
    },
    "vit_tiny_patch16_224_unfreeze0": {
        "modelName": "vit_tiny_patch16_224",
        "patchSize": 16,
        "unfreezeBlocks": 0,
        "trainableParams": 0,
        "totalParams": 0,
        "trainingLog": [],
        "trainLosses": [],
        "trainAccs": [],
        "testAccuracy": 0.0
    },
    "vit_tiny_patch16_224_unfreeze6": {
        "modelName": "vit_tiny_patch16_224",
        "patchSize": 16,
        "unfreezeBlocks": 6,
        "trainableParams": 0,
        "totalParams": 0,
        "trainingLog": [],
        "trainLosses": [],
        "trainAccs": [],
        "testAccuracy": 0.0
    },
    "vit_tiny_patch16_224_unfreeze12": {
        "modelName": "vit_tiny_patch16_224",
        "patchSize": 16,
        "unfreezeBlocks": 12,
        "trainableParams": 0,
        "totalParams": 0,
        "trainingLog": [],
        "trainLosses": [],
        "trainAccs": [],
        "testAccuracy": 0.0
    }
};

// Helper function to get variant key from parameters
function getVariantKey(modelSize, patchSize, unfreezeBlocks) {
    return `vit_${modelSize}_patch${patchSize}_224_unfreeze${unfreezeBlocks}`;
}

// Helper function to get variant data
function getVariantData(modelSize, patchSize, unfreezeBlocks) {
    const key = getVariantKey(modelSize, patchSize, unfreezeBlocks);
    return VIT_VARIANTS[key] || null;
}
