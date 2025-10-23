let usuario = null;
let ventas = [];
let graficoSemanal = null;

window.addEventListener('load', function() {
    inicializar();
});

function inicializar() {
    const sesion = localStorage.getItem('bocettos_usuario');
    if (!sesion) {
        window.location.href = 'login.html';
        return;
    }
    
    usuario = JSON.parse(sesion);
    mostrarUsuario();
    cargarVentas();
    actualizarDatos();
    
    document.getElementById('logout-btn').addEventListener('click', logout);
    setInterval(actualizarDatos, 30000);
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
    const hoy = new Date().toDateString();
    
    // Ventas de hoy
    const ventasHoy = ventas.filter(v => new Date(v.fecha).toDateString() === hoy);
    const totalHoy = ventasHoy.reduce((sum, v) => sum + v.total, 0);
    
    // Productos de hoy
    const productosHoy = ventasHoy.reduce((sum, v) => 
        sum + v.productos.reduce((pSum, p) => pSum + p.cantidad, 0), 0);
    
    // Clientes únicos
    const clientesHoy = new Set(ventasHoy.map(v => v.cliente)).size;
    
    // Total del mes
    const mesActual = new Date().getMonth();
    const ventasMes = ventas.filter(v => new Date(v.fecha).getMonth() === mesActual);
    const totalMes = ventasMes.reduce((sum, v) => sum + v.total, 0);
    
    // Actualizar interfaz
    document.getElementById('ventas-hoy').textContent = `S/ ${totalHoy.toFixed(2)}`;
    document.getElementById('ventas-mes').textContent = `S/ ${totalMes.toFixed(2)}`;
    document.getElementById('productos-hoy').textContent = productosHoy;
    document.getElementById('clientes-unicos').textContent = clientesHoy;
    
    // Gráfico semanal simple
    mostrarGraficoSemanal();
    
    // Top productos
    mostrarTopProductos();
    
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
        
        const ventasDia = ventas.filter(v => 
            new Date(v.fecha).toDateString() === fecha.toDateString()
        );
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

function mostrarTopProductos() {
    const productos = {};
    ventas.forEach(v => {
        v.productos.forEach(p => {
            productos[p.nombre] = (productos[p.nombre] || 0) + p.cantidad;
        });
    });
    
    const top = Object.entries(productos)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5);
    
    const emojis = ['🥇', '🥈', '🥉', '4️⃣', '5️⃣'];
    let html = '';
    
    top.forEach(([nombre, cantidad], i) => {
        html += `
            <div class="flex items-center justify-between p-3 bg-gray-50 rounded">
                <div class="flex items-center space-x-3">
                    <span>${emojis[i]}</span>
                    <div>
                        <div class="font-medium">${nombre}</div>
                        <div class="text-sm text-gray-500">${cantidad} uds.</div>
                    </div>
                </div>
            </div>
        `;
    });
    
    document.getElementById('top-productos').innerHTML = html || 
        '<div class="text-center py-4 text-gray-500">Sin productos aún</div>';
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
        const hora = new Date(v.fecha).toLocaleTimeString('es', {hour: '2-digit', minute: '2-digit'});
        const producto = v.productos[0].nombre + (v.productos.length > 1 ? ' +más' : '');
        const cantidad = v.productos.reduce((sum, p) => sum + p.cantidad, 0);
        
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
        window.location.href = 'login.html';
    }
}

// Funciones de navegación simples
function verDetalleVentas(tipo) {
    window.location.href = 'historial.html';
}

function verAnalisisCompleto() {
    alert('Función disponible próximamente');
}