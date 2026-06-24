document.addEventListener('DOMContentLoaded', () => {
    // Initialize fold variables at the top to share across handlers
    const totalFolds = 5;
    const labels = [];
    const images = [];

    for (let i = 1; i <= totalFolds; i++) {
        images[i] = document.getElementById(`img-fold-${i}`);
        labels[i] = document.getElementById(`img-fold-${i}-label`);
    }

    // Helper to hide a fold container and info box smoothly
    function hideFold(index) {
        const label = labels[index];
        const infoBox = document.getElementById(`img-fold-${index}-info-box`);
        if (!label) return;

        if (label.classList.contains('show')) {
            label.classList.remove('show');
            label.classList.add('hide');
            
            if (infoBox && infoBox.classList.contains('show')) {
                infoBox.classList.remove('show');
                infoBox.classList.add('hide');
            }

            const currentLabel = label;
            const currentInfoBox = infoBox;
            setTimeout(() => {
                if (currentLabel.classList.contains('hide')) {
                    currentLabel.classList.remove('hide');
                    currentLabel.style.bottom = '';
                    currentLabel.style.top = '';
                }
                if (currentInfoBox && currentInfoBox.classList.contains('hide')) {
                    currentInfoBox.classList.remove('hide');
                }
            }, 500);
        }
    }
    // ==========================================================================
    // 1. Dropdown Menu Toggle
    // ==========================================================================
    const mainMenuBtn = document.getElementById('main-menu-btn');
    const submenuContainer = document.getElementById('submenu-list');

    if (mainMenuBtn && submenuContainer) {
        mainMenuBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            submenuContainer.classList.toggle('open');
        });
    }

    // Close menu and active info boxes when clicking outside
    document.addEventListener('click', (e) => {
        const menuContainer = document.querySelector('.menu-container');
        if (menuContainer && submenuContainer && !e.target.closest('.menu-container')) {
            submenuContainer.classList.remove('open');
        }

        // Close active info boxes when clicking outside gallery image buttons
        if (!e.target.closest('.gallery-item')) {
            for (let j = 1; j <= totalFolds; j++) {
                hideFold(j);
            }
        }
    });

    // ==========================================================================
    // 2. Tab Content Navigation (Fading Views) (Safeguarded)
    // ==========================================================================
    const subMenuButtons = document.querySelectorAll('.submenu-btn');
    const galleryContainer = document.getElementById('gallery-container');
    const panels = {
        'identity': document.getElementById('panel-identity'),
        'direction': document.getElementById('panel-direction'),
        'gathering': document.getElementById('panel-gathering'),
        'leaving': document.getElementById('panel-leaving'),
        'things': 'gallery'
    };

    let activePanelKey = 'things';

    function switchView(targetKey) {
        if (targetKey === activePanelKey) return;
        const currentKey = activePanelKey;
        const currentElement = currentKey === 'things' ? galleryContainer : panels[currentKey];
        const targetElement = targetKey === 'things' ? galleryContainer : panels[targetKey];
        if (!currentElement || !targetElement) return;

        if (currentKey === 'things') {
            currentElement.classList.add('hidden');
        } else {
            currentElement.classList.remove('active');
        }

        setTimeout(() => {
            if (currentElement) {
                currentElement.style.display = 'none';
            }
            if (targetKey === 'things') {
                targetElement.style.display = 'flex';
                targetElement.offsetHeight; // trigger reflow
                targetElement.classList.remove('hidden');
            } else {
                targetElement.style.display = 'block';
                targetElement.offsetHeight; // trigger reflow
                targetElement.classList.add('active');
            }
            activePanelKey = targetKey;
            
            // Recalculate label positions when view changes
            updateLabelPositions();
        }, 300);
    }

    subMenuButtons.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            const page = btn.getAttribute('data-page');
            if (page) {
                switchView(page);
                if (window.innerWidth <= 768 && submenuContainer) {
                    submenuContainer.classList.remove('open');
                }
            }
        });
    });

    const backToGalleryBtns = document.querySelectorAll('.back-home-btn');
    backToGalleryBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            switchView('things');
        });
    });

    // ==========================================================================
    // 3. Fullscreen Lightbox Modal (Click to Zoom Gallery Images)
    // ==========================================================================
    const galleryItems = document.querySelectorAll('.gallery-item');
    const lightbox = document.getElementById('lightbox-modal');
    const lightboxImg = document.getElementById('lightbox-img');
    const lightboxClose = document.getElementById('lightbox-close');

    // Mapping for big images in img_a4folding/big
    const bigImages = [
        'img_a4folding/big/제목을 입력해주세요..png',
        'img_a4folding/big/제목을 입력해주세요. (1).png',
        'img_a4folding/big/제목을 입력해주세요. (2).png',
        'img_a4folding/big/제목을 입력해주세요. (3).png',
        'img_a4folding/big/제목을 입력해주세요. (4).png'
    ];

    // Image click functionalities disabled (static images only, no links or click actions)
    /*
    galleryItems.forEach(item => {
        item.addEventListener('click', () => {
            const index = parseInt(item.getAttribute('data-index'), 10);
            if (!isNaN(index) && bigImages[index]) {
                // Set image src
                lightboxImg.src = bigImages[index];
                
                // Show lightbox
                lightbox.style.display = 'flex';
                // Trigger reflow
                lightbox.offsetHeight;
                // Add active class for transition
                lightbox.classList.add('active');
            }
        });
    });
    */

    function closeLightbox() {
        lightbox.classList.remove('active');
        // Wait for transition before hiding display
        setTimeout(() => {
            lightbox.style.display = 'none';
            lightboxImg.src = ''; // Clear src
        }, 400);
    }

    // Close lightbox on button click
    lightboxClose.addEventListener('click', closeLightbox);

    // Close lightbox when clicking background
    lightbox.addEventListener('click', (e) => {
        if (e.target === lightbox || e.target.classList.contains('lightbox-wrap')) {
            closeLightbox();
        }
    });

    // Close lightbox on Escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && lightbox.classList.contains('active')) {
            closeLightbox();
        }
    });

    // ==========================================================================
    // 4. Image Button Click Rotation and Label Interactions (All 5 buttons)
    // ==========================================================================

    function isOverlapping(rect1, rect2) {
        return !(rect1.right < rect2.left || 
                 rect1.left > rect2.right || 
                 rect1.bottom < rect2.top || 
                 rect1.top > rect2.bottom);
    }

    function updateLabelPositions() {
        const isMobile = window.innerWidth <= 768 || window.innerHeight <= 780;
        const activePanel = document.querySelector('.content-panel.active');
        
        for (let i = 1; i <= totalFolds; i++) {
            const label = labels[i];
            if (label && label.classList.contains('show')) {
                label.style.bottom = '';
                label.style.top = '';

                // 오로지 그리고 라벨(i === 5)만 수정안을 유지하고 다른 라벨은 기존 CSS안을 따름
                if (i === 5 && isMobile) {
                    label.style.bottom = 'calc(50% + 140px)';

                    if (activePanel) {
                        const labelRect = label.getBoundingClientRect();
                        const panelRect = activePanel.getBoundingClientRect();
                        
                        if (isOverlapping(labelRect, panelRect)) {
                            label.style.bottom = 'auto';
                            label.style.top = '10px';
                        }
                    }
                }
            } else if (label) {
                label.style.bottom = '';
                label.style.top = '';
            }
        }
    }

    for (let i = 1; i <= totalFolds; i++) {
        const img = images[i];
        const label = labels[i];
        const infoBox = document.getElementById(`img-fold-${i}-info-box`);

        if (img && label) {
            img.addEventListener('click', (e) => {
                e.preventDefault();

                // Quickly rotate 360 degrees horizontally
                img.classList.remove('rotate-360-horizontal');
                void img.offsetWidth; // Trigger reflow to restart animation
                img.classList.add('rotate-360-horizontal');

                // Toggle show/hide of the label container and info box with mutual exclusivity
                if (label.classList.contains('show')) {
                    hideFold(i);
                } else {
                    // Hide all other labels and info boxes first
                    for (let j = 1; j <= totalFolds; j++) {
                        if (j !== i) {
                            hideFold(j);
                        }
                    }
                    label.classList.remove('hide');
                    label.classList.add('show');
                    if (infoBox) {
                        infoBox.classList.remove('hide');
                        infoBox.classList.add('show');
                    }
                    
                    // Update label positions after rendering is completed
                    requestAnimationFrame(() => {
                        updateLabelPositions();
                    });
                }
            });

            // Clean up animation class on completion to allow restarting on future clicks
            img.addEventListener('animationend', () => {
                img.classList.remove('rotate-360-horizontal');
            });
        }
    }

    window.addEventListener('resize', updateLabelPositions);
});
