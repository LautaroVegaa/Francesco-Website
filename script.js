// Variables globales
let cartCount = 0;
let currentSlide = 0;
const totalSlides = 4;
let currentLanguage = 'es';

// Traducciones
const translations = {
    es: {
        'brand': 'Francesco Ponte',
        'nav-home': 'HOME',
        'nav-about': 'SOBRE MÍ',
        'nav-projects': 'PROYECTOS',
        'nav-login': 'LOGIN',
        'hero-title': 'FRANCESCO PONTE',
        'artist-description': 'El artista Francesco Ponte combina técnicas tradicionales y contemporáneas para explorar la conexión entre la forma, la luz y la percepción. Su obra busca cuestionar los límites entre lo real y lo imaginado, invitando al espectador a contemplar la esencia detrás de cada objeto.',
        'btn-show-works': 'Mostrar obras en la tienda online',
        'btn-website': 'Sitio web de Francesco Ponte',
        'btn-projects': 'Proyectos con Francesco Ponte',
        'gallery-title': 'TRABAJA EN LÍNEA',
        'add-to-cart': 'Agregar al carrito',
        'modal-add-to-cart': 'AÑADIR A LA CESTA',
        'footer-contact': 'CONTACTO',
        'footer-newsletter': 'NEWSLETTER',
        'footer-newsletter-text': 'Con nuestro Newsletter no te perderás ninguna exposición. Además, obtienes ofertas especiales y siempre recibes las noticias más actuales.',
        'footer-newsletter-btn': '¡REGÍSTRATE AHORA!',
        'footer-social': 'REDES SOCIALES'
    },
    en: {
        'brand': 'Francesco Ponte',
        'nav-home': 'HOME',
        'nav-about': 'ABOUT ME',
        'nav-projects': 'PROJECTS',
        'nav-login': 'LOGIN',
        'hero-title': 'FRANCESCO PONTE',
        'artist-description': 'Artist Francesco Ponte combines traditional and contemporary techniques to explore the connection between form, light and perception. His work seeks to question the boundaries between the real and the imagined, inviting the viewer to contemplate the essence behind each object.',
        'btn-show-works': 'Show works in online store',
        'btn-website': 'Francesco Ponte Website',
        'btn-projects': 'Projects with Francesco Ponte',
        'gallery-title': 'WORKS ONLINE',
        'add-to-cart': 'Add to cart',
        'modal-add-to-cart': 'ADD TO BASKET',
        'footer-contact': 'CONTACT',
        'footer-newsletter': 'NEWSLETTER',
        'footer-newsletter-text': 'With our Newsletter you won\'t miss any exhibition. In addition, you get special offers and always receive the latest news.',
        'footer-newsletter-btn': 'SIGN UP NOW!',
        'footer-social': 'SOCIAL MEDIA'
    }
};

// Datos de las obras (sin cambios)
const artworksData = {
    1: { title: { es: 'Reflexiones Urbanas', en: 'Urban Reflections' }, price: '1,200 €', image: 'https://placeholder-image-service.onrender.com/image/500x500?prompt=Abstract expressionist painting with vibrant red and blue colors by Francesco Ponte' },
    2: { title: { es: 'Formas en Diálogo', en: 'Forms in Dialogue' }, price: '980 €', image: 'https://placeholder-image-service.onrender.com/image/500x500?prompt=Contemporary sculpture with geometric forms and metallic surface by Francesco Ponte' },
    3: { title: { es: 'Luz y Sombra', en: 'Light and Shadow' }, price: '1,500 €', image: 'https://placeholder-image-service.onrender.com/image/500x500?prompt=Mixed media artwork with textured surface and golden highlights by Francesco Ponte' },
    4: { title: { es: 'Esencia Pura', en: 'Pure Essence' }, price: '800 €', image: 'https://placeholder-image-service.onrender.com/image/500x500?prompt=Minimalist painting with clean lines and subtle color palette by Francesco Ponte' },
    5: { title: { es: 'Alma Expuesta', en: 'Exposed Soul' }, price: '1,800 €', image: 'https://placeholder-image-service.onrender.com/image/500x500?prompt=Contemporary portrait with expressive brushstrokes by Francesco Ponte' },
    6: { title: { es: 'Horizontes Infinitos', en: 'Infinite Horizons' }, price: '2,200 €', image: 'https://placeholder-image-service.onrender.com/image/500x500?prompt=Abstract landscape painting with dynamic composition by Francesco Ponte' },
    7: { title: { es: 'Naturaleza Reimaginada', en: 'Reimagined Nature' }, price: '1,100 €', image: 'https://placeholder-image-service.onrender.com/image/500x500?prompt=Modern still life painting with bold colors by Francesco Ponte' },
    8: { title: { es: 'Espacio y Tiempo', en: 'Space and Time' }, price: '2,800 €', image: 'https://placeholder-image-service.onrender.com/image/500x500?prompt=Contemporary installation art piece with interactive elements by Francesco Ponte' }
};

