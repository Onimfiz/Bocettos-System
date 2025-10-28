let ventasOriginales = [];
let ventasFiltradas = [];
let usuarioActual = null;

document.addEventListener('DOMContentLoaded', function() {
    const usuario = localStorage.getItem('bocettos_usuario');
    if (!usuario) {
        window.location.href = '../index.html';
        return;
    }
    
    usuarioActual = JSON.parse(usuario);
    mostrarUsuario();
    configurarEventListeners();
    cargarVentas();
    aplicarFiltros();
});

function mostrarUsuario() {
    document.getElementById('usuario-nombre').textContent = usuarioActual.nombre;
    document.getElementById('usuario-ubicacion').textContent = usuarioActual.ubicacion || 'Tienda';
}

function cargarVentas() {
    const todasVentas = JSON.parse(localStorage.getItem('bocettos_ventas') || '[]');
    
    // Filtrar ventas según el rol del usuario
    if (usuarioActual.rol === 'admin') {
        ventasOriginales = todasVentas;
    } else {
        ventasOriginales = todasVentas.filter(venta => venta.vendedor === usuarioActual.nombre);
    }
    
    ventasFiltradas = [...ventasOriginales];
}

function configurarEventListeners() {
    document.getElementById('dashboard-btn')?.addEventListener('click', () => window.location.href = 'dashboard.html');
    document.getElementById('nueva-venta-btn')?.addEventListener('click', () => window.location.href = 'formulario-ventas.html');
    
    const limpiarDatosBtn = document.getElementById('limpiar-datos-btn');
    if (limpiarDatosBtn && usuarioActual.rol === 'admin') {
        limpiarDatosBtn.style.display = 'block';
        limpiarDatosBtn.addEventListener('click', limpiarTodasLasVentas);
    }
    
    document.getElementById('aplicar-filtros-btn')?.addEventListener('click', aplicarFiltros);
    document.getElementById('limpiar-filtros-btn')?.addEventListener('click', limpiarFiltros);
    document.getElementById('filtro-cliente')?.addEventListener('input', aplicarFiltros);
    document.getElementById('filtro-producto')?.addEventListener('input', aplicarFiltros);
    document.getElementById('filtro-fecha-desde')?.addEventListener('change', aplicarFiltros);
    document.getElementById('filtro-fecha-hasta')?.addEventListener('change', aplicarFiltros);
    
    document.getElementById('cerrar-modal')?.addEventListener('click', cerrarModal);
    document.getElementById('modal-detalle')?.addEventListener('click', (e) => {
        if (e.target.id === 'modal-detalle') cerrarModal();
    });
}

window.aplicarFiltros = function() {
    const filtroCliente = document.getElementById('filtro-cliente')?.value.toLowerCase().trim() || '';
    const filtroProducto = document.getElementById('filtro-producto')?.value.toLowerCase().trim() || '';
    const fechaDesde = document.getElementById('filtro-fecha-desde')?.value || '';
    const fechaHasta = document.getElementById('filtro-fecha-hasta')?.value || '';
    
    ventasFiltradas = ventasOriginales.filter(venta => {
        if (filtroCliente && !String(venta.cliente).toLowerCase().includes(filtroCliente)) return false;
        if (filtroProducto && !venta.productos.some(p => String(p.nombre).toLowerCase().includes(filtroProducto))) return false;
        if (fechaDesde && venta.fecha < fechaDesde) return false;
        if (fechaHasta && venta.fecha > fechaHasta) return false;
        return true;
    });
    
    mostrarVentas();
    actualizarContador();
}

window.limpiarFiltros = function() {
    document.getElementById('filtro-cliente').value = '';
    document.getElementById('filtro-producto').value = '';
    document.getElementById('filtro-fecha-desde').value = '';
    document.getElementById('filtro-fecha-hasta').value = '';
    
    cargarVentas();
    window.aplicarFiltros();
}

function actualizarContador() {
    document.getElementById('total-registros').textContent = `Total: ${ventasFiltradas.length} ventas`;
}

function mostrarVentas() {
    const tbody = document.getElementById('tabla-historial');
    const estadoVacio = document.getElementById('estado-vacio');
    
    if (ventasFiltradas.length === 0) {
        tbody.innerHTML = '';
        estadoVacio.classList.remove('hidden');
        return;
    }
    
    estadoVacio.classList.add('hidden');
    
    // Ordenar por fecha y hora (más recientes primero)
    const ventasOrdenadas = ventasFiltradas.sort((a, b) => {
        const fechaA = new Date(a.fecha + 'T' + (a.hora || '00:00'));
        const fechaB = new Date(b.fecha + 'T' + (b.hora || '00:00'));
        return fechaB - fechaA;
    });
    
    tbody.innerHTML = ventasOrdenadas.map(venta => `
        <tr class="hover:bg-gray-50 transition-colors">
            <td class="px-6 py-4 whitespace-nowrap">
                <div class="text-sm font-medium text-gray-900">${formatearFecha(venta.fecha)}</div>
                <div class="text-sm text-gray-500">${venta.hora || 'Sin hora'}</div>
            </td>
            <td class="px-6 py-4">
                <div class="text-sm font-medium text-gray-900">${venta.cliente}</div>
                <div class="text-sm text-gray-500">${venta.telefono || 'Sin teléfono'}</div>
            </td>
            <td class="px-6 py-4">
                <div class="text-sm text-gray-900">
                    ${venta.productos.map(p => `${p.nombre} (${p.cantidad})`).join(', ')}
                </div>
                <div class="text-sm text-gray-500">${venta.productos.length} producto(s)</div>
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
                <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    ${venta.canalVenta || 'No especificado'}
                </span>
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
                <div class="text-sm font-bold text-green-600">$${formatearNumero(venta.total)}</div>
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
                <div class="text-sm text-gray-900">${venta.vendedor}</div>
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                <button 
                    onclick="window.verDetalle(${venta.id})"
                    class="text-bocettos-primary hover:text-blue-700 mr-3 text-base font-semibold"
                >
                     Ver
                </button>
            </td>
        </tr>
    `).join('');
}

