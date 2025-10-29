// Formulario de Registro de Ventas
// Permite agregar múltiples productos y calcular totales
let productos = [];
let total = 0;
let contadorProductos = 0;

window.addEventListener('load', function () {
    verificarAutenticacion();
    inicializarFormulario();
    agregarPrimerProducto(); // Añadir campo inicial de producto
});

function verificarAutenticacion() {
    const usuario = localStorage.getItem('bocettos_usuario');
    if (!usuario) {
        window.location.href = '../index.html';
        return;
    }
    document.getElementById('vendedor').value = JSON.parse(usuario).nombre;
}

function inicializarFormulario() {
    const hoy = new Date();
    document.getElementById('fecha-venta').value = `${hoy.getFullYear()}-${String(hoy.getMonth() + 1).padStart(2, '0')}-${String(hoy.getDate()).padStart(2, '0')}`;

    document.getElementById('dashboard-btn')?.addEventListener('click', () => window.location.href = 'dashboard.html');
    document.getElementById('guardar-btn')?.addEventListener('click', guardarVenta);
    document.getElementById('agregar-producto-btn')?.addEventListener('click', agregarProducto);
}
function agregarPrimerProducto() {
    agregarProducto();
}

function agregarProducto() {
    contadorProductos++;
    const productoId = `producto-${contadorProductos}`;
    const mostrarBotonEliminar = contadorProductos > 1;

    const botonEliminarHTML = mostrarBotonEliminar ? `
        <button type="button" onclick="eliminarProducto('${productoId}')" class="w-full btn-eliminar text-white px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 flex items-center justify-center space-x-1">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
            </svg>
            <span>Eliminar</span>
        </button>
    ` : '';

    document.getElementById('productos-container').insertAdjacentHTML('beforeend', `
        <div id="${productoId}" class="grid grid-cols-1 md:grid-cols-7 gap-4 items-end p-4 bg-gray-50 rounded-lg border border-gray-200">
            <div class="md:col-span-2">
                <label class="block text-sm font-medium text-gray-700 mb-1">Producto *</label>
                <input type="text" name="producto-nombre" required placeholder="Nombre del producto" class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-1 focus:ring-bocettos-primary focus:border-bocettos-primary text-sm">
            </div>
            <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Cantidad *</label>
                <input type="number" name="producto-cantidad" min="1" value="1" required onchange="calcularSubtotal('${productoId}')" class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-1 focus:ring-bocettos-primary focus:border-bocettos-primary text-sm">
            </div>
            <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Precio Unit. *</label>
                <input type="number" name="producto-precio" min="0" step="0.01" required placeholder="0.00" onchange="calcularSubtotal('${productoId}')" class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-1 focus:ring-bocettos-primary focus:border-bocettos-primary text-sm">
            </div>
            <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Método Pago *</label>
                <select name="producto-metodo-pago" required class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-1 focus:ring-bocettos-primary focus:border-bocettos-primary text-sm">
                    <option value="" disabled selected style="color: #9CA3AF;">Seleccionar</option>
                    <option value="efectivo">💵 Efectivo</option>
                    <option value="tarjeta-credito">💳 T. Crédito</option>
                    <option value="tarjeta-debito">💳 T. Débito</option>
                    <option value="yape">📱 Yape</option>
                    <option value="plin">📲 Plin</option>
                    <option value="transferencia">🏦 Transferencia</option>
                </select>
            </div>
            <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Subtotal</label>
                <input type="text" name="producto-subtotal" readonly value="$0.00" class="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100 text-gray-600 text-sm font-medium">
            </div>
            <div>${botonEliminarHTML}</div>
        </div>
    `);
    calcularTotal();
}

function eliminarProducto(productoId) {
    document.getElementById(productoId).remove();
    actualizarBotonesEliminar();
    calcularTotal();
}

function actualizarBotonesEliminar() {
    const productos = document.querySelectorAll('#productos-container > div');
    productos.forEach((producto, index) => {
        const botonContainer = producto.querySelector('div:last-child');
        if (index === 0) {
            botonContainer.innerHTML = '';
        } else if (!botonContainer.querySelector('button')) {
            botonContainer.innerHTML = `
                <button type="button" onclick="eliminarProducto('${producto.id}')" class="w-full btn-eliminar text-white px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 flex items-center justify-center space-x-1">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                    </svg>
                    <span>Eliminar</span>
                </button>
            `;
        }
    });
}
function calcularSubtotal(productoId) {
    const producto = document.getElementById(productoId);
    if (!producto) return;

    const cantidad = parseFloat(producto.querySelector('[name="producto-cantidad"]').value) || 0;
    const precio = parseFloat(producto.querySelector('[name="producto-precio"]').value) || 0;
    producto.querySelector('[name="producto-subtotal"]').value = formatearMoneda(cantidad * precio);
    calcularTotal();
}

