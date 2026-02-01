
// -- Global State --
const state = {
    currentTab: 'simulation-1',
    sim1: {
        isExploded: false,
        isFlattened: false,
        selectedImage: 'cifar_7_cat.png' // Default
    },
    images: [
        'cifar_7_cat.png', 'cifar_9_plane.png', 'cifar_3_car.png', 'cifar_4_bird.png', 'cifar_0_frog.png'
    ]
};

// -- Initialization --
document.addEventListener('DOMContentLoaded', () => {
    console.log('ViT Explorer Initialized');
    injectImagePicker();
    initSim1();
});

// -- Shared: Image Picker --
function injectImagePicker() {
    // We'll inject this into the header or sidebar area
    const header = document.querySelector('header');

    const pickerContainer = document.createElement('div');
    pickerContainer.className = 'flex gap-4 items-center mt-6 p-4 bg-gray-50 rounded-xl border border-gray-100';

    const label = document.createElement('span');
    label.className = 'text-sm font-medium text-gray-500 uppercase tracking-widest';
    label.innerText = 'Select Input Sample:';
    pickerContainer.appendChild(label);

    state.images.forEach(imgName => {
        const btn = document.createElement('button');
        btn.className = `w-12 h-12 rounded-lg border-2 overflow-hidden transition-all ${state.sim1.selectedImage === imgName ? 'border-black ring-2 ring-black/10' : 'border-gray-200 hover:border-gray-400'}`;

        const img = document.createElement('img');
        img.src = `assets/images/${imgName}`;
        img.className = 'w-full h-full object-cover pixelated'; // pixelated for crisp look
        img.style.imageRendering = 'pixelated';

        btn.appendChild(img);

        btn.onclick = () => {
            state.sim1.selectedImage = imgName;
            // Update UI
            Array.from(pickerContainer.children).slice(1).forEach(b => {
                b.className = b.className.replace('border-black ring-2 ring-black/10', 'border-gray-200 hover:border-gray-400');
            });
            btn.className = 'w-12 h-12 rounded-lg border-2 border-black ring-2 ring-black/10 overflow-hidden transition-all';

            // Re-init current sim
            if (state.currentTab === 'simulation-1') initSim1();
            if (state.currentTab === 'simulation-2') initSim2();
            // Sim 3 doesn't depend on image visual as much, but could
        };

        pickerContainer.appendChild(btn);
    });

    header.appendChild(pickerContainer);
}

// -- Tab Handling --
window.switchTab = (tabId) => {
    // Hide all sections
    document.querySelectorAll('.simulation-section').forEach(el => {
        el.classList.add('hidden');
        el.classList.remove('block');
    });

    // Show target section
    const target = document.getElementById(tabId);
    if (target) {
        target.classList.remove('hidden');
        target.classList.add('block');

        // Trigger animations/render for specific tabs if needed
        if (tabId === 'simulation-1') initSim1();
        if (tabId === 'simulation-2') initSim2();
        if (tabId === 'simulation-3') initSim3();
    }

    // Update Nav
    document.querySelectorAll('nav button').forEach(btn => {
        btn.classList.remove('active-tab');
        if (btn.getAttribute('onclick').includes(tabId)) {
            btn.classList.add('active-tab');
        }
    });

    state.currentTab = tabId;
};

