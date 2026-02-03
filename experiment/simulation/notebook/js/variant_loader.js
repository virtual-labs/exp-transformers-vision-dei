// Dynamic Variant Loader - UPDATED
// Renders notebook cells from variant data with proper outputs

let currentVariant = null;
let completedSteps = new Set();

// Initialize
document.addEventListener('DOMContentLoaded', function () {
    setupEventListeners();
    loadDefaultVariant();
    updateStatusUI('Ready', 0, 0);
});

function setupEventListeners() {
    // All three selectors
    document.getElementById('modelSelect').addEventListener('change', handleVariantChange);
    document.getElementById('patchSelect').addEventListener('change', handleVariantChange);
    document.getElementById('unfreezeSelect').addEventListener('change', handleVariantChange);

    // Reset button
    document.getElementById('resetBtn').addEventListener('click', resetExperiment);

    // Run All button
    const runAllBtn = document.getElementById('runAllBtn');
    if (runAllBtn) {
        runAllBtn.addEventListener('click', runAllCells);
    }
}

function loadDefaultVariant() {
    // Set default values
    document.getElementById('modelSelect').value = 'small';
    document.getElementById('patchSelect').value = '8';
    document.getElementById('unfreezeSelect').value = '12';

    const model = document.getElementById('modelSelect').value;
    const patch = document.getElementById('patchSelect').value;
    const unfreeze = document.getElementById('unfreezeSelect').value;
    loadVariant(model, patch, unfreeze);
}

function handleVariantChange() {
    const model = document.getElementById('modelSelect').value;
    const patch = document.getElementById('patchSelect').value;
    const unfreeze = document.getElementById('unfreezeSelect').value;
    resetExperiment();
    loadVariant(model, patch, unfreeze);
}

function loadVariant(model, patchSize, unfreezeBlocks) {
    currentVariant = getVariantData(model, patchSize, unfreezeBlocks);

    if (!currentVariant) {
        console.error('Variant not found:', model, patchSize, unfreezeBlocks);
        return;
    }

    console.log(`Loading variant: ${model}_patch${patchSize}_unfreeze${unfreezeBlocks}`, currentVariant);

    // Render sidebar steps
    renderSidebar(currentVariant);

    // Render cells
    renderCells(currentVariant);
}

function renderSidebar(variant) {
    const stepList = document.getElementById('stepList');
    stepList.innerHTML = '';

    // Create a step for each cell
    variant.cells.forEach((cell, index) => {
        const stepItem = document.createElement('div');
        stepItem.className = 'step-item';
        stepItem.dataset.step = index + 1;

        // Use cell title or fallback
        const title = cell.title || `Cell ${index + 1}`;
        // Truncate long titles
        const displayTitle = title.length > 30 ? title.substring(0, 27) + '...' : title;

        stepItem.innerHTML = `
            <div class="step-indicator">
                <span class="step-number">${index + 1}</span>
            </div>
            <div class="step-content">
                <span class="step-title">${displayTitle}</span>
            </div>
        `;

        stepItem.addEventListener('click', function () {
            scrollToCell(index + 1);
            setActiveStep(index + 1);
        });

        stepList.appendChild(stepItem);
    });

    // Set first step as active
    const firstStep = stepList.querySelector('.step-item[data-step="1"]');
    if (firstStep) {
        firstStep.classList.add('active');
    }
}

function renderCells(variant) {
    const container = document.getElementById('cellsContainer');
    container.innerHTML = '';

    variant.cells.forEach((cell, index) => {
        const cellDiv = createCellElement(cell, index + 1);
        container.appendChild(cellDiv);
    });
}

