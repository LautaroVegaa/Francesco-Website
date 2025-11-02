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
let currentLanguage = 'es';
let currentOpenModalId = null;

// --- 1. MODIFICACIÓN: La variable cartItems ahora se define dentro de loadCart ---
let cartItems = [];

// --- 2. NUEVA FUNCIÓN: Guardar carrito en localStorage ---
function saveCart() {
    localStorage.setItem('francescoCart', JSON.stringify(cartItems));
}

// --- 3. NUEVA FUNCIÓN: Cargar carrito desde localStorage ---
function loadCart() {
    const storedCart = localStorage.getItem('francescoCart');
    if (storedCart) {
        cartItems = JSON.parse(storedCart);
        cartCount = cartItems.length; // Actualizar el contador global
    } else {
        cartItems = [];
        cartCount = 0;
    }
}


// ====================================================
// 🧩 INTEGRACIÓN CON MERCADO PAGO (AGREGADO)
// ====================================================

// Convierte "$30.000 ARS" → 30000
function parseArsPrice(str) {
    if (!str) return 0;
    return Number(str.replace(/[^\d]/g, ""));
}

// Mapea los productos del carrito al formato de Mercado Pago
function mapCartToPreferenceItems() {
    return cartItems.map((item) => ({
        title: typeof item.title === 'object' ? item.title[currentLanguage] : item.title,
        unit_price: parseArsPrice(item.price),
        quantity: 1,
        picture_url: item.image
            ? (item.image.startsWith('http')
                ? item.image
                : `${window.location.origin}/images/${item.image}`)
            : undefined,
    }));
}

// Envía los productos al backend Supabase y redirige al checkout
async function iniciarCheckout() {
    try {
        const items = mapCartToPreferenceItems();
        if (!items.length) {
            alert("Tu carrito está vacío.");
            return;
        }

        // --- ¡CAMBIO AQUÍ! ---
        // 1. Obtenemos la sesión actual del usuario desde Supabase
        const { data: { session }, error: sessionError } = await _supabase.auth.getSession();

        if (sessionError) {
            console.error('Error al obtener la sesión:', sessionError);
            alert('Error de autenticación. Por favor, inicia sesión de nuevo.');
            return;
        }

        if (!session) {
            console.error('No hay sesión activa.');
            alert('No estás conectado. Por favor, inicia sesión para comprar.');
            // Opcional: redirigir a login.html
            // window.location.href = 'login.html';
            return;
        }
        // --- FIN DEL CAMBIO ---


        const res = await fetch(
            "https://umnahyousgddxyfwopsq.supabase.co/functions/v1/create_preference",
            {
                method: "POST",
                headers: { 
                    "Content-Type": "application/json",
                    // --- ¡LÍNEAS NUEVAS! ---
                    // Añadimos el token de autorización para que Supabase sepa quién eres
                    "Authorization": `Bearer ${session.access_token}`,
                    // La Anon Key también es necesaria para llamar a la función
                    "apikey": SUPABASE_ANON_KEY 
                },
                body: JSON.stringify({ items }),
            }
        );

        const data = await res.json();
        if (!data.init_point) {
            console.error("Error al crear preferencia:", data);
            alert("No se pudo iniciar el pago. Intenta nuevamente.");
            return;
        }

        // Redirige al checkout oficial de Mercado Pago
        window.location.href = data.init_point;
    } catch (err) {
        console.error("Error al iniciar pago:", err);
        alert("Ocurrió un error al iniciar el pago.");
    }
}
// ====================================================



