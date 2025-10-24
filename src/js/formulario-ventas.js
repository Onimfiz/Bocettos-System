// Estado de la aplicación
let productos = [];
let total = 0;
let contadorProductos = 0;

// Inicialización
window.addEventListener('load', function() {
    verificarAutenticacion();
    inicializarFormulario();
    agregarPrimerProducto();
});

function verificarAutenticacion() {
    const usuario = localStorage.getItem('bocettos_usuario');
    if (!usuario) {
        window.location.href = '../login.html';
        return;
    }
    
    const userData = JSON.parse(usuario);
    document.getElementById('vendedor').value = userData.nombre;
}

function inicializarFormulario() {
    // Establecer fecha actual en zona horaria local
    const hoy = new Date();
    const año = hoy.getFullYear();
    const mes = String(hoy.getMonth() + 1).padStart(2, '0');
    const dia = String(hoy.getDate()).padStart(2, '0');
    const fechaLocal = `${año}-${mes}-${dia}`;
    
    document.getElementById('fecha-venta').value = fechaLocal;

    // Configurar event listeners con validación
    const logoutBtn = document.getElementById('logout-btn');
    const dashboardBtn = document.getElementById('dashboard-btn');
    const limpiarBtn = document.getElementById('limpiar-btn');
    const guardarBtn = document.getElementById('guardar-btn');
    const agregarBtn = document.getElementById('agregar-producto-btn');
    
    if (logoutBtn) logoutBtn.addEventListener('click', logout);
    if (dashboardBtn) dashboardBtn.addEventListener('click', irADashboard);
    if (limpiarBtn) limpiarBtn.addEventListener('click', limpiarFormulario);
    if (guardarBtn) guardarBtn.addEventListener('click', guardarVenta);
    if (agregarBtn) agregarBtn.addEventListener('click', agregarProducto);
}

// Gestión de productos
function agregarPrimerProducto() {
    agregarProducto();
}

function agregarProducto() {
    contadorProductos++;
    const productoId = `producto-${contadorProductos}`;
    
    // Determinar si mostrar el botón de eliminar (solo a partir del segundo producto)
    const mostrarBotonEliminar = contadorProductos > 1;
    const botonEliminarHTML = mostrarBotonEliminar ? `
        <div>
            <button 
                type="button"
                onclick="eliminarProducto('${productoId}')"
                class="w-full btn-eliminar text-white px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 flex items-center justify-center space-x-1"
            >
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                </svg>
                <span>Eliminar</span>
            </button>
        </div>
    ` : `
        <div>
            <!-- Espacio reservado para mantener la alineación del grid -->
        </div>
    `;
    
    const productoHTML = `
        <div id="${productoId}" class="grid grid-cols-1 md:grid-cols-7 gap-4 items-end p-4 bg-gray-50 rounded-lg border border-gray-200">
            <div class="md:col-span-2">
                <label class="block text-sm font-medium text-gray-700 mb-1">Producto *</label>
                <input 
                    type="text" 
                    name="producto-nombre"
                    required
                    placeholder="Nombre del producto"
                    class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-1 focus:ring-bocettos-primary focus:border-bocettos-primary text-sm"
                >
            </div>
            <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Cantidad *</label>
                <input 
                    type="number" 
                    name="producto-cantidad"
                    min="1"
                    value="1"
                    required
                    onchange="calcularSubtotal('${productoId}')"
                    class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-1 focus:ring-bocettos-primary focus:border-bocettos-primary text-sm"
                >
            </div>
            <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Precio Unit. *</label>
                <input 
                    type="number" 
                    name="producto-precio"
                    min="0"
                    step="0.01"
                    required
                    placeholder="0.00"
                    onchange="calcularSubtotal('${productoId}')"
                    class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-1 focus:ring-bocettos-primary focus:border-bocettos-primary text-sm"
                >
            </div>
            <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Método Pago *</label>
                <select 
                    name="producto-metodo-pago"
                    required
                    class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-1 focus:ring-bocettos-primary focus:border-bocettos-primary text-sm placeholder:text-gray-400"
                >
                    <option value="" disabled selected style="color: #9CA3AF; opacity: 0.7;">Seleccionar</option>
                    <option value="efectivo" class="text-gray-800">💵 Efectivo</option>
                    <option value="tarjeta-credito" class="text-gray-800">💳 T. Crédito</option>
                    <option value="tarjeta-debito" class="text-gray-800">💳 T. Débito</option>
                    <option value="yape" class="text-gray-800">📱 Yape</option>
                    <option value="plin" class="text-gray-800">📲 Plin</option>
                    <option value="transferencia" class="text-gray-800">🏦 Transferencia</option>
                </select>
            </div>
            <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Subtotal</label>
                <input 
                    type="text" 
                    name="producto-subtotal"
                    readonly
                    value="$0.00"
                    class="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100 text-gray-600 text-sm font-medium"
                >
            </div>
            ${botonEliminarHTML}
        </div>
    `;
    
    document.getElementById('productos-container').insertAdjacentHTML('beforeend', productoHTML);
    calcularTotal();
}

