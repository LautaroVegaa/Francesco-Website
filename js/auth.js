// js/auth.js
import { _supabase } from './supabaseClient.js';
import { showToastMessage, getTranslation, openResetPasswordModal, closeResetPasswordModal } from './ui.js';

export function initAuthFormListeners() {
    const loginFormEl = document.querySelector('#login-form .login-form');
    const registerFormEl = document.querySelector('#register-form .login-form');
    const resetFormEl = document.querySelector('#reset-form .login-form');
    const newPasswordForm = document.getElementById('new-password-form');

    if (loginFormEl) {
        loginFormEl.addEventListener('submit', async (e) => {
            e.preventDefault();
            const email = document.getElementById('login-email').value;
            const password = document.getElementById('login-password').value;
            const { data, error } = await _supabase.auth.signInWithPassword({ email, password });

            if (error) {
                showToastMessage('❌ ' + error.message, true);
            } else {
                // ✅ Verificación adicional de seguridad
                if (!data?.user) {
                    showToastMessage('Error inesperado al iniciar sesión.', true);
                    return;
                }

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
            messageEl.textContent = '';

            const { error } = await _supabase.auth.signUp({
                email, password,
                options: {
                    data: { full_name: name },
                    emailRedirectTo: `${window.location.origin}/index.html`
                }
            });

            if (error) {
                messageEl.style.color = 'red';
                messageEl.textContent = 'Error al registrarse: ' + error.message;
            } else {
                messageEl.style.color = '#C6A200';
                messageEl.textContent = 'Cuenta creada con éxito. Verifica tu correo para confirmar tu cuenta.';
                registerFormEl.reset();
            }
        });
    }

    if (resetFormEl) {
        resetFormEl.addEventListener('submit', async (e) => {
            e.preventDefault();
            const email = document.getElementById('reset-email').value;
            const messageEl = document.getElementById('reset-message');
            messageEl.textContent = '';

            const { error } = await _supabase.auth.resetPasswordForEmail(email, {
                redirectTo: `${window.location.origin}/index.html`,
            });

            if (error) {
                messageEl.style.color = 'red';
                messageEl.textContent = getTranslation('reset-error');
            } else {
                messageEl.style.color = '#C6A200';
                messageEl.textContent = getTranslation('reset-success');
            }
        });
    }

    if (newPasswordForm) {
        newPasswordForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const newPassword = document.getElementById('new-password').value;
            const confirmPassword = document.getElementById('confirm-password').value;
            const messageEl = document.getElementById('new-password-message');

            if (newPassword !== confirmPassword) {
                messageEl.style.color = 'red';
                messageEl.textContent = getTranslation('reset-password-mismatch');
                return;
            }

            const { error } = await _supabase.auth.updateUser({ password: newPassword });

            if (error) {
                messageEl.style.color = 'red';
                messageEl.textContent = error.message;
            } else {
                messageEl.style.color = '#C6A200';
                messageEl.textContent = getTranslation('reset-password-success');
                setTimeout(closeResetPasswordModal, 2000);
            }
        });
    }
}

export function handleUserSession() {
    const navLoginLink = document.getElementById('navLoginLink');
    const userMenuContainer = document.getElementById('userMenuContainer');
    const userNameLink = document.getElementById('userNameLink');
    const logoutButton = document.getElementById('logoutButton');
    const userMenuDropdown = document.getElementById('userMenuDropdown');

    if (!navLoginLink || !userMenuContainer || !userNameLink || !logoutButton) return;

    _supabase.auth.onAuthStateChange((event, session) => {
        if (session) {
            navLoginLink.style.display = 'none';
            userMenuContainer.style.display = 'block';
            const userName = session.user.user_metadata.full_name || session.user.email.split('@')[0];
            userNameLink.textContent = userName.toUpperCase();
        } else {
            navLoginLink.style.display = 'block';
            userMenuContainer.style.display = 'none';
        }
    });

    userNameLink.addEventListener('click', (e) => {
        e.preventDefault();
        userMenuDropdown.classList.toggle('show');
    });

    logoutButton.addEventListener('click', async (e) => {
        e.preventDefault();
        userMenuDropdown.classList.remove('show');

        // ✅ try/catch agregado para mayor robustez
        try {
            await _supabase.auth.signOut();
        } catch (error) {
            console.warn('Error al cerrar sesión (ignorado en localhost):', error.message);
        }

        // Forzamos la limpieza en localhost
        localStorage.removeItem('sb-umnahyousgddxyfwopsq-auth-token');
        sessionStorage.clear();
        window.location.href = 'login.html';
    });

    document.addEventListener('click', (e) => {
        if (!userMenuContainer.contains(e.target) && userMenuDropdown.classList.contains('show')) {
            userMenuDropdown.classList.remove('show');
        }
    });
}

// Manejadores de eventos de autenticación al cargar la página
export function handleAuthEvents() {
    // 1. Mensaje de bienvenida
    const userName = localStorage.getItem('welcomeUser');
    if (userName) {
        showToastMessage(`✅ ¡Bienvenido ${userName}!`);
        localStorage.removeItem('welcomeUser');
    }

    // 2. Verificación de email o reseteo de contraseña
    const hash = window.location.hash;
    const urlParams = new URLSearchParams(hash.replace('#', '?'));
    if (urlParams.has('access_token')) {
        const type = urlParams.get('type');
        if (type === 'recovery') {
            openResetPasswordModal();
        } else if (type === 'signup' || type === null) {
            _supabase.auth.getUser().then(({ data: { user }, error }) => {
                if (!error && user) {
                    const fullName = user.user_metadata?.full_name || user.email.split('@')[0];
                    showToastMessage(`✅ Cuenta verificada, ¡bienvenido ${fullName}!`);
                    setTimeout(() => {
                        history.replaceState(null, '', window.location.pathname);
                    }, 500);
                }
            });
        }
    }
}
