// ===== INICIALIZACIÓN DE SUPABASE =====
// Pega tu URL y tu clave 'anon' pública aquí
const SUPABASE_URL = 'https://umnahyousgddxyfwopsq.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVtbmFoeW91c2dkZHh5ZndvcHNxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE2NTMyMjUsImV4cCI6MjA3NzIyOTIyNX0.hm4SZ83OWmBAibe-TUlM1myvBwZTSsymvJk-BtWXmVI';

// Crea el cliente de Supabase
const { createClient } = supabase;
const _supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// =====================================


// Variables globales
let cartCount = 0;
// let currentSlide = 0; // Eliminado (no se usa)
// const totalSlides = 4; // Eliminado (no se usa)
let currentLanguage = 'es';

// Traducciones
const translations = {
    es: {
        'brand': 'Francesco Ponte',
        'nav-home': 'HOME',
        'nav-about': 'SOBRE MÍ',
        'nav-projects': 'PROYECTOS',
        'nav-login': 'LOGIN',
        'hero-main-title': 'FRANCESCO PONTE', // MODIFICADO
        'hero-subtitle': 'ARTISTA REALISTA', // NUEVO
        'about-title': 'SOBRE MÍ', // NUEVO
        'artist-description': 'Me llamo Francesco Ponte, soy un artista autodidacta de Buenos Aires, Argentina. Mi trabajo se centra en el dibujo realista, una disciplina que descubrí como una forma de conectar con el detalle, la paciencia y la emoción detrás de cada trazo. Me especializo en retratos realistas en blanco y negro realizados con grafito, principalmente de rostros de celebridades. En cada obra busco alcanzar un equilibrio entre la fidelidad a la referencia y mi propia interpretación: no intento copiar la imagen, sino darle vida a través de mi mirada y mi técnica, incorporando matices que reflejan mi esencia como artista. Además de los retratos, también dibujo peces con el mismo enfoque realista, explorando las texturas, reflejos y contrastes que surgen de la naturaleza. Mi objetivo es transmitir conocimiento y, al mismo tiempo, provocar una emoción en quien observa mis obras: que cada dibujo logre detener el tiempo por un instante y genere una conexión genuina. Actualmente me encuentro en la búsqueda de un nuevo horizonte creativo, combinando el hiperrealismo con el surrealismo: piezas que mantienen la precisión técnica del realismo extremo, pero con contenidos imaginativos, simbólicos y conceptuales, que inviten a mirar más allá de lo evidente.',
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
        'footer-social': 'REDES SOCIALES',

        // --- Nuevas traducciones de Login/Register ---
        'login-title': 'INICIAR SESIÓN',
        'login-btn-submit': 'Ingresar',
        'login-forgot-password': '¿Olvidaste tu contraseña?',
        'login-register': 'Crear una cuenta',
        'register-title': 'CREAR CUENTA',
        'register-confirm-password': 'Confirmar Contraseña:',
        'register-btn-submit': 'Registrarse',
        'register-go-back': 'Ya tengo una cuenta',
        'form-label-email': 'Email:',
        'form-label-password': 'Contraseña:'
    },
    en: {
        'brand': 'Francesco Ponte',
        'nav-home': 'HOME',
        'nav-about': 'ABOUT ME',
        'nav-projects': 'PROJECTS',
        'nav-login': 'LOGIN',
        'hero-main-title': 'FRANCESCO PONTE', // MODIFICADO
        'hero-subtitle': 'REALIST ARTIST', // NUEVO
        'about-title': 'ABOUT ME', // NUEVO
        'artist-description': 'My name is Francesco Ponte, I´m a self-taught artist from Buenos Aires, Argentina. My work focuses on realistic drawing, a discipline I discovered as a way to connect with the detail, patience, and emotion behind each stroke. I specialize in realistic black and white graphite portraits, mainly of celebrity faces. In each piece, I seek to achieve a balance between fidelity to the reference and my own interpretation: I don´t try to copy the image, but rather bring it to life through my gaze and my technique, incorporating nuances that reflect my essence as an artist. In addition to portraits, I also draw fish with the same realistic approach, exploring the textures, reflections, and contrasts that emerge from nature. My goal is to convey knowledge and, at the same time, provoke an emotion in those who view my works: that each drawing manages to stop time for an instant and generate a genuine connection. I am currently searching for a new creative horizon, combining hyperrealismo with surrealism: pieces that maintain the technical precision of extreme realism, but with imaginative, symbolic and conceptual content that invites us to look beyond the obvious.',
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
        'footer-social': 'SOCIAL MEDIA',

        // --- New Login/Register translations ---
        'login-title': 'LOGIN',
        'login-btn-submit': 'Sign In',
        'login-forgot-password': 'Forgot your password?',
        'login-register': 'Create an account',
        'register-title': 'CREATE ACCOUNT',
        'register-confirm-password': 'Confirm Password:',
        'register-btn-submit': 'Register',
        'register-go-back': 'I already have an account',
        'form-label-email': 'Email:',
        'form-label-password': 'Password:'
    }
};