function eliminarProducto(productoId) {
    document.getElementById(productoId).remove();
    actualizarBotonesEliminar();
    calcularTotal();
}

// Función para actualizar la visibilidad de los botones de eliminar
function actualizarBotonesEliminar() {
    const productos = document.querySelectorAll('#productos-container > div');
    
    productos.forEach((producto, index) => {
        const botonContainer = producto.querySelector('div:last-child');
        
        if (index === 0) {
            // Primer producto: ocultar botón de eliminar
            botonContainer.innerHTML = `
                <!-- Espacio reservado para mantener la alineación del grid -->
            `;
        } else {
            // Productos adicionales: mostrar botón de eliminar si no existe
            if (!botonContainer.querySelector('button')) {
                const productoId = producto.id;
                botonContainer.innerHTML = `
                    <button 
                        type="button"
                        onclick="eliminarProducto('${productoId}')"
                        class="w-full btn-eliminar text-white px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 flex items-center justify-center space-x-1"
                    >
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                        </svg>
                        <span>Eliminar</span>
                    </button>
                `;
            }
        }
    });
}

// Cálculos
function calcularSubtotal(productoId) {
    const producto = document.getElementById(productoId);
    if (!producto) return; // Evitar errores si el producto no existe
    
    const cantidadInput = producto.querySelector('[name="producto-cantidad"]');
    const precioInput = producto.querySelector('[name="producto-precio"]');
    const subtotalInput = producto.querySelector('[name="producto-subtotal"]');
    
    if (!cantidadInput || !precioInput || !subtotalInput) return; // Evitar errores si faltan elementos
    
    const cantidad = parseFloat(cantidadInput.value) || 0;
    const precio = parseFloat(precioInput.value) || 0;
    const subtotal = cantidad * precio;
    
    subtotalInput.value = formatearMoneda(subtotal);
    
    calcularTotal();
}

function calcularTotal() {
    let total = 0;
    const productos = document.querySelectorAll('[name="producto-subtotal"]');
    
    productos.forEach(producto => {
        const valor = parseFloat(producto.value.replace('$', '').replace(',', '')) || 0;
        total += valor;
    });
    
    document.getElementById('total-venta').textContent = formatearMoneda(total);
}

// Formatear como moneda
function formatearMoneda(valor) {
    return new Intl.NumberFormat('es-MX', {
        style: 'currency',
        currency: 'MXN'
    }).format(valor);
}

// Gestión de formulario
function limpiarFormulario() {
    if (confirm('¿Está seguro de que desea limpiar todo el formulario?')) {
        // Limpiar campos principales
        const campos = [
            'cliente', 'telefono', 'email', 'direccion', 
            'canal-venta', 'tipo-entrega', 'tipo-comprobante', 
            'codigo-tracking', 'observaciones'
        ];
        
        campos.forEach(campo => {
            const elemento = document.getElementById(campo);
            if (elemento) {
                elemento.value = '';
            }
        });
        
        // Limpiar productos
        const productosContainer = document.getElementById('productos-container');
        if (productosContainer) {
            productosContainer.innerHTML = '';
        }
        
        // Resetear contador y agregar primer producto
        contadorProductos = 0;
        agregarPrimerProducto();
        calcularTotal();
        
        mostrarNotificacion('Formulario limpiado correctamente', 'info');
    }
}

