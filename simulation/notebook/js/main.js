// ViT Experiment Main JavaScript

// State management
let currentStep = 0;
let completedSteps = new Set();
let currentVariant = null;
let trainingChart = null;

// Initialize on page load
document.addEventListener('DOMContentLoaded', function () {
    initializeExperiment();
    setupEventListeners();
    loadDefaultVariant();
});

function initializeExperiment() {
    // Set first step as active
    const firstStep = document.querySelector('.step-item[data-step="1"]');
    if (firstStep) {
        firstStep.classList.add('active');
    }
}

function setupEventListeners() {
    // Step sidebar clicks
    document.querySelectorAll('.step-item').forEach(item => {
        item.addEventListener('click', function () {
            const step = parseInt(this.dataset.step);
            scrollToCell(step);
            setActiveStep(step);
        });
    });

    // Run buttons
    document.querySelectorAll('.run-btn').forEach(btn => {
        btn.addEventListener('click', function () {
            const cell = this.closest('.notebook-cell');
            const step = parseInt(cell.dataset.step);
            runCell(step);
        });
    });

    // Parameter selectors
    document.getElementById('modelSizeSelect').addEventListener('change', updateVariant);
    document.getElementById('patchSizeSelect').addEventListener('change', updateVariant);
    document.getElementById('unfreezeBlocksSelect').addEventListener('change', updateVariant);

    // Reset button
    document.getElementById('resetBtn').addEventListener('click', resetExperiment);

    // Download button
    document.getElementById('downloadBtn').addEventListener('click', downloadExperiment);
}

function loadDefaultVariant() {
    const modelSize = document.getElementById('modelSizeSelect').value;
    const patchSize = document.getElementById('patchSizeSelect').value;
    const unfreezeBlocks = document.getElementById('unfreezeBlocksSelect').value;

    currentVariant = getVariantData(modelSize, patchSize, parseInt(unfreezeBlocks));
    updateCodeDisplay();
}

function updateVariant() {
    const modelSize = document.getElementById('modelSizeSelect').value;
    const patchSize = document.getElementById('patchSizeSelect').value;
    const unfreezeBlocks = document.getElementById('unfreezeBlocksSelect').value;

    currentVariant = getVariantData(modelSize, patchSize, parseInt(unfreezeBlocks));

    if (currentVariant) {
        updateCodeDisplay();
        // Reset steps after parameter change
        if (completedSteps.has(4)) {
            // Re-run step 4 to show new parameters
            runCell(4);
        }
    }
}

function updateCodeDisplay() {
    if (!currentVariant) return;

    // Update model name in code
    const modelNameCode = document.getElementById('codeModelName');
    if (modelNameCode) {
        modelNameCode.textContent = `"${currentVariant.modelName}"`;
    }

    // Update unfreeze blocks in code
    const unfreezeBlocksCode = document.getElementById('codeUnfreezeBlocks');
    if (unfreezeBlocksCode) {
        unfreezeBlocksCode.textContent = currentVariant.unfreezeBlocks;
    }
}

function runCell(step) {
    const cell = document.querySelector(`.notebook-cell[data-step="${step}"]`);
    if (!cell) return;

    // Mark as running
    cell.classList.add('running');
    const stepItem = document.querySelector(`.step-item[data-step="${step}"]`);
    if (stepItem) {
        stepItem.classList.add('running');
    }

    // Simulate execution delay
    setTimeout(() => {
        executeCell(step, cell);

        // Mark as completed
        cell.classList.remove('running');
        cell.classList.add('completed');

        if (stepItem) {
            stepItem.classList.remove('running');
            stepItem.classList.add('completed');
        }

        completedSteps.add(step);

        // Show output
        const output = cell.querySelector('.cell-output');
        if (output) {
            output.classList.remove('hidden');
        }

        // Check if all steps completed
        if (completedSteps.size === 11) {
            showCompletionMessage();
        }
    }, 500);
}

function executeCell(step, cell) {
    if (!currentVariant) return;

    switch (step) {
        case 1:
            // Import libraries - just show output
            break;

        case 2:
            // Load dataset - just show output
            break;

        case 3:
            // Visualize samples - could add actual images here
            break;

        case 4:
            // Model configuration
            updateParameterTable();
            break;

        case 5:
            // Load pretrained model - just show output
            break;

        case 6:
            // Freeze/unfreeze layers
            updateFreezeOutput();
            break;

        case 7:
            // Training setup - just show output
            break;

        case 8:
            // Run training
            updateTrainingLog();
            break;

        case 9:
            // Plot training curves
            plotTrainingCurves();
            break;

        case 10:
            // Evaluate model
            updateTestAccuracy();
            break;

        case 11:
            // Confusion matrix - could add actual visualization
            break;
    }
}

function updateParameterTable() {
    if (!currentVariant) return;

    document.getElementById('outputModelName').textContent = currentVariant.modelName;
    document.getElementById('outputPatchSize').textContent = `${currentVariant.patchSize}×${currentVariant.patchSize}`;
    document.getElementById('outputUnfreezeBlocks').textContent = currentVariant.unfreezeBlocks;
}

function updateFreezeOutput() {
    if (!currentVariant) return;

    const percentage = (100 * currentVariant.trainableParams / currentVariant.totalParams).toFixed(2);
    const output = `Trainable parameters: ${currentVariant.trainableParams.toLocaleString()}
Total parameters: ${currentVariant.totalParams.toLocaleString()}
Percentage trainable: ${percentage}%`;

    document.getElementById('freezeOutput').textContent = output;
}

