const USUARIOS = [
    { username: 'admin', password: 'admin123', nombre: 'Administrador', rol: 'admin' },
    { username: 'vendedor1', password: 'vend123', nombre: 'Vendedor 1', rol: 'vendedor' },
    { username: 'vendedor2', password: 'vend123', nombre: 'Vendedor 2', rol: 'vendedor' }
];

function inicializarPantallaCarga() {
    setTimeout(() => {
        document.getElementById('loading-screen')?.classList.add('hidden');
        document.getElementById('login-container')?.classList.remove('hidden');
    }, 1500);
}

function verificarSesionActiva() {
    if (localStorage.getItem('bocettos_usuario')) {
        window.location.href = 'src/formulario-ventas.html';
    }
}

function manejarLogin(e) {
    e.preventDefault();
    
    const username = document.getElementById('username').value.trim();
    const password = document.getElementById('password').value;
    const loginBtn = document.getElementById('login-btn');
    const btnText = document.getElementById('btn-text');
    const btnLoading = document.getElementById('btn-loading');

    if (!username || !password) {
        mostrarError('Por favor complete todos los campos');
        return;
    }

    loginBtn.disabled = true;
    btnText.classList.add('hidden');
    btnLoading.classList.remove('hidden');

    setTimeout(() => {
        const usuario = USUARIOS.find(u => u.username === username && u.password === password);
        
        if (usuario) {
            localStorage.setItem('bocettos_usuario', JSON.stringify({
                username: usuario.username,
                nombre: usuario.nombre,
                rol: usuario.rol,
                loginTime: new Date().toISOString()
            }));
            
            mostrarExito('¡Bienvenido ' + usuario.nombre + '!');
            setTimeout(() => window.location.href = 'src/formulario-ventas.html', 1500);
        } else {
            mostrarError('Usuario o contraseña incorrectos');
            loginBtn.disabled = false;
            btnText.classList.remove('hidden');
            btnLoading.classList.add('hidden');
        }
    }, 1000);
}

function mostrarError(mensaje) {
    const errorMsg = document.getElementById('error-message');
    const errorText = document.getElementById('error-text');
    
    if (errorMsg && errorText) {
        errorText.textContent = mensaje;
        errorMsg.classList.remove('hidden');
        setTimeout(() => errorMsg.classList.add('hidden'), 4000);
    }
}

function mostrarExito(mensaje) {
    const successMsg = document.getElementById('success-message');
    const successText = document.getElementById('success-text');
    
    if (successMsg && successText) {
        successText.textContent = mensaje;
        successMsg.classList.remove('hidden');
        setTimeout(() => successMsg.classList.add('hidden'), 3000);
    }
}

document.addEventListener('DOMContentLoaded', function() {
    inicializarPantallaCarga();
    verificarSesionActiva();
    document.getElementById('login-form')?.addEventListener('submit', manejarLogin);
});