// Traducciones
const translations = {
    es: {
        'brand': 'Francesco Ponte',
        'nav-home': 'HOME',
        'nav-about': 'SOBRE MÍ',
        'nav-projects': 'PROYECTOS',
        'nav-login': 'LOGIN',
        'hero-main-title': 'FRANCESCO PONTE',
        'hero-subtitle': 'ARTISTA REALISTA',
        'about-title': 'SOBRE MÍ',
        'artist-description': 'Me llamo Francesco Ponte, soy un artista autodidacta de Buenos Aires, Argentina. Mi trabajo se centra en el dibujo realista, una disciplina que descubrí como una forma de conectar con el detalle, la paciencia y la emoción detrás de cada trazo.<br>Me especializo en retratos realistas en blanco y negro realizados con grafito, principalmente de rostros de celebridades. En cada obra busco alcanzar un equilibrio entre la fidelidad a la referencia y mi propia interpretación: no intento copiar la imagen, sino darle vida a través de mi mirada y mi técnica, incorporando matices que reflejan mi esencia como artista.<br>Además de los retratos, también dibujo peces con el mismo enfoque realista, explorando las texturas, reflejos y contrastes que surgen de la naturaleza.<br>Mi objetivo es transmitir conocimiento y, al mismo tiempo, provocar una emoción en quien observa mis obras: que cada dibujo logre detener el tiempo por un instante y genere una conexión genuina.<br>Actualmente me encuentro en la búsqueda de un nuevo horizonte creativo, combinando el hiperrealismo con el surrealismo: piezas que mantienen la precisión técnica del realismo extremo, pero con contenidos imaginativos, simbólicos y conceptuales, que inviten a mirar más allá de lo evidente.',
        'gallery-title': 'TRABAJA EN LÍNEA',
        'add-to-cart': 'Agregar al carrito',
        'modal-add-to-cart': 'AÑADIR A LA CESTA',
        'footer-contact': 'CONTACTO',
        'footer-social': 'REDES SOCIALES',
        
        // --- NUEVO: Títulos de la Galería ---
        'artwork-1-title': 'Retrato de Ben Shelton',
        'artwork-2-title': 'Lamine Yamal',
        'artwork-3-title': 'David Goggins',
        'artwork-4-title': 'Leonardo DiCaprio',
        'artwork-5-title': 'Will Smith',
        'artwork-6-title': 'Eminem',
        'artwork-7-title': 'Obra (Placeholder)',
        'artwork-8-title': 'Obra (Placeholder)',

        // --- NUEVO: Detalles del Modal ---
        'modal-year': 'Año:',
        'modal-technique': 'Técnica:',
        'modal-technique-value': 'Grafito sobre papel 150 gr',
        'modal-size': 'Tamaño:',
        'modal-style': 'Estilo:',
        'modal-style-value': 'Retrato Realista',

        // --- NUEVO: Modal del Carrito ---
        'cart-title': 'CARRITO DE COMPRA',
        'cart-total': 'Total:',
        'cart-checkout': 'FINALIZAR COMPRA',

        // --- NUEVO: Formulario de Contacto ---
        'footer-form-title': 'ENVIAR UN MENSAJE',
        'form-label-name': 'Nombre:',
        'form-label-message': 'Mensaje:',
        'form-btn-submit': 'Enviar',

        // --- NUEVO: Links del Footer ---
        'footer-privacy': 'Protección de Datos',
        'footer-agb': 'Términos y Cond.',
        'footer-faq': 'FAQ',
        'footer-shop-info': 'Info Tienda',

        // --- Traducciones de Login/Registro (Ya existían) ---
        'login-title': 'INICIAR SESIÓN',
        'login-btn-submit': 'Ingresar',
        'login-forgot-password': '¿Olvidaste tu contraseña?',
        'login-register': 'Crear una cuenta',
        'register-title': 'CREAR CUENTA',
        'register-confirm-password': 'Confirmar Contraseña:',
        'register-btn-submit': 'Registrarse',
        'register-go-back': 'Ya tengo una cuenta',
        'form-label-email': 'Email:',
        'form-label-password': 'Contraseña:',

        // --- (NUEVO) Traducciones de Reset ---
        'reset-title': 'RESETEAR CONTRASEÑA',
        'reset-btn-submit': 'Enviar enlace',
        'reset-success': 'Enlace enviado. Revisa tu correo.',
        'reset-error': 'Error: No se pudo enviar el enlace.',
        // --- (NUEVO) Traducciones de Nuevo Formulario de Reset ---
        'reset-title-new': 'Establece tu nueva contraseña',
        'form-label-password-new': 'Nueva Contraseña:',
        'form-label-password-confirm': 'Confirmar Contraseña:',
        'reset-btn-submit-new': 'Guardar Contraseña',
        'reset-password-success': '¡Contraseña actualizada con éxito!',
        'reset-password-mismatch': 'Las contraseñas no coinciden.',
    },
    en: {
        'brand': 'Francesco Ponte',
        'nav-home': 'HOME',
        'nav-about': 'ABOUT ME',
        'nav-projects': 'PROJECTS',
        'nav-login': 'LOGIN',
        'hero-main-title': 'FRANCESCO PONTE',
        'hero-subtitle': 'REALIST ARTIST',
        'about-title': 'ABOUT ME',
        'artist-description': 'My name is Francesco Ponte, I am a self-taught artist from Buenos Aires, Argentina. My work focuses on realistic drawing, a discipline I discovered as a way to connect with the detail, patience, and emotion behind each stroke.<br>I specialize in realistic black and white portraits made with graphite, mainly of celebrity faces. In each piece, I seek to achieve a balance between fidelity to the reference and my own interpretation: I do not try to copy the image, but to bring it to life through my gaze and my technique, incorporating nuances that reflect my essence as an artist.<br>In addition to portraits, I also draw fish with the same realistic approach, exploring the textures, reflections, and contrasts that arise from nature.<br>My goal is to transmit knowledge and, at the same time, provoke an emotion in the viewer: that each drawing manages to stop time for an instant and generate a genuine connection.<br>I am currently in search of a new creative horizon, combining hyperrealism with surrealism: pieces that maintain the technical precision of extreme realism but with imaginative, symbolic, and conceptual content, inviting viewers to look beyond the obvious.',
        'gallery-title': 'WORKS ONLINE',
        'add-to-cart': 'Add to cart',
        'modal-add-to-cart': 'ADD TO BASKET',
        'footer-contact': 'CONTACT',
        'footer-social': 'SOCIAL MEDIA',

        // --- NUEVO: Títulos de la Galería ---
        'artwork-1-title': 'Ben Shelton Portrait',
        'artwork-2-title': 'Lamine Yamal',
        'artwork-3-title': 'David Goggins',
        'artwork-4-title': 'Leonardo DiCaprio',
        'artwork-5-title': 'Will Smith',
        'artwork-6-title': 'Eminem',
        'artwork-7-title': 'Work (Placeholder)',
        'artwork-8-title': 'Work (Placeholder)',

        // --- NUEVO: Detalles del Modal ---
        'modal-year': 'Year:',
        'modal-technique': 'Technique:',
        'modal-technique-value': 'Graphite on 150 gr paper',
        'modal-size': 'Size:',
        'modal-style': 'Style:',
        'modal-style-value': 'Realistic Portrait',

        // --- NUEVO: Modal del Carrito ---
        'cart-title': 'SHOPPING CART',
        'cart-total': 'Total:',
        'cart-checkout': 'PROCEED TO CHECKOUT',
        
        // --- NUEVO: Formulario de Contacto ---
        'footer-form-title': 'SEND A MESSAGE',
        'form-label-name': 'Name:',
        'form-label-message': 'Message:',
        'form-btn-submit': 'Send',

        // --- NUEVO: Links del Footer ---
        'footer-privacy': 'Data Protection',
        'footer-agb': 'Terms & Cond.',
        'footer-faq': 'FAQ',
        'footer-shop-info': 'Shop Info',

        // --- Traducciones de Login/Registro (Ya existían) ---
        'login-title': 'LOGIN',
        'login-btn-submit': 'Sign In',
        'login-forgot-password': 'Forgot your password?',
        'login-register': 'Create an account',
        'register-title': 'CREATE ACCOUNT',
        'register-confirm-password': 'Confirm Password:',
        'register-btn-submit': 'Register',
        'register-go-back': 'I already have an account',
        'form-label-email': 'Email:',
        'form-label-password': 'Password:',
        
        // --- (NUEVO) Traducciones de Reset ---
        'reset-title': 'RESET PASSWORD',
        'reset-btn-submit': 'Send reset link',
        'reset-success': 'Link sent. Check your email.',
        'reset-error': 'Error: Could not send link.',
        // --- (NUEVO) Traducciones de Nuevo Formulario de Reset ---
        'reset-title-new': 'Set your new password',
        'form-label-password-new': 'New Password:',
        'form-label-password-confirm': 'Confirm Password:',
        'reset-btn-submit-new': 'Save Password',
        'reset-password-success': 'Password updated successfully!',
        'reset-password-mismatch': 'Passwords do not match.',
    }
};


