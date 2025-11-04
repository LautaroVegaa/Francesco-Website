// js/ui.js
import * as state from './state.js';
import { renderCartItems } from './cart.js';
import { artworksData } from './api.js'; // Importamos artworksData desde api.js

// Función de Toast (sin cambios)
export function showToastMessage(message, isError = false) {
    const toast = document.createElement('div');
    toast.textContent = message;
    toast.style.cssText = `
        position: fixed; top: 20px; left: 50%;
        transform: translateX(-50%) translateY(-10px);
        padding: 12px 24px; border-radius: 8px; font-weight: 600;
        z-index: 2000; box-shadow: 0 3px 10px rgba(0,0,0,0.2);
        opacity: 0; transition: opacity 0.4s ease, transform 0.4s ease;
    `;
    if (isError) {
        toast.style.background = '#ff4d4d'; toast.style.color = '#fff';
    } else {
        toast.style.background = '#C6A200'; toast.style.color = '#000';
    }
    document.body.appendChild(toast);
    setTimeout(() => {
        toast.style.opacity = '1';
        toast.style.transform = 'translateX(-50%) translateY(0)';
    }, 100);
    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateX(-50%) translateY(-10px)';
        setTimeout(() => { toast.remove(); }, 500);
    }, 3500);
}

// Funciones de Modales (Shipping, Cart, Reset)
export function openShippingModal(user) { // Modificado para aceptar 'user'
    if (user && user.user_metadata.shipping_details) {
        const details = user.user_metadata.shipping_details;
        document.getElementById('shipping-address').value = details.address || '';
        document.getElementById('shipping-city').value = details.city || '';
        document.getElementById('shipping-province').value = details.province || '';
        document.getElementById('shipping-postalcode').value = details.postalcode || '';
    }
    closeCartModal();
    const modal = document.getElementById('shippingModal');
    modal.style.display = 'flex';
    document.body.style.overflow = 'hidden';
}

export function closeShippingModal() {
    const modal = document.getElementById('shippingModal');
    if (modal) {
        modal.style.display = 'none';
        document.body.style.overflow = 'auto';
    }
}

export function openCartModal() {
    renderCartItems();
    const cartModal = document.getElementById('cartModal');
    if (cartModal) {
        cartModal.style.display = 'block';
        document.body.style.overflow = 'hidden';
    }
}

export function closeCartModal() {
    const cartModal = document.getElementById('cartModal');
    if (cartModal) {
        cartModal.style.display = 'none';
        document.body.style.overflow = 'auto';
    }
}

export function openResetPasswordModal() {
    const modal = document.getElementById('resetPasswordModal');
    if (modal) {
        modal.style.display = 'block';
        document.body.style.overflow = 'hidden';
    }
}

export function closeResetPasswordModal() {
    const modal = document.getElementById('resetPasswordModal');
    if (modal) {
        modal.style.display = 'none';
        document.body.style.overflow = 'auto';
        history.replaceState(null, '', window.location.pathname);
    }
}