function createCellElement(cell, stepNum) {
    const cellDiv = document.createElement('div');
    cellDiv.className = 'notebook-cell';
    cellDiv.dataset.cell = stepNum;
    cellDiv.dataset.step = stepNum;

    // Use cell title or fallback
    const title = cell.title || `Cell ${stepNum}`;

    // Cell header
    const header = document.createElement('div');
    header.className = 'cell-header';

    // Check if button should be disabled initially
    const isEnabled = stepNum === 1; // Only first step enabled initially
    const disabledAttr = isEnabled ? '' : 'disabled';

    header.innerHTML = `
        <span class="cell-label">${title}</span>
        <button class="run-btn" data-step="${stepNum}" onclick="runCell(${stepNum})" ${disabledAttr}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                <path d="M8 5v14l11-7z" />
            </svg>
            Run
        </button>
    `;
    cellDiv.appendChild(header);

    // Cell code
    if (cell.code) {
        const codeDiv = document.createElement('div');
        codeDiv.className = 'cell-code';

        const pre = document.createElement('pre');
        const code = document.createElement('code');
        code.className = 'language-python';
        code.textContent = cell.code;

        pre.appendChild(code);
        codeDiv.appendChild(pre);
        cellDiv.appendChild(codeDiv);
    }

    // Cell output (always create, will be hidden initially)
    const outputDiv = document.createElement('div');
    outputDiv.className = 'cell-output hidden';

    const outputLabel = document.createElement('div');
    outputLabel.className = 'output-label';
    outputLabel.textContent = 'Output:';
    outputDiv.appendChild(outputLabel);

    const outputContent = document.createElement('div');
    outputContent.className = 'output-content';

    // Text output
    if (cell.output_text && cell.output_text.trim()) {
        const textOutput = document.createElement('div');
        textOutput.className = 'text-output';

        const textPre = document.createElement('pre');
        textPre.textContent = cell.output_text;
        textOutput.appendChild(textPre);

        outputContent.appendChild(textOutput);
    }

    // Image outputs
    if (cell.has_image && cell.images && cell.images.length > 0) {
        cell.images.forEach((imgSrc, imgIndex) => {
            const imgDiv = document.createElement('div');
            imgDiv.className = 'output-image';
            imgDiv.style.textAlign = 'center';
            imgDiv.style.marginTop = '15px';

            const img = document.createElement('img');
            img.src = imgSrc;
            img.style.maxWidth = '100%';
            img.style.height = 'auto';
            img.alt = `Output visualization ${imgIndex + 1}`;
            img.onerror = function () {
                console.error('Failed to load image for cell', stepNum);
                this.style.display = 'none';
            };
            img.onload = function () {
                // console.log(`Image ${imgIndex} loaded for cell ${stepNum}`); // Removed
            };

            imgDiv.appendChild(img);
            outputContent.appendChild(imgDiv);
        });
    }

    // Only add output div if there's actual content
    if (outputContent.children.length > 0) {
        outputDiv.appendChild(outputContent);
        cellDiv.appendChild(outputDiv);
    } else {
        // Add a note if there's no output
        const noOutput = document.createElement('div');
        noOutput.className = 'cell-output hidden';
        noOutput.innerHTML = '<div class="output-label">Output:</div><div class="output-content"><em style="color: #888;">No output</em></div>';
        cellDiv.appendChild(noOutput);
    }

    return cellDiv;
}

function runCell(step, scrollToOutput = false) {
    return new Promise((resolve) => {
        const cell = document.querySelector(`.notebook-cell[data-step="${step}"]`);
        if (!cell) {
            resolve(false);
            return;
        }

        const runBtn = cell.querySelector('.run-btn');

        // Check if previous cell is completed (sequential execution)
        if (step > 1 && !completedSteps.has(step - 1)) {
            resolve(false);
            return;
        }

        // Don't run if already completed
        if (completedSteps.has(step)) {
            resolve(true);
            return;
        }

        // Scroll to the cell being executed
        cell.scrollIntoView({ behavior: 'smooth', block: 'center' });

        // Also scroll the sidebar step into view
        const stepItem = document.querySelector(`.step-item[data-step="${step}"]`);
        if (stepItem) {
            stepItem.scrollIntoView({ behavior: 'smooth', block: 'center' });
            stepItem.classList.add('running');
        }

        // Mark as running
        cell.classList.add('running');

        // Update Button State to Running
        if (runBtn) {
            runBtn.disabled = true;
            runBtn.classList.add('running');
            runBtn.innerHTML = `
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="animation: spin 1s linear infinite">
                    <path d="M12 2v4m0 12v4M4.93 4.93l2.83 2.83m8.48 8.48l2.83 2.83M2 12h4m12 0h4M4.93 19.07l2.83-2.83m8.48-8.48l2.83-2.83"/>
                </svg>
                Running...
            `;
        }

        // Update Status
        if (currentVariant) {
            updateStatusUI(`Running Cell ${step}...`, completedSteps.size, currentVariant.cells.length);
        }

        // Wait 1 second at the code cell before showing output
        setTimeout(() => {
            // Mark as completed
            cell.classList.remove('running');
            cell.classList.add('completed');

            if (stepItem) {
                stepItem.classList.remove('running');
                stepItem.classList.add('completed');
            }

            completedSteps.add(step);

            // Update Button State to Done
            if (runBtn) {
                runBtn.classList.remove('running');
                runBtn.classList.add('completed'); // Optional: for styling
                runBtn.innerHTML = `
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
                    </svg>
                    Done
                `;
                // Keep disabled
                runBtn.disabled = true;
            }

            // Update other buttons (enable next step)
            updateRunButtonStates();

            // Update Status
            if (currentVariant) {
                updateStatusUI(`Completed Cell ${step}`, completedSteps.size, currentVariant.cells.length);
            }

            // Show output immediately
            const output = cell.querySelector('.cell-output');
            if (output) {
                output.classList.remove('hidden');

                // If in auto-run mode, scroll to the output immediately and wait 3 seconds
                if (scrollToOutput) {
                    // Scroll to output immediately
                    output.scrollIntoView({ behavior: 'smooth', block: 'start' });
                    // Wait 3 seconds at the output before resolving
                    setTimeout(() => {
                        resolve(true);
                    }, 3000);
                } else {
                    resolve(true);
                }
            } else {
                resolve(true);
            }

            // Check if all steps completed
            if (currentVariant && completedSteps.size === currentVariant.cells.length) {
                showCompletionMessage();
                updateStatusUI('Experiment Completed', completedSteps.size, currentVariant.cells.length);
            }
        }, 1000); // 1 second at code cell
    });
}


