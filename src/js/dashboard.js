let usuario = null;
let ventas = [];
let graficoSemanal = null;

window.addEventListener('load', inicializar);

function inicializar() {
    const sesion = localStorage.getItem('bocettos_usuario');
    if (!sesion) {
        window.location.href = '../index.html';
        return;
    }
    usuario = JSON.parse(sesion);
    mostrarUsuario();
    cargarVentas();
    actualizarDatos();
    document.getElementById('logout-btn')?.addEventListener('click', logout);
    document.getElementById('exportar-csv-btn')?.addEventListener('click', exportarVentasCSV);
    document.getElementById('historial-btn')?.addEventListener('click', () => window.location.href = 'historial.html');
    setInterval(actualizarDatos, 30000);
}

function mostrarClientesVIP() {
    const clientesStats = analizarClientes();
    const topCompras = clientesStats.sort((a, b) => b.compras - a.compras).slice(0, 5);
    
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
                <div class="font-bold text-gray-900">$${cliente.total.toLocaleString()}</div>
                <div class="text-xs text-gray-500">Total gastado</div>
            </div>
        </div>
    `).join('');
    
    const topMonto = clientesStats.sort((a, b) => b.total - a.total).slice(0, 5);
    
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
                <div class="font-bold text-gray-900">$${cliente.total.toLocaleString()}</div>
                <div class="text-xs text-gray-500">${cliente.compras} compra${cliente.compras > 1 ? 's' : ''}</div>
            </div>
        </div>
    `).join('');
    
    const topComprasElement = document.getElementById('top-clientes-compras');
    const topMontoElement = document.getElementById('top-clientes-monto');
    
    if (topComprasElement) {
        topComprasElement.innerHTML = htmlCompras || '<div class="text-center py-4 text-gray-500">Sin datos de clientes aún</div>';
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
        
        if (venta.fecha > stats.ultimaCompra) {
            stats.ultimaCompra = venta.fecha;
        }
    });
    return Array.from(clientesMap.values()).map(cliente => ({
        ...cliente,
        promedio: cliente.total / cliente.compras
    }));
}

