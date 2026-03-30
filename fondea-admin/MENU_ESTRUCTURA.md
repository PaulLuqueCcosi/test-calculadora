# 📋 Estructura del Menú - Fondea Admin

## Organización Visual

```
┌─────────────────────────────┐
│     Fondea Admin            │
├─────────────────────────────┤
│                             │
│  PRINCIPAL                  │
│  🏠 Dashboard               │
│  🧮 Simulador               │
│                             │
│  PRODUCTOS                  │
│  📦 Productos               │
│  💰 Montos                  │
│  📅 Plazos                  │
│                             │
│  COMISIONES (FEES)          │
│  📋 Definiciones            │
│  ⚙️ Configuración           │
│                             │
│  DESCUENTOS                 │
│  🎁 Definiciones            │
│  🔧 Configuración           │
│                             │
└─────────────────────────────┘
```

## Descripción de Secciones

### 🏠 Principal
Acceso rápido a las funciones más usadas:
- **Dashboard**: Vista general del sistema
- **Simulador**: Herramienta principal para simular préstamos

### 📦 Productos
Gestión de productos y sus características:
- **Productos**: CRUD de productos de préstamo
- **Montos**: Montos disponibles por producto
- **Plazos**: Plazos de pago configurables

### 💳 Comisiones (Fees)
Configuración de comisiones del sistema:
- **Definiciones**: Tipos de fees (INTEREST, SERVICE, etc.)
- **Configuración**: Asociación de fees a productos

### 🎁 Descuentos
Gestión de descuentos y promociones:
- **Definiciones**: Tipos de descuentos (FIRST_LOAN, LOYALTY, etc.)
- **Configuración**: Asociación de descuentos a productos

## Flujo de Trabajo Recomendado

```
1. Productos → 2. Montos/Plazos → 3. Definiciones → 4. Configuración → 5. Simulador
```

1. Crea productos base
2. Define montos y plazos disponibles
3. Crea definiciones de fees y descuentos
4. Configura fees y descuentos por producto
5. Prueba con el simulador

## Características del Menú

✅ **Organizado por categorías** - Fácil de entender
✅ **Iconos visuales** - Identificación rápida
✅ **Indicador de página activa** - Sabes dónde estás
✅ **Hover effects** - Feedback visual
✅ **Scrollable** - Funciona con muchas opciones
✅ **Responsive** - Se adapta a diferentes pantallas

## Navegación Rápida

- El link activo se resalta en azul
- Hover sobre un link lo desplaza ligeramente a la derecha
- Los títulos de sección están en gris claro y mayúsculas
- Cada sección tiene separación visual clara
