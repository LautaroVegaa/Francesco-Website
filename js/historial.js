// js/historial.js
import { _supabase } from './supabaseClient.js';

// Esta lógica ahora se inicia por onAuthStateChange,
// no por DOMContentLoaded, eliminando el setTimeout.
_supabase.auth.onAuthStateChange((event, session) => {
    if (session) {
        // Usuario logueado, buscar pedidos
        fetchHistorial(session.user.id);
    } else {
        // Usuario no logueado, redirigir
        window.location.href = 'login.html';
    }
});

async function fetchHistorial(userId) {
    const container = document.getElementById('historial-container');

    // ✅ Mensaje de carga añadido
    container.innerHTML = '<p class="loading-historial">Cargando tus pedidos...</p>';
    
    try {
        const { data: pedidos, error } = await _supabase
            .from('pedidos')
            .select('*')
            .eq('user_id', userId)
            .order('created_at', { ascending: false });

        if (error) throw error;

        if (pedidos.length === 0) {
            container.innerHTML = '<p class="empty-historial">Aún no tienes pedidos registrados.</p>';
            return;
        }

        renderHistorial(pedidos);

    } catch (error) {
        console.error('Error al cargar el historial:', error.message);
        container.innerHTML = '<p class="empty-historial">Error al cargar tu historial. Intenta de nuevo.</p>';
    }
}

function renderHistorial(pedidos) {
    const container = document.getElementById('historial-container');
    container.innerHTML = ''; // Limpiamos el "Cargando..."

    pedidos.forEach(pedido => {
        const pedidoCard = document.createElement('div');
        pedidoCard.classList.add('pedido-card');

        const fecha = new Date(pedido.created_at).toLocaleDateString('es-ES', {
            day: 'numeric', month: 'long', year: 'numeric'
        });

        const total = (pedido.total_amount / 100).toLocaleString('es-AR', {
            style: 'currency', currency: 'ARS'
        });

        let itemsHtml = '<ul>';
        if (pedido.items && pedido.items.length > 0) {
            pedido.items.forEach(item => {
                itemsHtml += `<li>${item.title} (x${item.quantity})</li>`;
            });
        } else {
            itemsHtml += '<li>Detalle no disponible</li>';
        }
        itemsHtml += '</ul>';

        pedidoCard.innerHTML = `
            <div class="pedido-header">
                <span class="pedido-fecha">${fecha}</span>
                <span class="pedido-status ${pedido.payment_status}">${pedido.payment_status}</span>
            </div>
            <div class="pedido-body">
                <div class="pedido-items">
                    <h4>Items:</h4>
                    ${itemsHtml}
                </div>
                <div class="pedido-total">
                    <h4>Total:</h4>
                    <p>${total}</p>
                </div>
            </div>
            <div class="pedido-footer">
                ID de Pago: ${pedido.mp_payment_id}
            </div>
        `;
        container.appendChild(pedidoCard);
    });
}