// -- Simulation 1: Patchify --
function initSim1() {
    console.log('Init Sim 1');
    const container = document.getElementById('sim1-canvas-container');
    container.innerHTML = ''; // Clear placeholder

    // Config
    const imgSize = 256;
    const logicalSize = 32;
    const patchSize = 4;
    const numPatches = logicalSize / patchSize; // 8x8 grid
    const scale = imgSize / logicalSize; // 8x scale

    // Create Grid Container
    const gridEl = document.createElement('div');
    gridEl.style.width = `${imgSize}px`;
    gridEl.style.height = `${imgSize}px`;
    gridEl.style.position = 'relative';
    container.appendChild(gridEl);

    // Load Image first
    const img = new Image();
    img.onload = () => {
        // Draw to temp canvas to extract patches
        const srcCanvas = document.createElement('canvas');
        srcCanvas.width = logicalSize;
        srcCanvas.height = logicalSize;
        const sctx = srcCanvas.getContext('2d');
        sctx.drawImage(img, 0, 0, logicalSize, logicalSize);

        state.sim1.patches = [];
        state.sim1.gridEl = gridEl;
        state.sim1.isExploded = false;
        state.sim1.isFlattened = false;

        // Reset Buttons
        document.getElementById('btn-explode').innerText = "Explode Layout";
        document.getElementById('btn-flatten').innerText = "Flatten Patches";

        // Generate Patches
        for (let y = 0; y < numPatches; y++) {
            for (let x = 0; x < numPatches; x++) {
                const patchCanvas = document.createElement('canvas');
                patchCanvas.width = patchSize;
                patchCanvas.height = patchSize;
                patchCanvas.className = 'absolute transition-shadow hover:shadow-lg hover:z-10 cursor-pointer';

                const pctx = patchCanvas.getContext('2d');
                pctx.drawImage(srcCanvas,
                    x * patchSize, y * patchSize, patchSize, patchSize,
                    0, 0, patchSize, patchSize
                );

                const displaySize = patchSize * scale;
                patchCanvas.style.width = `${displaySize}px`;
                patchCanvas.style.height = `${displaySize}px`;
                patchCanvas.style.imageRendering = 'pixelated';

                // Initial Grid Position
                const initialX = x * displaySize;
                const initialY = y * displaySize;

                gsap.set(patchCanvas, { x: initialX, y: initialY, opacity: 1, rotation: 0 });

                gridEl.appendChild(patchCanvas);

                state.sim1.patches.push({
                    el: patchCanvas,
                    ix: x, iy: y,
                    initialX, initialY, displaySize,
                    canvas: patchCanvas // ref
                });
            }
        }
    };

    img.onerror = () => {
        console.error("Failed to load image:", img.src);
        container.innerHTML = `<div class="text-red-500">Error loading image. Please try again or check console.</div>`;
    };

    img.src = `assets/images/${state.sim1.selectedImage}`;

    // Bind Button Events
    const btnExplode = document.getElementById('btn-explode');
    const btnFlatten = document.getElementById('btn-flatten');

    // Re-bind (clone to strip old listeners)
    const newBtnExplode = btnExplode.cloneNode(true);
    btnExplode.parentNode.replaceChild(newBtnExplode, btnExplode);
    const newBtnFlatten = btnFlatten.cloneNode(true);
    btnFlatten.parentNode.replaceChild(newBtnFlatten, btnFlatten);

    newBtnExplode.onclick = toggleExplode;
    newBtnFlatten.onclick = toggleFlattenSim1;
}

function toggleExplode() {
    if (state.sim1.isFlattened) return; // Disable if flattened

    state.sim1.isExploded = !state.sim1.isExploded;
    const gap = 5;

    state.sim1.patches.forEach(p => {
        const centerX = 3.5;
        const centerY = 3.5;
        const dx = (p.ix - centerX) * gap;
        const dy = (p.iy - centerY) * gap;

        gsap.to(p.el, {
            x: state.sim1.isExploded ? p.initialX + dx : p.initialX,
            y: state.sim1.isExploded ? p.initialY + dy : p.initialY,
            duration: 0.5,
            ease: "back.out(1.7)"
        });
    });

    document.getElementById('btn-explode').innerText = state.sim1.isExploded ? "Implode" : "Explode Layout";
}

