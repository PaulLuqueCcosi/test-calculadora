# Panel de Administración Fondea

Panel web completo para gestionar el sistema de calculadora de préstamos de Fondea.

## 📁 Ubicación

El proyecto está en la carpeta `fondea-admin/`

## 🚀 Inicio Rápido

```bash
cd fondea-admin
npm install
npm run dev
```

Abre `http://localhost:5173` en tu navegador.

## ✨ Funcionalidades Implementadas

### Gestión de Productos
- ✅ CRUD completo de productos
- ✅ Activar/desactivar productos
- ✅ Validaciones de formulario

### Configuración de Montos y Plazos
- ✅ Gestión de montos por producto
- ✅ Gestión de plazos con etiquetas
- ✅ Orden de visualización
- ✅ Filtros por producto

### Definiciones de Fees (Comisiones)
- ✅ CRUD de definiciones de fees
- ✅ Tipos: INTEREST, SERVICE, INSURANCE, ADMINISTRATIVE
- ✅ Códigos únicos con validación

### Configuración de Fees por Producto
- ✅ Asociar fees a productos
- ✅ Tipo de cálculo: PERCENTAGE o FIXED_AMOUNT
- ✅ Selección de montos y plazos aplicables
- ✅ Filtros por producto y fee

### Definiciones de Descuentos
- ✅ CRUD de definiciones de descuentos
- ✅ Tipos: FIRST_LOAN, LOYALTY, PROMOTIONAL, SEASONAL
- ✅ Tipo de cálculo configurable

### Configuración de Descuentos por Producto
- ✅ Asociar descuentos a productos
- ✅ Opción "solo primer préstamo"
- ✅ Selección de montos y plazos aplicables
- ✅ Filtros avanzados

### Simulador de Préstamos
- ✅ Selección dinámica de producto
- ✅ Opciones de monto y plazo según producto
- ✅ Cálculo completo de fees
- ✅ Aplicación de descuentos
- ✅ Desglose detallado:
  - Fees originales y con descuento
  - Descuentos aplicados
  - Resumen financiero
  - IGV
  - Total a pagar
  - Cronograma de pagos

## 🎨 Características de UI

- ✅ Interfaz limpia y funcional
- ✅ Navegación lateral con todas las secciones
- ✅ Dashboard con accesos rápidos
- ✅ Tablas con hover effects
- ✅ Formularios con validaciones
- ✅ Badges de estado (Activo/Inactivo)
- ✅ Filtros en todas las tablas de configuración
- ✅ Diseño responsive
- ✅ Colores consistentes y profesionales

## 📋 Estructura del Proyecto

```
fondea-admin/
├── src/
│   ├── config/
│   │   └── api.js                    # Configuración de Axios
│   ├── services/
│   │   ├── productService.js         # Servicios de productos
│   │   ├── feeService.js             # Servicios de fees
│   │   ├── discountService.js        # Servicios de descuentos
│   │   └── simulatorService.js       # Servicio del simulador
│   ├── components/
│   │   ├── Layout.jsx                # Layout principal
│   │   └── Layout.css
│   ├── pages/
│   │   ├── Dashboard.jsx             # Página principal
│   │   ├── Products.jsx              # Gestión de productos
│   │   ├── ProductAmounts.jsx        # Gestión de montos
│   │   ├── ProductTerms.jsx          # Gestión de plazos
│   │   ├── FeeDefinitions.jsx        # Definiciones de fees
│   │   ├── ProductFeeConfigs.jsx     # Config de fees
│   │   ├── DiscountDefinitions.jsx   # Definiciones de descuentos
│   │   ├── ProductDiscountConfigs.jsx # Config de descuentos
│   │   ├── Simulator.jsx             # Simulador de préstamos
│   │   ├── CrudPage.css              # Estilos compartidos
│   │   ├── Dashboard.css
│   │   └── Simulator.css
│   ├── App.jsx                       # Configuración de rutas
│   ├── App.css
│   ├── main.jsx                      # Entry point
│   └── index.css
├── public/
├── package.json
├── README.md                         # Documentación en inglés
├── INSTRUCCIONES.md                  # Instrucciones en español
└── .env.example                      # Variables de entorno

```