function calcularTotal() {
    let total = 0;
    document.querySelectorAll('[name="producto-subtotal"]').forEach(p => {
        total += parseFloat(p.value.replace('$', '').replace(',', '')) || 0;
    });
    document.getElementById('total-venta').textContent = formatearMoneda(total);
}

function formatearMoneda(valor) {
    return new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(valor);
}

function guardarVenta() {
    const cliente = document.getElementById('cliente').value.trim();
    const telefono = document.getElementById('telefono').value.trim();
    const email = document.getElementById('email').value.trim();
    const direccion = document.getElementById('direccion').value.trim();
    const vendedor = document.getElementById('vendedor').value.trim();
    const canalVenta = document.getElementById('canal-venta').value;
    const tipoEntrega = document.getElementById('tipo-entrega').value;
    const tipoComprobante = document.getElementById('tipo-comprobante').value;

    if (!cliente) return mostrarNotificacion('❌ El nombre del cliente es obligatorio', 'error');
    if (!telefono) return mostrarNotificacion('❌ El teléfono es obligatorio', 'error');
    if (!email) return mostrarNotificacion('❌ El correo electrónico es obligatorio', 'error');
    if (!direccion) return mostrarNotificacion('❌ La dirección es obligatoria', 'error');
    if (!vendedor) return mostrarNotificacion('❌ El nombre del vendedor es obligatorio', 'error');
    if (!canalVenta) return mostrarNotificacion('❌ Debe seleccionar el canal de venta', 'error');
    if (!tipoEntrega) return mostrarNotificacion('❌ Debe seleccionar el tipo de entrega', 'error');
    if (!tipoComprobante) return mostrarNotificacion('❌ Debe seleccionar el tipo de comprobante', 'error');

    const ahora = new Date();
    const hora = `${String(ahora.getHours()).padStart(2, '0')}:${String(ahora.getMinutes()).padStart(2, '0')}`;

    const venta = {
        id: Date.now(),
        fecha: document.getElementById('fecha-venta').value,
        hora: hora,
        cliente,
        telefono,
        email,
        direccion,
        vendedor,
        canalVenta,
        tipoEntrega,
        tipoComprobante,
        codigoTracking: document.getElementById('codigo-tracking').value.trim(),
        observaciones: document.getElementById('observaciones').value.trim(),
        productos: [],
        total: 0
    };

    document.querySelectorAll('[name="producto-nombre"]').forEach(producto => {
        const contenedor = producto.closest('.grid');
        if (!contenedor) return;

        const nombre = producto.value.trim();
        const cantidad = parseFloat(contenedor.querySelector('[name="producto-cantidad"]').value) || 0;
        const precio = parseFloat(contenedor.querySelector('[name="producto-precio"]').value) || 0;
        const metodoPago = contenedor.querySelector('[name="producto-metodo-pago"]').value;
        const subtotal = cantidad * precio;

        if (nombre && cantidad && precio && metodoPago) {
            venta.productos.push({ nombre, cantidad, precio, metodoPago, subtotal });
            venta.total += subtotal;
        }
    });

    if (venta.productos.length === 0) {
        return mostrarNotificacion('❌ Debe agregar al menos un producto completo', 'error');
    }

    const ventas = JSON.parse(localStorage.getItem('bocettos_ventas') || '[]');
    ventas.push(venta);
    localStorage.setItem('bocettos_ventas', JSON.stringify(ventas));

    Swal.fire({
        title: '¡Venta guardada!',
        text: '¿Desea limpiar el formulario para una nueva venta?',
        icon: 'success',
        showCancelButton: true,
        confirmButtonColor: '#4a4a4b',
        cancelButtonColor: '#6b7280',
        confirmButtonText: 'Sí, nueva venta',
        cancelButtonText: 'No, mantener'
    }).then((result) => {
        if (result.isConfirmed) {
            ['cliente', 'telefono', 'email', 'direccion', 'canal-venta', 'tipo-entrega', 'tipo-comprobante', 'codigo-tracking', 'observaciones']
                .forEach(campo => document.getElementById(campo).value = '');

            document.getElementById('productos-container').innerHTML = '';
            contadorProductos = 0;
            agregarPrimerProducto();
            calcularTotal();
        }
    });
}
function mostrarNotificacion(mensaje, tipo = 'info') {
    const notificacion = document.createElement('div');
    notificacion.className = 'text-white px-6 py-3 rounded-lg shadow-lg transform translate-x-full transition-transform duration-300';
    notificacion.style.backgroundColor = '#4a4a4b';
    notificacion.textContent = mensaje;

    document.getElementById('notification-container').appendChild(notificacion);
    setTimeout(() => notificacion.classList.remove('translate-x-full'), 100);
    setTimeout(() => {
        notificacion.classList.add('translate-x-full');
        setTimeout(() => notificacion.remove(), 300);
    }, 4000);
}

window.calcularSubtotal = calcularSubtotal;
window.eliminarProducto = eliminarProducto;