// Datos de las obras
const artworksData = {
    1: { 
        title: { es: 'Retrato de Ben Shelton', en: 'Ben Shelton Portrait' }, 
        price: '$100 ARS', 
        image: 'ben-shelton.png',
        year: '2024',
        technique: { es: 'Grafito sobre papel 150 gr', en: 'Graphite on 150 gr paper' },
        size: { es: 'A3 (29,7 x 42 cm)', en: 'A3 (29.7 x 42 cm)' },
        style: { es: 'Retrato Realista', en: 'Realistic Portrait' }
    },
    2: { 
        title: { es: 'Lamine Yamal', en: 'Lamine Yamal' }, 
        price: '$30.000 ARS', 
        image: 'lamine-yamal.png',
        year: '2024',
        technique: { es: 'Grafito sobre papel 150 gr', en: 'Graphite on 150 gr paper' },
        size: { es: 'A3 (29,7 x 42 cm)', en: 'A3 (29.7 x 42 cm)' },
        style: { es: 'Retrato Realista', en: 'Realistic Portrait' }
    },
    3: { 
        title: { es: 'David Goggins', en: 'David Goggins' }, 
        price: '$30.000 ARS', 
        image: 'david-goggings.png',
        year: '2024',
        technique: { es: 'Grafito sobre papel 150 gr', en: 'Graphite on 150 gr paper' },
        size: { es: 'A3 (29,7 x 42 cm)', en: 'A3 (29.7 x 42 cm)' },
        style: { es: 'Retrato Realista', en: 'Realistic Portrait' }
    },
    4: { 
        title: { es: 'Leonardo DiCaprio', en: 'Leonardo DiCaprio' }, 
        price: '$30.000 ARS', 
        image: 'leo-dicaprio.png',
        year: '2023',
        technique: { es: 'Grafito sobre papel 150 gr', en: 'Graphite on 150 gr paper' },
        size: { es: 'A3 (29,7 x 42 cm)', en: 'A3 (29.7 x 42 cm)' },
        style: { es: 'Retrato Realista', en: 'Realistic Portrait' }
    },
    5: { 
        title: { es: 'Will Smith', en: 'Will Smith' }, 
        price: '$30.000 ARS', 
        image: 'will-smith.png',
        year: '2023',
        technique: { es: 'Grafito sobre papel 150 gr', en: 'Graphite on 150 gr paper' },
        size: { es: 'A3 (29,7 x 42 cm)', en: 'A3 (29.7 x 42 cm)' },
        style: { es: 'Retrato Realista', en: 'Realistic Portrait' }
    },
    6: { 
        title: { es: 'Eminem', en: 'Eminem' }, 
        price: '$30.000 ARS', 
        image: 'eminem.png',
        year: '2023',
        technique: { es: 'Grafito sobre papel 150 gr', en: 'Graphite on 150 gr paper' },
        size: { es: 'A3 (29,7 x 42 cm)', en: 'A3 (29.7 x 42 cm)' },
        style: { es: 'Retrato Realista', en: 'Realistic Portrait' }
    }
    // Puedes añadir las obras 7 y 8 aquí cuando las tengas
};


