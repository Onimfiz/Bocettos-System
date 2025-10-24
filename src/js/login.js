// ===== CONFIGURACIÓN DE LOGIN =====

// Usuarios predefinidos
const USUARIOS = [
    { username: 'admin', password: 'admin123', nombre: 'Administrador', rol: 'admin' },
    { username: 'vendedor1', password: 'vend123', nombre: 'Vendedor 1', rol: 'vendedor' },
    { username: 'vendedor2', password: 'vend123', nombre: 'Vendedor 2', rol: 'vendedor' }
];

// ===== FUNCIONES DE INICIALIZACIÓN =====

// Simular carga inicial
function inicializarPantallaCarga() {
    setTimeout(() => {
        const loadingScreen = document.getElementById('loading-screen');
        const loginContainer = document.getElementById('login-container');
        
        if (loadingScreen) {
            loadingScreen.classList.add('hidden');
        }
        if (loginContainer) {
            loginContainer.classList.remove('hidden');
        }
    }, 1500);
}

// Verificar si ya hay una sesión activa
function verificarSesionActiva() {
    const sesionActiva = localStorage.getItem('bocettos_usuario');
    if (sesionActiva) {
        // Si ya está logueado, redirigir al formulario de ventas
        window.location.href = 'src/formulario-ventas.html';
    }
}

// ===== FUNCIONES DE LOGIN =====

// Manejar envío del formulario
function manejarLogin(e) {
    e.preventDefault();
    
    const usernameField = document.getElementById('username');
    const passwordField = document.getElementById('password');
    const loginBtn = document.getElementById('login-btn');
    const btnText = document.getElementById('btn-text');
    const btnLoading = document.getElementById('btn-loading');

    // Validar que existan los elementos necesarios
    if (!usernameField || !passwordField || !loginBtn || !btnText || !btnLoading) {
        console.error('Elementos del formulario no encontrados');
        return;
    }

    const username = usernameField.value.trim();
    const password = passwordField.value;

    // Validación básica
    if (!username || !password) {
        mostrarError('Por favor complete todos los campos');
        return;
    }

    // Mostrar estado de carga
    loginBtn.disabled = true;
    btnText.classList.add('hidden');
    btnLoading.classList.remove('hidden');

    // Simular validación (en una app real esto sería una llamada al servidor)
    setTimeout(() => {
        const usuario = USUARIOS.find(u => u.username === username && u.password === password);
        
        if (usuario) {
            // Guardar sesión en localStorage
            localStorage.setItem('bocettos_usuario', JSON.stringify({
                username: usuario.username,
                nombre: usuario.nombre,
                rol: usuario.rol,
                loginTime: new Date().toISOString()
            }));
            
            mostrarExito('¡Bienvenido ' + usuario.nombre + '!');
            
            // Redireccionar al formulario de ventas
            setTimeout(() => {
                window.location.href = 'src/formulario-ventas.html';
            }, 1500);
            
        } else {
            mostrarError('Usuario o contraseña incorrectos');
            
            // Restaurar botón
            loginBtn.disabled = false;
            btnText.classList.remove('hidden');
            btnLoading.classList.add('hidden');
        }
    }, 1000);
}

// ===== FUNCIONES DE NOTIFICACIONES =====

// Función para mostrar errores
function mostrarError(mensaje) {
    const errorMsg = document.getElementById('error-message');
    const errorText = document.getElementById('error-text');
    
    if (errorMsg && errorText) {
        errorText.textContent = mensaje;
        errorMsg.classList.remove('hidden');
        
        setTimeout(() => {
            errorMsg.classList.add('hidden');
        }, 4000);
    }
}

// Función para mostrar éxito
function mostrarExito(mensaje) {
    const successMsg = document.getElementById('success-message');
    const successText = document.getElementById('success-text');
    
    if (successMsg && successText) {
        successText.textContent = mensaje;
        successMsg.classList.remove('hidden');
        
        setTimeout(() => {
            successMsg.classList.add('hidden');
        }, 3000);
    }
}

// ===== INICIALIZACIÓN AL CARGAR LA PÁGINA =====

document.addEventListener('DOMContentLoaded', function() {
    // Inicializar pantalla de carga
    inicializarPantallaCarga();
    
    // Verificar sesión activa
    verificarSesionActiva();
    
    // Configurar event listener para el formulario
    const loginForm = document.getElementById('login-form');
    if (loginForm) {
        loginForm.addEventListener('submit', manejarLogin);
    } else {
        console.error('Formulario de login no encontrado');
    }
});