### Procedure

The objective of this experiment is to apply a Vision Transformer (ViT) model to an image classification task and to study how attention-based mechanisms and patch-based representations enable effective learning from visual data. This experiment emphasizes understanding pretrained transformer models, fine-tuning strategies, and visualization of attention maps using a subset of the CIFAR-10 dataset.

**1. Import Required Libraries**

* **PyTorch:** for building and training the deep learning model.
* **torchvision:** for dataset loading and image transformations (plus pretrained ViT utilities).
* **NumPy + matplotlib:** NumPy for numerical operations, matplotlib for visualization/plots.

**2. Dataset Loading and Description**

* Load the CIFAR-10 dataset using torchvision dataset utilities.
* The dataset consists of:
  * 60,000 RGB images of size 32 × 32 pixels
  * 10 object classes: airplane, automobile, bird, cat, deer, dog, frog, horse, ship, and truck
  * 50,000 training images and 10,000 test images
* To reduce computational cost and training time, a subset of CIFAR-10 is selected in the code while maintaining class diversity.
* Since Vision Transformers expect larger input resolutions, images are resized to match the pretrained ViT input size before being passed to the model.

**3. Data Preprocessing**

* Convert images into a tensor format suitable for the transformer input.
* Resize images to the resolution required by the pretrained Vision Transformer.
* Normalize images using the mean and standard deviation values associated with the pretrained ViT model to ensure compatibility and stable training.

**4. Define Class Labels**

* Initialize a tuple containing the 10 CIFAR-10 class names.
* This mapping is used to convert numerical class labels into human-readable class names during visualization and evaluation.

**5. Load CIFAR-10 Dataset**

* Load the CIFAR-10 training and test datasets using torchvision dataset loaders.
* The dataset consists of:
  * 60,000 total RGB images
  * Image size: 32 × 32 pixels
  * 10 object classes

**Number of classes: 10**
* 0 → airplane
* 1 → automobile
* 2 → bird
* 3 → cat
* 4 → deer
* 5 → dog
* 6 → frog
* 7 → horse
* 8 → ship
* 9 → truck

* Download the dataset automatically if it is not already available locally.

**6. Create a CIFAR-10 Subset**

* Select a subset of the CIFAR-10 dataset to reduce computational requirements.
* Ensure that the subset maintains class diversity so that all categories are represented.
* This step allows faster experimentation while preserving the learning behavior of the Vision Transformer.

**7. Define Image Transformations**

* Resize input images to the resolution expected by the pretrained Vision Transformer.
* Convert images to tensor format.
* Normalize images using the mean and standard deviation values required by the pretrained ViT model.
* These transformations ensure compatibility between CIFAR-10 images and the pretrained model.

**8. Create Data Loaders**

* Create training and test DataLoader objects using the transformed datasets.
* Specify an appropriate batch size for efficient training.
* Enable shuffling for the training data to prevent learning order bias.
* Use parallel data loading where supported to improve performance.

**9. Load Pretrained Vision Transformer Model**

* Load a pretrained Vision Transformer (ViT) model using torchvision or timm utilities.
* The model is initialized with weights trained on a large-scale image dataset.
* Replace or reconfigure the final classification head to output predictions for 10 CIFAR-10 classes.

**10. Freeze and Unfreeze Model Layers**

* Freeze selected transformer layers to prevent their weights from updating during training.
* Allow the classification head (and optionally the last transformer layers) to be trainable.
* This fine-tuning strategy improves performance while reducing training time.

**11. Use Loss Function**

* Define the cross-entropy loss function for multi-class classification.
* This loss function measures the difference between predicted class probabilities and true class labels.

**12. Use Optimizer**

* Configure an optimizer to update trainable model parameters.
* Set an appropriate learning rate suitable for fine-tuning a pretrained model.
* The optimizer controls how model weights are updated during backpropagation.

**13. Training Loop Implementation**

* Iterate over the training dataset for a fixed number of epochs.
* For each batch:
  * Perform a forward pass through the Vision Transformer.
  * Compute the loss using predicted outputs and true labels.
  * Perform backpropagation to compute gradients.
  * Update model parameters using the optimizer.
* Track training loss and accuracy for each epoch.

**14. Model Evaluation**

* Switch the model to evaluation mode.
* Disable gradient computation to reduce memory usage.
* Evaluate the trained model on the test dataset.
* Compute classification accuracy to assess model generalization.

**15. Extract Self-Attention Weights**

* Access attention weights from the transformer encoder layers.
* Extract attention matrices corresponding to image patches.
* These weights represent how each patch attends to other patches in the image.

**16. Visualization of Patch Attention Maps**

* Select sample images from the test dataset.
* Visualize patch-level attention maps overlaid on the input image.
* Analyze which image regions the Vision Transformer focuses on while making predictions.