// Añade esta función nueva (después de artworksData está bien)

function updateModalContent() {
    if (!currentOpenModalId) return; // Si no hay modal abierto, no hace nada

    const artwork = artworksData[currentOpenModalId];
    if (!artwork) return;

    // Obtiene el texto traducido o el valor directo
    const title = artwork.title[currentLanguage] || artwork.title['es'];
    const price = artwork.price;
    const year = artwork.year;
    const technique = artwork.technique[currentLanguage] || artwork.technique['es'];
    const size = artwork.size[currentLanguage] || artwork.size['es'];
    const style = artwork.style[currentLanguage] || artwork.style['es'];

    // Actualiza el HTML del modal
    document.getElementById('modalTitle').textContent = title;
    document.getElementById('modalPrice').textContent = price;
    document.getElementById('modalYear').textContent = year;
    document.getElementById('modalTechnique').textContent = technique;
    document.getElementById('modalSize').textContent = size;
    document.getElementById('modalStyle').textContent = style;
    
    // También actualizamos la imagen por si acaso (aunque 'openModal' ya lo hace)
    const modalImage = document.getElementById('modalImage');
    modalImage.src = artwork.image.includes('http') ? artwork.image : `images/${artwork.image}`;
    modalImage.alt = title;
}


// Inicialización
document.addEventListener('DOMContentLoaded', function() {
    // --- 4. MODIFICACIÓN: Llamar a loadCart() al inicio ---
    loadCart(); 

    initCartFunctionality();
    initLanguageSwitcher();
    initModal();
    initSmoothScrolling();
    initNavbarScroll(); 
    initAuthFormListeners(); 
    handleUserSession(); 
    initPasswordToggles(); // --- (MODIFICACIÓN) LLAMAR A ESTA FUNCIÓN AQUÍ ---

    // --- 5. MODIFICACIÓN: Actualizar UI del carrito al cargar la página ---
    const cartCounter = document.getElementById('cartCounter');
    cartCounter.textContent = cartCount;
    if (cartCount > 0) {
        cartCounter.classList.add('show');
    }

    // 🔹 BOTÓN "FINALIZAR COMPRA" (AGREGADO)
    const checkoutBtn = document.getElementById('checkoutBtn');
    if (checkoutBtn) {
        checkoutBtn.addEventListener('click', (e) => {
            e.preventDefault();
            iniciarCheckout();
        });
    }

    // --- (NUEVO) LISTENER PARA EL FORMULARIO DE NUEVA CONTRASEÑA ---
    const newPasswordForm = document.getElementById('new-password-form');
    if (newPasswordForm) {
        newPasswordForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const newPassword = document.getElementById('new-password').value;
            const confirmPassword = document.getElementById('confirm-password').value;
            const messageEl = document.getElementById('new-password-message');

            if (newPassword !== confirmPassword) {
                messageEl.style.color = 'red';
                messageEl.textContent = translations[currentLanguage]['reset-password-mismatch'] || 'Las contraseñas no coinciden.';
                return;
            }

            // El usuario ya está autenticado por hacer clic en el enlace
            const { data, error } = await _supabase.auth.updateUser({
                password: newPassword
            });

            if (error) {
                messageEl.style.color = 'red';
                messageEl.textContent = error.message;
            } else {
                messageEl.style.color = '#C6A200'; // Verde o dorado
                messageEl.textContent = translations[currentLanguage]['reset-password-success'] || '¡Contraseña actualizada con éxito!';
                
                // Cerramos el modal y limpiamos la URL después de 2 segundos
                setTimeout(() => {
                    closeResetPasswordModal();
                }, 2000);
            }
        });
    }
});