// Inicialización
document.addEventListener('DOMContentLoaded', function() {
    initCarousel();
    initCartFunctionality();
    initLanguageSwitcher();
    initModal();
    initSmoothScrolling();
});

// Carrusel
function initCarousel() {
    const prevBtn = document.querySelector('.prev-btn');
    const nextBtn = document.querySelector('.next-btn');
    const indicators = document.querySelectorAll('.indicator');

    prevBtn.addEventListener('click', () => {
        currentSlide = (currentSlide - 1 + totalSlides) % totalSlides;
        showSlide(currentSlide);
    });
    nextBtn.addEventListener('click', () => {
        currentSlide = (currentSlide + 1) % totalSlides;
        showSlide(currentSlide);
    });
    indicators.forEach((indicator, index) => {
        indicator.addEventListener('click', () => {
            currentSlide = index;
            showSlide(currentSlide);
        });
    });
    setInterval(() => {
        currentSlide = (currentSlide + 1) % totalSlides;
        showSlide(currentSlide);
    }, 5000);
}

function showSlide(slideIndex) {
    const slides = document.querySelectorAll('.carousel-slide');
    const indicators = document.querySelectorAll('.indicator');
    slides.forEach(slide => slide.classList.remove('active'));
    indicators.forEach(indicator => indicator.classList.remove('active'));
    slides[slideIndex].classList.add('active');
    indicators[slideIndex].classList.add('active');
}

// Carrito
let cartItems = [];

function initCartFunctionality() {
    const addToCartBtns = document.querySelectorAll('.add-to-cart-btn');
    addToCartBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const card = e.target.closest('.artwork-card');
            const artworkId = card.getAttribute('data-artwork');
            addToCart(artworkId);
        });
    });
    document.querySelector('.modal-add-to-cart').addEventListener('click', () => {
        const title = document.getElementById('modalTitle').textContent;
        const artworkId = Object.keys(artworksData).find(
            id => artworksData[id].title[currentLanguage] === title
        );
        addToCart(artworkId);
        closeModal();
    });
}

function addToCart(artworkId) {
    const artwork = artworksData[artworkId];
    if (!artwork) return;
    cartItems.push(artwork);
    cartCount++;
    const cartCounter = document.getElementById('cartCounter');
    cartCounter.textContent = cartCount;
    cartCounter.classList.add('show', 'animate');
    setTimeout(() => cartCounter.classList.remove('animate'), 600);
    renderCartItems();
}

function openCartModal() {
    renderCartItems();
    const cartModal = document.getElementById('cartModal');
    cartModal.style.display = 'block';
    document.body.style.overflow = 'hidden';
}

function closeCartModal() {
    const cartModal = document.getElementById('cartModal');
    cartModal.style.display = 'none';
    document.body.style.overflow = 'auto';
}

