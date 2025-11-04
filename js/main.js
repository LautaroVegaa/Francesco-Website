// js/main.js
import { _supabase } from './supabaseClient.js';
import * as state from './state.js';
import { loadProducts, procesarPago, artworksData } from './api.js';
import { loadCart, initCartFunctionality, mapCartToPreferenceItems, addToCart } from './cart.js';
import { initAuthFormListeners, handleUserSession, handleAuthEvents } from './auth.js';
import { 
    initLanguageSwitcher, 
    initModal, 
    initSmoothScrolling, 
    initNavbarScroll, 
    initPasswordToggles,
    openShippingModal,
    closeShippingModal,
    showToastMessage,
} from './ui.js';

// Este es el nuevo "DOMContentLoaded"
document.addEventListener('DOMContentLoaded', async () => {

   // 🔹 Aplicar idioma guardado antes de cualquier carga
    const savedLang = localStorage.getItem('lang');
    if (savedLang) {
        state.setCurrentLanguage(savedLang);
   }

    // 1. Cargar estado inicial (carrito)
    loadCart();
    
    // 2. Cargar datos de la API (productos)
    await loadProducts();
    
    // 3. Inicializar todos los módulos de UI
    initLanguageSwitcher();
    initModal(artworkId => addToCart(artworkId)); // Pasa la función addToCart al modal
    initSmoothScrolling();
    initNavbarScroll();
    initPasswordToggles();
    
    // 4. Inicializar autenticación
    initAuthFormListeners();
    handleUserSession();
    handleAuthEvents(); // Maneja bienvenida y reseteo de pass
    
    // 5. Inicializar lógica del carrito
    initCartFunctionality(async () => {
        // Esta es la función onCheckout
        const { data: { user } } = await _supabase.auth.getUser();
        openShippingModal(user);
    });

    // 6. Conectar formulario de envío
    const shippingForm = document.getElementById('shipping-form');
    if (shippingForm) {
        shippingForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const shippingData = {
                address: document.getElementById('shipping-address').value,
                city: document.getElementById('shipping-city').value,
                province: document.getElementById('shipping-province').value,
                postalcode: document.getElementById('shipping-postalcode').value,
            };

            const { error: updateError } = await _supabase.auth.updateUser({
                data: { shipping_details: shippingData }
            });

            if (updateError) {
                console.error("Error al guardar dirección (probablemente no logueado):", updateError.message);
                showToastMessage('❌ Por favor, inicia sesión antes de continuar con la compra.', true);
                closeShippingModal();
                return;
            }
            
            closeShippingModal();
            const itemsToPay = mapCartToPreferenceItems();
            procesarPago(itemsToPay, shippingData);
        });
    }
    
    // 7. Lógica simple (botones de cerrar modal de envío)
    const closeShippingBtn = document.getElementById('closeShippingModal');
    const shippingModal = document.getElementById('shippingModal');
    if(closeShippingBtn) closeShippingBtn.addEventListener('click', closeShippingModal);
    if(shippingModal) shippingModal.addEventListener('click', (e) => { if(e.target === shippingModal) closeShippingModal(); });

    // 8. Actualizar contador de carrito inicial
    const cartCounter = document.getElementById('cartCounter');
    cartCounter.textContent = state.cartCount;
    if (state.cartCount > 0) {
        cartCounter.classList.add('show');
    }
});