function toggleFlattenSim1() {
    state.sim1.isFlattened = !state.sim1.isFlattened;
    const patches = state.sim1.patches;
    const gridEl = state.sim1.gridEl;

    if (state.sim1.isFlattened) {
        // FLATTEN: True Vector Representation
        // Make them behave like 1D sequences

        // Center the whole sequence.
        // 64 patches. 
        // We can't show a generic 64-long strip easily without scrolling or wrapping.
        // Let's wrap it primarily: 1 x 64 vector is usually conceptualized as N x D.
        // Here "flattening" means (H*W) sequence length.

        // Let's do a linear strip, but maybe condensed.

        const stripHeight = 80;
        const stripWidth = 10; // thin bars
        const gap = 2;
        const totalW = patches.length * (stripWidth + gap);
        const startX = (256 - totalW) / 2; // Center in container

        // We need to move the grid container to fit this usually wide format if we want true 1D
        // Or we wrap it in 2 rows?
        // Let's do 2 rows of 32 for visibility

        patches.forEach((p, index) => {
            // We want to morph the patch (image) into a "vector bar"
            // Visual trick: scale X down, scale Y up?
            // Or just arrange the squares in a line.

            // User asked for "True Flattening".
            // Ideally, the pixels unroll. That's hard with just a canvas element.
            // Alternative: The patch *becomes* a vector token.
            // Let's arrange them in a long snake or line.

            const col = index;
            const targetX = (col * 14) - (64 * 14) / 2 + 128; // Center it
            const targetY = 300; // Move down

            // If we have strict width limits...
            // Let's just stack them tight

            gsap.to(p.el, {
                x: (index % 16) * 18, // 16 items per row
                y: Math.floor(index / 16) * 24 + 100, // 4 rows
                width: 14,
                height: 14,
                rotation: 0,
                borderRadius: "2px",
                border: "1px solid rgba(255,255,255,0.8)", // Outline
                boxShadow: "0 0 2px rgba(0,0,0,0.5)", // Shadow for contrast
                duration: 0.8,
                ease: "power2.inOut",
                delay: index * 0.01
            });
        });

        // Add "Vector" annotations?
    } else {
        // RESTORE
        state.sim1.isExploded = false; // Reset
        document.getElementById('btn-explode').innerText = "Explode Layout";

        patches.forEach((p, index) => {
            gsap.to(p.el, {
                x: p.initialX,
                y: p.initialY,
                width: p.displaySize,
                height: p.displaySize,
                borderRadius: "0px",
                duration: 0.5,
                delay: index * 0.005
            });
        });
    }

    document.getElementById('btn-flatten').innerText = state.sim1.isFlattened ? "Restore Grid" : "Flatten Patches";
}

// -- Simulation 2: Attention --
function initSim2() {
    console.log('Init Sim 2');
    const container = document.getElementById('sim2-input-container');
    const heatmapContainer = document.getElementById('sim2-heatmap-container');
    container.innerHTML = '';
    heatmapContainer.innerHTML = '';

    const logicSize = 32;
    const dispSize = 256;
    const patchSize = 4;
    const scale = dispSize / logicSize;
    const patchDispSize = patchSize * scale;
    const numPatches = logicSize / patchSize; // 8

    // Load Image
    const img = new Image();

    // We try to use anonymous crossOrigin to potentially allow it, 
    // but local files handling is strict in browsers.
    img.crossOrigin = "Anonymous";

    img.onload = () => {
        let patchColors = [];
        let useSimulation = false;

        // Try extracting pixels
        try {
            const logicCanvas = document.createElement('canvas');
            logicCanvas.width = logicSize;
            logicCanvas.height = logicSize;
            const lctx = logicCanvas.getContext('2d');
            lctx.drawImage(img, 0, 0, logicSize, logicSize);
            const pixels = lctx.getImageData(0, 0, logicSize, logicSize).data;

            function getPatchColor(px, py) {
                let r = 0, g = 0, b = 0, count = 0;
                for (let y = 0; y < patchSize; y++) {
                    for (let x = 0; x < patchSize; x++) {
                        const idx = ((py * patchSize + y) * logicSize + (px * patchSize + x)) * 4;
                        r += pixels[idx]; g += pixels[idx + 1]; b += pixels[idx + 2]; count++;
                    }
                }
                return { r: r / count, g: g / count, b: b / count };
            }

            for (let y = 0; y < numPatches; y++) {
                for (let x = 0; x < numPatches; x++) {
                    patchColors.push(getPatchColor(x, y));
                }
            }
        } catch (e) {
            console.warn("Sim 2: Pixel access restricted (CORS/files). Switching to simulated attention.", e);
            useSimulation = true;
            // Generate dummy colors for consistent index mapping if needed, 
            // though renderAttention will handle the logic.
            for (let i = 0; i < numPatches * numPatches; i++) patchColors.push({ r: 0, g: 0, b: 0 });
        }

        // Display Input (Interactive)
        const dispCanvas = document.createElement('canvas');
        dispCanvas.width = dispSize;
        dispCanvas.height = dispSize;
        dispCanvas.className = 'rounded shadow-sm';
        const dctx = dispCanvas.getContext('2d');
        dctx.imageRendering = 'pixelated';
        dctx.drawImage(img, 0, 0, dispSize, dispSize);
        container.appendChild(dispCanvas);

        const gridOverlay = document.createElement('div');
        gridOverlay.className = 'absolute inset-0 grid grid-cols-8 grid-rows-8 cursor-crosshair';
        container.appendChild(gridOverlay);

        // Heatmap Output
        const heatCanvas = document.createElement('canvas');
        heatCanvas.width = dispSize;
        heatCanvas.height = dispSize;
        heatCanvas.className = 'rounded shadow-sm';
        const hctx = heatCanvas.getContext('2d');
        heatmapContainer.appendChild(heatCanvas);

        // Initial State
        hctx.fillStyle = '#f3f4f6'; hctx.fillRect(0, 0, dispSize, dispSize);
        hctx.fillStyle = '#9ca3af'; hctx.font = '14px sans-serif'; hctx.fillText('Hover image to', 40, 110);
        hctx.fillText('see attention', 40, 130);

        // Interaction Handlers
        for (let i = 0; i < numPatches * numPatches; i++) {
            const cell = document.createElement('div');
            cell.dataset.idx = i;
            // Transparent cells to catch hover
            cell.className = 'transition-colors hover:bg-white/10';

            cell.addEventListener('mouseenter', (e) => {
                const idx = parseInt(e.target.dataset.idx);
                renderAttention(idx, patchColors, hctx, img, dispSize, numPatches, patchDispSize, useSimulation);
            });
            gridOverlay.appendChild(cell);
        }

        // Hook up sliders to update labels and re-render if needed
        const updateUI = () => {
            const l = parseInt(document.getElementById('layer-slider').value);
            const h = parseInt(document.getElementById('head-slider').value);

            // Layer Descriptions
            let lText = `${l}: `;
            if (l < 2) lText += "Local / Edges (Low Level)";
            else if (l < 4) lText += "Mid-Level Patterns";
            else lText += "Global / Semantic (High Level)";

            // Head Descriptions
            const hText = h === 0 ? "0: Texture (Local+Color)"
                : h === 1 ? "1: Color Matching (Global)"
                    : h === 2 ? "2: Neighbors Only (Spatial)"
                        : "3: Abstract / Mixed";

            document.getElementById('layer-desc').innerText = lText;
            document.getElementById('head-desc').innerText = hText;
        };

        // Initialize labels
        updateUI();

        document.getElementById('layer-slider').oninput = updateUI;
        document.getElementById('head-slider').oninput = updateUI;
    };

    img.onerror = () => {
        console.error("Failed to load image for Sim 2:", img.src);
        container.innerHTML = `<div class="text-red-500 p-4 border border-red-200 rounded">Error loading image.<br>Check console.</div>`;
    };

    img.src = `assets/images/${state.sim1.selectedImage}`;
}

