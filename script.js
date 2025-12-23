fetch("./heart.svg")
  .then((res) => res.text())
  .then((svg) => {
    const container = document.getElementById("svg-container");
    container.innerHTML = svg;

    const groups = container.querySelectorAll(".section-group");
    const STORAGE_KEY = "quran-heart-active-sections";

    // Statistics functions
    function updateStats() {
      const total = groups.length;
      // count active groups
      let completed = 0;
      groups.forEach((g) => {
        const path = g.querySelector(".section");
        if (path && path.classList.contains("active")) {
          completed++;
        }
      });

      const remaining = total - completed;
      const completedPercentage =
        total === 0 ? 0 : Math.round((completed / total) * 100);
      const remainingPercentage = 100 - completedPercentage;

      document.getElementById(
        "stat-completed"
      ).textContent = `${completed} سورة`;
      document.getElementById(
        "stat-remaining"
      ).textContent = `${remaining} سورة`;
      document.getElementById(
        "stat-progress-bar"
      ).style.width = `${completedPercentage}%`;
      document.getElementById(
        "stat-percentage"
      ).textContent = `تم حفظ ${completedPercentage}% من القرآن الكريم والمتبقي ${remainingPercentage}%`;
    }

    // Zoom and Pan Logic
    let scale = 1;
    let pointX = 0;
    let pointY = 0;
    let startX = 0;
    let startY = 0;
    let isPanning = false;
    let isDragging = false;

    const svgElement = container.querySelector("svg");

    function setTransform() {
      svgElement.style.transform = `translate(${pointX}px, ${pointY}px) scale(${scale})`;
    }

    // Zoom Controls
    const zoomInBtn = document.getElementById("zoom-in");
    const zoomOutBtn = document.getElementById("zoom-out");
    const zoomResetBtn = document.getElementById("zoom-reset");

    if (zoomInBtn) {
      zoomInBtn.addEventListener("click", () => {
        scale = Math.min(scale + 0.2, 4);
        setTransform();
      });
    }

    if (zoomOutBtn) {
      zoomOutBtn.addEventListener("click", () => {
        scale = Math.max(scale - 0.2, 0.5);
        setTransform();
      });
    }

    if (zoomResetBtn) {
      zoomResetBtn.addEventListener("click", () => {
        scale = 1;
        pointX = 0;
        pointY = 0;
        setTransform();
      });
    }

    // Mouse Events for Panning
    container.addEventListener("mousedown", (e) => {
      if (
        e.target.closest(".zoom-btn") ||
        e.target.closest(".download-btn") ||
        e.target.closest(".modal")
      )
        return;
      isPanning = true;
      isDragging = false;
      startX = e.clientX - pointX;
      startY = e.clientY - pointY;
      svgElement.style.cursor = "grabbing";
    });

    container.addEventListener("mousemove", (e) => {
      if (!isPanning) return;
      e.preventDefault();
      // Consider it a drag if moved significantly
      if (
        Math.abs(e.clientX - startX - pointX) > 5 ||
        Math.abs(e.clientY - startY - pointY) > 5
      ) {
        isDragging = true;
      }
      pointX = e.clientX - startX;
      pointY = e.clientY - startY;
      setTransform();
    });

    container.addEventListener("mouseup", () => {
      isPanning = false;
      svgElement.style.cursor = "grab";
      // Delay resetting isDragging slightly so click event can see it
      setTimeout(() => {
        isDragging = false;
      }, 50);
    });

    container.addEventListener("mouseleave", () => {
      isPanning = false;
      svgElement.style.cursor = "grab";
      isDragging = false;
    });

    // Wheel Zoom
    container.addEventListener("wheel", (e) => {
      e.preventDefault();
      const zoomSensitivity = 0.001;
      const delta = -e.deltaY * zoomSensitivity;
      scale = Math.min(Math.max(0.5, scale + delta), 4);
      setTransform();
    });

    // Touch Events
    container.addEventListener(
      "touchstart",
      (e) => {
        if (
          e.target.closest(".zoom-btn") ||
          e.target.closest(".download-btn") ||
          e.target.closest(".modal")
        )
          return;
        if (e.touches.length === 1) {
          isPanning = true;
          isDragging = false;
          startX = e.touches[0].clientX - pointX;
          startY = e.touches[0].clientY - pointY;
        }
      },
      { passive: false }
    );

    container.addEventListener(
      "touchmove",
      (e) => {
        if (!isPanning) return;
        if (e.touches.length === 1) {
          e.preventDefault();
          isDragging = true;
          pointX = e.touches[0].clientX - startX;
          pointY = e.touches[0].clientY - startY;
          setTransform();
        }
      },
      { passive: false }
    );

    container.addEventListener("touchend", () => {
      isPanning = false;
      setTimeout(() => {
        isDragging = false;
      }, 50);
    });

    // Load saved selections
    const savedSelections = JSON.parse(
      localStorage.getItem(STORAGE_KEY) || "[]"
    );
    groups.forEach((group) => {
      const textElement = group.querySelector(".section-text");
      if (textElement) {
        const name = textElement.textContent.trim();
        if (savedSelections.includes(name)) {
          const paths = group.querySelectorAll(".section");
          paths.forEach((p) => p.classList.add("active"));
        }
      }
    });

    // Initial stats update
    updateStats();

    groups.forEach((group) => {
      group.addEventListener("click", (e) => {
        if (isDragging) {
          e.preventDefault();
          e.stopPropagation();
          return;
        }

        const paths = group.querySelectorAll(".section");
        const isActive = paths[0].classList.contains("active");

        const textElement = group.querySelector(".section-text");
        let name = "";
        if (textElement) {
          name = textElement.textContent.trim();
        }

        paths.forEach((p) => {
          p.classList.toggle("active", !isActive);
        });

        // Update Local Storage
        if (name) {
          let selections = JSON.parse(
            localStorage.getItem(STORAGE_KEY) || "[]"
          );
          if (!isActive) {
            // We just activated it (since it WAS NOT active)
            if (!selections.includes(name)) {
              selections.push(name);
            }
          } else {
            // We just deactivated it (since it WAS active)
            selections = selections.filter((item) => item !== name);
          }
          localStorage.setItem(STORAGE_KEY, JSON.stringify(selections));
        }

        updateStats();
      });
    });

    // Reset Progress
    const resetBtn = document.getElementById("reset-progress");
    if (resetBtn) {
      resetBtn.addEventListener("click", () => {
        if (confirm("هل أنت متأكد أنك تريد حذف كل ما تم حفظه؟")) {
          // "Are you sure you want to delete all saved progress?"
          localStorage.removeItem(STORAGE_KEY);
          groups.forEach((group) => {
            const paths = group.querySelectorAll(".section");
            paths.forEach((p) => p.classList.remove("active"));
          });
          updateStats();
        }
      });
    }

    // Download functionality
    const downloadDesktop = document.getElementById("download-desktop");
    const downloadMobile = document.getElementById("download-mobile");
    const downloadCustom = document.getElementById("download-custom");
    const modal = document.getElementById("custom-modal");
    const modalCancel = document.getElementById("modal-cancel");
    const modalDownload = document.getElementById("modal-download");
    const customWidth = document.getElementById("custom-width");
    const customHeight = document.getElementById("custom-height");

    // Set initial custom dimensions to current screen size
    customWidth.value = window.screen.width;
    customHeight.value = window.screen.height;

    // Download function
    function downloadSVG(width, height) {
      const svgElement = container.querySelector("svg");
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
      clonedSVG.setAttribute(
        "viewBox",
        `${bbox.x} ${bbox.y} ${bbox.width} ${bbox.height}`
      );
      // Set the SVG to render at the exact scaled size for maximum quality
      clonedSVG.setAttribute("width", scaledWidth);
      clonedSVG.setAttribute("height", scaledHeight);

      // Embed styles inline in the cloned SVG
      const styleElement = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "style"
      );
      styleElement.textContent = `
        .section {
          fill: #ffffff;
          transition: fill 0.25s ease;
        }
        .section.active {
          fill: #e63946;
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
      `;
      clonedSVG.insertBefore(styleElement, clonedSVG.firstChild);

      // Create canvas
      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d");

      // Fill background
      ctx.fillStyle = "#222831";
      ctx.fillRect(0, 0, width, height);

      // Serialize SVG
      const serializer = new XMLSerializer();
      let svgString = serializer.serializeToString(clonedSVG);

      // Create blob and image
      const blob = new Blob([svgString], {
        type: "image/svg+xml;charset=utf-8",
      });
      const url = URL.createObjectURL(blob);
      const img = new Image();

      img.onload = function () {
        // Enable high-quality image rendering
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = "high";

        // Draw the SVG centered on canvas with correct aspect ratio
        ctx.drawImage(img, x, y, scaledWidth, scaledHeight);

        // Convert to PNG and download with maximum quality
        canvas.toBlob(
          function (blob) {
            const link = document.createElement("a");
            link.download = `quran-heart-${width}x${height}.png`;
            link.href = URL.createObjectURL(blob);
            link.click();
            URL.revokeObjectURL(link.href);
          },
          "image/png",
          1.0
        ); // 1.0 = maximum quality

        URL.revokeObjectURL(url);
      };

      img.src = url;
    }

    // Desktop download (1920x1080)
    downloadDesktop.addEventListener("click", () => {
      downloadSVG(1920, 1080);
    });

    // Mobile download (1080x1920)
    downloadMobile.addEventListener("click", () => {
      downloadSVG(1080, 1920);
    });

    // Custom download
    downloadCustom.addEventListener("click", () => {
      modal.classList.add("active");
    });

    // Modal cancel
    modalCancel.addEventListener("click", () => {
      modal.classList.remove("active");
    });

    // Modal download
    modalDownload.addEventListener("click", () => {
      const width = parseInt(customWidth.value);
      const height = parseInt(customHeight.value);

      if (width >= 100 && width <= 10000 && height >= 100 && height <= 10000) {
        downloadSVG(width, height);
        modal.classList.remove("active");
      } else {
        alert("Please enter valid dimensions between 100 and 10000 pixels.");
      }
    });

    // Close modal on background click
    modal.addEventListener("click", (e) => {
      if (e.target === modal) {
        modal.classList.remove("active");
      }
    });
  });