function runAllCells() {
    if (!currentVariant) return;

    let currentIndex = 0;

    async function runNext() {
        if (currentIndex >= currentVariant.cells.length) {
            return; // All cells completed
        }

        const step = currentIndex + 1;
        const success = await runCell(step, true); // Pass true to enable output scrolling

        if (!success) {
            // Sequential error occurred, stop execution
            console.log(`Stopped at cell ${step}: previous cell not completed`);
            updateStatusUI(`Stopped at Cell ${step}`, completedSteps.size, currentVariant.cells.length);
            return;
        }

        currentIndex++;

        // Immediately continue to next cell (delays are handled in runCell)
        runNext();
    }

    runNext();
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

        // Reset button state
        const runBtn = cell.querySelector('.run-btn');
        if (runBtn) {
            runBtn.classList.remove('running', 'completed');
            runBtn.innerHTML = `
                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M8 5v14l11-7z" />
                </svg>
                Run
            `;
            // Re-evaluate disabled state
            const step = parseInt(cell.dataset.step);
            runBtn.disabled = step !== 1;
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

    // Reset status UI
    if (currentVariant) {
        updateStatusUI('Ready', 0, currentVariant.cells.length);
    } else {
        updateStatusUI('Ready', 0, 0);
    }

    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
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
    const scrollPos = window.scrollY + 200;

    cells.forEach(cell => {
        const cellTop = cell.offsetTop;
        const cellBottom = cellTop + cell.offsetHeight;

        if (scrollPos >= cellTop && scrollPos < cellBottom) {
            const step = parseInt(cell.dataset.step);
            setActiveStep(step);
        }
    });
}

function updateRunButtonStates() {
    const cells = document.querySelectorAll('.notebook-cell');
    if (!cells.length) return;

    cells.forEach(cell => {
        const step = parseInt(cell.dataset.step);
        const btn = cell.querySelector('.run-btn');
        if (!btn) return;

        // If completed or running, keep disabled (state handled in runCell)
        if (completedSteps.has(step) || cell.classList.contains('running')) {
            btn.disabled = true;
            return;
        }

        if (step === 1 || completedSteps.has(step - 1)) {
            btn.disabled = false;
        } else {
            btn.disabled = true;
        }
    });
}

function updateStatusUI(status, completed, total) {
    const statusText = document.getElementById('statusText');
    const progressBar = document.getElementById('progressBar');
    const progressText = document.getElementById('progressText');

    if (statusText) statusText.textContent = status;
    if (progressText) progressText.textContent = `${completed}/${total}`;
    if (progressBar) {
        const percent = total > 0 ? (completed / total) * 100 : 0;
        progressBar.style.width = `${percent}%`;
    }
}
