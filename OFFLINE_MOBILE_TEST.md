# 📱 Guía de Prueba: Modo Offline en Móviles

## ✅ Verificación de Soporte Offline

CartBudget **SÍ soporta modo offline en móviles**. Aquí está cómo verificarlo:

## 🧪 Cómo Probar en Android

### 1. Desde Chrome
```
1. Abre http://localhost:3000 (o tu URL en producción)
2. Espera 10 segundos → Verás popup "Instalar CartBudget"
3. Toca "Instalar"
4. Se agregará a tu pantalla de inicio
```

### 2. Probar Offline
```
1. Abre Settings → Mobile Network (o WiFi)
2. Apaga la conexión o habilita "Airplane Mode"
3. Abre CartBudget desde el ícono en la pantalla de inicio
4. Verás notificación amarilla: "Modo offline - Los cambios se sincronizarán..."
5. Todas las funciones siguen funcionando:
   - Agregar productos ✅
   - Editar cantidad ✅
   - Cambiar presupuesto ✅
   - Eliminar productos ✅
```

### 3. Sincronización Online
```
1. Habilita conexión nuevamente
2. La notificación amarilla desaparece
3. Los cambios se sincronizan automáticamente
```

## 🧪 Cómo Probar en iOS (Safari)

### 1. Desde Safari
```
1. Abre http://localhost:3000
2. Toca el botón "Compartir" (cuadrado con flecha)
3. Busca "Agregar a pantalla de inicio"
4. Toca y agrega el nombre "CartBudget"
```

### 2. Probar Offline
```
1. Abre Settings → Airplane Mode → Activa
2. Abre CartBudget desde la pantalla de inicio
3. Verás notificación amarilla "Modo offline"
4. Funcionalidad completa disponible (igual que en Android)
```

### 3. Sincronización Online
```
1. Desactiva Airplane Mode
2. La app se sincroniza automáticamente
```

## 🔍 Verificación Técnica

### Service Worker Registrado
```
DevTools (F12) → Application → Service Workers
Deberías ver: "cartbudget-v1" con estado "activated and running"
```

### Caché Local
```
DevTools → Application → Cache Storage
Deberías ver: "cartbudget-v1" y "cartbudget-runtime-v1"
```

### localStorage
```
DevTools → Application → Local Storage
Deberías ver: "cartbudget_products" y "cartbudget_budget"
```

## 🚀 Características Offline en Móviles

| Característica | Android | iOS |
|---|---|---|
| Service Worker | ✅ | ⚠️ Limitado* |
| localStorage | ✅ | ✅ |
| Instalar App | ✅ | ✅ |
| Indicador Offline | ✅ | ✅ |
| Modo Offline Completo | ✅ | ✅ |

*iOS tiene soporte limitado de Service Worker en modo standalone

## 🔄 Flujo Offline (Diagrama)

```
┌─────────────────┐
│  App Instalada  │
│   en Móvil      │
└────────┬────────┘
         │
         ▼
┌─────────────────────────────────────┐
│  Usuario Activa Airplane Mode       │
└────────┬────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────┐
│  Indicador: "Modo offline"          │
│  Service Worker + localStorage      │
└────────┬────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────┐
│  Usuario edita datos:               │
│  • Agrega productos                 │
│  • Cambia presupuesto               │
│  • Edita cantidades                 │
└────────┬────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────┐
│  Datos guardados en localStorage    │
│  (100% funcional sin conexión)      │
└────────┬────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────┐
│  Usuario desactiva Airplane Mode    │
└────────┬────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────┐
│  Indicador desaparece               │
│  Datos sincronizados                │
│  App completamente online           │
└─────────────────────────────────────┘
```

## 📊 Verificación en DevTools (Desktop)

Para simular móvil en desktop:
```
1. F12 → Device Toggle Toolbar (Ctrl+Shift+M)
2. Network tab → Throttle to "Offline"
3. Refresca la página
4. Verás la app funcionando completamente sin conexión
```

## 🐛 Solucionar Problemas

### Service Worker no se registra
- Borra caché: DevTools → Application → Clear site data
- Cierra completamente la app
- Reabre y espera a que se registre

### App no funciona offline
- Verifica que se instaló como PWA (no solo marcapáginas)
- En Settings → App info → Datos de la app → Almacenamiento
- Asegúrate que hay espacio suficiente

### Datos no persisten
- Verifica localStorage en DevTools
- Revisa que no tengas "Block 3rd party cookies"
- En Android: Settings → Apps → CartBudget → Permissions

## 📱 Requerimientos Mínimos

| Sistema | Versión | Soporte |
|---|---|---|
| Android | 5.0+ | ✅ |
| iOS | 12.2+ | ✅ |
| Chrome | 40+ | ✅ |
| Safari | 12.2+ | ✅ |

## 🎯 Conclusión

**CartBudget funciona 100% offline en móviles** gracias a:
- ✅ Service Worker para cacheo
- ✅ localStorage para datos
- ✅ Detección automática de online/offline
- ✅ Sincronización al reconectar
- ✅ PWA instalable en Android e iOS

Los usuarios pueden:
1. Instalar como app nativa
2. Usarla sin conexión
3. Todos los datos se guardan localmente
4. Sincronización automática al conectarse