function renderCartItems() {
    const cartItemsContainer = document.getElementById('cartItems');
    const cartTotal = document.getElementById('cartTotal');
    const clearBtn = document.getElementById('clearCartBtn');
    cartItemsContainer.innerHTML = '';
    let total = 0;

    if (cartItems.length === 0) {
        cartItemsContainer.innerHTML = '<p style="text-align:center;">Tu carrito está vacío.</p>';
        clearBtn.style.display = 'none';
    } else {
        cartItems.forEach((item, index) => {
            const cartItem = document.createElement('div');
            cartItem.classList.add('cart-item');
            cartItem.innerHTML = `
                <img src="${item.image}" alt="${item.title[currentLanguage]}" style="width:60px;height:60px;object-fit:cover;border-radius:5px;">
                <div class="cart-item-info">
                    <p class="cart-item-title">${item.title[currentLanguage]}</p>
                    <p class="cart-item-price">${item.price}</p>
                </div>
                <button class="remove-item" data-index="${index}" style="background:none;border:none;font-size:18px;cursor:pointer;color:#C6A200;">🗑️</button>
            `;
            cartItemsContainer.appendChild(cartItem);

            //  Conversión robusta de precios (maneja puntos y comas)
            let cleanPrice = item.price.replace(/[^\d.,]/g, ''); // eliminar símbolos
            // Si hay coma y punto (ej. "1.200,50") -> coma decimal
            if (cleanPrice.includes('.') && cleanPrice.includes(',')) {
                cleanPrice = cleanPrice.replace(/\./g, '').replace(',', '.');
            }
            // Si solo hay coma (ej. "1,200") -> miles
            else if (cleanPrice.includes(',') && !cleanPrice.includes('.')) {
                cleanPrice = cleanPrice.replace(/,/g, '');
            }
            // Si solo hay punto (ej. "1200.50") -> decimal válido
            const numericPrice = parseFloat(cleanPrice);
            total += numericPrice;
        });
        clearBtn.style.display = 'block';
    }

    //  Mostrar total correctamente formateado
    cartTotal.textContent = total.toLocaleString('es-ES', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    }) + ' €';

    // Eventos para eliminar productos
    const removeButtons = document.querySelectorAll('.remove-item');
    removeButtons.forEach(btn => {
        btn.addEventListener('click', (e) => {
            const index = e.target.getAttribute('data-index');
            removeFromCart(index);
        });
    });
}


function removeFromCart(index) {
    cartItems.splice(index, 1);
    cartCount = Math.max(0, cartCount - 1);
    document.getElementById('cartCounter').textContent = cartCount;
    renderCartItems();
}

function clearCart() {
    cartItems = [];
    cartCount = 0;
    document.getElementById('cartCounter').textContent = '0';
    renderCartItems();
}

// Idioma, modal de obra y scroll (sin cambios)
function initLanguageSwitcher() {
    const langBtns = document.querySelectorAll('.lang-btn');
    langBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const lang = btn.getAttribute('data-lang');
            if (lang !== currentLanguage) switchLanguage(lang);
        });
    });
}

function switchLanguage(lang) {
    currentLanguage = lang;
    document.querySelectorAll('.lang-btn').forEach(btn => {
        btn.classList.toggle('active', btn.getAttribute('data-lang') === lang);
    });
    const elements = document.querySelectorAll('[data-translate]');
    elements.forEach(el => {
        const key = el.getAttribute('data-translate');
        if (translations[lang] && translations[lang][key]) {
            el.textContent = translations[lang][key];
        }
    });
}

function initModal() {
    const modal = document.getElementById('artworkModal');
    const closeBtn = document.querySelector('.modal-close');
    const artworkCards = document.querySelectorAll('.artwork-card');
    artworkCards.forEach(card => {
        card.addEventListener('click', (e) => {
            if (e.target.classList.contains('add-to-cart-btn')) return;
            const artworkId = card.getAttribute('data-artwork');
            openModal(artworkId);
        });
    });
    closeBtn.addEventListener('click', closeModal);
    modal.addEventListener('click', (e) => { if (e.target === modal) closeModal(); });
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeModal(); });
}

function openModal(artworkId) {
    const modal = document.getElementById('artworkModal');
    const artwork = artworksData[artworkId];
    if (!artwork) return;
    document.getElementById('modalImage').src = artwork.image;
    document.getElementById('modalTitle').textContent = artwork.title[currentLanguage];
    document.getElementById('modalPrice').textContent = artwork.price;
    modal.style.display = 'block';
    document.body.style.overflow = 'hidden';
}

function closeModal() {
    document.getElementById('artworkModal').style.display = 'none';
    document.body.style.overflow = 'auto';
}

function initSmoothScrolling() {
    document.querySelectorAll('a[href^="#"]').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const target = document.querySelector(link.getAttribute('href'));
            if (target) {
                window.scrollTo({ top: target.offsetTop - 80, behavior: 'smooth' });
            }
        });
    });
}

// Inicializar modal del carrito
document.addEventListener('DOMContentLoaded', () => {
    const cartIcon = document.querySelector('.cart-container a');
    const closeCartBtn = document.getElementById('closeCart');
    const cartModal = document.getElementById('cartModal');
    const clearCartBtn = document.getElementById('clearCartBtn');

    cartIcon.addEventListener('click', (e) => {
        e.preventDefault();
        openCartModal();
    });
    closeCartBtn.addEventListener('click', closeCartModal);
    cartModal.addEventListener('click', (e) => {
        if (e.target === cartModal) closeCartModal();
    });
    clearCartBtn.addEventListener('click', clearCart);
});