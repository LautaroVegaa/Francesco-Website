// js/state.js
export let cartCount = 0;
export let currentLanguage = 'es';
export let currentOpenModalId = null;
export let cartItems = [];
export let artworksData = {};

// Funciones para modificar el estado de forma segura
export function setCartCount(count) {
    cartCount = count;
}
export function setCurrentLanguage(lang) {
    currentLanguage = lang;
}
export function setCurrentOpenModalId(id) {
    currentOpenModalId = id;
}
export function setCartItems(items) {
    cartItems = items;
}
export function setArtworksData(data) {
    artworksData = data;
}