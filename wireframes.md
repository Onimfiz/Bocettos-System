# Wireframe: Dashboard Principal - Bocettos Sales System

## Descripción
Pantalla principal del sistema que muestra métricas clave, gráficos de ventas por ubicación, productos más vendidos y últimas transacciones.

## Elementos Principales
1. **Header**: Navegación, selector de ubicación, botón de nueva venta
2. **Tarjetas de Métricas**: Ventas del día, total general, productos vendidos, clientes únicos
3. **Gráfico de Barras**: Ventas por ubicación (Tienda, Facebook, Instagram)
4. **Top Productos**: Lista de los 5 productos más vendidos
5. **Últimas Ventas**: Tabla con las transacciones recientes
6. **Acciones**: Botones de Exportar/Importar datos


-------------------------------------------------------------------------------------------------------

## Librerías a utilizar
1. **chart.js**: para gráficos
2. **lucide react**: para iconos
3. **date-fns**: para manejo de fechas
4. **paparse**: para importación/exportación de CSV
5. **localforage**: para almacenamiento local o localStorage para datos simples
6. **React Hot Toast**: para notificaciones
7. **Framer Motion**: para animaciones
8. **Firebase SDK**: para autenticación y base de datos

-------------------------------------------------------------------------------------------------------
## Selección de Librerías

### Chart.js v4.4.0
- **Propósito:** Visualización de estadísticas (gráficos de barras, líneas)
- **Justificación:** Librería estándar de la industria, fácil de usar, responsive
- **Uso:** Dashboard de ventas por ubicación, productos más vendidos
- **Tamaño:** 60KB (ligera)

### Lucide React v0.263.1
- **Propósito:** Iconografía moderna
- **Justificación:** +1000 iconos, tree-shakeable, estilo consistente
- **Uso:** Botones, indicadores, navegación
- **Tamaño:** Solo importas lo que usas (~2KB por icono)

### PapaParse v5.4.1
- **Propósito:** Exportar/Importar archivos CSV
- **Justificación:** Estándar para CSV, maneja casos complejos
- **Uso:** Exportar ventas, importar datos de otras ubicaciones
- **Tamaño:** 45KB

### date-fns v2.30.0
- **Propósito:** Formateo y cálculos de fechas
- **Justificación:** Ligera, modular, mejor que Moment.js
- **Uso:** Filtros por fecha, formateo de timestamps
- **Tamaño:** Tree-shakeable (solo usas lo necesario)

### React Hot Toast v2.4.1
- **Propósito:** Notificaciones al usuario
- **Justificación:** Simple, bonita, sin configuración compleja
- **Uso:** Confirmaciones de guardado, errores, sincronización
- **Tamaño:** 3KB

### Framer Motion v10.16.0
- **Propósito:** Animaciones y transiciones
- **Justificación:** API declarativa, fácil para React
- **Uso:** Transiciones de página, aparición de modales, feedback visual
- **Tamaño:** 80KB (justificado por calidad de animaciones)

### Firebase v10.5.0 (Opcional)
- **Propósito:** Sincronización en tiempo real multi-dispositivo
- **Justificación:** Solución completa, gratis hasta 50k ops/día
- **Uso:** Compartir datos entre 3+ dispositivos
- **Nota:** Solo si el cliente aprueba uso multi-dispositivo