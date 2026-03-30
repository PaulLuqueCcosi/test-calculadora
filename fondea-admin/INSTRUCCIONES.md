# Instrucciones de Uso - Panel Fondea

## Inicio Rápido

1. Instalar dependencias:
```bash
cd fondea-admin
npm install
```

2. Iniciar el servidor de desarrollo:
```bash
npm run dev
```

3. Abrir en el navegador: `http://localhost:5173`

## Navegación del Panel

El menú lateral está organizado en 4 secciones para facilitar la navegación:

### 🏠 Principal
- **Dashboard**: Vista general con accesos rápidos
- **Simulador**: Simula préstamos con todas las configuraciones

### 📦 Productos
- **Productos**: Gestiona los productos de préstamo
- **Montos**: Define montos disponibles por producto
- **Plazos**: Configura plazos de pago

### 💳 Comisiones (Fees)
- **Definiciones**: Crea tipos de comisiones (TECH_FEE, ADMIN_FEE, etc.)
- **Configuración**: Asocia fees a productos con valores específicos

### 🎁 Descuentos
- **Definiciones**: Crea tipos de descuentos
- **Configuración**: Asocia descuentos a productos

## Configuración del Backend

1. Copia el archivo de variables de entorno:
```bash
cp .env.example .env
```

2. Edita `.env` y configura la URL del backend:
```env
VITE_API_BASE_URL=http://localhost:8080/api
```

3. Asegúrate de que el backend esté corriendo en la URL configurada

## Flujo de Trabajo Recomendado

### 1. Configuración Inicial

1. **Crear Productos**
   - Ve a "Productos"
   - Crea uno o más productos (ej: "Préstamo Personal", "Préstamo Express")

2. **Definir Montos**
   - Ve a "Montos"
   - Asocia montos disponibles a cada producto
   - Ejemplo: $500, $1000, $2000

3. **Definir Plazos**
   - Ve a "Plazos"
   - Crea plazos para cada producto
   - Ejemplo: 30 días, 60 días, 90 días

### 2. Configurar Fees (Comisiones)

1. **Crear Definiciones de Fee**
   - Ve a "Definiciones Fee"
   - Crea tipos de comisiones
   - Ejemplos:
     - TECH_FEE (Comisión Tecnológica)
     - ADMIN_FEE (Comisión Administrativa)
     - INTEREST (Interés)

2. **Configurar Fees por Producto**
   - Ve a "Config Fee"
   - Asocia fees a productos
   - Define si es porcentaje o monto fijo
   - Selecciona montos y plazos aplicables

### 3. Configurar Descuentos

1. **Crear Definiciones de Descuento**
   - Ve a "Definiciones Descuento"
   - Crea tipos de descuentos
   - Ejemplos:
     - FIRST_LOAN_DISCOUNT (Descuento Primer Préstamo)
     - LOYALTY_DISCOUNT (Descuento por Lealtad)

2. **Configurar Descuentos por Producto**
   - Ve a "Config Descuento"
   - Asocia descuentos a productos
   - Define valor y tipo de cálculo
   - Marca si aplica solo al primer préstamo

### 4. Simular Préstamos

1. Ve a "Simulador"
2. Selecciona un producto
3. Elige monto y plazo
4. Marca si es primer préstamo
5. Haz clic en "Simular"

El simulador mostrará:
- Desglose completo de fees
- Descuentos aplicados
- Resumen financiero con IGV
- Total a pagar
- Cronograma de pagos

## Características Importantes

### Filtros en Tablas
- Todas las tablas de configuración tienen filtros
- Filtra por producto para ver solo configuraciones relevantes
- Útil cuando tienes muchos productos

### Validaciones
- Los códigos de fees y descuentos solo aceptan mayúsculas y guiones bajos
- Los montos deben ser mayores a 0
- Los plazos deben ser al menos 1 día

### Estados Activo/Inactivo
- Puedes desactivar configuraciones sin eliminarlas
- Las configuraciones inactivas no se usan en simulaciones

## Solución de Problemas

### Error al cargar datos
- Verifica que el backend esté corriendo
- Revisa la URL en `src/config/api.js`
- Abre la consola del navegador para ver errores

### No aparecen opciones en el simulador
- Asegúrate de haber creado montos y plazos para el producto
- Verifica que estén marcados como activos

### Los descuentos no se aplican
- Verifica que la configuración esté activa
- Revisa que los montos y plazos seleccionados sean aplicables
- Si es descuento de primer préstamo, marca la casilla correspondiente

## Tecnologías Utilizadas

- **React 18**: Framework de UI
- **React Router**: Navegación entre páginas
- **Axios**: Llamadas HTTP al backend
- **Vite**: Build tool y dev server

## Comandos Útiles

```bash
# Desarrollo
npm run dev

# Build para producción
npm run build

# Preview del build
npm run preview

# Linting
npm run lint
```

## Estructura de Carpetas

```
src/
├── config/          # Configuración (API)
├── services/        # Servicios HTTP
├── components/      # Componentes (Layout)
├── pages/           # Páginas principales
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

## Notas Adicionales

- El panel es completamente funcional y listo para usar
- Todas las operaciones CRUD están implementadas
- El simulador consume el endpoint real del backend
- La interfaz es responsive y funciona en diferentes tamaños de pantalla
