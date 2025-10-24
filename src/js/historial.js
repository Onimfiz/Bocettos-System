// ===== HISTORIAL DE VENTAS =====

let ventasOriginales = [];
let ventasFiltradas = [];
let usuarioActual = null;

// ===== INICIALIZACIÓN =====

document.addEventListener('DOMContentLoaded', function() {
    // Verificar autenticación
    const usuario = localStorage.getItem('bocettos_usuario');
    if (!usuario) {
        window.location.href = '../login.html';
        return;
    }
    
    usuarioActual = JSON.parse(usuario);
    
    // Mostrar información del usuario
    mostrarUsuario();
    
    // Configurar event listeners PRIMERO
    configurarEventListeners();
    
    // Cargar ventas
    cargarVentas();
    
    // Aplicar filtros iniciales
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
    // Botones de navegación
    const dashboardBtn = document.getElementById('dashboard-btn');
    const nuevaVentaBtn = document.getElementById('nueva-venta-btn');
    const logoutBtn = document.getElementById('logout-btn');
    
    if (dashboardBtn) {
        dashboardBtn.addEventListener('click', () => {
            window.location.href = 'dashboard.html';
        });
    }
    
    if (nuevaVentaBtn) {
        nuevaVentaBtn.addEventListener('click', () => {
            window.location.href = 'formulario-ventas.html';
        });
    }
    
    if (logoutBtn) {
        logoutBtn.addEventListener('click', logout);
    }
    
    // Configurar botón de limpiar datos (solo para administradores)
    const limpiarDatosBtn = document.getElementById('limpiar-datos-btn');
    if (limpiarDatosBtn && usuarioActual.rol === 'admin') {
        limpiarDatosBtn.style.display = 'block';
        limpiarDatosBtn.addEventListener('click', limpiarTodasLasVentas);
    }
    
    // Filtros - con verificación de existencia
    const aplicarBtn = document.getElementById('aplicar-filtros-btn');
    const limpiarBtn = document.getElementById('limpiar-filtros-btn');
    const filtroCliente = document.getElementById('filtro-cliente');
    const filtroProducto = document.getElementById('filtro-producto');
    const fechaDesde = document.getElementById('filtro-fecha-desde');
    const fechaHasta = document.getElementById('filtro-fecha-hasta');
    
    if (aplicarBtn) {
        aplicarBtn.addEventListener('click', aplicarFiltros);
    }
    
    if (limpiarBtn) {
        limpiarBtn.addEventListener('click', limpiarFiltros);
    }
    
    // Filtros en tiempo real
    if (filtroCliente) {
        filtroCliente.addEventListener('input', aplicarFiltros);
    }
    if (filtroProducto) {
        filtroProducto.addEventListener('input', aplicarFiltros);
    }
    if (fechaDesde) {
        fechaDesde.addEventListener('change', aplicarFiltros);
    }
    if (fechaHasta) {
        fechaHasta.addEventListener('change', aplicarFiltros);
    }
    
    // Modal
    const cerrarModalBtn = document.getElementById('cerrar-modal');
    const modalDetalle = document.getElementById('modal-detalle');
    
    if (cerrarModalBtn) {
        cerrarModalBtn.addEventListener('click', cerrarModal);
    }
    if (modalDetalle) {
        modalDetalle.addEventListener('click', (e) => {
            if (e.target.id === 'modal-detalle') {
                cerrarModal();
            }
        });
    }
}

// ===== FILTROS =====

window.aplicarFiltros = function() {
    console.log('Aplicando filtros...'); // Debug
    
    const filtroClienteElement = document.getElementById('filtro-cliente');
    const filtroProductoElement = document.getElementById('filtro-producto');
    const fechaDesdeElement = document.getElementById('filtro-fecha-desde');
    const fechaHastaElement = document.getElementById('filtro-fecha-hasta');
    
    const filtroCliente = filtroClienteElement ? filtroClienteElement.value.toLowerCase().trim() : '';
    const filtroProducto = filtroProductoElement ? filtroProductoElement.value.toLowerCase().trim() : '';
    const fechaDesde = fechaDesdeElement ? fechaDesdeElement.value : '';
    const fechaHasta = fechaHastaElement ? fechaHastaElement.value : '';
    
    ventasFiltradas = ventasOriginales.filter(venta => {
        // Filtro por cliente
        if (filtroCliente && venta.cliente && !String(venta.cliente).toLowerCase().includes(filtroCliente)) {
            return false;
        }
        
        // Filtro por producto
        if (filtroProducto && venta.productos) {
            const tieneProducto = venta.productos.some(producto => 
                producto.nombre && String(producto.nombre).toLowerCase().includes(filtroProducto)
            );
            if (!tieneProducto) return false;
        }
        
        // Filtro por fecha desde
        if (fechaDesde && venta.fecha < fechaDesde) {
            return false;
        }
        
        // Filtro por fecha hasta
        if (fechaHasta && venta.fecha > fechaHasta) {
            return false;
        }
        
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
    const contadorElement = document.getElementById('total-registros');
    if (contadorElement) {
        contadorElement.textContent = `Total: ${ventasFiltradas.length} ventas`;
    } else {
        console.error('Elemento total-registros no encontrado');
    }
}

// ===== MOSTRAR DATOS =====

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
                    onclick="verDetalle('${venta.id}')"
                    class="text-bocettos-primary hover:text-blue-700 mr-3"
                >
                    👁️ Ver
                </button>
            </td>
        </tr>
    `).join('');
}

// ===== MODAL DE DETALLE =====

function verDetalle(ventaId) {
    const venta = ventasFiltradas.find(v => v.id === ventaId);
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

// ===== UTILIDADES =====

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

function logout() {
    if (confirm('¿Está seguro de que desea cerrar sesión?')) {
        localStorage.removeItem('bocettos_usuario');
        window.location.href = '../login.html';
    }
}

function limpiarTodasLasVentas() {
    if (confirm('⚠️ ADVERTENCIA: Esto borrará TODAS las ventas del sistema de forma permanente.\n\n¿Estás seguro de continuar?')) {
        if (confirm('Esta acción NO se puede deshacer. ¿Realmente deseas eliminar todas las ventas?')) {
            localStorage.removeItem('bocettos_ventas');
            alert('✅ Todas las ventas han sido eliminadas');
            location.reload();
        }
    }
}