let usuario = null;
let ventas = [];
let graficoSemanal = null;

window.addEventListener('load', function() {
    inicializar();
});

function inicializar() {
    const sesion = localStorage.getItem('bocettos_usuario');
    if (!sesion) {
        window.location.href = '../login.html';
        return;
    }
    
    usuario = JSON.parse(sesion);
    mostrarUsuario();
    cargarVentas();
    actualizarDatos();
    
    // Configurar botón de logout
    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', logout);
    }
    
    // Configurar botón de exportar CSV
    const exportarCsvBtn = document.getElementById('exportar-csv-btn');
    if (exportarCsvBtn) {
        exportarCsvBtn.addEventListener('click', exportarVentasCSV);
    }
    
    // Configurar botón de historial
    const historialBtn = document.getElementById('historial-btn');
    if (historialBtn) {
        historialBtn.addEventListener('click', () => {
            window.location.href = 'historial.html';
        });
    }
    
    setInterval(actualizarDatos, 30000);
}

// ===== ANÁLISIS DE CLIENTES VIP =====

function mostrarClientesVIP() {
    const clientesStats = analizarClientes();
    
    // Top clientes por número de compras
    const topCompras = clientesStats
        .sort((a, b) => b.compras - a.compras)
        .slice(0, 5);
    
    const htmlCompras = topCompras.map((cliente, index) => `
        <div class="flex items-center justify-between p-3 rounded-lg ${index === 0 ? 'bg-yellow-50 border border-yellow-200' : 'bg-gray-50'}">
            <div class="flex items-center space-x-3">
                <div class="w-8 h-8 rounded-full ${index === 0 ? 'bg-yellow-500' : index === 1 ? 'bg-gray-400' : index === 2 ? 'bg-orange-400' : 'bg-blue-500'} text-white flex items-center justify-center text-sm font-bold">
                    ${index + 1}
                </div>
                <div>
                    <div class="font-medium text-gray-800">${cliente.nombre}</div>
                    <div class="text-sm text-gray-600">${cliente.compras} compra${cliente.compras > 1 ? 's' : ''}</div>
                </div>
            </div>
            <div class="text-right">
                <div class="font-bold text-green-600">$${cliente.total.toLocaleString()}</div>
                <div class="text-xs text-gray-500">Total gastado</div>
            </div>
        </div>
    `).join('');
    
    // Top clientes por monto gastado
    const topMonto = clientesStats
        .sort((a, b) => b.total - a.total)
        .slice(0, 5);
    
    const htmlMonto = topMonto.map((cliente, index) => `
        <div class="flex items-center justify-between p-3 rounded-lg ${index === 0 ? 'bg-green-50 border border-green-200' : 'bg-gray-50'}">
            <div class="flex items-center space-x-3">
                <div class="w-8 h-8 rounded-full ${index === 0 ? 'bg-green-500' : index === 1 ? 'bg-gray-400' : index === 2 ? 'bg-orange-400' : 'bg-blue-500'} text-white flex items-center justify-center text-sm font-bold">
                    ${index + 1}
                </div>
                <div>
                    <div class="font-medium text-gray-800">${cliente.nombre}</div>
                    <div class="text-sm text-gray-600">$${cliente.promedio.toLocaleString()} promedio</div>
                </div>
            </div>
            <div class="text-right">
                <div class="font-bold text-green-600">$${cliente.total.toLocaleString()}</div>
                <div class="text-xs text-gray-500">${cliente.compras} compra${cliente.compras > 1 ? 's' : ''}</div>
            </div>
        </div>
    `).join('');
    
    // Actualizar DOM
    const topComprasElement = document.getElementById('top-clientes-compras');
    const topMontoElement = document.getElementById('top-clientes-monto');
    
    if (topComprasElement) {
        topComprasElement.innerHTML = htmlCompras || 
            '<div class="text-center py-4 text-gray-500">Sin datos de clientes aún</div>';
    }
    
    if (topMontoElement) {
        topMontoElement.innerHTML = htmlMonto || 
            '<div class="text-center py-4 text-gray-500">Sin datos de clientes aún</div>';
    }
}