function updateTrainingLog() {
    if (!currentVariant) return;

    const logElement = document.getElementById('trainingLog');
    logElement.textContent = '';

    // Animate training log
    currentVariant.trainingLog.forEach((line, index) => {
        setTimeout(() => {
            logElement.textContent += line + '\n';
            logElement.scrollTop = logElement.scrollHeight;
        }, index * 200);
    });
}

function plotTrainingCurves() {
    if (!currentVariant) return;

    const ctx = document.getElementById('trainingChart');
    if (!ctx) return;

    // Destroy existing chart if any
    if (trainingChart) {
        trainingChart.destroy();
    }

    const epochs = Array.from({ length: 10 }, (_, i) => i + 1);

    trainingChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: epochs,
            datasets: [
                {
                    label: 'Train Loss',
                    data: currentVariant.trainLosses,
                    borderColor: '#0d6efd',
                    backgroundColor: 'rgba(13, 110, 253, 0.1)',
                    tension: 0.4,
                    yAxisID: 'y'
                },
                {
                    label: 'Train Accuracy (%)',
                    data: currentVariant.trainAccs,
                    borderColor: '#198754',
                    backgroundColor: 'rgba(25, 135, 84, 0.1)',
                    tension: 0.4,
                    yAxisID: 'y1'
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            interaction: {
                mode: 'index',
                intersect: false,
            },
            plugins: {
                title: {
                    display: true,
                    text: 'Training Progress',
                    font: {
                        size: 16,
                        weight: 'bold'
                    }
                },
                legend: {
                    display: true,
                    position: 'top',
                }
            },
            scales: {
                x: {
                    title: {
                        display: true,
                        text: 'Epoch'
                    }
                },
                y: {
                    type: 'linear',
                    display: true,
                    position: 'left',
                    title: {
                        display: true,
                        text: 'Loss'
                    }
                },
                y1: {
                    type: 'linear',
                    display: true,
                    position: 'right',
                    title: {
                        display: true,
                        text: 'Accuracy (%)'
                    },
                    grid: {
                        drawOnChartArea: false,
                    }
                }
            }
        }
    });
}

function updateTestAccuracy() {
    if (!currentVariant) return;

    document.getElementById('testAccuracy').textContent = `${currentVariant.testAccuracy.toFixed(2)}%`;
}

function scrollToCell(step) {
    const cell = document.querySelector(`.notebook-cell[data-step="${step}"]`);
    if (cell) {
        cell.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
}

function setActiveStep(step) {
    // Remove active from all steps
    document.querySelectorAll('.step-item').forEach(item => {
        item.classList.remove('active');
    });

    // Add active to current step
    const stepItem = document.querySelector(`.step-item[data-step="${step}"]`);
    if (stepItem) {
        stepItem.classList.add('active');
    }

    currentStep = step;
}

function showLoading() {
    const overlay = document.getElementById('loadingOverlay');
    if (overlay) {
        overlay.classList.remove('hidden');
    }
}

function hideLoading() {
    const overlay = document.getElementById('loadingOverlay');
    if (overlay) {
        overlay.classList.add('hidden');
    }
}

function showCompletionMessage() {
    const message = document.getElementById('completionMessage');
    if (message) {
        message.classList.remove('hidden');
        message.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
}

function resetExperiment() {
    // Reset all steps
    completedSteps.clear();

    // Remove all completed/running classes
    document.querySelectorAll('.notebook-cell').forEach(cell => {
        cell.classList.remove('running', 'completed');
        const output = cell.querySelector('.cell-output');
        if (output) {
            output.classList.add('hidden');
        }
    });

    document.querySelectorAll('.step-item').forEach(item => {
        item.classList.remove('running', 'completed', 'active');
    });

    // Set first step as active
    const firstStep = document.querySelector('.step-item[data-step="1"]');
    if (firstStep) {
        firstStep.classList.add('active');
    }

    // Hide completion message
    const message = document.getElementById('completionMessage');
    if (message) {
        message.classList.add('hidden');
    }

    // Destroy chart
    if (trainingChart) {
        trainingChart.destroy();
        trainingChart = null;
    }

    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function downloadExperiment() {
    if (!currentVariant) {
        alert('Please select a model configuration first.');
        return;
    }

    // Create a simple text file with experiment details
    const content = `Vision Transformer Experiment Results
=====================================

Model Configuration:
- Model: ${currentVariant.modelName}
- Patch Size: ${currentVariant.patchSize}×${currentVariant.patchSize}
- Unfreeze Blocks: ${currentVariant.unfreezeBlocks}
- Trainable Parameters: ${currentVariant.trainableParams.toLocaleString()}
- Total Parameters: ${currentVariant.totalParams.toLocaleString()}

Training Results:
${currentVariant.trainingLog.join('\n')}

Test Accuracy: ${currentVariant.testAccuracy.toFixed(2)}%
`;

    // Create and download file
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `vit_experiment_${currentVariant.modelName}_unfreeze${currentVariant.unfreezeBlocks}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

// Scroll spy to update active step
let ticking = false;
window.addEventListener('scroll', function () {
    if (!ticking) {
        window.requestAnimationFrame(function () {
            updateActiveStepOnScroll();
            ticking = false;
        });
        ticking = true;
    }
});

function updateActiveStepOnScroll() {
    const cells = document.querySelectorAll('.notebook-cell');
    const scrollPos = window.scrollY + 200; // Offset for better UX

    cells.forEach(cell => {
        const cellTop = cell.offsetTop;
        const cellBottom = cellTop + cell.offsetHeight;

        if (scrollPos >= cellTop && scrollPos < cellBottom) {
            const step = parseInt(cell.dataset.step);
            if (step !== currentStep) {
                setActiveStep(step);
            }
        }
    });
}
