fetch('./heart.svg')
  .then(res => res.text())
  .then(svg => {
    const container = document.getElementById('svg-container');
    container.innerHTML = svg;

    const groups = container.querySelectorAll('.section-group');

    // Memorization level state
    let currentLevel = null;

    // Level button elements
    const levelButtons = {
      good: document.getElementById('level-good'),
      middle: document.getElementById('level-middle'),
      weak: document.getElementById('level-weak')
    };

    // Save state to localStorage
    function saveState() {
      const state = {};
      groups.forEach(group => {
        const paths = group.querySelectorAll('.section');
        if (paths.length > 0) {
          const path = paths[0];
          const id = path.id;
          if (id) {
            const classes = [];
            if (path.classList.contains('level-good')) classes.push('level-good');
            if (path.classList.contains('level-middle')) classes.push('level-middle');
            if (path.classList.contains('level-weak')) classes.push('level-weak');
            if (path.classList.contains('active')) classes.push('active');
            state[id] = classes;
          }
        }
      });
      localStorage.setItem('quranHeartState', JSON.stringify(state));
    }

    // Load state from localStorage
    function loadState() {
      const savedState = localStorage.getItem('quranHeartState');
      if (savedState) {
        try {
          const state = JSON.parse(savedState);
          groups.forEach(group => {
            const paths = group.querySelectorAll('.section');
            if (paths.length > 0) {
              const path = paths[0];
              const id = path.id;
              if (id && state[id]) {
                paths.forEach(p => {
                  // Remove all classes first
                  p.classList.remove('level-good', 'level-middle', 'level-weak', 'active');
                  // Apply saved classes
                  state[id].forEach(cls => p.classList.add(cls));
                });
              }
            }
          });
        } catch (e) {
          console.error('Error loading saved state:', e);
        }
      }
    }

    // Level button click handlers
    Object.keys(levelButtons).forEach(level => {
      levelButtons[level].addEventListener('click', () => {
        // Toggle selection
        if (currentLevel === level) {
          currentLevel = null;
          levelButtons[level].classList.remove('active');
        } else {
          // Deactivate all buttons
          Object.values(levelButtons).forEach(btn => btn.classList.remove('active'));
          // Activate selected button
          currentLevel = level;
          levelButtons[level].classList.add('active');
        }
      });
    });

    // Section click handler
    groups.forEach(group => {
      group.addEventListener('click', () => {
        const paths = group.querySelectorAll('.section');

        if (currentLevel) {
          // Apply memorization level
          const hasLevel = paths[0].classList.contains(`level-${currentLevel}`);

          paths.forEach(p => {
            // Remove all level classes
            p.classList.remove('level-good', 'level-middle', 'level-weak', 'active');

            // If clicking the same level, remove it (toggle off)
            // Otherwise, apply the new level
            if (!hasLevel) {
              p.classList.add(`level-${currentLevel}`);
            }
          });
        } else {
          // No level selected - toggle the old active state (red color)
          const isActive = paths[0].classList.contains('active');

          paths.forEach(p => {
            // Remove all level classes first
            p.classList.remove('level-good', 'level-middle', 'level-weak');
            // Toggle active
            p.classList.toggle('active', !isActive);
          });
        }

        // Save state after each click
        saveState();
      });
    });

    // Load saved state after setting up event handlers
    loadState();

    // Download functionality
    const downloadDesktop = document.getElementById('download-desktop');
    const downloadMobile = document.getElementById('download-mobile');
    const downloadCustom = document.getElementById('download-custom');
    const modal = document.getElementById('custom-modal');
    const modalCancel = document.getElementById('modal-cancel');
    const modalDownload = document.getElementById('modal-download');
    const customWidth = document.getElementById('custom-width');
    const customHeight = document.getElementById('custom-height');

    // Set initial custom dimensions to current screen size
    customWidth.value = window.screen.width;
    customHeight.value = window.screen.height;

    // Download function
    function downloadSVG(width, height) {
      const svgElement = container.querySelector('svg');
      if (!svgElement) return;

      // Clone the SVG
      const clonedSVG = svgElement.cloneNode(true);

      // Get the actual bounding box of the heart content (not the viewBox which has lots of padding)
      const bbox = svgElement.getBBox();
      const svgWidth = bbox.width;
      const svgHeight = bbox.height;
      const svgAspectRatio = svgWidth / svgHeight;

      // Calculate dimensions to fit the heart in the center while maintaining aspect ratio
      const targetAspectRatio = width / height;
      let scaledWidth, scaledHeight;

      if (svgAspectRatio > targetAspectRatio) {
        // SVG is wider than target
        scaledWidth = width * 0.8; // 0.8 for some padding
        scaledHeight = scaledWidth / svgAspectRatio;
      } else {
        // SVG is taller than target
        scaledHeight = height * 0.8; // 0.8 for some padding
        scaledWidth = scaledHeight * svgAspectRatio;
      }

      // Calculate position to center the heart
      const x = (width - scaledWidth) / 2;
      const y = (height - scaledHeight) / 2;

      // Update the viewBox to match the actual content bounds (removes extra padding)
      clonedSVG.setAttribute('viewBox', `${bbox.x} ${bbox.y} ${bbox.width} ${bbox.height}`);
      // Set the SVG to render at the exact scaled size for maximum quality
      clonedSVG.setAttribute('width', scaledWidth);
      clonedSVG.setAttribute('height', scaledHeight);

      // Embed styles inline in the cloned SVG
      const styleElement = document.createElementNS('http://www.w3.org/2000/svg', 'style');
      styleElement.textContent = `
        .section {
          fill: #ffffff;
          transition: fill 0.25s ease;
        }
        .section.active {
          fill: #e63946;
        }
        .section.level-good {
          fill: #4caf50 !important;
        }
        .section.level-middle {
          fill: #ffc107 !important;
        }
        .section.level-weak {
          fill: #f44336 !important;
        }
        .section-text {
          fill: #000000;
          font-size: 14px;
          font-weight: bold;
          pointer-events: none;
          user-select: none;
          transition: fill 0.25s ease;
        }
        .section.active + .section-text {
          fill: #ffffff;
        }
        .section.level-good + .section-text,
        .section.level-middle + .section-text,
        .section.level-weak + .section-text {
          fill: #ffffff;
        }
      `;
      clonedSVG.insertBefore(styleElement, clonedSVG.firstChild);

      // Create canvas
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');

      // Fill background
      ctx.fillStyle = '#222831';
      ctx.fillRect(0, 0, width, height);

      // Serialize SVG
      const serializer = new XMLSerializer();
      let svgString = serializer.serializeToString(clonedSVG);

      // Create blob and image
      const blob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const img = new Image();

      img.onload = function () {
        // Enable high-quality image rendering
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';

        // Draw the SVG centered on canvas with correct aspect ratio
        ctx.drawImage(img, x, y, scaledWidth, scaledHeight);

        // Convert to PNG and download with maximum quality
        canvas.toBlob(function (blob) {
          const link = document.createElement('a');
          link.download = `quran-heart-${width}x${height}.png`;
          link.href = URL.createObjectURL(blob);
          link.click();
          URL.revokeObjectURL(link.href);
        }, 'image/png', 1.0); // 1.0 = maximum quality

        URL.revokeObjectURL(url);
      };

      img.src = url;
    }

    // Desktop download (1920x1080)
    downloadDesktop.addEventListener('click', () => {
      downloadSVG(1920, 1080);
    });

    // Mobile download (1080x1920)
    downloadMobile.addEventListener('click', () => {
      downloadSVG(1080, 1920);
    });

    // Custom download
    downloadCustom.addEventListener('click', () => {
      modal.classList.add('active');
    });

    // Modal cancel
    modalCancel.addEventListener('click', () => {
      modal.classList.remove('active');
    });

    // Modal download
    modalDownload.addEventListener('click', () => {
      const width = parseInt(customWidth.value);
      const height = parseInt(customHeight.value);

      if (width >= 100 && width <= 10000 && height >= 100 && height <= 10000) {
        downloadSVG(width, height);
        modal.classList.remove('active');
      } else {
        alert('Please enter valid dimensions between 100 and 10000 pixels.');
      }
    });

    // Close modal on background click
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        modal.classList.remove('active');
      }
    });
  });