function analizarClientes() {
    const clientesMap = new Map();
    
    ventas.forEach(venta => {
        const cliente = venta.cliente;
        if (!clientesMap.has(cliente)) {
            clientesMap.set(cliente, {
                nombre: cliente,
                compras: 0,
                total: 0,
                ultimaCompra: venta.fecha
            });
        }
        
        const stats = clientesMap.get(cliente);
        stats.compras++;
        stats.total += venta.total;
        
        // Actualizar última compra si es más reciente
        if (venta.fecha > stats.ultimaCompra) {
            stats.ultimaCompra = venta.fecha;
        }
    });
    
    // Convertir a array y calcular promedio
    return Array.from(clientesMap.values()).map(cliente => ({
        ...cliente,
        promedio: cliente.total / cliente.compras
    }));
}

// Función para análisis completo (botón en dashboard)
function verAnalisisCompleto() {
    window.location.href = 'historial.html';
}

// ===== ANÁLISIS DE PRODUCTOS TOP =====

function mostrarAnalisisProductos() {
    const productosStats = analizarProductos();
    
    // Top 5 productos más vendidos
    const topProductos = productosStats
        .sort((a, b) => b.cantidadVendida - a.cantidadVendida)
        .slice(0, 5);
    
    const html = topProductos.map((producto, index) => `
        <div class="flex items-center justify-between p-3 rounded-lg ${index === 0 ? 'bg-blue-50 border border-blue-200' : 'bg-gray-50'}">
            <div class="flex items-center space-x-3">
                <div class="w-8 h-8 rounded-full ${index === 0 ? 'bg-blue-500' : index === 1 ? 'bg-gray-400' : index === 2 ? 'bg-orange-400' : 'bg-green-500'} text-white flex items-center justify-center text-sm font-bold">
                    ${index + 1}
                </div>
                <div>
                    <div class="font-medium text-gray-800">${producto.nombre}</div>
                    <div class="text-sm text-gray-600">${producto.cantidadVendida} unidades vendidas</div>
                </div>
            </div>
            <div class="text-right">
                <div class="font-bold text-green-600">$${producto.ingresoTotal.toLocaleString()}</div>
                <div class="text-xs text-gray-500">${producto.ventasCount} ventas</div>
            </div>
        </div>
    `).join('');
    
    // Si hay un elemento para productos top, actualízalo
    const productosElement = document.getElementById('top-productos');
    if (productosElement) {
        productosElement.innerHTML = html || 
            '<div class="text-center py-4 text-gray-500">Sin datos de productos aún</div>';
    }
}

function analizarProductos() {
    const productosMap = new Map();
    
    ventas.forEach(venta => {
        venta.productos.forEach(producto => {
            const nombre = producto.nombre;
            if (!productosMap.has(nombre)) {
                productosMap.set(nombre, {
                    nombre: nombre,
                    cantidadVendida: 0,
                    ingresoTotal: 0,
                    ventasCount: 0,
                    precioPromedio: 0
                });
            }
            
            const stats = productosMap.get(nombre);
            stats.cantidadVendida += parseInt(producto.cantidad);
            stats.ingresoTotal += parseFloat(producto.subtotal);
            stats.ventasCount++;
        });
    });
    
    // Convertir a array y calcular promedio
    return Array.from(productosMap.values()).map(producto => ({
        ...producto,
        precioPromedio: producto.ingresoTotal / producto.cantidadVendida
    }));
}

// ===== RESUMEN DE VENTAS =====

function mostrarResumenVentas() {
    const productosStats = analizarProductos();
    
    // Calcular métricas
    const totalProductosVendidos = productosStats.reduce((sum, p) => sum + p.cantidadVendida, 0);
    const productoMasPopular = productosStats.length > 0 
        ? productosStats.sort((a, b) => b.cantidadVendida - a.cantidadVendida)[0].nombre 
        : 'Sin datos';
    
    const ticketPromedio = ventas.length > 0 
        ? ventas.reduce((sum, v) => sum + v.total, 0) / ventas.length 
        : 0;
    
    // Actualizar DOM
    const totalProductosElement = document.getElementById('total-productos-vendidos');
    const productoPopularElement = document.getElementById('producto-mas-popular');
    const ticketPromedioElement = document.getElementById('ticket-promedio');
    
    if (totalProductosElement) {
        totalProductosElement.textContent = totalProductosVendidos.toLocaleString();
    }
    
    if (productoPopularElement) {
        productoPopularElement.textContent = productoMasPopular;
    }
    
    if (ticketPromedioElement) {
        ticketPromedioElement.textContent = `$${ticketPromedio.toLocaleString('es-ES', {
            minimumFractionDigits: 0,
            maximumFractionDigits: 2
        })}`;
    }
}