// Datos de las obras (usando las imágenes locales del proyecto)
const artworksData = {
    1: {
        title: { es: 'Retrato de Ben Shelton', en: 'Ben Shelton Portrait' },
        price: '$30.000 ARS',
        image: 'ben-shelton.png'
    },
    2: {
        title: { es: 'Lamine Yamal', en: 'Lamine Yamal' },
        price: '$30.000 ARS',
        image: 'lamine-yamal.png'
    },
    3: {
        title: { es: 'David Goggins', en: 'David Goggins' },
        price: '$30.000 ARS',
        image: 'david-goggings.png'
    },
    4: {
        title: { es: 'Leonardo DiCaprio', en: 'Leonardo DiCaprio' },
        price: '$30.000 ARS',
        image: 'leo-dicaprio.png'
    },
    5: {
        title: { es: 'Will Smith', en: 'Will Smith' },
        price: '$30.000 ARS',
        image: 'will-smith.png'
    },
    6: {
        title: { es: 'Eminem', en: 'Eminem' },
        price: '$30.000 ARS',
        image: 'eminem.png'
    }
};


// Inicialización
document.addEventListener('DOMContentLoaded', function() {
    // initCarousel(); // ELIMINADO
    initCartFunctionality();
    initLanguageSwitcher();
    initModal();
    initSmoothScrolling();
    initNavbarScroll(); 
    initAuthFormListeners(); 
    handleUserSession(); // <-- MODIFICADA
    initPasswordToggles(); 
});

// Carrusel (ELIMINADO)
/*
function initCarousel() {
    ...
}
*/

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

    const modalAddToCartBtn = document.querySelector('.modal-add-to-cart');
    if (modalAddToCartBtn) {
        modalAddToCartBtn.addEventListener('click', () => {
            const title = document.getElementById('modalTitle').textContent;
            const artworkId = Object.keys(artworksData).find(
                id => artworksData[id].title[currentLanguage] === title
            );
            addToCart(artworkId);
            closeModal();
        });
    }
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
    if (cartModal) {
        cartModal.style.display = 'block';
        document.body.style.overflow = 'hidden';
    }
}


function closeCartModal() {
    const cartModal = document.getElementById('cartModal');
    if (cartModal) {
        cartModal.style.display = 'none';
        document.body.style.overflow = 'auto';
    }
}

