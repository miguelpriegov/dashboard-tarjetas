# Instrucciones para Desplegar a Netlify

Tu dashboard ahora usa **Google Sheets API + Netlify Functions** para sincronización bidireccional completa, sin problemas de CORS.

## Archivos que necesitas

Asegúrate de tener estos archivos en tu carpeta de proyecto:

```
proyecto/
├── dashboard-tarjetas-sync.html    (el dashboard)
├── netlify.toml                     (configuración de Netlify)
├── package.json                     (dependencias)
└── functions/
    └── google-sheets.js             (función serverless)
```

## Paso 1: Crear repositorio en GitHub

### Opción A: Desde la terminal (si tienes Git instalado)

```bash
cd /ruta/a/tu/proyecto
git init
git add .
git commit -m "Initial commit: Dashboard con sincronización Netlify"
git branch -M main
git remote add origin https://github.com/TU_USUARIO/dashboard-tarjetas.git
git push -u origin main
```

### Opción B: Crear el repositorio directamente en GitHub

1. Ve a https://github.com/new
2. Nombre del repositorio: `dashboard-tarjetas`
3. Descripción: "Dashboard de Tarjetas con Sincronización Google Sheets"
4. Selecciona "Public" (opcional, puede ser Private)
5. Haz clic en "Create repository"
6. Sigue las instrucciones para subir tus archivos

## Paso 2: Conectar a Netlify

### Opción 1: Depliegue automático desde GitHub (Recomendado)

1. Ve a https://app.netlify.com
2. Si no tienes cuenta, crea una (puedes usar tu email o GitHub)
3. Haz clic en "New site from Git"
4. Selecciona "GitHub"
5. Autoriza Netlify a acceder a tu GitHub
6. Selecciona el repositorio `dashboard-tarjetas`
7. Haz clic en "Deploy site"

### Opción 2: Despliegue manual (si no usas GitHub)

1. Ve a https://app.netlify.com
2. Haz clic en "Add new site" → "Deploy manually"
3. Arrastra tu carpeta de proyecto a la ventana
4. ¡Listo! Tu sitio se desplegará

## Paso 3: Configurar la Variable de Entorno

**MUY IMPORTANTE:** Sin esto, la sincronización NO funcionará.

1. En el panel de Netlify, ve a tu sitio
2. Ve a **Settings** → **Environment variables** (o "Build & deploy" → "Environment")
3. Haz clic en **Add environment variable**
4. Rellena:
   - **Key**: `GOOGLE_SHEETS_CREDENTIALS`
   - **Value**: Pega TODO el contenido del archivo JSON de credenciales que descargaste de Google Cloud

El JSON completo debe verse así:
```json
{
  "type": "service_account",
  "project_id": "gold-chess-509922-f5",
  "private_key_id": "abc123...",
  "private_key": "-----BEGIN PRIVATE KEY-----\n...",
  "client_email": "dashboard-bot@gold-chess-509922-f5.iam.gserviceaccount.com",
  "client_id": "123456789",
  "auth_uri": "https://accounts.google.com/o/oauth2/auth",
  "token_uri": "https://oauth2.googleapis.com/token",
  "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
  "client_x509_cert_url": "https://www.googleapis.com/robot/v1/metadata/x509/..."
}
```

5. Haz clic en **Save**

## Paso 4: Redesplegar (si es necesario)

Si ya desplegaste ANTES de agregar la variable de entorno:

1. Ve a **Deployments** en Netlify
2. Busca el último deploy
3. Haz clic en los tres puntos (...) 
4. Selecciona **Redeploy**

## Paso 5: Probar el Dashboard

1. Copia la URL de tu sitio Netlify (algo como `https://dashboard-tarjetas-xyz.netlify.app`)
2. Abre la URL en tu navegador
3. Prueba estos pasos:

### Prueba 1: Cargar datos desde Google Sheets
- Haz clic en **"⬇ Recargar desde Google Sheets"**
- Deberías ver los valores de tu Google Sheets cargados en el dashboard
- Si ves un ✓ verde, ¡funciona!

### Prueba 2: Enviar datos a Google Sheets
- Registra un pago en el dashboard (cualquier cantidad)
- Haz clic en **"⬆ Enviar a Google Sheets"**
- Abre tu Google Sheets en otra pestaña y verifica que se actualizó

### Prueba 3: Auto-sincronización
- Cambia un valor directamente en tu Google Sheets
- El dashboard se actualizará automáticamente en **5 minutos**
- (Puedes hacer clic en "Recargar" para forzar la actualización inmediata)

## Solución de Problemas

### ❌ "Error de conexión con Google Sheets"

**Causa 1:** La variable de entorno no está configurada
- Verifica que `GOOGLE_SHEETS_CREDENTIALS` esté en Settings → Environment variables
- Copia TODO el contenido JSON (incluyendo las líneas de `private_key`)
- Haz clic en "Redeploy" después de guardar

**Causa 2:** El ID de Sheet es incorrecto
- Abre `functions/google-sheets.js` en tu editor
- Verifica la línea: `const SHEET_ID = '1AZsOGPn9la37_Pqq6zRy3f9E8gaFFlkMl4djKnqGij4';`
- Si tu Sheet tiene otro ID, cámbialo:
  1. Abre tu Google Sheets
  2. La URL es algo como: `https://docs.google.com/spreadsheets/d/1AZsOGPn9la37_Pqq6zRy3f9E8gaFFlkMl4djKnqGij4/edit`
  3. Copia el número (entre `/d/` y `/edit`)
  4. Reemplázalo en el código y haz push a GitHub (Netlify se redespliegue automáticamente)

**Causa 3:** El nombre de la hoja es incorrecto
- En `functions/google-sheets.js`, verifica: `const SHEET_NAME = 'Tarjetas';`
- Asegúrate que la pestaña en tu Google Sheets se llame exactamente "Tarjetas"
- Si es diferente, cámbialo en el código

**Causa 4:** El número de fila es incorrecto
- En `functions/google-sheets.js`, verifica: `const TOTAL_ROW = 47;`
- Abre tu Google Sheets y busca la fila con los TOTALES
- Si es otra fila, actualiza el número

### ❌ "Error 403: Permission denied"

- La cuenta de servicio no tiene acceso al Sheet
- Ve a tu Google Sheets
- Comparte la carpeta/archivo con: `dashboard-bot@gold-chess-509922-f5.iam.gserviceaccount.com` (o el que veas en tus credenciales)
- Dale permiso de "Editor"

### ❌ El dashboard muestra valores de ejemplo pero no se sincroniza

- Abre la consola del navegador (F12 → Pestaña Console)
- Haz clic en "Recargar desde Google Sheets"
- Busca mensajes de error en la consola
- Cópialos y verifica contra las causas arriba

## Notas Finales

✅ **Sincronización Bidireccional Completamente Funcional:**
- **Dashboard → Google Sheets**: Botón "Enviar a Google Sheets"
- **Google Sheets → Dashboard**: Botón "Recargar" + Auto-sincronización cada 5 minutos
- **Sin problemas de CORS**: Usa Netlify Functions como proxy seguro

✅ **Estado en Tiempo Real:**
- 🟢 Sincronizado: Los datos están al día
- 🟡 Sin sincronizar: En espera del próximo ciclo
- 🔵 Cargando...: Sincronización en progreso

¿Necesitas ayuda? Verifica la consola del navegador (F12) para mensajes de error específicos.
