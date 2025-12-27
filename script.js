fetch('./heart.svg')
  .then(res => res.text())
  .then(svg => {
    const container = document.getElementById('svg-container');
    container.innerHTML = svg;

    const groups = container.querySelectorAll('.section-group');

    const chapterMap = {
      "الفاتحة": 1, "البقرة": 2, "آل عمران": 3, "النساء": 4, "المائدة": 5, "الأنعام": 6,
      "الأعراف": 7, "الأنفال": 8, "التوبة": 9, "يونس": 10, "هود": 11, "يوسف": 12,
      "الرعد": 13, "إبراهيم": 14, "الحجر": 15, "النحل": 16, "الإسراء": 17, "الكهف": 18,
      "مريم": 19, "طه": 20, "الأنبياء": 21, "الحج": 22, "المؤمنون": 23, "النور": 24,
      "الفرقان": 25, "الشعراء": 26, "النمل": 27, "القصص": 28, "العنكبوت": 29, "الروم": 30,
      "لقمان": 31, "السجدة": 32, "الأحزاب": 33, "سبأ": 34, "فاطر": 35, "يس": 36,
      "الصافات": 37, "ص": 38, "الزمر": 39, "غافر": 40, "فصلت": 41, "الشورى": 42, "الشوري": 42,
      "الزخرف": 43, "الدخان": 44, "الجاثية": 45, "الأحقاف": 46, "محمد": 47, "الفتح": 48,
      "الحجرات": 49, "ق": 50, "الذاريات": 51, "الطور": 52, "النجم": 53, "القمر": 54,
      "الرحمن": 55, "الواقعة": 56, "الحديد": 57, "المجادلة": 58, "الحشر": 59, "الممتحنة": 60,
      "الصف": 61, "الجمعة": 62, "المنافقون": 63, "التغابن": 64, "الطلاق": 65, "التحريم": 66,
      "الملك": 67, "القلم": 68, "الحاقة": 69, "المعارج": 70, "نوح": 71, "الجن": 72,
      "المزمل": 73, "المدثر": 74, "القيامة": 75, "الإنسان": 76, "المرسلات": 77, "النبأ": 78,
      "النازعات": 79, "عبس": 80, "التكوير": 81, "الانفطار": 82, "المطففين": 83,
      "الانشقاق": 84, "البروج": 85, "الطارق": 86, "الأعلى": 87, "الأعلي": 87,
      "الغاشية": 88, "الفجر": 89, "البلد": 90, "الشمس": 91, "الليل": 92, "الضحى": 93, "الضحي": 93,
      "الشرح": 94, "التين": 95, "العلق": 96, "القدر": 97, "البينة": 98, "الزلزلة": 99,
      "العاديات": 100, "القارعة": 101, "التكاثر": 102, "العصر": 103, "الهمزة": 104,
      "الفيل": 105, "قريش": 106, "الماعون": 107, "الكوثر": 108, "الكافرون": 109,
      "النصر": 110, "المسد": 111, "الإخلاص": 112, "الفلق": 113, "الناس": 114
    };

    groups.forEach(group => {
      // Toggle active state on click
      group.addEventListener('click', () => {
        const paths = group.querySelectorAll('.section');
        const isActive = paths[0].classList.contains('active');

        paths.forEach(p => {
          p.classList.toggle('active', !isActive);
        });
      });

      const openChapter = () => {
        const textElement = group.querySelector('.section-text');
        if (textElement) {
          const chapterName = textElement.textContent.trim();
          const chapterNumber = chapterMap[chapterName];
          if (chapterNumber) {
            window.open(`https://quran.com/ar/${chapterNumber}`, '_blank');
          } else {
            console.warn(`Chapter number not found for: ${chapterName}`);
          }
        }
      };

      // Navigate to Quran.com on double click (Desktop)
      group.addEventListener('dblclick', openChapter);

      // Long press logic for touch devices
      let touchTimer;
      const longPressDuration = 500; // ms

      group.addEventListener('touchstart', (e) => {
        // Prevent default to avoid potential conflicts if needed, 
        // but here we likely want scrolling to still work if the user moves efficiently.
        // So we won't preventDefault immediately on start.
        touchTimer = setTimeout(() => {
          openChapter();
          // Optional: Vibrate to indicate long press success
          if (navigator.vibrate) navigator.vibrate(50);
        }, longPressDuration);
      }, { passive: true });

      group.addEventListener('touchend', () => {
        clearTimeout(touchTimer);
      });

      group.addEventListener('touchmove', () => {
        // If the user moves their finger, cancel the long press
        clearTimeout(touchTimer);
      });
    });

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