function mostrarUsuario() {
    document.getElementById('usuario-nombre').textContent = usuario.nombre;
    document.getElementById('usuario-ubicacion').textContent = usuario.ubicacion || 'Tienda';
    
    if (usuario.rol === 'gerente') {
        document.getElementById('admin-link').style.display = 'block';
    }
    
    // Reloj
    actualizarHora();
    setInterval(actualizarHora, 60000);
}

function cargarVentas() {
    const todasVentas = JSON.parse(localStorage.getItem('bocettos_ventas') || '[]');
    ventas = todasVentas.filter(v => v.vendedor === usuario.nombre);
}

function actualizarDatos() {
    cargarVentas();
    
    // Calcular fecha actual en zona horaria local
    const ahora = new Date();
    const año = ahora.getFullYear();
    const mes = String(ahora.getMonth() + 1).padStart(2, '0');
    const dia = String(ahora.getDate()).padStart(2, '0');
    const hoy = `${año}-${mes}-${dia}`;
    
    // Ventas de hoy - múltiples métodos de comparación
    const ventasHoy = ventas.filter(v => {
        const fechaVenta = v.fecha;
        return fechaVenta === hoy || (fechaVenta && fechaVenta.startsWith(hoy));
    });
    const totalHoy = ventasHoy.reduce((sum, v) => sum + v.total, 0);
    
    // Productos de hoy
    const productosHoy = ventasHoy.reduce((sum, v) => 
        sum + v.productos.reduce((pSum, p) => pSum + p.cantidad, 0), 0);
    
    // Clientes únicos
    const clientesHoy = new Set(ventasHoy.map(v => v.cliente)).size;
    
    // Total del mes - corregido para usar fecha local
    const fechaActual = new Date();
    const mesActual = fechaActual.getMonth();
    const añoActual = fechaActual.getFullYear();
    
    const ventasMes = ventas.filter(v => {
        if (!v.fecha) return false;
        
        // Parsear fecha usando formato YYYY-MM-DD directamente
        const partesFecha = v.fecha.split('-');
        if (partesFecha.length !== 3) return false;
        
        const añoVenta = parseInt(partesFecha[0]);
        const mesVenta = parseInt(partesFecha[1]) - 1; // JavaScript usa 0-11 para meses
        
        return mesVenta === mesActual && añoVenta === añoActual;
    });
    const totalMes = ventasMes.reduce((sum, v) => sum + v.total, 0);
    
    // Actualizar interfaz - con validaciones
    const ventasHoyElement = document.getElementById('ventas-hoy');
    const ventasMesElement = document.getElementById('ventas-mes');
    const productosHoyElement = document.getElementById('productos-hoy');
    const clientesUnicosElement = document.getElementById('clientes-unicos');
    
    if (ventasHoyElement) ventasHoyElement.textContent = `S/ ${totalHoy.toFixed(2)}`;
    if (ventasMesElement) ventasMesElement.textContent = `S/ ${totalMes.toFixed(2)}`;
    if (productosHoyElement) productosHoyElement.textContent = productosHoy;
    if (clientesUnicosElement) clientesUnicosElement.textContent = clientesHoy;
    
    // Gráfico semanal simple
    mostrarGraficoSemanal();
    
    // Top productos
    mostrarAnalisisProductos();
    
    // Análisis de canales
    mostrarAnalisisCanales();
    
    // Clientes VIP
    mostrarClientesVIP();
    
    // Mostrar resumen de ventas
    mostrarResumenVentas();
    
    // Últimas ventas
    mostrarUltimasVentas(ventasHoy.slice(0, 5));
    
    // Objetivo
    actualizarObjetivo(totalHoy);
}

function mostrarGraficoSemanal() {
    const dias = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
    const ventasSemana = [];
    const etiquetas = [];
    
    // Calcular datos de la semana
    for (let i = 6; i >= 0; i--) {
        const fecha = new Date();
        fecha.setDate(fecha.getDate() - i);
        
        // Usar zona horaria local para la fecha
        const año = fecha.getFullYear();
        const mes = String(fecha.getMonth() + 1).padStart(2, '0');
        const dia = String(fecha.getDate()).padStart(2, '0');
        const fechaStr = `${año}-${mes}-${dia}`;
        
        const ventasDia = ventas.filter(v => v.fecha === fechaStr);
        const total = ventasDia.reduce((sum, v) => sum + v.total, 0);
        
        ventasSemana.push(total);
        etiquetas.push(dias[fecha.getDay()]);
    }
    
    const ctx = document.getElementById('grafico-semanal').getContext('2d');
    
    // Destruir gráfico anterior si existe
    if (graficoSemanal) {
        graficoSemanal.destroy();
    }
    
    // Crear nuevo gráfico
    graficoSemanal = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: etiquetas,
            datasets: [{
                label: 'Ventas (S/)',
                data: ventasSemana,
                backgroundColor: '#3b82f6',
                borderColor: '#1e40af',
                borderWidth: 1,
                borderRadius: 4
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        callback: function(value) {
                            return 'S/ ' + value;
                        }
                    }
                }
            },
            animation: {
                duration: 800
            }
        }
    });
    
    // Actualizar total semanal
    const totalSemana = ventasSemana.reduce((sum, valor) => sum + valor, 0);
    document.getElementById('total-semana').textContent = `S/ ${totalSemana.toFixed(2)}`;
}

