// js/cart.js
import * as state from './state.js';
import { artworksData } from './api.js';
import { openCartModal, closeCartModal } from './ui.js'; // ✅ Import añadido

function saveCart() {
    localStorage.setItem('francescoCart', JSON.stringify(state.cartItems));
}

export function loadCart() {
    const storedCart = localStorage.getItem('francescoCart');
    if (storedCart) {
        state.setCartItems(JSON.parse(storedCart));
        state.setCartCount(state.cartItems.length);
    } else {
        state.setCartItems([]);
        state.setCartCount(0);
    }
}

export function addToCart(artworkId) {
    const currentArtworks = artworksData();
    const artwork = currentArtworks[artworkId];
    if (!artwork) return;
    
    state.cartItems.push(artwork);
    state.setCartCount(state.cartCount + 1);
    
    const cartCounter = document.getElementById('cartCounter');
    cartCounter.textContent = state.cartCount;
    cartCounter.classList.add('show', 'animate');
    setTimeout(() => cartCounter.classList.remove('animate'), 600);
    
    renderCartItems();
    saveCart();
}

function removeFromCart(index) {
    state.cartItems.splice(index, 1);
    state.setCartCount(state.cartCount - 1);
    document.getElementById('cartCounter').textContent = state.cartCount;
    renderCartItems();
    saveCart();
}

function clearCart() {
    state.setCartItems([]);
    state.setCartCount(0);
    document.getElementById('cartCounter').textContent = '0';
    renderCartItems();
    saveCart();
}

export function renderCartItems() {
    const cartItemsContainer = document.getElementById('cartItems');
    const cartTotal = document.getElementById('cartTotal');
    const clearBtn = document.getElementById('clearCartBtn');

    if (!cartItemsContainer || !cartTotal || !clearBtn) return;

    cartItemsContainer.innerHTML = '';
    let total = 0;

    if (state.cartItems.length === 0) {
        cartItemsContainer.innerHTML = '<p style="text-align:center;">Tu carrito está vacío.</p>';
        clearBtn.style.display = 'none';
    } else {
        state.cartItems.forEach((item, index) => {
            const imgSrc = item.image.includes('http') ? item.image : `images/${item.image}`;
            const title = item.title[state.currentLanguage] || item.title['es'];

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
                <button class="remove-item" data-index="${index}"><i class="fa-solid fa-trash"></i></button>
            `;
            cartItemsContainer.appendChild(cartItem);
            total += item.raw_price;
        });
        clearBtn.style.display = 'block';
    }

    cartTotal.textContent = '$' + total.toLocaleString('es-AR', { minimumFractionDigits: 0 }) + ' ARS';

    document.querySelectorAll('.remove-item').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const index = e.currentTarget.getAttribute('data-index');
            removeFromCart(index);
        });
    });
}

export function mapCartToPreferenceItems() {
    const aggregatedCart = state.cartItems.reduce((acc, item) => {
        if (!acc[item.id]) {
            acc[item.id] = { id: item.id, quantity: 0 };
        }
        acc[item.id].quantity += 1;
        return acc;
    }, {});
    return Object.values(aggregatedCart).map(item => ({
        id: item.id,
        quantity: item.quantity
    }));
}

export function initCartFunctionality(onCheckout) {
    // Listener para botones de "Agregar al carrito" en las tarjetas
    const galleryGrid = document.querySelector('.gallery-grid');
    if (galleryGrid) {
        galleryGrid.addEventListener('click', (e) => {
            if (e.target.classList.contains('add-to-cart-btn')) {
                e.stopPropagation();
                const card = e.target.closest('.artwork-card');
                const artworkId = card.getAttribute('data-artwork');
                addToCart(artworkId);
            }
        });
    }

    // Listener para modal del carrito
    const cartIcon = document.querySelector('.cart-container a');
    const closeCartBtn = document.getElementById('closeCart');
    const cartModal = document.getElementById('cartModal');
    const clearCartBtn = document.getElementById('clearCartBtn');
    const checkoutBtn = document.getElementById('checkoutBtn');

    if (cartIcon) cartIcon.addEventListener('click', (e) => { e.preventDefault(); openCartModal(); });
    if (closeCartBtn) closeCartBtn.addEventListener('click', closeCartModal);
    if (cartModal) cartModal.addEventListener('click', (e) => { if (e.target === cartModal) closeCartModal(); });
    if (clearCartBtn) clearCartBtn.addEventListener('click', clearCart);
    if (checkoutBtn) checkoutBtn.addEventListener('click', (e) => { e.preventDefault(); onCheckout(); });
}