function renderCartItems() {
    const cartItemsContainer = document.getElementById('cartItems');
    const cartTotal = document.getElementById('cartTotal');
    const clearBtn = document.getElementById('clearCartBtn');

    if (!cartItemsContainer || !cartTotal || !clearBtn) {
        return;
    }

    cartItemsContainer.innerHTML = '';
    let total = 0;

    if (cartItems.length === 0) {
        cartItemsContainer.innerHTML = '<p style="text-align:center;">Tu carrito está vacío.</p>';
        clearBtn.style.display = 'none';
    } else {
        cartItems.forEach((item, index) => {
            const imgSrc = item.image.includes('http')
                ? item.image
                : `images/${item.image}`;

            const cartItem = document.createElement('div');
            cartItem.classList.add('cart-item');
            cartItem.innerHTML = `
                <div class="cart-item-left">
                    <img src="${imgSrc}" alt="${item.title[currentLanguage]}" class="cart-item-image">
                    <div class="cart-item-info">
                        <p class="cart-item-title">${item.title[currentLanguage]}</p>
                        <p class="cart-item-price">${item.price}</p>
                    </div>
                </div>
                <button class="remove-item" data-index="${index}">🗑️</button>
            `;
            cartItemsContainer.appendChild(cartItem);

            let cleanPrice = item.price.replace(/[^\d]/g, ''); 
            const numericPrice = parseFloat(cleanPrice); 
            total += numericPrice;
        });
        clearBtn.style.display = 'block';
    }

    cartTotal.textContent = '$' + total.toLocaleString('es-AR', {
        minimumFractionDigits: 0
    }) + ' ARS';

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
            el.innerHTML = translations[lang][key]; 
        }
    });
}

function initModal() {
    const modal = document.getElementById('artworkModal');
    const closeBtn = document.querySelector('.modal-close');
    const artworkCards = document.querySelectorAll('.artwork-card');

    if (modal && closeBtn) {
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
}

function openModal(artworkId) {
    const modal = document.getElementById('artworkModal');
    const artwork = artworksData[artworkId];
    if (!artwork || !modal) return; 

    const imgSrc = artwork.image.includes('http')
        ? artwork.image
        : `images/${artwork.image}`;

    const modalImage = document.getElementById('modalImage');
    modalImage.src = imgSrc;
    modalImage.alt = artwork.title[currentLanguage];
    modalImage.style.objectFit = 'contain';
    modalImage.style.maxHeight = '80vh';
    modalImage.style.width = 'auto';
    modalImage.style.margin = '0 auto';
    modalImage.style.display = 'block';

    document.getElementById('modalTitle').textContent = artwork.title[currentLanguage];
    document.getElementById('modalPrice').textContent = artwork.price;

    modal.style.display = 'block';
    document.body.style.overflow = 'hidden';
}


function closeModal() {
    const modal = document.getElementById('artworkModal');
    if (modal) {
        modal.style.display = 'none';
        document.body.style.overflow = 'auto';
    }
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

    if (cartIcon) {
        cartIcon.addEventListener('click', (e) => {
            e.preventDefault();
            openCartModal();
        });
    }

    if (closeCartBtn) {
        closeCartBtn.addEventListener('click', closeCartModal);
    }
    
    if (cartModal) {
        cartModal.addEventListener('click', (e) => {
            if (e.target === cartModal) closeCartModal();
        });
    }

    if (clearCartBtn) {
        clearCartBtn.addEventListener('click', clearCart);
    }
});

function initNavbarScroll() {
    const navbar = document.querySelector('.navbar');
    if (!navbar) return; 

    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) { 
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    });
}

function initAuthFormListeners() {
    const loginFormEl = document.querySelector('#login-form .login-form');
    const registerFormEl = document.querySelector('#register-form .login-form');

    if (loginFormEl) {
        loginFormEl.addEventListener('submit', async (e) => { 
            e.preventDefault(); 
            
            const email = document.getElementById('login-email').value;
            const password = document.getElementById('login-password').value;

            console.log('Intentando iniciar sesión con Supabase...');

            const { data, error } = await _supabase.auth.signInWithPassword({
                email: email,
                password: password,
            });

            if (error) {
                console.error('Error en el login:', error.message);
                alert('Error al iniciar sesión: ' + error.message);
            } else {
                console.log('Login exitoso:', data.user);
                alert('¡Login exitoso! Redirigiendo...');
                window.location.href = 'index.html'; 
            }
        });
    }

    if (registerFormEl) {
        registerFormEl.addEventListener('submit', async (e) => { 
            e.preventDefault(); 

            const name = document.getElementById('register-name').value;
            const email = document.getElementById('register-email').value;
            const password = document.getElementById('register-password').value;
            
            console.log('Intentando registrar con Supabase...');

            const { data, error } = await _supabase.auth.signUp({
                email: email,
                password: password,
                options: {
                    data: {
                        full_name: name 
                    }
                }
            });

            if (error) {
                console.error('Error en el registro:', error.message);
                alert('Error al registrarse: ' + error.message);
            } else {
                console.log('Registro exitoso:', data.user);
                alert('¡Registro exitoso! Por favor, revisa tu email para confirmar tu cuenta.');
            }
        });
    }
}

