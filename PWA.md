# CartBudget - Capacidades PWA y Modo Offline

## 🌐 Características PWA

CartBudget es una **Progressive Web App (PWA)** totalmente funcional que puede ser instalada como una aplicación nativa en dispositivos móviles.

### 1. Instalación de la App

#### En Android
- Abre CartBudget en Chrome
- Toca el ícono de "Instalar" o "Agregar a pantalla de inicio"
- Se agregará a tu pantalla de inicio como una app nativa

#### En iOS (Safari)
- Abre CartBudget en Safari
- Toca el botón "Compartir"
- Selecciona "Agregar a pantalla de inicio"
- Se agregará a tu pantalla de inicio

#### En Desktop (PWA Installer)
- Abre CartBudget en Chrome/Edge
- Haz clic en el ícono de "Instalar" en la barra de direcciones
- Se abrirá en una ventana dedicada

### 2. Modo Offline

CartBudget funciona completamente **sin conexión a internet**:

- ✅ Todos los datos se guardan localmente en `localStorage`
- ✅ La UI está completamente cacheada
- ✅ Todas las funciones funcionan offline
- ✅ Los cambios se sincronizan automáticamente cuando regresas online

#### Cómo Funciona el Offline

1. **Service Worker**: Se registra automáticamente en tu navegador
2. **Cacheo de Assets**: Todos los archivos estáticos (.js, .css, .html) se guardan en caché
3. **Sincronización Local**: Los datos se guardan en localStorage sin necesidad de conexión
4. **Indicador Visual**: Verás una notificación amarilla cuando estés offline

### 3. Almacenamiento de Datos

Los datos de CartBudget se almacenan en dos lugares:

#### localStorage Browser
- **Productos**: `cartbudget_products`
- **Presupuesto**: `cartbudget_budget`
- **Ventaja**: Accesible incluso sin Service Worker
- **Capacidad**: ~5-10 MB por dominio

### 4. Actualizaciones Automáticas

CartBudget detecta automáticamente cuando hay una versión nueva:

- Un notificador azul aparece mostrando "Actualización disponible"
- Puedes hacer clic en "Actualizar" para obtener la última versión
- O hacer clic en "Después" para actualizarla más tarde

### 5. Notificaciones del Sistema

#### Indicador Offline
```
┌─────────────────────────────────────────┐
│ Modo offline - Los cambios se            │
│ sincronizarán cuando regreses online    │
└─────────────────────────────────────────┘
```

#### Prompt de Instalación (después de 10 segundos)
```
┌─────────────────────────────────────────┐
│ Instalar CartBudget                     │
│ Acceso rápido desde tu home             │
│ [No]  [Instalar]                        │
└─────────────────────────────────────────┘
```

#### Notificación de Actualización
```
┌─────────────────────────────────────────┐
│ Actualización disponible                 │
│ Hay una nueva versión de CartBudget      │
│ [Después]  [Actualizar]                 │
└─────────────────────────────────────────┘
```

## 🔧 Configuración Técnica

### manifest.json
Define cómo aparece la app cuando se instala:
- Nombre completo: "CartBudget - Shopping Calculator"
- Nombre corto: "CartBudget"
- Tema: Azul (`#3b82f6`)
- Modo: "standalone" (se ve como app nativa)
- Íconos: Personalizados con logo "💲"

### Service Worker (sw.js)
Implementa las estrategias de cacheo:

#### Network First (para páginas HTML)
```
1. Intenta cargar desde la red
2. Si falla, carga desde caché
3. Si no hay caché, retorna página offline
```

#### Cache First (para assets estáticos)
```
1. Intenta cargar desde caché
2. Si no existe, carga desde la red
3. Guarda la nueva respuesta en caché
```

## 📱 Funcionalidades por Dispositivo

| Característica | Android | iOS | Desktop | Web |
|---|---|---|---|---|
| Instalación como App | ✅ | ✅ | ✅ | ❌ |
| Modo Offline | ✅ | ✅ | ✅ | ✅ |
| Service Worker | ✅ | ⚠️* | ✅ | ✅ |
| Push Notifications** | ✅ | ❌ | ✅ | ❌ |
| Home Icon | ✅ | ✅ | ✅ | N/A |

*iOS en Safari tiene soporte limitado de Service Worker
**No implementado actualmente en CartBudget

## 🚀 Flujo Offline Típico

```
1. Usuario abre CartBudget en la app instalada
   ↓
2. Aunque no hay conexión, la app carga normalmente
   ↓
3. El indicador amarillo muestra "Modo offline"
   ↓
4. Usuario agrega productos, edita cantidades, cambia presupuesto
   ↓
5. Todo se guarda en localStorage
   ↓
6. Cuando regresa online, la app sincroniza automáticamente
   ↓
7. El indicador desaparece
```

## 🔒 Privacidad y Seguridad

- ✅ **Sin datos en servidor**: Todo está guardado localmente
- ✅ **Sin cookies de tracking**: Solo localStorage esencial
- ✅ **Sin permiso de ubicación**: CartBudget no solicita acceso a ubicación
- ✅ **Sin cámara/micrófono**: CartBudget no accede a estos sensores
- ✅ **Datos protegidos**: localStorage está aislado por origen

## 🔄 Borrado de Datos

Los datos se eliminan en estos casos:
- El usuario borra datos del navegador/app
- El usuario desinstala la app
- El navegador no tiene espacio suficiente

**Nota**: CartBudget no tiene opción de "Exportar datos" o "Sincronizar a nube". Los datos se guardan **solo localmente**.

## 📊 Capacidad de Almacenamiento

| Navegador | Límite localStorage |
|---|---|
| Chrome/Edge | ~10 MB |
| Firefox | ~10 MB |
| Safari | ~5 MB |
| iOS Safari | ~5 MB |

CartBudget típicamente usa <1 MB incluso con 1000+ productos.

## 🐛 Solucionar Problemas

### Service Worker no se registra
```bash
# Borrar caché
Abre DevTools (F12) → Application → Storage → Clear site data
```

### App no aparece offline
- Verifica que el Service Worker esté registrado en DevTools
- Intenta desinstalar y reinstalar la app
- Borra el caché del navegador

### Los datos no se sincronizan
- Verifica que localStorage esté habilitado
- Abre DevTools → Console para ver errores
- Intenta cerrar y reabrir la app

## 🚀 Próximas Mejoras (Roadmap)

- [ ] Sincronización en la nube con autenticación opcional
- [ ] Exportar/importar datos como CSV
- [ ] Notificaciones push locales
- [ ] Sincronización entre dispositivos
- [ ] Respaldos automáticos

