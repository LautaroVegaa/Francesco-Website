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
        'artwork-1-title': 'Reflexiones Urbanas',
        'artwork-2-title': 'Formas en Diálogo',
        'artwork-3-title': 'Luz y Sombra',
        'artwork-4-title': 'Esencia Pura',
        'artwork-5-title': 'Alma Expuesta',
        'artwork-6-title': 'Horizontes Infinitos',
        'artwork-7-title': 'Naturaleza Reimaginada',
        'artwork-8-title': 'Espacio y Tiempo',
        'add-to-cart': 'Agregar al carrito',
        'modal-year': 'Año:',
        'modal-technique': 'Técnica:',
        'modal-technique-value': 'Óleo sobre lienzo',
        'modal-size': 'Tamaño:',
        'modal-style': 'Estilo:',
        'modal-style-value': 'Arte Contemporáneo',
        'modal-add-to-cart': 'AÑADIR A LA CESTA',
        'footer-contact': 'CONTACTO',
        'footer-newsletter': 'NEWSLETTER',
        'footer-newsletter-text': 'Con nuestro Newsletter no te perderás ninguna exposición. Además, obtienes ofertas especiales y siempre recibes las noticias más actuales.',
        'footer-newsletter-btn': '¡REGÍSTRATE AHORA!',
        'footer-social': 'REDES SOCIALES',
        'footer-impressum': 'Impressum',
        'footer-privacy': 'Datenschutz',
        'footer-agb': 'AGB',
        'footer-faq': 'FAQ',
        'footer-shop-info': 'Shop Info',
        'footer-update': 'UpDate'
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
        'artwork-1-title': 'Urban Reflections',
        'artwork-2-title': 'Forms in Dialogue',
        'artwork-3-title': 'Light and Shadow',
        'artwork-4-title': 'Pure Essence',
        'artwork-5-title': 'Exposed Soul',
        'artwork-6-title': 'Infinite Horizons',
        'artwork-7-title': 'Reimagined Nature',
        'artwork-8-title': 'Space and Time',
        'add-to-cart': 'Add to cart',
        'modal-year': 'Year:',
        'modal-technique': 'Technique:',
        'modal-technique-value': 'Oil on canvas',
        'modal-size': 'Size:',
        'modal-style': 'Style:',
        'modal-style-value': 'Contemporary Art',
        'modal-add-to-cart': 'ADD TO BASKET',
        'footer-contact': 'CONTACT',
        'footer-newsletter': 'NEWSLETTER',
        'footer-newsletter-text': 'With our Newsletter you won\'t miss any exhibition. In addition, you get special offers and always receive the latest news.',
        'footer-newsletter-btn': 'SIGN UP NOW!',
        'footer-social': 'SOCIAL MEDIA',
        'footer-impressum': 'Legal Notice',
        'footer-privacy': 'Privacy Policy',
        'footer-agb': 'Terms & Conditions',
        'footer-faq': 'FAQ',
        'footer-shop-info': 'Shop Info',
        'footer-update': 'Updates'
    }
};