// ===== MODAL DE DETALLE =====

function verDetalle(ventaId) {
    const venta = ventasFiltradas.find(v => v.id == ventaId);
    if (!venta) return;
    
    const contenido = document.getElementById('contenido-detalle');
    contenido.innerHTML = `
        <div class="space-y-6">
            <!-- Información del Cliente -->
            <div class="bg-gray-50 p-4 rounded-lg">
                <h4 class="font-semibold text-gray-800 mb-3">👤 Información del Cliente</h4>
                <div class="grid grid-cols-2 gap-4 text-sm">
                    <div><span class="font-medium">Cliente:</span> ${venta.cliente}</div>
                    <div><span class="font-medium">Teléfono:</span> ${venta.telefono || 'No registrado'}</div>
                    <div><span class="font-medium">Email:</span> ${venta.email || 'No registrado'}</div>
                    <div><span class="font-medium">Dirección:</span> ${venta.direccion || 'No registrada'}</div>
                </div>
            </div>
            
            <!-- Información de la Venta -->
            <div class="bg-gray-50 p-4 rounded-lg">
                <h4 class="font-semibold text-gray-800 mb-3">📋 Información de la Venta</h4>
                <div class="grid grid-cols-2 gap-4 text-sm">
                    <div><span class="font-medium">Fecha:</span> ${formatearFecha(venta.fecha)}</div>
                    <div><span class="font-medium">Hora:</span> ${venta.hora || 'No registrada'}</div>
                    <div><span class="font-medium">Canal:</span> ${venta.canalVenta || 'No especificado'}</div>
                    <div><span class="font-medium">Entrega:</span> ${venta.tipoEntrega || 'No especificado'}</div>
                    <div><span class="font-medium">Comprobante:</span> ${venta.tipoComprobante || 'No especificado'}</div>
                    <div><span class="font-medium">Tracking:</span> ${venta.codigoTracking || 'No especificado'}</div>
                    <div><span class="font-medium">Vendedor:</span> ${venta.vendedor}</div>
                </div>
            </div>
            
            <!-- Productos -->
            <div class="bg-gray-50 p-4 rounded-lg">
                <h4 class="font-semibold text-gray-800 mb-3">🛍️ Productos</h4>
                <div class="space-y-3">
                    ${venta.productos.map(producto => `
                        <div class="bg-white p-3 rounded border">
                            <div class="flex justify-between items-start">
                                <div>
                                    <div class="font-medium">${producto.nombre}</div>
                                    <div class="text-sm text-gray-600">
                                        Cantidad: ${producto.cantidad} × $${formatearNumero(producto.precio)}
                                    </div>
                                    <div class="text-sm text-gray-600">
                                        Método de pago: ${producto.metodoPago}
                                    </div>
                                </div>
                                <div class="text-right">
                                    <div class="font-bold text-green-600">$${formatearNumero(producto.subtotal)}</div>
                                </div>
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
            
            <!-- Total -->
            <div class="bg-bocettos-primary p-4 rounded-lg text-white text-center">
                <div class="text-sm opacity-90">Total de la Venta</div>
                <div class="text-2xl font-bold">$${formatearNumero(venta.total)}</div>
            </div>
        </div>
    `;
    
    document.getElementById('modal-detalle').classList.remove('hidden');
}

function cerrarModal() {
    document.getElementById('modal-detalle').classList.add('hidden');
}

function formatearFecha(fecha) {
    const date = new Date(fecha + 'T00:00:00');
    return date.toLocaleDateString('es-ES', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
    });
}

function formatearNumero(numero) {
    return Number(numero).toLocaleString('es-ES', {
        minimumFractionDigits: 0,
        maximumFractionDigits: 2
    });
}

function limpiarTodasLasVentas() {
    Swal.fire({
        title: '⚠️ ADVERTENCIA',
        html: 'Esto borrará <strong>TODAS</strong> las ventas del sistema de forma permanente.<br><br>¿Estás seguro de continuar?',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#dc2626',
        cancelButtonColor: '#6b7280',
        confirmButtonText: 'Sí, eliminar todo',
        cancelButtonText: 'Cancelar'
    }).then((result) => {
        if (result.isConfirmed) {
            Swal.fire({
                title: '⚠️ Confirmación Final',
                text: 'Esta acción NO se puede deshacer. ¿Realmente deseas eliminar todas las ventas?',
                icon: 'error',
                showCancelButton: true,
                confirmButtonColor: '#dc2626',
                cancelButtonColor: '#6b7280',
                confirmButtonText: 'Sí, confirmo',
                cancelButtonText: 'Cancelar'
            }).then((finalResult) => {
                if (finalResult.isConfirmed) {
                    localStorage.removeItem('bocettos_ventas');
                    Swal.fire({
                        title: '✅ Eliminado',
                        text: 'Todas las ventas han sido eliminadas',
                        icon: 'success',
                        confirmButtonColor: '#059669'
                    }).then(() => {
                        location.reload();
                    });
                }
            });
        }
    });
}

window.verDetalle = verDetalle;