// Guardar venta
function guardarVenta() {
    // Validar formulario
    const cliente = document.getElementById('cliente').value.trim();
    const vendedor = document.getElementById('vendedor').value.trim();
    const canalVenta = document.getElementById('canal-venta').value;
    const tipoEntrega = document.getElementById('tipo-entrega').value;
    const tipoComprobante = document.getElementById('tipo-comprobante').value;
    const productos = document.querySelectorAll('[name="producto-nombre"]');
    
    if (!cliente) {
        mostrarNotificacion('❌ El nombre del cliente es obligatorio', 'error');
        return;
    }
    
    if (!vendedor) {
        mostrarNotificacion('❌ El nombre del vendedor es obligatorio', 'error');
        return;
    }
    
    if (!canalVenta) {
        mostrarNotificacion('❌ Debe seleccionar el canal de venta', 'error');
        return;
    }
    
    if (!tipoEntrega) {
        mostrarNotificacion('❌ Debe seleccionar el tipo de entrega', 'error');
        return;
    }
    
    if (!tipoComprobante) {
        mostrarNotificacion('❌ Debe seleccionar el tipo de comprobante', 'error');
        return;
    }
    
    // Validar que hay al menos un producto completo
    let productosValidos = 0;
    productos.forEach(producto => {
        const contenedor = producto.closest('.grid');
        const nombre = producto.value.trim();
        const cantidad = contenedor.querySelector('[name="producto-cantidad"]').value;
        const precio = contenedor.querySelector('[name="producto-precio"]').value;
        const metodoPago = contenedor.querySelector('[name="producto-metodo-pago"]').value;
        
        if (nombre && cantidad && precio && metodoPago) {
            productosValidos++;
        }
    });
    
    if (productosValidos === 0) {
        mostrarNotificacion('❌ Debe agregar al menos un producto completo con método de pago', 'error');
        return;
    }
    
    // Crear objeto de venta
    const fechaFormulario = document.getElementById('fecha-venta').value;
    
    const venta = {
        id: Date.now(),
        fecha: fechaFormulario,
        cliente: cliente,
        telefono: document.getElementById('telefono').value.trim(),
        email: document.getElementById('email').value.trim(),
        direccion: document.getElementById('direccion').value.trim(),
        canalVenta: document.getElementById('canal-venta').value,
        tipoEntrega: document.getElementById('tipo-entrega').value,
        tipoComprobante: document.getElementById('tipo-comprobante').value,
        codigoTracking: document.getElementById('codigo-tracking').value.trim(),
        vendedor: vendedor,
        observaciones: document.getElementById('observaciones').value.trim(),
        productos: [],
        total: 0
    };
    
    // Agregar productos a la venta - con validaciones adicionales
    productos.forEach(producto => {
        const contenedor = producto.closest('.grid');
        if (!contenedor) return; // Skip si no encuentra el contenedor
        
        const nombre = producto.value.trim();
        const cantidadInput = contenedor.querySelector('[name="producto-cantidad"]');
        const precioInput = contenedor.querySelector('[name="producto-precio"]');
        const metodoPagoSelect = contenedor.querySelector('[name="producto-metodo-pago"]');
        
        if (!cantidadInput || !precioInput || !metodoPagoSelect) return; // Skip si faltan elementos
        
        const cantidad = parseFloat(cantidadInput.value) || 0;
        const precio = parseFloat(precioInput.value) || 0;
        const metodoPago = metodoPagoSelect.value;
        const subtotal = cantidad * precio;
        
        if (nombre && cantidad && precio && metodoPago) {
            venta.productos.push({
                nombre: nombre,
                cantidad: cantidad,
                precio: precio,
                metodoPago: metodoPago,
                subtotal: subtotal
            });
            venta.total += subtotal;
        }
    });
    
    // Guardar en localStorage
    const ventas = JSON.parse(localStorage.getItem('bocettos_ventas') || '[]');
    ventas.push(venta);
    localStorage.setItem('bocettos_ventas', JSON.stringify(ventas));
    
    mostrarNotificacion('✅ Venta guardada exitosamente', 'success');
    
    // Preguntar si desea limpiar el formulario
    setTimeout(() => {
        if (confirm('¿Desea limpiar el formulario para una nueva venta?')) {
            limpiarFormulario();
        }
    }, 1500);
}

// Notificaciones
function mostrarNotificacion(mensaje, tipo = 'info') {
    const colores = {
        success: 'text-white',
        error: 'text-white',
        warning: 'text-white',
        info: 'text-white'
    };
    
    const notificacion = document.createElement('div');
    notificacion.className = `text-white px-6 py-3 rounded-lg shadow-lg transform translate-x-full transition-transform duration-300`;
    notificacion.style.backgroundColor = '#4a4a4b';
    notificacion.textContent = mensaje;
    
    document.getElementById('notification-container').appendChild(notificacion);
    
    setTimeout(() => {
        notificacion.classList.remove('translate-x-full');
    }, 100);
    
    setTimeout(() => {
        notificacion.classList.add('translate-x-full');
        setTimeout(() => {
            notificacion.remove();
        }, 300);
    }, 4000);
}

// Navegación
function logout() {
    if (confirm('¿Está seguro de que desea cerrar sesión?')) {
        localStorage.removeItem('bocettos_usuario');
        window.location.href = '../login.html';
    }
}

function irADashboard() {
    window.location.href = 'dashboard.html';
}

function irAAdmin() {
    const usuario = localStorage.getItem('bocettos_usuario');
    if (usuario) {
        const userData = JSON.parse(usuario);
        if (userData.rol === 'admin') {
            mostrarNotificacion('🚀 Redirigiendo al panel de administrador...', 'info');
            // Aquí se redirigirá al dashboard cuando esté implementado
            setTimeout(() => {
                alert('Dashboard de administrador en desarrollo');
            }, 1000);
        } else {
            mostrarNotificacion('❌ Acceso denegado: Solo administradores', 'error');
        }
    }
}

// ===== FUNCIONES GLOBALES =====
// Función global para ser llamada desde onclick
window.calcularSubtotal = calcularSubtotal;
window.eliminarProducto = eliminarProducto;