// Datos de las obras
const artworksData = {
    1: {
        title: { es: 'Reflexiones Urbanas', en: 'Urban Reflections' },
        price: '1,200 €',
        year: '2024',
        technique: { es: 'Óleo sobre lienzo', en: 'Oil on canvas' },
        size: '80 x 60 cm',
        style: { es: 'Arte Contemporáneo', en: 'Contemporary Art' },
        image: 'https://placeholder-image-service.onrender.com/image/500x500?prompt=Abstract expressionist painting with vibrant red and blue colors by Francesco Ponte&id=77a80fee-8a55-40e3-8abd-e380037f9a5e&customer_id=cus_T6TCYe7lXY5gQI'
    },
    2: {
        title: { es: 'Formas en Diálogo', en: 'Forms in Dialogue' },
        price: '980 €',
        year: '2023',
        technique: { es: 'Escultura mixta', en: 'Mixed media sculpture' },
        size: '45 x 45 x 30 cm',
        style: { es: 'Arte Contemporáneo', en: 'Contemporary Art' },
        image: 'https://placeholder-image-service.onrender.com/image/500x500?prompt=Contemporary sculpture with geometric forms and metallic surface by Francesco Ponte&id=77a80fee-8a55-40e3-8abd-e380037f9a5e&customer_id=cus_T6TCYe7lXY5gQI'
    },
    3: {
        title: { es: 'Luz y Sombra', en: 'Light and Shadow' },
        price: '1,500 €',
        year: '2024',
        technique: { es: 'Técnica mixta', en: 'Mixed media' },
        size: '90 x 70 cm',
        style: { es: 'Arte Contemporáneo', en: 'Contemporary Art' },
        image: 'https://placeholder-image-service.onrender.com/image/500x500?prompt=Mixed media artwork with textured surface and golden highlights by Francesco Ponte&id=77a80fee-8a55-40e3-8abd-e380037f9a5e&customer_id=cus_T6TCYe7lXY5gQI'
    },
    4: {
        title: { es: 'Esencia Pura', en: 'Pure Essence' },
        price: '800 €',
        year: '2023',
        technique: { es: 'Acrílico sobre papel', en: 'Acrylic on paper' },
        size: '50 x 40 cm',
        style: { es: 'Minimalismo', en: 'Minimalism' },
        image: 'https://placeholder-image-service.onrender.com/image/500x500?prompt=Minimalist painting with clean lines and subtle color palette by Francesco Ponte&id=77a80fee-8a55-40e3-8abd-e380037f9a5e&customer_id=cus_T6TCYe7lXY5gQI'
    },
    5: {
        title: { es: 'Alma Expuesta', en: 'Exposed Soul' },
        price: '1,800 €',
        year: '2024',
        technique: { es: 'Óleo sobre lienzo', en: 'Oil on canvas' },
        size: '100 x 80 cm',
        style: { es: 'Expresionismo', en: 'Expressionism' },
        image: 'https://placeholder-image-service.onrender.com/image/500x500?prompt=Contemporary portrait with expressive brushstrokes by Francesco Ponte&id=77a80fee-8a55-40e3-8abd-e380037f9a5e&customer_id=cus_T6TCYe7lXY5gQI'
    },
    6: {
        title: { es: 'Horizontes Infinitos', en: 'Infinite Horizons' },
        price: '2,200 €',
        year: '2024',
        technique: { es: 'Óleo sobre lienzo', en: 'Oil on canvas' },
        size: '120 x 90 cm',
        style: { es: 'Abstracción', en: 'Abstract Art' },
        image: 'https://placeholder-image-service.onrender.com/image/500x500?prompt=Abstract landscape painting with dynamic composition by Francesco Ponte&id=77a80fee-8a55-40e3-8abd-e380037f9a5e&customer_id=cus_T6TCYe7lXY5gQI'
    },
    7: {
        title: { es: 'Naturaleza Reimaginada', en: 'Reimagined Nature' },
        price: '1,100 €',
        year: '2023',
        technique: { es: 'Óleo sobre lienzo', en: 'Oil on canvas' },
        size: '70 x 50 cm',
        style: { es: 'Realismo Contemporáneo', en: 'Contemporary Realism' },
        image: 'https://placeholder-image-service.onrender.com/image/500x500?prompt=Modern still life painting with bold colors by Francesco Ponte&id=77a80fee-8a55-40e3-8abd-e380037f9a5e&customer_id=cus_T6TCYe7lXY5gQI'
    },
    8: {
        title: { es: 'Espacio y Tiempo', en: 'Space and Time' },
        price: '2,800 €',
        year: '2024',
        technique: { es: 'Instalación', en: 'Installation' },
        size: '200 x 150 x 100 cm',
        style: { es: 'Arte Conceptual', en: 'Conceptual Art' },
        image: 'https://placeholder-image-service.onrender.com/image/500x500?prompt=Contemporary installation art piece with interactive elements by Francesco Ponte&id=77a80fee-8a55-40e3-8abd-e380037f9a5e&customer_id=cus_T6TCYe7lXY5gQI'
    }
};

// Inicialización cuando el DOM esté cargado
document.addEventListener('DOMContentLoaded', function() {
    initCarousel();
    initCartFunctionality();
    initLanguageSwitcher();
    initModal();
    initSmoothScrolling();
});

// Función del carrusel
function initCarousel() {
    const prevBtn = document.querySelector('.prev-btn');
    const nextBtn = document.querySelector('.next-btn');
    const indicators = document.querySelectorAll('.indicator');
    
    // Navegación con flechas
    prevBtn.addEventListener('click', () => {
        currentSlide = (currentSlide - 1 + totalSlides) % totalSlides;
        showSlide(currentSlide);
    });
    
    nextBtn.addEventListener('click', () => {
        currentSlide = (currentSlide + 1) % totalSlides;
        showSlide(currentSlide);
    });
    
    // Navegación con indicadores
    indicators.forEach((indicator, index) => {
        indicator.addEventListener('click', () => {
            currentSlide = index;
            showSlide(currentSlide);
        });
    });
    
    // Carrusel automático
    setInterval(() => {
        currentSlide = (currentSlide + 1) % totalSlides;
        showSlide(currentSlide);
    }, 5000);
}

function showSlide(slideIndex) {
    const slides = document.querySelectorAll('.carousel-slide');
    const indicators = document.querySelectorAll('.indicator');
    
    // Ocultar todas las diapositivas
    slides.forEach(slide => slide.classList.remove('active'));
    indicators.forEach(indicator => indicator.classList.remove('active'));
    
    // Mostrar la diapositiva actual
    slides[slideIndex].classList.add('active');
    indicators[slideIndex].classList.add('active');
}

