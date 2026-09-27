# Arquitectura de la Solución - Dashboard Tarjetas

## 📋 Resumen General

Tu dashboard implementa **sincronización bidireccional** entre:
- **Cliente**: Dashboard HTML interactivo en tu navegador
- **Servidor**: Netlify Function que gestiona Google Sheets API
- **Datos**: Google Sheets con tus saldos de tarjetas

## 🏗️ Estructura de Archivos

```
dashboard-tarjetas/
├── dashboard-tarjetas-sync.html      ← El dashboard (cliente)
├── netlify.toml                      ← Configuración de build
├── package.json                      ← Dependencias npm
├── functions/
│   └── google-sheets.js              ← La función serverless (servidor)
└── .gitignore                        ← (optional) Archivos a ignorar en Git
```

## 🔄 Flujo de Sincronización

### ↑ Dashboard → Google Sheets (Envío)

```
1. Usuario registra pago en dashboard
   ↓
2. Datos se guardan en localStorage del navegador
   ↓
3. Usuario hace clic en "Enviar a Google Sheets"
   ↓
4. Dashboard hace POST a /.netlify/functions/google-sheets
   ↓
5. Función Netlify recibe los datos:
   - Autentica con Google usando credenciales de servicio
   - Actualiza fila 47 (TOTALES) en Google Sheets
   - Retorna confirmación
   ↓
6. Dashboard muestra ✅ "Sincronizado"
```

### ↓ Google Sheets → Dashboard (Carga)

```
1. Usuario hace clic en "Recargar desde Google Sheets"
   ↓
2. Dashboard hace GET a /.netlify/functions/google-sheets
   ↓
3. Función Netlify:
   - Autentica con Google
   - Lee fila 47 (TOTALES) de Google Sheets
   - Retorna valores JSON
   ↓
4. Dashboard actualiza con los valores nuevos
   ↓
5. Dashboard muestra ✅ "Sincronizado"
```

### ⏰ Auto-sincronización (Cada 5 minutos)

```
1. Dashboard se carga
   ↓
2. Automáticamente ejecuta GET cada 5 minutos
   ↓
3. Si los datos en Google Sheets cambiaron:
   - Dashboard se actualiza sin intervención del usuario
   ↓
4. Estado muestra si está:
   🟢 Sincronizado (datos actuales)
   🔵 Cargando... (en progreso)
   🟡 Sin sincronizar (próxima actualización en X minutos)
```

## 📄 Descripción de Archivos

### 1. `dashboard-tarjetas-sync.html` (Frontend)

**Qué hace:**
- Interfaz visual interactiva
- Registra pagos y gastos
- Muestra gráficos y tablas
- Gestiona sincronización con Google Sheets

**Características:**
- ✅ Almacenamiento local (localStorage) para datos offline
- ✅ Historial de transacciones
- ✅ Gráficos con Chart.js
- ✅ Botones de sincronización manual
- ✅ Auto-sync cada 5 minutos
- ✅ Indicadores de estado en tiempo real
- ✅ Responsive design (funciona en móvil)

**Variables importantes:**
```javascript
const NETLIFY_FUNCTION_URL = window.location.origin + '/.netlify/functions/google-sheets';
```
Apunta a tu función serverless. Se construye automáticamente desde tu URL de Netlify.

**Métodos principales:**
- `sincronizarGoogleSheets()` - Envía datos TO Google Sheets (POST)
- `cargarDesdeGoogleSheets()` - Carga datos FROM Google Sheets (GET)
- `iniciarAutoSync()` - Inicia auto-sync cada 5 minutos
- `guardarDatos()` - Guarda en localStorage
- `actualizarUI()` - Redibuja gráficos y datos

---

### 2. `functions/google-sheets.js` (Backend - Serverless)

**Qué hace:**
- Actúa como "proxy" seguro entre el navegador y Google Sheets
- Autentica con Google Sheets API usando credenciales de servicio
- Lee y escribe datos en Google Sheets

**Por qué necesita esto:**
- ❌ NO puedes llamar a Google Sheets API directamente desde el navegador (CORS)
- ✅ Netlify Functions corren en servidor (sin restricciones CORS)
- ✅ Más seguro: las credenciales nunca pasan por el navegador

**Configuración:**
```javascript
const SHEET_ID = '1AZsOGPn9la37_Pqq6zRy3f9E8gaFFlkMl4djKnqGij4';  // Tu archivo
const SHEET_NAME = 'Tarjetas';                                    // Tu pestaña
const TOTAL_ROW = 47;                                              // Fila con totales
```

**Mapeo de columnas:**
```javascript
const columnMap = {
  'BBVA': 'B',       // Columna B
  'Liverpool': 'C',  // Columna C
  'MP': 'D',         // Columna D
  'PDH': 'E',        // Columna E
  'Efectivo': 'F'    // Columna F
};
```

**Métodos:**
- `getAuthClient()` - Crea cliente autenticado con credenciales de Google
- `readFromSheets()` - Lee datos de Google Sheets
- `writeToSheets()` - Escribe datos a Google Sheets
- `handler()` - Maneja peticiones HTTP (GET/POST)

**Peticiones HTTP:**

```
GET /.netlify/functions/google-sheets
├─ Retorna: { success: true, BBVA: 1000, Liverpool: 500, ... }
└─ Usado por: cargarDesdeGoogleSheets()

POST /.netlify/functions/google-sheets
├─ Body: { BBVA: 1000, Liverpool: 500, MP: 2000, PDH: 1500, Efectivo: 300 }
├─ Retorna: { success: true, message: "Sincronizado..." }
└─ Usado por: sincronizarGoogleSheets()
```

---

### 3. `netlify.toml` (Configuración)

