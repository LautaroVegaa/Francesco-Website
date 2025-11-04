// js/api.js
import { _supabase } from './supabaseClient.js';
import * as state from './state.js';
import { showToastMessage } from './ui.js';

// Hacemos que artworksData sea una función que devuelve el estado
export const artworksData = () => state.artworksData;

export async function loadProducts() {
    const galleryGrid = document.querySelector('.gallery-grid');
    if (!galleryGrid) {
        console.log('No se encontró .gallery-grid, saltando carga de productos.');
        return; 
    }

    const { data, error } = await _supabase
        .from('productos')
        .select('*')
        .order('id', { ascending: true });

    if (error) {
        console.error('Error al cargar productos:', error);
        galleryGrid.innerHTML = '<p style="color: red; text-align: center;">Error al cargar los productos.</p>';
        return;
    }

    // Procesamos y guardamos los datos en el estado global
    const processedData = data.reduce((acc, product) => {
        acc[product.id] = {
            id: product.id,
            title: { es: product.title_es, en: product.title_en },
            price: product.price 
                ? `$${product.price.toLocaleString('es-AR')} ARS`
                : 'Precio no disponible',
            image: product.image_url,
            year: product.year,
            technique: { es: product.technique_es, en: product.technique_en },
            size: { es: product.size_es, en: product.size_en },
            style: { es: product.style_es, en: product.style_en },
            raw_price: product.price || 0
        };
        return acc;
    }, {});
    
    state.setArtworksData(processedData);
    
    // Renderizamos el HTML
    renderProductCards(data, galleryGrid);
    console.log('Productos cargados y renderizados desde Supabase.');
}

function renderProductCards(products, galleryGrid) {
    galleryGrid.innerHTML = '';
    for (const product of products) {
        const card = document.createElement('div');
        card.className = 'artwork-card';
        card.setAttribute('data-artwork', product.id);

        const priceString = product.price 
            ? `$${product.price.toLocaleString('es-AR')} ARS`
            : 'Precio no disponible';
        const title = product.title_es; // Default a español
        const imageUrl = product.image_url.includes('http') ? product.image_url : `images/${product.image_url}`;

        card.innerHTML = `
            <div class="artwork-image">
                <img src="${imageUrl}" alt="${title}">
            </div>
            <div class="artwork-info">
                <h3 class="artist-name">Francesco Ponte</h3>
                <p class="artwork-title">${title}</p>
                <p class="artwork-price">${priceString}</p>
                <button class="add-to-cart-btn" data-translate="add-to-cart">Agregar al carrito</button>
            </div>
        `;
        galleryGrid.appendChild(card);
    }
}

export async function procesarPago(items, shippingData) {
    try {
        if (!items.length) {
            showToastMessage("Tu carrito está vacío.", true);
            return;
        }

        const { data: { session }, error: sessionError } = await _supabase.auth.getSession();
        if (sessionError) {
            console.error('Error al obtener la sesión:', sessionError);
            showToastMessage('Error de autenticación. Por favor, inicia sesión de nuevo.', true);
            return;
        }

        // 🔒 Validación adicional de sesión
        if (!session || !session.access_token) {
            console.error('No hay sesión activa o el token expiró.');
            showToastMessage('Tu sesión ha expirado. Por favor, vuelve a iniciar sesión.', true);
            return;
        }

        const res = await fetch(
            "https://umnahyousgddxyfwopsq.supabase.co/functions/v1/create_preference",
            {
                method: "POST",
                headers: { 
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${session.access_token}`,
                    "apikey": _supabase.auth.anonKey 
                },
                body: JSON.stringify({ items, shipping_details: shippingData }),
            }
        );

        const data = await res.json();
        if (!data.init_point) {
            console.error("Error al crear preferencia:", data);
            showToastMessage(data.error || "No se pudo iniciar el pago. Intenta nuevamente.", true);
            return;
        }

        window.location.href = data.init_point;
    } catch (err) {
        console.error("Error al procesar pago:", err);
        showToastMessage("Ocurrió un error al procesar el pago.", true);
    }
}