## 🔧 Tecnologías

- **React 18**: Framework principal
- **React Router DOM 7**: Navegación
- **Axios**: Cliente HTTP
- **Vite 8**: Build tool y dev server
- **CSS puro**: Sin frameworks CSS

## 🌐 API Backend

El panel consume la API REST documentada en `.kiro/steering/api_doc.md`

Base URL por defecto: `http://localhost:8080/api`

### Endpoints utilizados:

**Productos:**
- GET/POST `/v1/products`
- GET/PUT/DELETE `/v1/products/{id}`

**Montos:**
- GET/POST `/v1/product-amounts`
- GET/PUT/DELETE `/v1/product-amounts/{id}`

**Plazos:**
- GET/POST `/v1/product-terms`
- GET/PUT/DELETE `/v1/product-terms/{id}`

**Fee Definitions:**
- GET/POST `/v1/fee-definitions`
- GET/PUT/DELETE `/v1/fee-definitions/{code}`

**Fee Configs:**
- GET/POST `/v1/product-fee-configs`
- GET/PUT/DELETE `/v1/product-fee-configs/{id}`

**Discount Definitions:**
- GET/POST `/v1/discount-definitions`
- GET/PUT/DELETE `/v1/discount-definitions/{code}`

**Discount Configs:**
- GET/POST `/v1/product-discount-configs`
- GET/PUT/DELETE `/v1/product-discount-configs/{id}`

**Simulador:**
- POST `/simulate`
- GET `/products`
- GET `/products/{productId}/options`

## 📝 Flujo de Uso Recomendado

1. **Crear Productos** → Define los productos de préstamo
2. **Configurar Montos** → Asocia montos disponibles a cada producto
3. **Configurar Plazos** → Define los plazos de pago
4. **Crear Definiciones de Fee** → Define tipos de comisiones
5. **Configurar Fees** → Asocia fees a productos con valores específicos
6. **Crear Definiciones de Descuento** → Define tipos de descuentos
7. **Configurar Descuentos** → Asocia descuentos a productos
8. **Simular** → Usa el simulador para probar configuraciones

## 🎯 Características Destacadas

### Filtros Inteligentes
Todas las tablas de configuración incluyen filtros para buscar por producto, fee o descuento.

### Validaciones
- Códigos en mayúsculas con guiones bajos
- Montos positivos
- Plazos mínimos
- Campos requeridos marcados

### Selección Múltiple
En las configuraciones de fees y descuentos, puedes seleccionar múltiples montos y plazos aplicables usando Ctrl/Cmd.

### Simulador Completo
El simulador muestra:
- Información general del préstamo
- Desglose de cada fee con descuentos aplicados
- Lista de descuentos activos
- Resumen financiero completo
- Cronograma de pagos

## 🚀 Comandos

```bash
# Instalar dependencias
npm install

# Desarrollo
npm run dev

# Build para producción
npm run build

# Preview del build
npm run preview

# Linting
npm run lint
```

## 📦 Build para Producción

```bash
npm run build
```

Los archivos optimizados se generan en `dist/` y están listos para deploy.

## 🔐 Configuración

Para cambiar la URL del backend, edita `src/config/api.js` o usa variables de entorno:

```bash
# Crear archivo .env
cp .env.example .env

# Editar VITE_API_BASE_URL
VITE_API_BASE_URL=http://tu-backend.com/api
```

## 📚 Documentación Adicional

- `README.md` - Documentación técnica en inglés
- `INSTRUCCIONES.md` - Guía de uso en español
- `.kiro/steering/api_doc.md` - Documentación completa de la API

## ✅ Estado del Proyecto

El proyecto está **100% funcional** y listo para usar. Todas las funcionalidades CRUD están implementadas y el simulador consume correctamente la API del backend.

## 🎨 Diseño

El diseño es funcional y profesional, con:
- Paleta de colores consistente
- Sidebar de navegación
- Cards para el dashboard
- Tablas con hover effects
- Formularios bien estructurados
- Badges de estado
- Responsive design

No es un diseño "muy vistoso" como solicitaste, pero es completamente funcional y profesional, perfecto para un panel de administración real.