// Lógica de Traducción
const translations = {
    es: {
        'brand': 'Francesco Ponte', 'nav-home': 'HOME', 'nav-about': 'SOBRE MÍ', 'nav-projects': 'PROYECTOS', 'nav-login': 'LOGIN', 'hero-main-title': 'FRANCESCO PONTE', 'hero-subtitle': 'ARTISTA REALISTA', 'about-title': 'SOBRE MÍ', 'artist-description': 'Me llamo Francesco Ponte, soy un artista autodidacta de Buenos Aires, Argentina. Mi trabajo se centra en el dibujo realista, una disciplina que descubrí como una forma de conectar con el detalle, la paciencia y la emoción detrás de cada trazo.<br>Me especializo en retratos realistas en blanco y negro realizados con grafito, principalmente de rostros de celebridades. En cada obra busco alcanzar un equilibrio entre la fidelidad a la referencia y mi propia interpretación: no intento copiar la imagen, sino darle vida a través de mi mirada y mi técnica, incorporando matices que reflejan mi esencia como artista.<br>Además de los retratos, también dibujo peces con el mismo enfoque realista, explorando las texturas, reflejos y contrastes que surgen de la naturaleza.<br>Mi objetivo es transmitir conocimiento y, al mismo tiempo, provocar una emoción en quien observa mis obras: que cada dibujo logre detener el tiempo por un instante y genere una conexión genuina.<br>Actualmente me encuentro en la búsqueda de un nuevo horizonte creativo, combinando el hiperrealismo con el surrealismo: piezas que mantienen la precisión técnica del realismo extremo, pero con contenidos imaginativos, simbólicos y conceptuales, que inviten a mirar más allá de lo evidente.', 'gallery-title': 'TRABAJA EN LÍNEA', 'add-to-cart': 'Agregar al carrito', 'modal-add-to-cart': 'AÑADIR A LA CESTA', 'footer-contact': 'CONTACTO', 'footer-social': 'REDES SOCIALES', 'modal-year': 'Año:', 'modal-technique': 'Técnica:', 'modal-technique-value': 'Grafito sobre papel 150 gr', 'modal-size': 'Tamaño:', 'modal-style': 'Estilo:', 'modal-style-value': 'Retrato Realista', 'cart-title': 'CARRITO DE COMPRA', 'cart-total': 'Total:', 'cart-checkout': 'FINALIZAR COMPRA', 'footer-form-title': 'ENVIAR UN MENSAJE', 'form-label-name': 'Nombre:', 'form-label-message': 'Mensaje:', 'form-btn-submit': 'Enviar', 'footer-privacy': 'Protección de Datos', 'footer-agb': 'Términos y Cond.', 'footer-faq': 'FAQ', 'footer-shop-info': 'Info Tienda', 'login-title': 'INICIAR SESIÓN', 'login-btn-submit': 'Ingresar', 'login-forgot-password': '¿Olvidaste tu contraseña?', 'login-register': 'Crear una cuenta', 'register-title': 'CREAR CUENTA', 'register-confirm-password': 'Confirmar Contraseña:', 'register-btn-submit': 'Registrarse', 'register-go-back': 'Ya tengo una cuenta', 'form-label-email': 'Email:', 'form-label-password': 'Contraseña:', 'reset-title': 'RESETEAR CONTRASEÑA', 'reset-btn-submit': 'Enviar enlace', 'reset-success': 'Enlace enviado. Revisa tu correo.', 'reset-error': 'Error: No se pudo enviar el enlace.', 'reset-title-new': 'Establece tu nueva contraseña', 'form-label-password-new': 'Nueva Contraseña:', 'form-label-password-confirm': 'Confirmar Contraseña:', 'reset-btn-submit-new': 'Guardar Contraseña', 'reset-password-success': '¡Contraseña actualizada con éxito!', 'reset-password-mismatch': 'Las contraseñas no coinciden.',
    },
    en: {
        'brand': 'Francesco Ponte', 'nav-home': 'HOME', 'nav-about': 'ABOUT ME', 'nav-projects': 'PROJECTS', 'nav-login': 'LOGIN', 'hero-main-title': 'FRANCESCO PONTE', 'hero-subtitle': 'REALIST ARTIST', 'about-title': 'ABOUT ME', 'artist-description': 'My name is Francesco Ponte, I am a self-taught artist from Buenos Aires, Argentina. My work focuses on realistic drawing, a discipline I discovered as a way to connect with the detail, patience, and emotion behind each stroke.<br>I specialize in realistic black and white portraits made with graphite, mainly of celebrity faces. In each piece, I seek to achieve a balance between fidelity to the reference and my own interpretation: I do not try to copy the image, but to bring it to life through my gaze and my technique, incorporating nuances that reflect my essence as an artist.<br>In addition to portraits, I also draw fish with the same realistic approach, exploring the textures, reflections, and contrasts that arise from nature.<br>My goal is to transmit knowledge and, at the same time, provoke an emotion in the viewer: that each drawing manages to stop time for an instant and generate a genuine connection.<br>I am currently in search of a new creative horizon, combining hyperrealism with surrealism: pieces that maintain the technical precision of extreme realism but with imaginative, symbolic, and conceptual content, inviting viewers to look beyond the obvious.', 'gallery-title': 'WORKS ONLINE', 'add-to-cart': 'Add to cart', 'modal-add-to-cart': 'ADD TO BASKET', 'footer-contact': 'CONTACT', 'footer-social': 'SOCIAL MEDIA', 'modal-year': 'Year:', 'modal-technique': 'Technique:', 'modal-technique-value': 'Graphite on 150 gr paper', 'modal-size': 'Size:', 'modal-style': 'Style:', 'modal-style-value': 'Realistic Portrait', 'cart-title': 'SHOPPING CART', 'cart-total': 'Total:', 'cart-checkout': 'PROCEED TO CHECKOUT', 'footer-form-title': 'SEND A MESSAGE', 'form-label-name': 'Name:', 'form-label-message': 'Message:', 'form-btn-submit': 'Send', 'footer-privacy': 'Data Protection', 'footer-agb': 'Terms & Cond.', 'footer-faq': 'FAQ', 'footer-shop-info': 'Shop Info', 'login-title': 'LOGIN', 'login-btn-submit': 'Sign In', 'login-forgot-password': 'Forgot your password?', 'login-register': 'Create an account', 'register-title': 'CREATE ACCOUNT', 'register-confirm-password': 'Confirm Password:', 'register-btn-submit': 'Register', 'register-go-back': 'I already have an account', 'form-label-email': 'Email:', 'form-label-password': 'Password:', 'reset-title': 'RESET PASSWORD', 'reset-btn-submit': 'Send reset link', 'reset-success': 'Link sent. Check your email.', 'reset-error': 'Error: Could not send link.', 'reset-title-new': 'Set your new password', 'form-label-password-new': 'New Password:', 'form-label-password-confirm': 'Confirm Password:', 'reset-btn-submit-new': 'Save Password', 'reset-password-success': 'Password updated successfully!', 'reset-password-mismatch': 'Passwords do not match.',
    }
};

