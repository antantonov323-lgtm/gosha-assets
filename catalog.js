// Фильтрация товаров на странице каталога
document.addEventListener('DOMContentLoaded', () => {
  const filterNav = document.getElementById('catalogFilterNav');
  const catalogGrid = document.querySelector('.catalog-grid');
  const countEl = document.querySelector('.sidebar-count');

  if (!filterNav || !catalogGrid) return;

  const filterBtns = filterNav.querySelectorAll('.filter-btn');
  const cards = catalogGrid.querySelectorAll('.grid-card');

  function applyFilter(cat) {
    filterNav.querySelectorAll('.sidebar-nav__item').forEach(item => {
      const btn = item.querySelector('.filter-btn');
      if (btn && btn.dataset.category === cat) {
        item.classList.add('is-active');
      } else {
        item.classList.remove('is-active');
      }
    });

    let visibleCount = 0;
    cards.forEach(card => {
      const cardCat = card.dataset.category;
      const isMatch = (cat === 'all') || (cardCat === cat);
      if (isMatch) {
        card.style.display = '';
        visibleCount++;
      } else {
        card.style.display = 'none';
      }
    });

    if (countEl) {
      countEl.textContent = `${visibleCount} Products`;
    }

    const mobileCount = document.getElementById('catalogMobileFilterCount');
    if (mobileCount) {
      mobileCount.textContent = `(${visibleCount})`;
    }

    const mobileLabel = document.querySelector('#catalogMobileFilterTrigger .mobile-filter-trigger__label');
    if (mobileLabel) {
      mobileLabel.textContent = cat === 'all' ? 'ФИЛЬТРЫ' : cat.toUpperCase();
    }

    const mobileItems = document.querySelectorAll('#catalogMobileFilterList .mobile-filter-item');
    mobileItems.forEach(item => {
      item.classList.toggle('is-active', item.dataset.category === cat);
    });
  }

  filterBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const cat = btn.dataset.category;
      applyFilter(cat);

      const newUrl = cat === 'all' ? window.location.pathname : `?category=${cat}`;
      window.history.replaceState({}, '', newUrl);
    });
  });

  // Мобильная шторка фильтров каталога
  const catMobileTrigger = document.getElementById('catalogMobileFilterTrigger');
  const catMobileDrawer = document.getElementById('catalogMobileFilterDrawer');
  const catMobileClose = document.getElementById('catalogMobileFilterClose');
  const catMobileItems = document.querySelectorAll('#catalogMobileFilterList .mobile-filter-item');

  if (catMobileTrigger && catMobileDrawer) {
    catMobileTrigger.addEventListener('click', (e) => {
      e.stopPropagation();
      catMobileDrawer.classList.toggle('is-open');
    });

    if (catMobileClose) {
      catMobileClose.addEventListener('click', () => {
        catMobileDrawer.classList.remove('is-open');
      });
    }

    document.addEventListener('click', (e) => {
      if (!catMobileDrawer.contains(e.target) && !catMobileTrigger.contains(e.target)) {
        catMobileDrawer.classList.remove('is-open');
      }
    });

    catMobileItems.forEach(item => {
      item.addEventListener('click', () => {
        const cat = item.dataset.category;
        applyFilter(cat);
        catMobileDrawer.classList.remove('is-open');

        const newUrl = cat === 'all' ? window.location.pathname : `?category=${cat}`;
        window.history.replaceState({}, '', newUrl);
      });
    });
  }

  // Проверка начального параметра в URL
  const urlParams = new URLSearchParams(window.location.search);
  const initialCategory = urlParams.get('category');
  if (initialCategory && ['dresses', 'tops', 'skirts', 'longsleeves', 'pants'].includes(initialCategory)) {
    applyFilter(initialCategory);
  }

  // Клик по карточке товара открывает страницу товара (кроме видео) с бесшовной анимацией
  cards.forEach(card => {
    if (!card.classList.contains('grid-card--video')) {
      card.addEventListener('click', () => {
        const uid = card.dataset.uid;
        if (uid) {
          const targetUrl = `product.html?id=${encodeURIComponent(uid)}`;
          if (typeof window.navigateTo === 'function') {
            window.navigateTo(targetUrl);
          } else {
            window.location.href = targetUrl;
          }
        }
      });
    }
  });
});