// === (MODIFICADO) Detectar confirmación de email Y RESSETEO DE CONTRASEÑA ===
document.addEventListener('DOMContentLoaded', async () => {
    const hash = window.location.hash;
    const urlParams = new URLSearchParams(hash.replace('#', '?'));

    if (urlParams.has('access_token')) {
        
        // --- (NUEVO) Diferenciamos el tipo de token ---
        const type = urlParams.get('type');

        if (type === 'recovery') {
            // --- Es un reseteo de contraseña ---
            console.log('Detectado flujo de reseteo de contraseña.');
            openResetPasswordModal();
            // No mostramos el mensaje de bienvenida

        } else if (type === 'signup' || type === null) {
            // --- Es una confirmación de cuenta nueva ---
            console.log('Cuenta verificada desde el email.');
            const { data: { user }, error } = await _supabase.auth.getUser();

            if (!error && user) {
                const fullName = user.user_metadata?.full_name || user.email.split('@')[0];

                const welcomeMsg = document.createElement('div');
                welcomeMsg.textContent = `✅ Cuenta verificada, ¡bienvenido ${fullName}!`;
                welcomeMsg.style.cssText = `
                    position: fixed;
                    top: 20px;
                    left: 50%;
                    transform: translateX(-50%) translateY(-10px);
                    background: #C6A200;
                    color: #000;
                    padding: 12px 24px;
                    border-radius: 8px;
                    font-weight: 600;
                    z-index: 2000;
                    box-shadow: 0 3px 10px rgba(0,0,0,0.2);
                    opacity: 0;
                    transition: opacity 0.4s ease, transform 0.4s ease;
                `;
                document.body.appendChild(welcomeMsg);
                setTimeout(() => {
                    welcomeMsg.style.opacity = '1';
                    welcomeMsg.style.transform = 'translateX(-50%) translateY(0)';
                }, 100);

                setTimeout(() => {
                    welcomeMsg.style.opacity = '0';
                    welcomeMsg.style.transform = 'translateX(-50%) translateY(-10px)';
                    setTimeout(() => {
                        welcomeMsg.remove();
                        // Limpiamos la URL
                        history.replaceState(null, '', window.location.pathname); 
                    }, 500);
                }, 4000);
            }
        }
    }
});