// ===== FUNCIÓN MODIFICADA PARA MANEJAR EL NUEVO MENÚ =====
function handleUserSession() {
    // 1. Obtenemos los nuevos elementos
    const navLoginLink = document.getElementById('navLoginLink');
    const userMenuContainer = document.getElementById('userMenuContainer');
    const userNameLink = document.getElementById('userNameLink');
    const logoutButton = document.getElementById('logoutButton');
    const userMenuDropdown = document.getElementById('userMenuDropdown');

    // Salimos si los elementos principales no existen
    if (!navLoginLink || !userMenuContainer || !userNameLink || !logoutButton) return;

    // 2. Escuchador de Supabase
    _supabase.auth.onAuthStateChange((event, session) => {
        
        if (session) {
            // --- Usuario INICIÓ SESIÓN ---
            console.log('Usuario detectado:', session.user);
            
            // Ocultamos "LOGIN", mostramos el menú de usuario
            navLoginLink.style.display = 'none';
            userMenuContainer.style.display = 'block'; // O 'inline-block' si prefieres

            // Ponemos el nombre de usuario
            const userName = session.user.user_metadata.full_name || session.user.email.split('@')[0];
            userNameLink.textContent = userName.toUpperCase(); 

        } else {
            // --- Usuario CERRÓ SESIÓN o no está logueado ---
            console.log('No hay usuario en sesión.');
            
            // Mostramos "LOGIN", ocultamos el menú de usuario
            navLoginLink.style.display = 'block';
            userMenuContainer.style.display = 'none';
        }
    });

    // 3. Lógica para ABRIR/CERRAR el menú desplegable
    userNameLink.addEventListener('click', (e) => {
        e.preventDefault();
        userMenuDropdown.classList.toggle('show');
    });

    // 4. Lógica de LOGOUT
    logoutButton.addEventListener('click', async (e) => {
        e.preventDefault();
        console.log('Cerrando sesión...');
        userMenuDropdown.classList.remove('show'); // Oculta el menú
        const { error } = await _supabase.auth.signOut();
        if (error) {
            console.error('Error al cerrar sesión:', error.message);
        } else {
            console.log('Sesión cerrada.');
            window.location.reload(); // Recargamos la página
        }
    });

    // 5. Opcional: Cierra el menú si se hace clic fuera
    document.addEventListener('click', (e) => {
        if (!userMenuContainer.contains(e.target) && userMenuDropdown.classList.contains('show')) {
            userMenuDropdown.classList.remove('show');
        }
    });
}

// ===== NUEVA FUNCIÓN PARA EL OJO DE CONTRASEÑA =====
function initPasswordToggles() {
    const toggles = document.querySelectorAll('.toggle-password');
    toggles.forEach(toggle => {
        toggle.addEventListener('click', () => {
            const passwordField = toggle.previousElementSibling; // El input está justo antes
            
            // Cambiar tipo de input
            const type = passwordField.getAttribute('type') === 'password' ? 'text' : 'password';
            passwordField.setAttribute('type', type);
            
            // Cambiar icono
            toggle.classList.toggle('fa-eye');
            toggle.classList.toggle('fa-eye-slash');
        });
    });
}