function renderAttention(targetIdx, patchColors, hctx, img, dispSize, numPatches, patchDispSize, useSimulation) {
    if (isNaN(targetIdx)) return;

    const sliderLayer = document.getElementById('layer-slider');
    const sliderHead = document.getElementById('head-slider');
    const layer = parseInt(sliderLayer.value);
    const head = parseInt(sliderHead.value);

    // Calc coordinates
    const tx = targetIdx % numPatches;
    const ty = Math.floor(targetIdx / numPatches);

    // Compute Weights
    const weights = [];
    let maxW = 0.001; // Avoid divide by zero

    for (let i = 0; i < numPatches * numPatches; i++) {
        const ox = i % numPatches;
        const oy = Math.floor(i / numPatches);
        const dist = Math.sqrt(Math.pow(tx - ox, 2) + Math.pow(ty - oy, 2));

        let w = 0;

        if (useSimulation) {
            // -- Fallback Logic (Geometric / Pseudo-random) --
            // Deterministic hash based on indices + layer + head
            const hash = Math.sin(tx * 12.9898 + ty * 78.233 + ox * 37.1 + oy * 17.1 + layer * 23.0 + head * 19.0) * 43758.5453;
            // Bias towards closeness (Spatial attention)
            const spatial = Math.exp(-dist / 3);
            // Bias towards "random semantic"
            const semantic = (hash - Math.floor(hash));

            // Mix based on layer
            if (layer < 3) {
                // Early layers: focus locally
                w = spatial * 0.8 + semantic * 0.2;
            } else {
                // Late layers: focus globally (more "semantic" scatter)
                w = spatial * 0.3 + semantic * 0.7;
            }
        } else {
            // -- Real Pixel Logic --
            const targetColor = patchColors[targetIdx];
            const c = patchColors[i];
            const colorDist = Math.sqrt(Math.pow(targetColor.r - c.r, 2) + Math.pow(targetColor.g - c.g, 2) + Math.pow(targetColor.b - c.b, 2));

            // Normalize color dist (0-442 approx) to 0-1 similarity
            const similarity = Math.max(0, 1 - (colorDist / 200));

            if (head === 0) w = similarity * Math.exp(-dist / 5); // Local-ish similar
            else if (head === 1) w = similarity; // Pure similar
            else if (head === 2) w = Math.exp(-dist / 2); // Pure spatial
            else w = (similarity + Math.random()) / 2; // Mixed

            if (layer < 2) w = w * (1 / (dist + 1));
        }

        weights.push(w);
        if (w > maxW) maxW = w;
    }

    // Render
    hctx.clearRect(0, 0, dispSize, dispSize);

    // Draw Faded Base Image
    hctx.globalAlpha = 0.3;
    hctx.imageRendering = 'pixelated';
    try {
        hctx.drawImage(img, 0, 0, dispSize, dispSize);
    } catch (e) {
        // If drawing the image itself fails due to taint (rarely implies drawImage fails, usually just read), 
        // we can draw a placeholder. But standard drawImage usually works for tainted sources, just not reading back.
        hctx.fillStyle = '#ccc'; hctx.fillRect(0, 0, dispSize, dispSize);
    }
    hctx.globalAlpha = 1.0;

    // Draw Heatmap Overlay
    for (let i = 0; i < weights.length; i++) {
        const wx = (i % numPatches) * patchDispSize;
        const wy = Math.floor(i / numPatches) * patchDispSize;

        const norm = weights[i] / maxW;

        // Heatmap color: Red with alpha
        // Cleaner look: use a gradient from yellow to red?
        // Simple: Red
        hctx.fillStyle = `rgba(255, 0, 0, ${norm * 0.8})`; // Max opacity 0.8

        // Don't draw over the self-patch too heavily? 
        // Actually standard attention includes self.

        hctx.fillRect(wx, wy, patchDispSize, patchDispSize);

        // Highlight Target Box
        if (i === targetIdx) {
            hctx.strokeStyle = '#00ff00';
            hctx.lineWidth = 3;
            hctx.strokeRect(wx, wy, patchDispSize, patchDispSize);
        }
    }
}