// Funcionalidad del carrito
function initCartFunctionality() {
    const addToCartBtns = document.querySelectorAll('.add-to-cart-btn');
    const cartCounter = document.getElementById('cartCounter');
    
    addToCartBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            addToCart();
        });
    });
    
    // También agregar funcionalidad al botón del modal
    document.querySelector('.modal-add-to-cart').addEventListener('click', () => {
        addToCart();
        closeModal();
    });
}

function addToCart() {
    cartCount++;
    const cartCounter = document.getElementById('cartCounter');
    cartCounter.textContent = cartCount;
    cartCounter.classList.add('show', 'animate');
    
    // Remover la animación después de completarse
    setTimeout(() => {
        cartCounter.classList.remove('animate');
    }, 600);
}

// Cambio de idioma
function initLanguageSwitcher() {
    const langBtns = document.querySelectorAll('.lang-btn');
    
    langBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const lang = btn.getAttribute('data-lang');
            if (lang !== currentLanguage) {
                switchLanguage(lang);
            }
        });
    });
}

function switchLanguage(lang) {
    currentLanguage = lang;
    
    // Actualizar botones de idioma
    const langBtns = document.querySelectorAll('.lang-btn');
    langBtns.forEach(btn => {
        btn.classList.remove('active');
        if (btn.getAttribute('data-lang') === lang) {
            btn.classList.add('active');
        }
    });
    
    // Aplicar transición fade
    const body = document.body;
    body.classList.add('fade-transition');
    
    setTimeout(() => {
        // Actualizar textos
        const elements = document.querySelectorAll('[data-translate]');
        elements.forEach(element => {
            const key = element.getAttribute('data-translate');
            if (translations[lang] && translations[lang][key]) {
                element.textContent = translations[lang][key];
            }
        });
        
        body.classList.add('visible');
    }, 150);
    
    setTimeout(() => {
        body.classList.remove('fade-transition', 'visible');
    }, 300);
}

// Modal de detalles de obra
function initModal() {
    const modal = document.getElementById('artworkModal');
    const closeBtn = document.querySelector('.modal-close');
    const artworkCards = document.querySelectorAll('.artwork-card');
    
    // Abrir modal al hacer clic en una obra
    artworkCards.forEach(card => {
        card.addEventListener('click', (e) => {
            // Evitar que se abra el modal si se hizo clic en el botón de agregar al carrito
            if (e.target.classList.contains('add-to-cart-btn')) {
                return;
            }
            
            const artworkId = card.getAttribute('data-artwork');
            openModal(artworkId);
        });
    });
    
    // Cerrar modal
    closeBtn.addEventListener('click', closeModal);
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            closeModal();
        }
    });
    
    // Cerrar con Escape
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && modal.style.display === 'block') {
            closeModal();
        }
    });
}

function openModal(artworkId) {
    const modal = document.getElementById('artworkModal');
    const artwork = artworksData[artworkId];
    
    if (!artwork) return;
    
    // Actualizar contenido del modal
    document.getElementById('modalImage').src = artwork.image;
    document.getElementById('modalImage').alt = `${artwork.title[currentLanguage]} by Francesco Ponte`;
    document.getElementById('modalTitle').textContent = artwork.title[currentLanguage];
    document.getElementById('modalPrice').textContent = artwork.price;
    document.getElementById('modalYear').textContent = artwork.year;
    document.getElementById('modalTechnique').textContent = artwork.technique[currentLanguage];
    document.getElementById('modalSize').textContent = artwork.size;
    document.getElementById('modalStyle').textContent = artwork.style[currentLanguage];
    
    modal.style.display = 'block';
    document.body.style.overflow = 'hidden';
}

function closeModal() {
    const modal = document.getElementById('artworkModal');
    modal.style.display = 'none';
    document.body.style.overflow = 'auto';
}

// Navegación suave
function initSmoothScrolling() {
    const navLinks = document.querySelectorAll('a[href^="#"]');
    
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const target = document.querySelector(link.getAttribute('href'));
            if (target) {
                const offsetTop = target.offsetTop - 80; // Compensar altura del navbar
                window.scrollTo({
                    top: offsetTop,
                    behavior: 'smooth'
                });
            }
        });
    });
}

// Funcionalidad adicional: lazy loading para imágenes (opcional)
function initLazyLoading() {
    const images = document.querySelectorAll('img[data-src]');
    
    const imageObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                img.src = img.dataset.src;
                img.classList.remove('lazy');
                observer.unobserve(img);
            }
        });
    });
    
    images.forEach(img => imageObserver.observe(img));
}

// Efectos de scroll (opcional)
window.addEventListener('scroll', () => {
    const navbar = document.querySelector('.navbar');
    if (window.scrollY > 100) {
        navbar.style.backgroundColor = 'rgba(255, 255, 255, 0.95)';
        navbar.style.backdropFilter = 'blur(10px)';
    } else {
        navbar.style.backgroundColor = '#ffffff';
        navbar.style.backdropFilter = 'none';
    }
});