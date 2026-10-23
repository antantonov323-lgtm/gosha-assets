/**
 * page-transition.js
 * Бесшовная кинематографическая анимация переходов между страницами
 * Бренд: ГОША КАРЦЕВ (High Fashion Minimal Brutalism)
 *
 * Оптимизировано:
 * - Без мерцаний белого экрана (background синхронизирован, аппаратно ускоренный оверлей)
 * - Без подергиваний и лагов (GPU transform3d + will-change + плавные тайминги)
 * - Мгновенная инициализация шторки
 */

(function () {
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Проверяем, был ли переход инициирован нашим скриптом
  const isTransitioningIn = sessionStorage.getItem('gk_nav_transition') === '1';
  sessionStorage.removeItem('gk_nav_transition');

  // Создаем оверлей
  let overlay = document.getElementById('gkPageTransition');
  if (!overlay) {
    overlay = document.createElement('div');
    overlay.id = 'gkPageTransition';
    overlay.className = 'page-transition-curtain' + (isTransitioningIn ? ' is-entering' : '');
    overlay.innerHTML = `
      <div class="page-transition-curtain__shutter"></div>
      <div class="page-transition-curtain__brand">
        <span class="pt-brand-name">SAMPLE SALE GK</span>
        <span class="pt-brand-meta">AUTUMN 26</span>
      </div>
    `;

    // Вставляем немедленно
    if (document.body) {
      document.body.prepend(overlay);
    } else {
      document.documentElement.appendChild(overlay);
    }
  }

  // Если это вход по клику из предыдущей страницы — плавно раскрываем (reveal)
  if (isTransitioningIn && !prefersReducedMotion) {
    // Ждем готовности первого кадра рендера
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        overlay.classList.add('is-revealing');
        overlay.classList.remove('is-entering');
        setTimeout(() => {
          overlay.classList.remove('is-revealing');
          overlay.style.pointerEvents = 'none';
        }, 500);
      });
    });
  } else {
    // Если это холодная загрузка (пользователь только открыл сайт / перезагрузил страницу)
    // Шторка не перекрывает экран, чтобы не было паразитного мерцания
    overlay.classList.remove('is-entering');
    overlay.style.pointerEvents = 'none';
  }

  // При навигации по кнопкам истории браузера (bfcache)
  window.addEventListener('pageshow', (event) => {
    overlay.classList.remove('is-entering', 'is-exiting', 'is-revealing');
    overlay.style.pointerEvents = 'none';
    document.body.classList.remove('is-page-unloading');
    isNavigating = false;
  });

  let isNavigating = false;

  function triggerPageTransition(targetHref) {
    if (isNavigating) return;
    isNavigating = true;

    if (prefersReducedMotion) {
      window.location.href = targetHref;
      return;
    }

    // Сохраняем флаг, чтобы следующая страница знала, что надо начать со шторки
    sessionStorage.setItem('gk_nav_transition', '1');

    overlay.style.pointerEvents = 'all';
    overlay.classList.remove('is-revealing');
    overlay.classList.add('is-exiting');
    document.body.classList.add('is-page-unloading');

    // Через 340ms шторка надежно закрывает экран -> переходим на новый URL
    setTimeout(() => {
      window.location.href = targetHref;
    }, 340);
  }

  // Перехват кликов по внутренним ссылкам
  document.addEventListener('click', (e) => {
    const link = e.target.closest('a');
    if (!link) return;

    const href = link.getAttribute('href');
    if (!href) return;

    // Игнорируем якоря, спецссылки, скачивание и открытие в новой вкладке
    if (
      href.startsWith('#') ||
      href.startsWith('mailto:') ||
      href.startsWith('tel:') ||
      href.startsWith('javascript:') ||
      link.target === '_blank' ||
      link.hasAttribute('download') ||
      e.ctrlKey || e.metaKey || e.shiftKey || e.altKey || e.button !== 0
    ) {
      return;
    }

    try {
      const targetUrl = new URL(link.href, window.location.href);
      const currentUrl = new URL(window.location.href);

      // Внешний домен
      if (targetUrl.origin !== currentUrl.origin) return;

      // Та же страница с хэшем
      if (
        targetUrl.pathname === currentUrl.pathname &&
        targetUrl.search === currentUrl.search &&
        targetUrl.hash
      ) {
        return;
      }

      // Та же страница без хэша
      const normalizePath = (p) => p.replace(/\/index\.html$/, '/').replace(/\/$/, '');
      if (
        normalizePath(targetUrl.pathname) === normalizePath(currentUrl.pathname) &&
        targetUrl.search === currentUrl.search
      ) {
        if ((targetUrl.pathname.endsWith('index.html') || targetUrl.pathname === '/') && window.scrollY > 40) {
          return;
        }
        return;
      }

      e.preventDefault();
      triggerPageTransition(targetUrl.href);
    } catch (err) {
      // Игнорируем ошибки парсинга
    }
  });

  window.navigateTo = triggerPageTransition;

  /* ─────────────────────────────────────────────
     SCROLL REVEAL OBSERVER (INTERSECTION OBSERVER)
     Анимация проигрывается ТОЛЬКО когда пользователь реально увидел элемент
  ───────────────────────────────────────────── */
  function initScrollReveal() {
    if (prefersReducedMotion) return;

    // Автоматическая расстановка атрибутов для ВСЕХ типов контента сайта
    const autoTargets = [
      // Карточки товаров и лукбука
      { sel: '.home-card-4, .grid-card, .lookbook-card, .p-gallery-item', type: 'card' },
      // Заголовки, баннеры, секции
      { sel: '.static-editorial-title, .lookbook-title, .catalog-top-banner, .home-bottom-banner, .p-title, .static-editorial-hero', type: 'title' },
      // Текстовые блоки, манифест, контакты, колонки футера
      { sel: '.static-editorial-lead, .static-editorial-col, .static-contact-row, .static-editorial-text p, .p-price, .p-color-block, .p-action-row, .p-accordion-item, .home-footer__col, .home-footer__brand-section', type: 'text' }
    ];

    autoTargets.forEach(({ sel, type }) => {
      document.querySelectorAll(sel).forEach((el, index) => {
        if (!el.hasAttribute('data-gk-reveal')) {
          el.setAttribute('data-gk-reveal', type);
          const delay = (index % 4) * 0.08;
          el.style.transitionDelay = `${delay}s`;
        }
      });
    });

    // Функция проверки видимости элемента (для начального экрана и контейнеров)
    function revealElement(el) {
      el.classList.add('is-revealed');
    }

    // Наблюдатель основного окна браузера
    const windowObserver = new IntersectionObserver((entries, obs) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          revealElement(entry.target);
          obs.unobserve(entry.target);
        }
      });
    }, {
      root: null,
      rootMargin: '0px 0px -20px 0px',
      threshold: 0.05
    });

    // Наблюдатель внутри скролл-контейнера каталога главной страницы (#catalogScrollArea)
    const scrollArea = document.getElementById('catalogScrollArea');
    let scrollAreaObserver = null;
    if (scrollArea) {
      scrollAreaObserver = new IntersectionObserver((entries, obs) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            revealElement(entry.target);
            obs.unobserve(entry.target);
          }
        });
      }, {
        root: scrollArea,
        rootMargin: '0px 0px 0px 0px',
        threshold: 0.05
      });
    }

    // Подключаем все элементы к соответствующему наблюдателю
    document.querySelectorAll('[data-gk-reveal]').forEach(el => {
      if (scrollArea && scrollArea.contains(el)) {
        scrollAreaObserver.observe(el);
      } else {
        windowObserver.observe(el);
      }
    });

    // Экспортируем функцию для динамически созданных элементов (карточки товара и т.д.)
    window.refreshScrollReveal = function () {
      setTimeout(() => {
        document.querySelectorAll('.p-gallery-item, .product-gallery-item, .grid-card').forEach((el, index) => {
          if (!el.hasAttribute('data-gk-reveal')) {
            el.setAttribute('data-gk-reveal', 'card');
            el.style.transitionDelay = `${(index % 3) * 0.08}s`;
            windowObserver.observe(el);
          }
        });
      }, 60);
    };
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initScrollReveal);
  } else {
    initScrollReveal();
  }
})();