// === ✅ Mostrar mensaje de bienvenida tras login ===
document.addEventListener('DOMContentLoaded', () => {
    const userName = localStorage.getItem('welcomeUser');
    if (userName) {
        const welcomeMsg = document.createElement('div');
        welcomeMsg.textContent = `✅ ¡Bienvenido ${userName}!`;
        welcomeMsg.style.cssText = `
            position: fixed;
            top: 20px;
            left: 50%;
            transform: translateX(-50%) translateY(-10px);
            background: #C6A200;
            color: #000;
            padding: 12px 24px;
            border-radius: 8px;
            font-weight: 600;
            z-index: 2000;
            box-shadow: 0 3px 10px rgba(0,0,0,0.2);
            opacity: 0;
            transition: opacity 0.4s ease, transform 0.4s ease;
        `;
        document.body.appendChild(welcomeMsg);
        setTimeout(() => {
            welcomeMsg.style.opacity = '1';
            welcomeMsg.style.transform = 'translateX(-50%) translateY(0)';
        }, 100);

        // 🔹 Borrar mensaje después de unos segundos
        setTimeout(() => {
            welcomeMsg.style.opacity = '0';
            welcomeMsg.style.transform = 'translateX(-50%) translateY(-10px)';
            setTimeout(() => {
                welcomeMsg.remove();
                localStorage.removeItem('welcomeUser');
            }, 500);
        }, 3500);
    }
});



// --- MODIFICACIÓN: Se elimina la definición 'let cartItems = [];' de aquí ---

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
    
    // --- 6. MODIFICACIÓN: Llamar a saveCart() ---
    saveCart();
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