function mostrarAnalisisCanales() {
    const canales = {};
    
    ventas.forEach(venta => {
        if (venta.canalVenta) {
            canales[venta.canalVenta] = (canales[venta.canalVenta] || 0) + 1;
        }
    });
    
    const topCanales = Object.entries(canales)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5);
    
    const iconosCanales = {
        'web': '🌐',
        'instagram': '📱', 
        'whatsapp': '💬',
        'feria': '🎪',
        'stand': '🏪'
    };
    
    const nombresCanales = {
        'web': 'Página Web',
        'instagram': 'Instagram',
        'whatsapp': 'WhatsApp', 
        'feria': 'Feria',
        'stand': 'Stand Barranco'
    };
    
    let html = '';
    
    topCanales.forEach(([canal, cantidad], i) => {
        const porcentaje = ventas.length > 0 ? Math.round((cantidad / ventas.length) * 100) : 0;
        html += `
            <div class="flex items-center justify-between p-3 bg-gray-50 rounded">
                <div class="flex items-center space-x-3">
                    <span class="text-xl">${iconosCanales[canal] || '📊'}</span>
                    <div>
                        <div class="font-medium">${nombresCanales[canal] || canal}</div>
                        <div class="text-sm text-gray-500">${cantidad} ventas (${porcentaje}%)</div>
                    </div>
                </div>
            </div>
        `;
    });
    
    document.getElementById('canales-venta').innerHTML = html || 
        '<div class="text-center py-4 text-gray-500">Sin datos de canales aún</div>';
}

function mostrarUltimasVentas(ventasRecientes) {
    const tbody = document.getElementById('tabla-ultimas-ventas');
    
    if (ventasRecientes.length === 0) {
        tbody.parentElement.parentElement.style.display = 'none';
        document.getElementById('sin-ventas').style.display = 'block';
        return;
    }
    
    tbody.parentElement.parentElement.style.display = 'block';
    document.getElementById('sin-ventas').style.display = 'none';
    
    let html = '';
    ventasRecientes.forEach(v => {
        // Como solo guardamos fecha (no hora), mostrar solo la fecha o un placeholder
        const fechaVenta = v.fecha || 'Sin fecha';
        const hora = v.hora || 'Todo el día'; // Si no hay hora específica
        const producto = v.productos && v.productos.length > 0 ? 
            (v.productos[0].nombre + (v.productos.length > 1 ? ' +más' : '')) : 
            'Sin productos';
        const cantidad = v.productos ? v.productos.reduce((sum, p) => sum + p.cantidad, 0) : 0;
        
        html += `
            <tr class="hover:bg-gray-50">
                <td class="px-6 py-4 text-sm">${hora}</td>
                <td class="px-6 py-4 text-sm">${producto}</td>
                <td class="px-6 py-4 text-sm">${v.cliente}</td>
                <td class="px-6 py-4 text-sm">${cantidad}</td>
                <td class="px-6 py-4 text-sm font-medium text-green-600">S/ ${v.total.toFixed(2)}</td>
                <td class="px-6 py-4"><span class="bg-green-100 text-green-800 px-2 py-1 rounded text-xs">✅ OK</span></td>
            </tr>
        `;
    });
    
    tbody.innerHTML = html;
}

function actualizarObjetivo(totalHoy) {
    const objetivo = 600;
    const progreso = Math.min((totalHoy / objetivo) * 100, 100);
    const faltante = Math.max(0, objetivo - totalHoy);
    
    document.getElementById('objetivo-actual').textContent = `S/ ${totalHoy.toFixed(2)}`;
    document.getElementById('objetivo-faltante').textContent = `S/ ${faltante.toFixed(2)}`;
    document.getElementById('objetivo-porcentaje').textContent = `${Math.round(progreso)}%`;
    document.getElementById('barra-progreso').style.width = `${progreso}%`;
    
    const barra = document.getElementById('barra-progreso');
    barra.className = progreso >= 80 ? 'bg-green-500 h-2 rounded-full transition-all' : 
                     progreso >= 50 ? 'bg-blue-500 h-2 rounded-full transition-all' : 
                     'bg-orange-500 h-2 rounded-full transition-all';
}

