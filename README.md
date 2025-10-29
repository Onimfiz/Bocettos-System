# Sistema de Ventas BOCETTOS

## Descripción del Proyecto
Sistema web desarrollado para la gestión de ventas de la empresa BOCETTOS. Permite el registro de ventas, seguimiento de inventario y análisis de rendimiento en tiempo real.

## Características Principales
- 💼 Panel de control con métricas en tiempo real
- 📝 Formulario de registro de ventas
- 📊 Gráficos estadísticos de ventas semanales
- 🔍 Historial con sistema de filtros avanzados
- 📱 Diseño responsive para dispositivos móviles
- 📥 Exportación de datos a Excel

## Tecnologías Utilizadas
- HTML5, CSS3, JavaScript
- Tailwind CSS para estilos
- Chart.js para gráficos
- SweetAlert2 para notificaciones
- LocalStorage para persistencia de datos

## Estructura del Proyecto
```
PROYECTO-REAL/
├── index.html              # Página de login
├── src/
│   ├── dashboard.html      # Panel principal
│   ├── historial.html      # Historial de ventas
│   ├── formulario-ventas.html
│   ├── js/
│   │   ├── login.js
│   │   ├── dashboard.js
│   │   ├── historial.js
│   │   └── formulario-ventas.js
│   └── css/
│       └── styles.css
└── Bocettos.png           # Logo de la empresa
```

## Instalación y Uso
1. Clonar o descargar el proyecto
2. Abrir `index.html` en un navegador web moderno
3. Iniciar sesión con las credenciales:
   - **Admin**: usuario: `admin`, contraseña: `admin123`
   - **Gerente**: usuario: `gerente`, contraseña: `gerente123`
   - **Vendedor**: usuario: `vendedor1`, contraseña: `vendedor123`

## Funcionalidades por Rol

### Administrador
- Ver todas las ventas del sistema
- Exportar reportes a Excel
- Eliminar todos los datos
- Acceso completo al dashboard
- 
### Vendedor
- Ver solo sus propias ventas
- Registrar nuevas ventas
- Dashboard personalizado

## Desarrollo

### Proceso de Desarrollo
Este proyecto fue desarrollado siguiendo una metodología iterativa:
1. Diseño de wireframes y planificación
2. Desarrollo del sistema de autenticación
3. Implementación del dashboard con métricas
4. Creación del formulario de ventas
5. Desarrollo del historial con filtros
6. Optimización responsive
7. Testing y refinamiento

### Decisiones Técnicas
- **LocalStorage**: Elegido por su simplicidad y para funcionamiento offline
- **Tailwind CSS**: Framework CSS utility-first para desarrollo rápido
- **Chart.js**: Librería ligera para visualización de datos
- **SweetAlert2**: Modales elegantes para mejor UX

## Notas Importantes
- Los datos se almacenan localmente en el navegador
- Se recomienda exportar a Excel periódicamente como respaldo
- Compatible con Chrome, Firefox, Safari y Edge

## Autor
Desarrollado por [Francisco y Jorge]
Fecha: Octubre 2025

## Licencia
Proyecto académico