// --- (NUEVO) Funciones para abrir/cerrar el nuevo modal de reseteo ---
function openResetPasswordModal() {
    const modal = document.getElementById('resetPasswordModal');
    if (modal) {
        modal.style.display = 'block';
        document.body.style.overflow = 'hidden';
    }
}

function closeResetPasswordModal() {
    const modal = document.getElementById('resetPasswordModal');
    if (modal) {
        modal.style.display = 'none';
        document.body.style.overflow = 'auto';
        // Limpiamos la URL para que no se vuelva a abrir si refresca
        history.replaceState(null, '', window.location.pathname);
    }
}
// --- Fin de nuevas funciones ---


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

            // --- FIX: Asegurarse de que el título se muestre en el idioma actual ---
            const title = item.title[currentLanguage] || item.title['es'];

            const cartItem = document.createElement('div');
            cartItem.classList.add('cart-item');
            cartItem.innerHTML = `
                <div class="cart-item-left">
                    <img src="${imgSrc}" alt="${title}" class="cart-item-image">
                    <div class="cart-item-info">
                        <p class="cart-item-title">${title}</p>
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

    // --- 7. MODIFICACIÓN: Llamar a saveCart() ---
    saveCart();
}

function clearCart() {
    cartItems = [];
    cartCount = 0;
    document.getElementById('cartCounter').textContent = '0';
    renderCartItems();

    // --- 8. MODIFICACIÓN: Llamar a saveCart() ---
    saveCart();
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
    updateModalContent();
    // --- 9. MODIFICACIÓN: Re-renderizar el carrito para traducir títulos ---
    renderCartItems();
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
    if (!modal) return; 

    // 1. Guardamos el ID de la obra que estamos abriendo
    currentOpenModalId = artworkId;

    // 2. Llamamos a la función que rellena los datos
    updateModalContent();

    // 3. Mostramos el modal
    modal.style.display = 'block';
    document.body.style.overflow = 'hidden';
}


function closeModal() {
    const modal = document.getElementById('artworkModal');
    if (modal) {
        modal.style.display = 'none';
        document.body.style.overflow = 'auto';
    }
    currentOpenModalId = null; // <-- AÑADE ESTA LÍNEA
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

// ===== (FUNCIÓN MODIFICADA) =====
function initAuthFormListeners() {
    const loginFormEl = document.querySelector('#login-form .login-form');
    const registerFormEl = document.querySelector('#register-form .login-form');
    // --- (NUEVO) ---
    const resetFormEl = document.querySelector('#reset-form .login-form');

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
                const msg = document.createElement('div');
                msg.textContent = '❌ ' + error.message;
                msg.style.cssText = `
                    position: fixed;
                    top: 20px;
                    left: 50%;
                    transform: translateX(-50%);
                    background: #ff4d4d;
                    color: #fff;
                    padding: 12px 24px;
                    border-radius: 8px;
                    font-weight: 600;
                    z-index: 2000;
                    box-shadow: 0 3px 10px rgba(0,0,0,0.2);
                    opacity: 0;
                    transition: opacity 0.4s ease;
                `;
                document.body.appendChild(msg);
                setTimeout(() => (msg.style.opacity = '1'), 100);
                setTimeout(() => {
                    msg.style.opacity = '0';
                    setTimeout(() => msg.remove(), 500);
                }, 4000);
            } else {
                console.log('Login exitoso:', data.user);

                // 🔹 Guarda el nombre y redirige al home
                const userName = data.user.user_metadata?.full_name || data.user.email.split('@')[0];
                localStorage.setItem('welcomeUser', userName);
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
            const messageEl = document.getElementById('register-message');
            
            messageEl.textContent = ''; // limpia cualquier mensaje previo

            console.log('Intentando registrar con Supabase...');

            const { data, error } = await _supabase.auth.signUp({
                email: email,
                password: password,
                options: {
                    data: { full_name: name },
                    // 🔹 Agregamos la URL de redirección post-confirmación
                    emailRedirectTo: `${window.location.origin}/index.html`
                }
            });

            if (error) {
                console.error('Error en el registro:', error.message);
                messageEl.style.color = 'red';
                messageEl.textContent = 'Error al registrarse: ' + error.message;
                return;
            }

            console.log('Registro exitoso:', data.user);
            messageEl.style.color = '#C6A200';
            messageEl.textContent = 'Cuenta creada con éxito. Verifica tu correo para confirmar tu cuenta.';
            
            // Limpia los campos del formulario
            registerFormEl.reset();
        });
    }

    // --- (NUEVO) LISTENER PARA EL FORMULARIO DE RESET ---
    if (resetFormEl) {
        resetFormEl.addEventListener('submit', async (e) => {
            e.preventDefault();
            const email = document.getElementById('reset-email').value;
            const messageEl = document.getElementById('reset-message');
            messageEl.textContent = ''; // Limpia mensajes previos

            console.log('Intentando enviar enlace de reseteo...');

            // Llama a la función de Supabase
            const { error } = await _supabase.auth.resetPasswordForEmail(email, {
                redirectTo: `${window.location.origin}/index.html`, // A dónde ir DESPUÉS de hacer clic en el enlace
            });

            if (error) {
                console.error('Error al resetear contraseña:', error.message);
                messageEl.style.color = 'red';
                // Usamos la traducción, con un fallback
                messageEl.textContent = translations[currentLanguage]['reset-error'] || 'Error: No se pudo enviar el enlace.';
            } else {
                console.log('Enlace de reseteo enviado');
                messageEl.style.color = '#C6A200'; // Color dorado
                messageEl.textContent = translations[currentLanguage]['reset-success'] || 'Enlace enviado. Revisa tu correo.';
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
    userMenuDropdown.classList.remove('show');

    try {
        // Intenta cerrar sesión con Supabase
        const { error } = await _supabase.auth.signOut();

        // Borra la sesión local (fix para localhost)
        localStorage.removeItem('sb-umnahyousgddxyfwopsq-auth-token');
        sessionStorage.clear();

        if (error) console.warn('Supabase signOut error (ignorado en localhost):', error.message);

        console.log('Sesión cerrada correctamente.');
        window.location.href = 'login.html';
    } catch (err) {
        console.error('Error al cerrar sesión:', err);
        localStorage.removeItem('sb-umnahyousgddxyfwopsq-auth-token');
        sessionStorage.clear();
        window.location.href = 'login.html';
    }
});



    // 5. Opcional: Cierra el menú si se hace clic fuera
    document.addEventListener('click', (e) => {
        if (!userMenuContainer.contains(e.target) && userMenuDropdown.classList.contains('show')) {
            userMenuDropdown.classList.remove('show');
        }
    });
}

// ===== (MODIFICADO) FUNCIÓN PARA EL OJO DE CONTRASEÑA =====
function initPasswordToggles() {
    // Ahora busca *todos* los toggles en la página (login, registro y nuevo modal)
    const toggles = document.querySelectorAll('.toggle-password');
    toggles.forEach(toggle => {
        // Prevenimos que se añadan múltiples listeners si se llama varias veces
        if (toggle.dataset.listenerAttached) return; 

        toggle.addEventListener('click', () => {
            // Buscamos el input que está ANTES del icono 'i'
            const passwordField = toggle.previousElementSibling; 
            
            if (passwordField && passwordField.tagName === 'INPUT') {
                // Cambiar tipo de input
                const type = passwordField.getAttribute('type') === 'password' ? 'text' : 'password';
                passwordField.setAttribute('type', type);
                
                // Cambiar icono
                toggle.classList.toggle('fa-eye');
                toggle.classList.toggle('fa-eye-slash');
            } else {
                console.warn('No se encontró el input de contraseña antes del toggle.');
            }
        });
        toggle.dataset.listenerAttached = 'true'; // Marcamos como inicializado
    });
}