function actualizarHora() {
    const ahora = new Date();
    const hora = ahora.toLocaleTimeString('es', {hour: '2-digit', minute: '2-digit'});
    const fecha = ahora.toLocaleDateString('es', {day: '2-digit', month: 'short'});
    document.getElementById('fecha-hora').textContent = `🕐 ${hora} - ${fecha}`;
}

function logout() {
    if (confirm('¿Cerrar sesión?')) {
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

// Funciones de navegación simples
function verDetalleVentas(tipo) {
    // Redirigir a la página de historial
    window.location.href = 'historial.html';
}

// Función para exportar ventas a CSV
function exportarVentasCSV() {
    const todasVentas = JSON.parse(localStorage.getItem('bocettos_ventas') || '[]');
    const usuarioActual = JSON.parse(localStorage.getItem('bocettos_usuario'));
    
    // Filtrar ventas del usuario actual si no es admin
    let ventasParaExportar = todasVentas;
    if (usuarioActual.rol !== 'admin') {
        ventasParaExportar = todasVentas.filter(venta => venta.vendedor === usuarioActual.nombre);
    }
    
    if (ventasParaExportar.length === 0) {
        alert('No hay ventas para exportar');
        return;
    }
    
    // Crear header del CSV
    const header = [
        'Fecha', 'Hora', 'Cliente', 'Teléfono', 'Email', 'Dirección',
        'Canal de Venta', 'Tipo de Entrega', 'Tipo de Comprobante', 'Código de Tracking',
        'Producto', 'Cantidad', 'Precio Unitario', 'Método de Pago', 'Subtotal',
        'Total Venta', 'Vendedor'
    ];
    
    // Crear filas del CSV
    const filas = [];
    ventasParaExportar.forEach(venta => {
        venta.productos.forEach(producto => {
            const fila = [
                venta.fecha,
                venta.hora || '',
                venta.cliente,
                venta.telefono || '',
                venta.email || '',
                venta.direccion || '',
                venta.canalVenta || '',
                venta.tipoEntrega || '',
                venta.tipoComprobante || '',
                venta.codigoTracking || '',
                producto.nombre,
                producto.cantidad,
                producto.precio,
                producto.metodoPago,
                producto.subtotal,
                venta.total,
                venta.vendedor
            ];
            filas.push(fila);
        });
    });
    
    // Combinar header y filas
    const csvContent = [header, ...filas]
        .map(fila => fila.map(campo => {
            // Limpiar el campo y escapar comillas
            const valor = String(campo || '').replace(/"/g, '""');
            return `"${valor}"`;
        }).join(','))
        .join('\r\n');
    
    // Crear y descargar archivo con BOM UTF-8 para Excel
    const fecha = new Date().toISOString().split('T')[0];
    const nombreArchivo = usuarioActual.rol === 'admin' 
        ? `bocettos_ventas_todas_${fecha}.csv`
        : `bocettos_ventas_${usuarioActual.nombre}_${fecha}.csv`;
    
    // Agregar BOM UTF-8 para que Excel lo reconozca
    const BOM = '\uFEFF';
    const blob = new Blob([BOM + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    
    if (link.download !== undefined) {
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', nombreArchivo);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        // Mostrar notificación de éxito
        mostrarNotificacion(`✅ Archivo ${nombreArchivo} descargado exitosamente`, 'success');
    }
}

// Función para mostrar notificaciones
function mostrarNotificacion(mensaje, tipo = 'success') {
    const colores = {
        success: 'bg-green-500',
        error: 'bg-red-500',
        warning: 'bg-yellow-500'
    };
    
    const notificacion = document.createElement('div');
    notificacion.className = `fixed top-4 right-4 ${colores[tipo]} text-white px-6 py-3 rounded-lg shadow-lg z-50 transform transition-transform duration-300`;
    notificacion.textContent = mensaje;
    
    document.body.appendChild(notificacion);
    
    setTimeout(() => {
        notificacion.style.transform = 'translateX(100%)';
        setTimeout(() => {
            document.body.removeChild(notificacion);
        }, 300);
    }, 3000);
}