// -- Simulation 3: Architecture Flow --
function initSim3() {
    console.log('Init Sim 3: Swarm Pipeline');
    const container = document.getElementById('sim3-flow-container');
    container.innerHTML = '';

    // Scale container to allow more width
    container.className = 'w-full overflow-x-auto p-4';

    // Wrapper for horizontal scroll diagram
    const pipelineWrapper = document.createElement('div');
    pipelineWrapper.className = 'relative flex items-center justify-start gap-12 min-w-[1200px] h-[500px] bg-white border border-gray-200 rounded-xl p-8';
    container.appendChild(pipelineWrapper);

    // -- Pipeline Components --

    // 1. Input Image Area
    const imgContainer = createStepNode("Input Image", 'border-gray-300 relative bg-gray-50');
    // We will place the "Swarm" of patches ON TOP of this container
    imgContainer.style.width = "140px";
    imgContainer.style.height = "140px";

    // Background placeholder for where image sits
    const bgPlaceholder = document.createElement('div');
    bgPlaceholder.className = "absolute inset-0 m-auto w-32 h-32 border border-dashed border-gray-300 rounded";
    imgContainer.appendChild(bgPlaceholder);

    pipelineWrapper.appendChild(imgContainer);

    addArrow(pipelineWrapper);

    // 2. Linear Projection Area
    const projectionContainer = createStepNode("Linear Projection", 'border-gray-300');
    projectionContainer.style.minWidth = "140px";
    // Grid to catch the patches
    const projectionGrid = document.createElement('div');
    projectionGrid.className = "grid grid-cols-4 gap-1 w-32 h-32 p-1 bg-gray-100 rounded border border-gray-200";
    projectionContainer.appendChild(projectionGrid);
    pipelineWrapper.appendChild(projectionContainer);

    addArrow(pipelineWrapper);

    // 3. Encoder Block
    const encoderWrapper = document.createElement('div');
    encoderWrapper.className = "relative flex flex-col items-center justify-center p-4 border-2 border-purple-100 bg-purple-50/50 rounded-xl gap-2 w-72";
    encoderWrapper.innerHTML = '<span class="text-xs font-bold text-purple-400 uppercase tracking-widest mb-2">Transformer Encoder</span>';

    const internalBlocks = [
        { name: "Layer Norm & MHA", color: "bg-purple-100 border-purple-300 text-purple-700" },
        { name: "Layer Norm & MLP", color: "bg-green-100 border-green-300 text-green-700" }
    ];

    const uiRefs = {};
    internalBlocks.forEach((b, i) => {
        const el = document.createElement('div');
        el.className = `w-full py-4 text-center text-xs font-mono border rounded ${b.color} shadow-sm z-10 bg-opacity-90`;
        el.innerText = b.name;
        el.id = `enc-step-${i}`;
        uiRefs[`enc-step-${i}`] = el;
        encoderWrapper.appendChild(el);
        if (i < internalBlocks.length - 1) {
            const gap = document.createElement('div');
            gap.className = "h-4 w-0.5 bg-gray-300";
            encoderWrapper.appendChild(gap);
        }
    });
    pipelineWrapper.appendChild(encoderWrapper);

    addArrow(pipelineWrapper);

    // 4. MLP Head & Output
    const headContainer = createStepNode("MLP Head", 'border-blue-200 bg-blue-50 relative');

    // Class distribution bars visual
    const barsContainer = document.createElement('div');
    barsContainer.className = "flex gap-1 items-end h-16 w-24 mb-2";
    [0.2, 0.5, 0.3, 0.8, 0.4].forEach(h => {
        const b = document.createElement('div');
        b.className = "w-full bg-blue-300 rounded-t opacity-50";
        b.style.height = (h * 100) + "%";
        barsContainer.appendChild(b);
    });
    headContainer.appendChild(barsContainer);

    const outLabel = document.createElement('div');
    outLabel.className = "text-xl font-bold text-green-700 mt-2";
    outLabel.innerText = "?";
    headContainer.appendChild(outLabel);

    pipelineWrapper.appendChild(headContainer);


    // -- Controls & Animation Logic --

    const ctrl = document.createElement('div');
    ctrl.className = "absolute top-4 left-4 z-30";
    const runBtn = document.createElement('button');
    runBtn.className = "utility-btn bg-black text-white hover:bg-gray-800 shadow-lg transform active:scale-95 transition-all";
    runBtn.innerText = "Simulate Flow";
    ctrl.appendChild(runBtn);
    pipelineWrapper.appendChild(ctrl);

    runBtn.onclick = () => {
        // Reset
        outLabel.innerText = "?";
        runBtn.disabled = true;
        runBtn.classList.add('opacity-50');

        // Create the SWARM
        // We need 16 patches (4x4)
        const patches = [];
        const patchSize = 32; // Visual size in px

        // 1. Spawning patches at Input Image
        // Determine start offset
        const startRect = bgPlaceholder.getBoundingClientRect();
        const wrapperRect = pipelineWrapper.getBoundingClientRect();

        // Calculate offset relative to the wrapper which is the positioned parent
        const offsetX = startRect.left - wrapperRect.left;
        const offsetY = startRect.top - wrapperRect.top;

        // Get current label dynamically
        const labelText = state.sim1.selectedImage.split('_')[2].split('.')[0].toUpperCase();

        for (let y = 0; y < 4; y++) {
            for (let x = 0; x < 4; x++) {
                const p = document.createElement('div');
                // Use background image proper slice? That's fancy.
                // Or simplified: Just colored blocks or a clone of the image inside a container.
                // Let's crop the actual image for maximum effect!

                p.className = "absolute shadow-sm z-20 border border-white/20";
                p.style.width = patchSize + "px";
                p.style.height = patchSize + "px";
                p.style.left = (offsetX + x * patchSize) + "px";
                p.style.top = (offsetY + y * patchSize) + "px";

                // Set background image w/ position
                p.style.backgroundImage = `url(assets/images/${state.sim1.selectedImage})`;
                p.style.backgroundSize = "128px 128px"; // Match the 4*32 size
                p.style.backgroundPosition = `-${x * patchSize}px -${y * patchSize}px`;
                p.style.imageRendering = "pixelated";

                pipelineWrapper.appendChild(p);
                patches.push({ el: p, ix: x, iy: y });
            }
        }

        // Timeline
        const tl = gsap.timeline({
            onComplete: () => {
                runBtn.disabled = false;
                runBtn.classList.remove('opacity-50');
            }
        });

        // Step 1: Explode slightly
        tl.to(patches.map(p => p.el), {
            scale: 0.9,
            rotation: () => (Math.random() - 0.5) * 10,
            duration: 0.4,
            ease: "back.out(1.7)"
        });

        // Step 2: Move to Projection Grid
        // Target Rect
        const progRect = projectionGrid.getBoundingClientRect();
        const projX = progRect.left - wrapperRect.left;
        const projY = progRect.top - wrapperRect.top;

        // Arrange in grid again, but maybe with gaps
        patches.forEach((p, i) => {
            const tx = projX + p.ix * 33 + 2; // + gap
            const ty = projY + p.iy * 33 + 2;

            tl.to(p.el, {
                // Correctly animate absolute position - DO NOT mix with x transform unless necessary
                left: tx,
                top: ty,
                x: 0, // Reset any transform
                y: 0,
                rotation: 0,
                scale: 1,
                borderRadius: "4px",
                duration: 0.8,
                ease: "power2.inOut"
            }, "<+=0.02"); // Stagger slightly
        });

        // Step 3: TOKENIZATION (Color Change)
        // Transition from image patch to "Feature Vector" (purple box)
        tl.to(patches.map(p => p.el), {
            backgroundImage: "none",
            backgroundColor: "#a855f7", // Purple-500
            border: "2px solid #e9d5ff",
            boxShadow: "0 0 8px rgba(168, 85, 247, 0.4)",
            duration: 0.5
        });

        // Step 4: Enter Encoder
        // We stack them or stream them? Let's stream them into a single file line
        const encRefs = Object.values(uiRefs);

        // Move towards first block
        const b1Rect = encRefs[0].getBoundingClientRect();
        const b1X = b1Rect.left - wrapperRect.left + b1Rect.width / 2 - 16;
        const b1Y = b1Rect.top - wrapperRect.top + b1Rect.height / 2 - 16;

        tl.to(patches.map(p => p.el), {
            left: b1X,
            top: b1Y,
            scale: 0.5, // Shrink to flow
            opacity: 0.8,
            stagger: 0.02,
            duration: 0.6,
            ease: "power1.in"
        });

        // Step 5: Inside Encoder (Ping Pong)
        // Move to second block
        const b2Rect = encRefs[1].getBoundingClientRect();
        const b2X = b2Rect.left - wrapperRect.left + b2Rect.width / 2 - 16;
        const b2Y = b2Rect.top - wrapperRect.top + b2Rect.height / 2 - 16;

        tl.to(patches.map(p => p.el), {
            top: b2Y,
            backgroundColor: "#22c55e", // Green (Processed)
            stagger: 0.02,
            duration: 0.5
        });

        // Step 6: Move to Head (Converge)
        const headRect = headContainer.getBoundingClientRect();
        const hX = headRect.left - wrapperRect.left + headRect.width / 2 - 16;
        const hY = headRect.top - wrapperRect.top + headRect.height / 2 - 16;

        tl.to(patches.map(p => p.el), {
            left: hX,
            top: hY,
            opacity: 0, // Merge into nothing
            scale: 0,
            stagger: 0.01,
            duration: 0.6,
            ease: "circ.in"
        });

        // Step 7: Prediction
        tl.to(outLabel, {
            text: labelText, // Needs TextPlugin or just use callback
            duration: 0.1,
            onStart: () => {
                outLabel.innerText = labelText;
            }
        });
        tl.from(outLabel, {
            scale: 5,
            opacity: 0,
            rotation: -10,
            duration: 0.5,
            ease: "back.out(2)"
        });

        // Cleanup patches
        tl.add(() => {
            patches.forEach(p => p.el.remove());
        });
    };

    // Helpers
    function createStepNode(title, classes) {
        const d = document.createElement('div');
        d.className = `flex flex-col items-center justify-center p-4 border rounded-xl bg-white shadow-sm gap-2 ${classes}`;
        const t = document.createElement('span');
        t.className = "text-xs font-medium text-gray-500 uppercase text-center";
        t.innerText = title;
        d.appendChild(t);
        return d;
    }

    function addArrow(parent) {
        const arr = document.createElement('div');
        arr.innerHTML = `<svg class="w-6 h-6 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 8l4 4m0 0l-4 4m4-4H3"/></svg>`;
        parent.appendChild(arr);
    }
}