function mostrarAnalisisProductos() {
    const productosStats = analizarProductos();
    const topProductos = productosStats.sort((a, b) => b.cantidadVendida - a.cantidadVendida).slice(0, 5);
    
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
                <div class="font-bold text-gray-900">$${producto.ingresoTotal.toLocaleString()}</div>
                <div class="text-xs text-gray-500">${producto.ventasCount} ventas</div>
            </div>
        </div>
    `).join('');
    
    const productosElement = document.getElementById('top-productos');
    if (productosElement) {
        productosElement.innerHTML = html || '<div class="text-center py-4 text-gray-500">Sin datos de productos aún</div>';
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
    
    // Ventas de ayer
    const ayer = new Date();
    ayer.setDate(ayer.getDate() - 1);
    const ayerStr = `${ayer.getFullYear()}-${String(ayer.getMonth() + 1).padStart(2, '0')}-${String(ayer.getDate()).padStart(2, '0')}`;
    const ventasAyer = ventas.filter(v => v.fecha === ayerStr);
    const totalAyer = ventasAyer.reduce((sum, v) => sum + v.total, 0);
    const variacionHoy = totalAyer > 0 ? ((totalHoy - totalAyer) / totalAyer * 100) : 0;
    
    // Productos de hoy
    const productosHoy = ventasHoy.reduce((sum, v) => 
        sum + v.productos.reduce((pSum, p) => pSum + p.cantidad, 0), 0);
    
    // Clientes únicos
    const clientesHoy = new Set(ventasHoy.map(v => v.cliente)).size;
    
    // Total del mes
    const fechaActual = new Date();
    const mesActual = fechaActual.getMonth();
    const añoActual = fechaActual.getFullYear();
    
    const ventasMes = ventas.filter(v => {
        if (!v.fecha) return false;
        const partesFecha = v.fecha.split('-');
        if (partesFecha.length !== 3) return false;
        const añoVenta = parseInt(partesFecha[0]);
        const mesVenta = parseInt(partesFecha[1]) - 1;
        return mesVenta === mesActual && añoVenta === añoActual;
    });
    const totalMes = ventasMes.reduce((sum, v) => sum + v.total, 0);
    
    // Ventas del mes anterior
    const mesAnterior = mesActual === 0 ? 11 : mesActual - 1;
    const añoMesAnterior = mesActual === 0 ? añoActual - 1 : añoActual;
    const ventasMesAnterior = ventas.filter(v => {
        if (!v.fecha) return false;
        const partesFecha = v.fecha.split('-');
        if (partesFecha.length !== 3) return false;
        const añoVenta = parseInt(partesFecha[0]);
        const mesVenta = parseInt(partesFecha[1]) - 1;
        return mesVenta === mesAnterior && añoVenta === añoMesAnterior;
    });
    const totalMesAnterior = ventasMesAnterior.reduce((sum, v) => sum + v.total, 0);
    const variacionMes = totalMesAnterior > 0 ? ((totalMes - totalMesAnterior) / totalMesAnterior * 100) : 0;
    
    // Actualizar interfaz
    const ventasHoyElement = document.getElementById('ventas-hoy');
    const ventasMesElement = document.getElementById('ventas-mes');
    const productosHoyElement = document.getElementById('productos-hoy');
    const clientesUnicosElement = document.getElementById('clientes-unicos');
    const variacionHoyElement = document.getElementById('variacion-hoy');
    const variacionMesElement = document.getElementById('variacion-mes');
    
    if (ventasHoyElement) ventasHoyElement.textContent = `S/ ${totalHoy.toFixed(2)}`;
    if (ventasMesElement) ventasMesElement.textContent = `S/ ${totalMes.toFixed(2)}`;
    if (productosHoyElement) productosHoyElement.textContent = productosHoy;
    if (clientesUnicosElement) clientesUnicosElement.textContent = clientesHoy;
    
    if (variacionHoyElement) {
        const icono = variacionHoy >= 0 ? '📈' : '📉';
        const color = variacionHoy >= 0 ? 'text-green-500' : 'text-red-500';
        variacionHoyElement.innerHTML = `<span class="${color}">${icono} ${variacionHoy >= 0 ? '+' : ''}${variacionHoy.toFixed(1)}%</span> vs ayer`;
    }
    
    if (variacionMesElement) {
        const icono = variacionMes >= 0 ? '📈' : '📉';
        const color = variacionMes >= 0 ? 'text-green-500' : 'text-red-500';
        variacionMesElement.innerHTML = `<span class="${color}">${icono} ${variacionMes >= 0 ? '+' : ''}${variacionMes.toFixed(1)}%</span> vs anterior`;
    }
    
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
    Swal.fire({
        title: '¿Cerrar sesión?',
        icon: 'question',
        showCancelButton: true,
        confirmButtonColor: '#4a4a4b',
        cancelButtonColor: '#6b7280',
        confirmButtonText: 'Aceptar',
        cancelButtonText: 'Cancelar'
    }).then((result) => {
        if (result.isConfirmed) {
            localStorage.removeItem('bocettos_usuario');
            window.location.href = '../index.html';
        }
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

function exportarVentasCSV() {
    const todasVentas = JSON.parse(localStorage.getItem('bocettos_ventas') || '[]');
    const usuarioActual = JSON.parse(localStorage.getItem('bocettos_usuario'));
    
    let ventasParaExportar = todasVentas;
    if (usuarioActual.rol !== 'admin') {
        ventasParaExportar = todasVentas.filter(venta => venta.vendedor === usuarioActual.nombre);
    }
    
    if (ventasParaExportar.length === 0) {
        alert('No hay ventas para exportar');
        return;
    }
    
    const datosExcel = [];
    ventasParaExportar.forEach(venta => {
        venta.productos.forEach(producto => {
            datosExcel.push({
                'Fecha': venta.fecha,
                'Hora': venta.hora || '',
                'Cliente': venta.cliente,
                'Teléfono': venta.telefono || '',
                'Email': venta.email || '',
                'Dirección': venta.direccion || '',
                'Canal de Venta': venta.canalVenta || '',
                'Tipo de Entrega': venta.tipoEntrega || '',
                'Tipo de Comprobante': venta.tipoComprobante || '',
                'Código de Tracking': venta.codigoTracking || '',
                'Producto': producto.nombre,
                'Cantidad': producto.cantidad,
                'Precio Unitario': producto.precio,
                'Método de Pago': producto.metodoPago,
                'Subtotal': producto.subtotal,
                'Total Venta': venta.total,
                'Vendedor': venta.vendedor
            });
        });
    });
    
    const ws = XLSX.utils.json_to_sheet(datosExcel);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Ventas');
    
    const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
    
    const fecha = new Date().toISOString().split('T')[0];
    const nombreArchivo = usuarioActual.rol === 'admin' 
        ? `bocettos_ventas_todas_${fecha}.xlsx`
        : `bocettos_ventas_${usuarioActual.nombre}_${fecha}.xlsx`;
    
    const blob = new Blob([wbout], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = nombreArchivo;
    link.click();
    URL.revokeObjectURL(url);
    
    mostrarNotificacion(`✅ Archivo ${nombreArchivo} descargado exitosamente`, 'success');
}

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