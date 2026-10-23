/* ─────────────────────────────────────────────
   CUSTOM CURSOR (SHOP) — ТОЛЬКО НА ПЕРВОМ БЛОКЕ (HERO)
───────────────────────────────────────────── */
const cursorShop = document.getElementById('cursorShop');
const heroSection = document.getElementById('hero');
const heroNav = document.getElementById('heroNav');

if (cursorShop && heroSection) {
  let targetX = 0;
  let targetY = 0;
  let currentX = 0;
  let currentY = 0;
  let isMoving = false;
  let mouseInsideHero = false;
  let hoveringInteractive = false;

  // Фактор инерции (lerp)
  const ease = 0.12;

  function updateCursorVisibility() {
    const isHeroVisible = window.scrollY < (heroSection.offsetHeight * 0.7);
    if (mouseInsideHero && isHeroVisible && !hoveringInteractive) {
      cursorShop.classList.add('is-active');
    } else {
      cursorShop.classList.remove('is-active');
    }
  }

  // Следим за движением мыши ТОЛЬКО внутри первого экрана hero
  heroSection.addEventListener('mouseenter', () => {
    mouseInsideHero = true;
    updateCursorVisibility();
  });

  heroSection.addEventListener('mouseleave', () => {
    mouseInsideHero = false;
    updateCursorVisibility();
  });

  heroSection.addEventListener('mousemove', (e) => {
    targetX = e.clientX;
    targetY = e.clientY;

    if (!isMoving) {
      currentX = targetX;
      currentY = targetY;
      isMoving = true;
    }

    mouseInsideHero = true;
    updateCursorVisibility();
  });

  window.addEventListener('mouseleave', () => {
    mouseInsideHero = false;
    updateCursorVisibility();
  });

  // Цикл анимации с физикой lerp для плавной инерции
  function renderCursor() {
    if (isMoving) {
      currentX += (targetX - currentX) * ease;
      currentY += (targetY - currentY) * ease;
      cursorShop.style.transform = `translate3d(${currentX + 12}px, ${currentY - 18}px, 0)`;
    }
    requestAnimationFrame(renderCursor);
  }

  requestAnimationFrame(renderCursor);

  // Скрытие SHOP при наведении на кликабельные пункты интерфейса
  const interactiveElements = document.querySelectorAll('.home-header a, .ui-nav a');
  interactiveElements.forEach((el) => {
    el.addEventListener('mouseenter', () => {
      hoveringInteractive = true;
      updateCursorVisibility();
    });
    el.addEventListener('mouseleave', () => {
      hoveringInteractive = false;
      updateCursorVisibility();
    });
  });

  // Управление видимостью и фиксацией навигации при скролле
  function handleScroll() {
    const scrollY = window.scrollY;
    const isScrolled = scrollY > 40;
    document.body.classList.toggle('is-scrolled', isScrolled);

    // Меню Hero в нижнем правом углу плавно скрывается при переходе к каталогу
    if (heroNav) {
      if (scrollY > window.innerHeight * 0.25) {
        heroNav.style.opacity = '0';
        heroNav.style.pointerEvents = 'none';
        heroNav.style.visibility = 'hidden';
      } else {
        heroNav.style.opacity = '1';
        heroNav.style.pointerEvents = 'auto';
        heroNav.style.visibility = 'visible';
      }
    }

    updateCursorVisibility();
  }

  window.addEventListener('scroll', handleScroll, { passive: true });
  handleScroll();

  // Плавный кинематографичный переход между экраном Hero и каталогом
  const homeCatalogEl = document.getElementById('homeCatalog');
  const catalogScrollAreaEl = document.getElementById('catalogScrollArea');
  const catalogTopBannerEl = document.getElementById('catalogTopBanner');
  const homeBottomBannerEl = document.querySelector('.home-bottom-banner');

  const homeHeaderEl = document.getElementById('homeHeader');
  let isNavHidden = false;
  let bannerTicking = false;

  function updateBannerOverlap() {
    if (!catalogTopBannerEl || !homeBottomBannerEl) return;
    const bannerRect = homeBottomBannerEl.getBoundingClientRect();

    // 1. Скрытие полоски: когда плашка ALL PRODUCTS подошла к шапке (<= 120px)
    if (!isNavHidden && bannerRect.top <= 120) {
      isNavHidden = true;
      catalogTopBannerEl.classList.add('is-hidden');
      if (homeHeaderEl) homeHeaderEl.classList.add('is-hidden');
      if (homeCatalogEl) homeCatalogEl.classList.add('is-nav-hidden');
    }
    // 2. Показ: ТОЛЬКО когда плашка опустилась обратно вниз к карточкам товаров (> 220px)
    else if (isNavHidden && bannerRect.top > 220) {
      isNavHidden = false;
      catalogTopBannerEl.classList.remove('is-hidden');
      if (homeHeaderEl) homeHeaderEl.classList.remove('is-hidden');
      if (homeCatalogEl) homeCatalogEl.classList.remove('is-nav-hidden');
    }
  }

  function checkBannerOverlap() {
    if (!bannerTicking) {
      bannerTicking = true;
      requestAnimationFrame(() => {
        updateBannerOverlap();
        bannerTicking = false;
      });
    }
  }

  function resetNavVisibility() {
    isNavHidden = false;
    if (catalogTopBannerEl) catalogTopBannerEl.classList.remove('is-hidden');
    if (homeHeaderEl) homeHeaderEl.classList.remove('is-hidden');
    if (homeCatalogEl) homeCatalogEl.classList.remove('is-nav-hidden');
  }

  // Отключаем запоминание браузером промежуточного положения скролла при перезагрузке
  if ('scrollRestoration' in history) {
    history.scrollRestoration = 'manual';
  }

  // При первой загрузке страницы всегда сбрасываемся в начало Hero и каталог в начало
  window.scrollTo(0, 0);
  if (catalogScrollAreaEl) {
    catalogScrollAreaEl.scrollTop = 0;
  }
  resetNavVisibility();

  if (heroSection && homeCatalogEl && catalogScrollAreaEl) {
    let isTransitioning = false;

    function smoothScrollTo(targetY, duration = 650, resetCatalog = false) {
      if (isTransitioning) return;
      isTransitioning = true;
      if (resetCatalog && catalogScrollAreaEl) {
        catalogScrollAreaEl.scrollTop = 0;
        resetNavVisibility();
      }
      const startY = window.scrollY;
      const diff = targetY - startY;
      if (Math.abs(diff) < 2) {
        window.scrollTo(0, targetY);
        isTransitioning = false;
        return;
      }
      const startTime = performance.now();

      function step(now) {
        const elapsed = now - startTime;
        const progress = Math.min(elapsed / duration, 1);
        // Мягкая квадратичная кривая (easeInOutQuad) без микрорывков
        const ease = progress < 0.5
          ? 2 * progress * progress
          : 1 - Math.pow(-2 * progress + 2, 2) / 2;

        window.scrollTo(0, Math.round(startY + diff * ease));

        if (progress < 1) {
          requestAnimationFrame(step);
        } else {
          window.scrollTo(0, targetY);
          setTimeout(() => {
            isTransitioning = false;
          }, 80);
        }
      }

      requestAnimationFrame(step);
    }

    // Слушаем wheel с passive: false, чтобы управлять плавным переходом и прокруткой с шапки
    window.addEventListener('wheel', (e) => {
      // Во время перехода блокируем паразитные события
      if (isTransitioning) {
        e.preventDefault();
        return;
      }

      const catalogTop = homeCatalogEl.offsetTop;

      // 1. На экране Hero при скролле вниз — мягкий переход к каталогу
      if (window.scrollY < catalogTop * 0.85 && e.deltaY > 15) {
        e.preventDefault();
        smoothScrollTo(catalogTop, 650, true);
        return;
      }

      // 2. В секции каталога
      if (window.scrollY >= catalogTop * 0.7) {
        const isOverScrollArea = catalogScrollAreaEl.contains(e.target);

        // Когда курсор НА НАВИГАЦИИ (вне сетки карточек):
        if (!isOverScrollArea) {
          // Крутим вниз — листаем каталог!
          if (e.deltaY > 0) {
            e.preventDefault();
            catalogScrollAreaEl.scrollTop += e.deltaY;
            checkBannerOverlap();
            return;
          }
          // Крутим вверх, когда карточки еще прокручены — листаем каталог вверх!
          else if (e.deltaY < 0 && catalogScrollAreaEl.scrollTop > 0) {
            e.preventDefault();
            catalogScrollAreaEl.scrollTop += e.deltaY;
            checkBannerOverlap();
            return;
          }
          // Крутим вверх, когда карточки уже на самом верху — возвращаемся на Hero!
          else if (e.deltaY < -20 && catalogScrollAreaEl.scrollTop <= 0) {
            e.preventDefault();
            smoothScrollTo(0, 650);
            return;
          }
        }
        // Когда курсор НА СЕТКЕ КАРТОЧЕК:
        else {
          // Если карточки уже на самом верху и пользователь тянет вверх — возврат на Hero
          if (catalogScrollAreaEl.scrollTop <= 0 && e.deltaY < -25) {
            e.preventDefault();
            smoothScrollTo(0, 650);
            return;
          }
        }
      }
    }, { passive: false });

    // Клик по ссылкам к каталогу (всегда открывает каталог С НАЧАЛА, карточки 1-4)
    const shopLinks = document.querySelectorAll('a[href="#homeCatalog"]');
    shopLinks.forEach((link) => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        smoothScrollTo(homeCatalogEl.offsetTop, 750, true);
      });
    });

    // Клик по логотипу плавно возвращает на Hero
    const homeLogo = document.querySelector('.home-logo');
    if (homeLogo) {
      homeLogo.addEventListener('click', (e) => {
        if (window.scrollY > 50) {
          e.preventDefault();
          smoothScrollTo(0, 750);
        }
      });
    }

    if (catalogScrollAreaEl) {
      catalogScrollAreaEl.addEventListener('scroll', () => {
        checkBannerOverlap();
      }, { passive: true });
    }

    // Обработка свайпов (touch) для мобильных устройств
    let touchStartY = 0;
    let touchStartTime = 0;

    window.addEventListener('touchstart', (e) => {
      touchStartY = e.touches[0].clientY;
      touchStartTime = performance.now();
    }, { passive: true });

    window.addEventListener('touchend', (e) => {
      if (isTransitioning) return;
      const touchEndY = e.changedTouches[0].clientY;
      const deltaY = touchStartY - touchEndY;
      const duration = performance.now() - touchStartTime;
      const catalogTop = homeCatalogEl.offsetTop;

      // Быстрый или уверенный свайп вверх на первом экране Hero -> плавный переход к каталогу
      if (window.scrollY < catalogTop * 0.7 && deltaY > 60 && duration < 600) {
        smoothScrollTo(catalogTop, 600, true);
      }
    }, { passive: true });
  }

  // Фильтрация карточек на главной странице
  const homeFilterNav = document.getElementById('homeFilterNav');
  const homeGrid = document.querySelector('.home-grid-4col');
  const homeCountEl = document.getElementById('homeProductsCount');

  if (homeFilterNav && homeGrid) {
    const filterBtns = homeFilterNav.querySelectorAll('.filter-btn');
    const cards = homeGrid.querySelectorAll('.home-card-4');

    function syncActiveCategory(cat, count) {
      // Синхронизация десктопных кнопок
      filterBtns.forEach(b => {
        b.classList.toggle('is-active', b.dataset.category === cat);
      });

      // Синхронизация мобильных пунктов
      const mobileItems = document.querySelectorAll('.mobile-filter-item');
      mobileItems.forEach(item => {
        item.classList.toggle('is-active', item.dataset.category === cat);
      });

      const mobileCountEl = document.getElementById('mobileFilterCount');
      if (mobileCountEl) {
        mobileCountEl.textContent = `(${count})`;
      }

      const mobileLabel = document.querySelector('.mobile-filter-trigger__label');
      if (mobileLabel) {
        mobileLabel.textContent = cat === 'all' ? 'ФИЛЬТРЫ' : cat.toUpperCase();
      }
    }

    function applyCategory(cat) {
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

      let emptyEl = document.getElementById('homeGridEmptyMsg');
      if (visibleCount === 0) {
        if (!emptyEl) {
          emptyEl = document.createElement('div');
          emptyEl.id = 'homeGridEmptyMsg';
          emptyEl.className = 'grid-empty-msg';
          homeGrid.appendChild(emptyEl);
        }
        emptyEl.innerHTML = `В подборке на главной нет товаров этой категории. <a href="catalog.html?category=${cat}">Смотреть в полном каталоге →</a>`;
        emptyEl.style.display = 'block';
      } else if (emptyEl) {
        emptyEl.style.display = 'none';
      }

      if (homeCountEl) {
        homeCountEl.textContent = `${visibleCount} Product${visibleCount === 1 ? '' : 's'}`;
      }

      syncActiveCategory(cat, visibleCount);
      checkBannerOverlap();
    }

    filterBtns.forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        applyCategory(btn.dataset.category);
      });
    });

    // Мобильная шторка фильтров
    const mobileFilterTrigger = document.getElementById('mobileFilterTrigger');
    const mobileFilterDrawer = document.getElementById('mobileFilterDrawer');
    const mobileFilterClose = document.getElementById('mobileFilterClose');
    const mobileItems = document.querySelectorAll('.mobile-filter-item');

    if (mobileFilterTrigger && mobileFilterDrawer) {
      mobileFilterTrigger.addEventListener('click', (e) => {
        e.stopPropagation();
        mobileFilterDrawer.classList.toggle('is-open');
      });

      if (mobileFilterClose) {
        mobileFilterClose.addEventListener('click', () => {
          mobileFilterDrawer.classList.remove('is-open');
        });
      }

      // Закрытие при клике снаружи
      document.addEventListener('click', (e) => {
        if (!mobileFilterDrawer.contains(e.target) && !mobileFilterTrigger.contains(e.target)) {
          mobileFilterDrawer.classList.remove('is-open');
        }
      });

      mobileItems.forEach(item => {
        item.addEventListener('click', () => {
          const cat = item.dataset.category;
          applyCategory(cat);
          mobileFilterDrawer.classList.remove('is-open');
        });
      });
    }

    // Клик по карточке на главной открывает страницу товара (кроме видео)
    cards.forEach(card => {
      if (!card.classList.contains('home-card-4--video')) {
        card.style.cursor = 'pointer';
        card.addEventListener('click', () => {
          const uid = card.dataset.uid;
          const titleEl = card.querySelector('.home-card-info__title');
          const title = titleEl ? titleEl.textContent.trim() : '';
          let targetUrl = '';
          if (uid) {
            targetUrl = `product.html?id=${encodeURIComponent(uid)}`;
          } else if (title) {
            targetUrl = `product.html?title=${encodeURIComponent(title)}`;
          }

          if (targetUrl) {
            if (typeof window.navigateTo === 'function') {
              window.navigateTo(targetUrl);
            } else {
              window.location.href = targetUrl;
            }
          }
        });
      }
    });
  }
}
