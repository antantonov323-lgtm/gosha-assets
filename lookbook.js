/**
 * lookbook.js
 * Минималистичный эдиториал лукбук высокой моды для ГОША КАРЦЕВ
 * 
 * 1. Верхняя полноэкранная карусель (Hero) главных фото коллекций:
 *    - Слайды Collection 01 и Collection 02
 *    - Стрелки переключения
 *    - Минимум текста: только номер/название коллекции
 * 2. При переключении карусели коллекций — снизу в 75vw сетке меняются луки
 * 3. Правая колонка 25vw свободна от контента (чистая зона под навигацию)
 */

document.addEventListener('DOMContentLoaded', () => {
  const collectionsData = {
    'collection-1': {
      id: 'collection-1',
      title: 'COLLECTION 01',
      subtitle: 'URBAN MONO',
      count: '6 LOOKS',
      heroImage: 'assets/lookbook/Collection 1 (1).jpg',
      items: [
        { src: 'assets/lookbook/Collection 1 (1).jpg', title: 'LOOK 01' },
        { src: 'assets/lookbook/Collection 1 (2).jpg', title: 'LOOK 02' },
        { src: 'assets/lookbook/Collection 1 (3).jpg', title: 'LOOK 03' },
        { src: 'assets/lookbook/Collection 1 (4).jpg', title: 'LOOK 04' },
        { src: 'assets/lookbook/Collection 1 (5).jpg', title: 'LOOK 05' },
        { src: 'assets/lookbook/Collection 1 (6).jpg', title: 'LOOK 06' }
      ]
    },
    'collection-2': {
      id: 'collection-2',
      title: 'COLLECTION 02',
      subtitle: 'NIGHT NOIR',
      count: '9 LOOKS',
      heroImage: 'assets/lookbook/collection 2 (1).jpg',
      items: [
        { src: 'assets/lookbook/collection 2 (1).jpg', title: 'LOOK 01' },
        { src: 'assets/lookbook/collection 2 (2).jpg', title: 'LOOK 02' },
        { src: 'assets/lookbook/collection 2 (3).jpg', title: 'LOOK 03' },
        { src: 'assets/lookbook/collection 2 (4).jpg', title: 'LOOK 04' },
        { src: 'assets/lookbook/collection 2 (5).jpg', title: 'LOOK 05' },
        { src: 'assets/lookbook/collection 2 (6).jpg', title: 'LOOK 06' },
        { src: 'assets/lookbook/collection 2 (7).jpg', title: 'LOOK 07' },
        { src: 'assets/lookbook/collection 2 (8).jpg', title: 'LOOK 08', isWide: true },
        { src: 'assets/lookbook/collection 2 (9).jpg', title: 'LOOK 09', isWide: true }
      ]
    }
  };

  const collectionKeys = Object.keys(collectionsData);
  let currentIndex = 0;

  const slides = document.querySelectorAll('.lb-hero-slide');
  const prevBtn = document.getElementById('lbHeroPrev');
  const nextBtn = document.getElementById('lbHeroNext');
  const collectionNavBtns = document.querySelectorAll('.lb-nav-btn');
  const gridContainer = document.getElementById('lookbookEditorialGrid');
  const activeCountEl = document.getElementById('lbSidebarCount');

  function setCollection(index) {
    if (index < 0) index = collectionKeys.length - 1;
    if (index >= collectionKeys.length) index = 0;

    currentIndex = index;
    const key = collectionKeys[currentIndex];
    const data = collectionsData[key];

    // 1. Переключение верхних слайдов
    slides.forEach((slide, idx) => {
      if (idx === currentIndex) {
        slide.classList.add('is-active');
      } else {
        slide.classList.remove('is-active');
      }
    });

    // 2. Сайдбар-переключатели
    collectionNavBtns.forEach(btn => {
      if (btn.dataset.collection === key) {
        btn.classList.add('is-active');
      } else {
        btn.classList.remove('is-active');
      }
    });

    // 3. Количество луков
    if (activeCountEl) {
      activeCountEl.textContent = data.count;
    }

    // 4. Отрисовка нижней сетки фото
    renderGrid(data.items);
  }

  function renderGrid(items) {
    if (!gridContainer) return;

    gridContainer.style.opacity = '0';

    setTimeout(() => {
      gridContainer.innerHTML = '';

      items.forEach((item, idx) => {
        const card = document.createElement('article');
        card.className = 'lb-look-card' + (item.isWide ? ' lb-look-card--wide' : '');

        card.innerHTML = `
          <img src="${item.src}" alt="${item.title}" loading="lazy" class="lb-look-card__img" />
          <div class="lb-look-card__overlay">
            <span>${item.title}</span>
          </div>
        `;

        gridContainer.appendChild(card);
      });

      gridContainer.style.transition = 'opacity 0.3s ease';
      gridContainer.style.opacity = '1';
    }, 150);
  }

  // Клики по стрелкам
  if (prevBtn) {
    prevBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      setCollection(currentIndex - 1);
    });
  }

  if (nextBtn) {
    nextBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      setCollection(currentIndex + 1);
    });
  }

  // Клики по кнопкам сайдбара
  collectionNavBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const targetKey = btn.dataset.collection;
      const targetIndex = collectionKeys.indexOf(targetKey);
      if (targetIndex !== -1) {
        setCollection(targetIndex);
      }
    });
  });

  // Свайп жесты на hero карусели
  const heroCarousel = document.getElementById('lookbookHero');
  if (heroCarousel) {
    let touchStartX = 0;
    heroCarousel.addEventListener('touchstart', (e) => {
      touchStartX = e.changedTouches[0].clientX;
    }, { passive: true });

    heroCarousel.addEventListener('touchend', (e) => {
      const touchEndX = e.changedTouches[0].clientX;
      const diff = touchEndX - touchStartX;
      if (Math.abs(diff) > 40) {
        if (diff < 0) {
          setCollection(currentIndex + 1);
        } else {
          setCollection(currentIndex - 1);
        }
      }
    }, { passive: true });
  }

  // Клавиатура стрелки
  window.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowRight') setCollection(currentIndex + 1);
    if (e.key === 'ArrowLeft') setCollection(currentIndex - 1);
  });

  // Старт
  setCollection(0);
});