**Qué hace:**
- Configura Netlify para reconocer y ejecutar tus funciones serverless
- Define el proceso de build y despliegue

**Contenido:**
```toml
[build]
  command = "echo 'Build complete'"  # No hay build (es HTML estático)
  functions = "functions"            # Dónde están las funciones serverless
  publish = "."                       # Publicar desde raíz (el HTML)

[dev]
  framework = "static"               # Framework tipo
  targetPort = 3000                  # Puerto local para testing
  port = 8888                        # Puerto de Netlify CLI
```

---

### 4. `package.json` (Dependencias)

**Qué hace:**
- Define las librerías que necesita tu función Netlify
- Netlify automáticamente ejecuta `npm install` durante el build

**Dependencia única:**
```json
"googleapis": "^118.0.0"  // Google Sheets API v4
```

Esta librería permite a `functions/google-sheets.js` comunicarse con Google Sheets.

---

## 🔐 Seguridad

### ✅ Lo que está seguro:

1. **Credenciales protegidas**
   - No están en el código HTML
   - Se guardan como variable de entorno en Netlify
   - Solo accesibles en el servidor (función)

2. **CORS manejado correctamente**
   - Headers CORS configurados en la función
   - Permite requests desde tu dominio

3. **Validación de datos**
   - Convertidos a números flotantes
   - Valores por defecto si hay error

### ⚠️ Lo que debes hacer:

1. **Nunca** subas `GOOGLE_SHEETS_CREDENTIALS` en el código
2. **Siempre** usa variables de entorno de Netlify
3. **Mantén privado** el repositorio si prefieres
4. **Haz backup** de tus credenciales JSON originales

---

## 🚀 Flujo de Despliegue

```
1. Creas carpeta con archivos
   ↓
2. Subes a GitHub (o despliegue manual)
   ↓
3. Conectas a Netlify
   ↓
4. Agregas variable de entorno GOOGLE_SHEETS_CREDENTIALS
   ↓
5. Netlify automáticamente:
   - Descarga tu código
   - Ejecuta `npm install` (descarga googleapis)
   - Construye `functions/google-sheets.js`
   - Publica tu HTML
   ↓
6. Tu dashboard está VIVO en https://tudominio.netlify.app
```

---

## 📊 Estructura de Datos en Google Sheets

El código espera este formato en tu Google Sheets:

```
Fila 47 (TOTAL):
┌─────────────┬───────┬───────────┬────────┬────────┬──────────┐
│   Nombre    │   B   │     C     │   D    │   E    │    F     │
├─────────────┼───────┼───────────┼────────┼────────┼──────────┤
│   BBVA      │ 1000  │ Liverpool │ 1500   │  MP    │    800   │
│   ...       │ ...   │    ...    │  ...   │  ...   │   ...    │
│   TOTAL     │ 1000  │   1500    │  800   │ 2000   │   300    │  ← Fila 47
└─────────────┴───────┴───────────┴────────┴────────┴──────────┘
```

Si tu estructura es diferente:
- Cambia `TOTAL_ROW` en `functions/google-sheets.js`
- Cambia `columnMap` si tus tarjetas están en otras columnas

---

## 🔧 Configuración Personalizada

### Si tu fila de totales es otra:
Edita `functions/google-sheets.js`:
```javascript
const TOTAL_ROW = 50;  // Cambiar a tu fila
```

### Si tus tarjetas están en otras columnas:
```javascript
const columnMap = {
  'BBVA': 'A',        // Cambiar a tu columna
  'Liverpool': 'B',
  'MP': 'C',
  'PDH': 'D',
  'Efectivo': 'E'
};
```

### Si tu hoja tiene otro nombre:
```javascript
const SHEET_NAME = 'Deudas';  // Cambiar a tu nombre
```

---

## 📱 Características del Dashboard

- **Registrar Pagos**: Ingresa cantidad y selecciona tarjeta
- **Registrar Gastos**: Ingresa gasto con descripción
- **Historial**: Ve todas tus transacciones
- **Gráficos**: Visualiza deuda por tarjeta
- **Tabla Resumen**: Ve todos los saldos en una tabla
- **Sincronización**: Manual (botones) + Automática (5 minutos)
- **Estado**: Indicador visual de sincronización
- **Responsive**: Funciona en cualquier dispositivo

---

## ✅ Verificación Post-Despliegue

Después de desplegar a Netlify:

1. **Verifica que la URL funciona**
   - Abre `https://tudominio.netlify.app`
   - Deberías ver el dashboard

2. **Prueba sincronización de lectura**
   - Haz clic en "⬇ Recargar desde Google Sheets"
   - Deberían aparecer tus datos

3. **Prueba sincronización de escritura**
   - Registra un pago
   - Haz clic en "⬆ Enviar a Google Sheets"
   - Verifica en Google Sheets que cambió el valor

4. **Prueba auto-sync**
   - Cambia un valor en Google Sheets
   - Espera 5 minutos (o haz click en Recargar)
   - El dashboard debería actualizarse

5. **Abre consola (F12)**
   - Busca errores en la pestaña "Console"
   - Debería mostrar "Datos sincronizados correctamente"

---

## 🎯 Resumen

| Componente | Rol | Ubicación |
|---|---|---|
| **HTML Dashboard** | Interfaz usuario | Cliente (navegador) |
| **JavaScript (fetch)** | Conecta con servidor | Cliente (navegador) |
| **Netlify Function** | Proxy seguro a Google | Servidor (Netlify) |
| **Google Sheets API** | Almacenamiento datos | Google Cloud |

**Flujo completo:**
```
Usuario → Dashboard → Netlify Function → Google Sheets API → Google Sheets
```

¡Listo para desplegar! 🚀
