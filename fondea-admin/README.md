# Fondea Admin Panel

Panel de administración para gestionar productos, comisiones, descuentos y simular préstamos del sistema Fondea.

## Características

- ✅ Gestión completa de Productos
- ✅ Configuración de Montos y Plazos
- ✅ Definiciones de Fees (Comisiones)
- ✅ Configuración de Fees por Producto
- ✅ Definiciones de Descuentos
- ✅ Configuración de Descuentos por Producto
- ✅ Simulador de Préstamos con cálculo completo
- ✅ Filtros en tablas para búsqueda rápida
- ✅ Interfaz funcional y responsive
- ✅ Menú organizado por secciones con iconos

## Navegación

El menú lateral está organizado en 4 secciones claras:

### 🏠 Principal
- Dashboard
- Simulador

### 📦 Productos
- Productos
- Montos
- Plazos

### 💳 Comisiones (Fees)
- Definiciones
- Configuración

### 🎁 Descuentos
- Definiciones
- Configuración

## Requisitos

- Node.js 18+
- Backend API corriendo en `http://localhost:8080`

## Instalación

```bash
cd fondea-admin
npm install
```

## Configuración

La URL del backend se configura en `src/config/api.js`:

```javascript
const API_BASE_URL = 'http://localhost:8080/api';
```

## Ejecución

```bash
npm run dev
```

La aplicación estará disponible en `http://localhost:5173`

## Estructura del Proyecto

```
src/
├── config/          # Configuración de API
├── services/        # Servicios para llamadas HTTP
├── components/      # Componentes reutilizables
├── pages/           # Páginas de la aplicación
│   ├── Dashboard.jsx
│   ├── Products.jsx
│   ├── ProductAmounts.jsx
│   ├── ProductTerms.jsx
│   ├── FeeDefinitions.jsx
│   ├── ProductFeeConfigs.jsx
│   ├── DiscountDefinitions.jsx
│   ├── ProductDiscountConfigs.jsx
│   └── Simulator.jsx
└── App.jsx          # Configuración de rutas
```

## Uso

### Gestión de Productos

1. Navega a "Productos"
2. Crea productos con nombre y descripción
3. Los productos creados estarán disponibles para configuración

### Configuración de Montos y Plazos

1. Crea montos disponibles para cada producto
2. Define plazos con días y etiquetas descriptivas
3. Establece el orden de visualización

### Definiciones de Fees y Descuentos

1. Crea definiciones de fees con código único (ej: TECH_FEE)
2. Crea definiciones de descuentos con tipo y cálculo
3. Estas definiciones se usarán en las configuraciones

### Configuración por Producto

1. Asocia fees y descuentos a productos específicos
2. Define valores (porcentaje o monto fijo)
3. Selecciona montos y plazos aplicables
4. Usa filtros para encontrar configuraciones rápidamente

### Simulador

1. Selecciona un producto
2. Elige monto y plazo de las opciones disponibles
3. Indica si es primer préstamo
4. Obtén resultados detallados con:
   - Desglose de fees
   - Descuentos aplicados
   - Resumen financiero
   - Cronograma de pagos

## Tecnologías

- React 18
- React Router DOM
- Axios
- Vite
- CSS Modules

## Build para Producción

```bash
npm run build
```

Los archivos optimizados estarán en la carpeta `dist/`