export function getTranslation(key) {
    return translations[state.currentLanguage][key] || key;
}

function switchLanguage(lang) {
    state.setCurrentLanguage(lang);
    document.querySelectorAll('.lang-btn').forEach(btn => {
        btn.classList.toggle('active', btn.getAttribute('data-lang') === lang);
    });
    document.querySelectorAll('[data-translate]').forEach(el => {
        const key = el.getAttribute('data-translate');
        if (translations[lang] && translations[lang][key]) {
            el.innerHTML = translations[lang][key];
        }
    });

    const artworkTitles = document.querySelectorAll('.artwork-card .artwork-title');
    artworkTitles.forEach(titleEl => {
        const card = titleEl.closest('.artwork-card');
        const artworkId = card.getAttribute('data-artwork');
        const currentArtworks = artworksData();
        if (currentArtworks[artworkId]) {
            titleEl.textContent = currentArtworks[artworkId].title[lang] || currentArtworks[artworkId].title['es'];
        }
    });

    updateModalContent();
    renderCartItems();
}

export function initLanguageSwitcher() {
    document.querySelectorAll('.lang-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const lang = btn.getAttribute('data-lang');
            if (lang !== state.currentLanguage) switchLanguage(lang);
        });
    });
    // Aplica el idioma inicial
    switchLanguage(state.currentLanguage);
}

// Lógica de Modales de Obras
function updateModalContent() {
    if (!state.currentOpenModalId) return;
    const currentArtworks = artworksData();
    const artwork = currentArtworks[state.currentOpenModalId];
    if (!artwork) return;

    const title = artwork.title[state.currentLanguage] || artwork.title['es'];
    document.getElementById('modalTitle').textContent = title;
    document.getElementById('modalPrice').textContent = artwork.price;
    document.getElementById('modalYear').textContent = artwork.year;
    document.getElementById('modalTechnique').textContent = artwork.technique[state.currentLanguage] || artwork.technique['es'];
    document.getElementById('modalSize').textContent = artwork.size[state.currentLanguage] || artwork.size['es'];
    document.getElementById('modalStyle').textContent = artwork.style[state.currentLanguage] || artwork.style['es'];
    
    const modalImage = document.getElementById('modalImage');
    modalImage.src = artwork.image.includes('http') ? artwork.image : `images/${artwork.image}`;
    modalImage.alt = title;
}

function openModal(artworkId) {
    const modal = document.getElementById('artworkModal');
    if (!modal) return;
    state.setCurrentOpenModalId(artworkId);
    updateModalContent();
    modal.style.display = 'block';
    document.body.style.overflow = 'hidden';
}

function closeModal() {
    const modal = document.getElementById('artworkModal');
    if (modal) {
        modal.style.display = 'none';
        document.body.style.overflow = 'auto';
    }
    state.setCurrentOpenModalId(null);
}

export function initModal(onAddToCart) {
    const galleryGrid = document.querySelector('.gallery-grid');
    const modal = document.getElementById('artworkModal');
    const closeBtn = document.querySelector('.modal-close');
    const modalAddToCartBtn = document.querySelector('.modal-add-to-cart');

    if (modal && closeBtn && galleryGrid) {
        galleryGrid.addEventListener('click', (e) => {
            const card = e.target.closest('.artwork-card');
            if (!card || e.target.classList.contains('add-to-cart-btn')) {
                return;
            }
            const artworkId = card.getAttribute('data-artwork');
            openModal(artworkId);
        });

        closeBtn.addEventListener('click', closeModal);
        modal.addEventListener('click', (e) => { if (e.target === modal) closeModal(); });
        document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeModal(); });
    }
    
    if (modalAddToCartBtn) {
        modalAddToCartBtn.addEventListener('click', () => {
            onAddToCart(state.currentOpenModalId);
            closeModal();
        });
    }
}

// Otros Inits de UI
export function initSmoothScrolling() {
    document.querySelectorAll('a[href]').forEach(link => {
        link.addEventListener('click', (e) => {
            const href = link.getAttribute('href');
            if (!href) return;
            if (href.startsWith('mailto:') || href.startsWith('tel:') || href.startsWith('http')) {
                return;
            }
            if (href.startsWith('#')) {
                e.preventDefault();
                const target = document.querySelector(href);
                if (target) {
                    window.scrollTo({ top: target.offsetTop - 80, behavior: 'smooth' });
                }
            }
        });
    });
}

export function initNavbarScroll() {
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

export function initPasswordToggles() {
    document.querySelectorAll('.toggle-password').forEach(toggle => {
        if (toggle.dataset.listenerAttached) return;
        toggle.addEventListener('click', () => {
            const passwordField = toggle.previousElementSibling;
            if (passwordField && passwordField.tagName === 'INPUT') {
                const type = passwordField.getAttribute('type') === 'password' ? 'text' : 'password';
                passwordField.setAttribute('type', type);
                toggle.classList.toggle('fa-eye');
                toggle.classList.toggle('fa-eye-slash');
            }
        });
        toggle.dataset.listenerAttached = 'true';
    });
}