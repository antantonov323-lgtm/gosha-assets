// Скрипт страницы карточки товара
document.addEventListener('DOMContentLoaded', async () => {
  const pCategory = document.getElementById('pCategory');
  const pTitle = document.getElementById('pTitle');
  const pPrice = document.getElementById('pPrice');
  const pColorSwatch = document.getElementById('pColorSwatch');
  const pColorName = document.getElementById('pColorName');
  const pSizeSelect = document.getElementById('pSizeSelect');
  const pDescription = document.getElementById('pDescription');
  const pDetailsContent = document.getElementById('pDetailsContent');
  const productThumbs = document.getElementById('productThumbs');
  const productGallery = document.getElementById('productGallery');
  const btnAddToBag = document.getElementById('btnAddToBag');
  const btnOpenSizeGuide = document.getElementById('btnOpenSizeGuide');
  const btnCloseSizeModal = document.getElementById('btnCloseSizeModal');
  const sizeModal = document.getElementById('sizeModal');
  const productToast = document.getElementById('productToast');
  const cartCountEl = document.getElementById('cartCount');
  const btnBackToCatalog = document.getElementById('btnBackToCatalog');
  if (btnBackToCatalog) {
    btnBackToCatalog.addEventListener('click', (e) => {
      if (document.referrer && document.referrer.includes('catalog.html')) {
        e.preventDefault();
        window.history.back();
      }
    });
  }

  // Управление корзиной в localStorage
  let cart = JSON.parse(localStorage.getItem('gk_cart') || '[]');
  function updateCartBadge() {
    const totalQty = cart.reduce((sum, item) => sum + (item.qty || 1), 0);
    if (cartCountEl) cartCountEl.textContent = totalQty;
  }
  updateCartBadge();

  function showToast(msg) {
    if (!productToast) return;
    productToast.textContent = msg;
    productToast.classList.add('is-visible');
    setTimeout(() => {
      productToast.classList.remove('is-visible');
    }, 2400);
  }

  // Загрузка товаров
  let products = [];
  if (Array.isArray(window.GK_PRODUCTS) && window.GK_PRODUCTS.length > 0) {
    products = window.GK_PRODUCTS;
  }

  if (!products.length) {
    try {
      const res = await fetch('/api/products');
      if (res.ok) {
        const data = await res.json();
        if (data.success && Array.isArray(data.products) && data.products.length > 0) {
          products = data.products;
        }
      }
    } catch (e) {
      console.warn('API fetch error:', e);
    }
  }

  if (!products.length) {
    try {
      const res = await fetch('https://cdn.jsdelivr.net/gh/antantonov323-lgtm/gosha-assets@main/data/products.json');
      if (res.ok) {
        const json = await res.json();
        if (Array.isArray(json) && json.length > 0) {
          products = json;
        }
      }
    } catch (e) {
      console.error('Failed to load products from data/products.json:', e);
    }
  }

  if (!products.length) {
    if (pTitle) pTitle.textContent = 'Ошибка загрузки товара';
    return;
  }

  // Получаем ID или название из URL (?id=... или ?uid=... или ?title=...)
  const params = new URLSearchParams(window.location.search);
  const targetId = params.get('id') || params.get('uid');
  const targetTitle = params.get('title');

  let currentProduct = null;
  if (targetId) {
    currentProduct = products.find(p => 
      String(p.uid) === String(targetId) || 
      String(p.id) === String(targetId)
    );
  }
  if (!currentProduct && targetTitle) {
    currentProduct = products.find(p => 
      (p.title || '').trim().toLowerCase() === targetTitle.trim().toLowerCase()
    );
  }

  // Если не найден или видео — берем первый реальный товар
  if (!currentProduct || currentProduct.is_video) {
    currentProduct = products.find(p => !p.is_video) || products[0];
  }

  // Заполняем текстовую информацию
  document.title = `SAMPLE SALE GK — ${currentProduct.title || 'ТОВАР'}`;
  if (pTitle) pTitle.textContent = currentProduct.title || '';
  if (pPrice) pPrice.textContent = currentProduct.price || '';

  // Определение категории
  const titleLower = (currentProduct.title || '').toLowerCase();
  let categoryLabel = 'CLOTHING';
  if (titleLower.includes('платье') || titleLower.includes('сарафан')) categoryLabel = 'DRESSES';
  else if (titleLower.includes('топ')) categoryLabel = 'TOPS';
  else if (titleLower.includes('юбк')) categoryLabel = 'SKIRTS';
  else if (titleLower.includes('лонгслив') || titleLower.includes('водолазк')) categoryLabel = 'LONGSLEEVES';
  else if (titleLower.includes('брюк')) categoryLabel = 'PANTS';
  if (pCategory) pCategory.textContent = categoryLabel;

  // Цвет
  const colorName = currentProduct.color || (titleLower.includes('серебр') ? 'SILVER' : (titleLower.includes('бел') ? 'WHITE' : 'BLACK'));
  const colorHex = currentProduct.color_hex || (colorName === 'SILVER' ? '#C0C0C0' : (colorName === 'WHITE' ? '#FFFFFF' : '#111111'));
  if (pColorName) pColorName.textContent = colorName;
  if (pColorSwatch) pColorSwatch.style.backgroundColor = colorHex;

  // Размеры
  const sizes = currentProduct.sizes || ['XS', 'S', 'M', 'L'];
  if (pSizeSelect) {
    pSizeSelect.innerHTML = sizes.map((s, idx) => `<option value="${s}" ${idx === 0 ? 'selected' : ''}>${s}</option>`).join('');
  }

  // Описание
  if (pDescription) {
    pDescription.innerHTML = `<p>${currentProduct.description || 'Капсульная коллекция AUTUMN 26. Сложный минимализм, архитектура кроя и акцент на линиях тела.'}</p>`;
  }

  // Аккордеон: Детали, состав, параметры модели
  if (pDetailsContent) {
    let detailsHtml = '';
    if (currentProduct.composition_care) {
      const formatted = currentProduct.composition_care.replace(/\n/g, '<br />');
      detailsHtml += `<p>${formatted}</p>`;
    }
    if (currentProduct.model_info) {
      detailsHtml += `<p style="margin-top: 10px; font-weight: 700;">${currentProduct.model_info}</p>`;
    }
    if (!detailsHtml) {
      detailsHtml = '<p>Состав: хлопок 95%, эластан 5%<br />Уход: деликатная стирка при 30°C</p>';
    }
    pDetailsContent.innerHTML = detailsHtml;
  }

  // Формирование списка всех фотографий товара
  let photos = [];
  if (currentProduct.photos && currentProduct.photos.length > 0) {
    photos = currentProduct.photos;
  } else {
    if (currentProduct.primary) photos.push(currentProduct.primary);
    if (currentProduct.hover) photos.push(currentProduct.hover);
  }
  // Убираем видео из фото ленты если попало
  photos = photos.filter(img => !img.endsWith('.mp4'));
  if (photos.length === 0 && currentProduct.primary) {
    photos = [currentProduct.primary];
  }

  // Рендер миниатюр и основной ленты
  if (productThumbs && productGallery) {
    productThumbs.innerHTML = '';
    productGallery.innerHTML = '';

    photos.forEach((src, idx) => {
      // 1. Миниатюра слева
      const thumb = document.createElement('div');
      thumb.className = `p-thumb ${idx === 0 ? 'is-active' : ''}`;
      thumb.dataset.index = idx;
      thumb.innerHTML = `<img src="${src}" alt="${currentProduct.title} - ракурс ${idx+1}" />`;
      productThumbs.appendChild(thumb);

      // 2. Крупное фото в центре
      const mainImgWrap = document.createElement('div');
      mainImgWrap.className = 'p-gallery-item';
      mainImgWrap.id = `galleryItem-${idx}`;
      mainImgWrap.innerHTML = `<img src="${src}" alt="${currentProduct.title} - ракурс ${idx+1}" class="p-gallery-img" />`;
      productGallery.appendChild(mainImgWrap);

      // Клик по миниатюре плавно скроллит к выбранному фото
      thumb.addEventListener('click', () => {
        productThumbs.querySelectorAll('.p-thumb').forEach(t => t.classList.remove('is-active'));
        thumb.classList.add('is-active');

        mainImgWrap.scrollIntoView({ behavior: 'smooth', block: 'start' });
      });
    });

    // Отслеживание скролла центральной ленты для подсветки активной миниатюры
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const id = entry.target.id;
          const idx = id.replace('galleryItem-', '');
          productThumbs.querySelectorAll('.p-thumb').forEach(t => {
            t.classList.toggle('is-active', t.dataset.index === idx);
          });
        }
      });
    }, { threshold: 0.6 });

    productGallery.querySelectorAll('.p-gallery-item').forEach(el => observer.observe(el));
    if (typeof window.refreshScrollReveal === 'function') {
      window.refreshScrollReveal();
    }
  }

  // Аккордеоны: переключение открытия / закрытия
  const accordionItems = document.querySelectorAll('.p-accordion-item');
  accordionItems.forEach(item => {
    const header = item.querySelector('.p-accordion-header');
    header.addEventListener('click', () => {
      const isOpen = item.classList.contains('is-open');
      item.classList.toggle('is-open', !isOpen);
      const icon = item.querySelector('.p-accordion-icon');
      if (icon) icon.textContent = isOpen ? '+' : '−';
    });
  });

  // Модалка таблицы размеров
  if (btnOpenSizeGuide && sizeModal) {
    btnOpenSizeGuide.addEventListener('click', () => {
      sizeModal.classList.add('is-open');
    });
  }
  if (btnCloseSizeModal && sizeModal) {
    btnCloseSizeModal.addEventListener('click', () => {
      sizeModal.classList.remove('is-open');
    });
  }
  if (sizeModal) {
    sizeModal.addEventListener('click', (e) => {
      if (e.target === sizeModal) sizeModal.classList.remove('is-open');
    });
  }

  // Добавление в корзину
  if (btnAddToBag) {
    btnAddToBag.addEventListener('click', () => {
      const selectedSize = pSizeSelect ? pSizeSelect.value : 'S';
      const cartItem = {
        id: currentProduct.id || currentProduct.uid,
        title: currentProduct.title,
        price: currentProduct.price,
        size: selectedSize,
        image: photos[0] || '',
        qty: 1
      };

      const existingIndex = cart.findIndex(it => it.id === cartItem.id && it.size === cartItem.size);
      if (existingIndex !== -1) {
        cart[existingIndex].qty = (cart[existingIndex].qty || 1) + 1;
      } else {
        cart.push(cartItem);
      }

      localStorage.setItem('gk_cart', JSON.stringify(cart));
      updateCartBadge();
      showToast(`ДОБАВЛЕНО В КОРЗИНУ (${selectedSize})`);
    });
  }
});
