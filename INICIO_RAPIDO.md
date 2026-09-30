# ⚡ Inicio Rápido - 5 Pasos

Tu dashboard está listo para desplegar. Aquí está el flujo rápido:

## 📦 Descargar Archivos

Ya tienes estos 5 archivos listos:

1. ✅ `dashboard-tarjetas-sync.html` - El dashboard completo
2. ✅ `netlify.toml` - Configuración de despliegue
3. ✅ `functions/google-sheets.js` - Función serverless
4. ✅ `package.json` - Dependencias
5. ✅ `INSTRUCCIONES_DESPLEGAR_NETLIFY.md` - Guía detallada

Descargalos de arriba 👆

---

## 🚀 5 Pasos para Desplegar

### Paso 1: Preparar carpeta
```
Crea una carpeta llamada "dashboard-tarjetas"
Mete adentro:
- dashboard-tarjetas-sync.html
- netlify.toml
- package.json
- Crea subcarpeta "functions" y mete google-sheets.js adentro
```

### Paso 2: GitHub (o despliegue directo)

**Opción A - Usar GitHub (recomendado):**
- Ve a github.com/new
- Crea repositorio llamado "dashboard-tarjetas"
- Sube tus archivos
- Copia la URL del repositorio

**Opción B - Sin GitHub:**
- Salta al Paso 3 (despliegue manual)

### Paso 3: Conectar a Netlify

- Ve a https://app.netlify.com
- Haz login (crea cuenta si no tienes)
- Click en "New site from Git" (o "Deploy manually")
- Si usas GitHub: elige tu repositorio
- Si no: arrastra tu carpeta

**Tu dashboard ahora tiene una URL como:**
```
https://dashboard-tarjetas-xyz.netlify.app
```

### Paso 4: Agregar Variable de Entorno ⚠️ IMPORTANTE

Sin esto NO funciona la sincronización:

1. En Netlify, ve a: **Settings** → **Environment variables**
2. Click en **Add environment variable**
3. Rellena:
   - Key: `GOOGLE_SHEETS_CREDENTIALS`
   - Value: *Todo el contenido de tu archivo JSON de Google Cloud*
4. Click **Save**
5. En **Deployments**, haz click en **Redeploy** del último deploy

### Paso 5: Probar

1. Abre tu URL de Netlify
2. Haz click en **"⬇ Recargar desde Google Sheets"**
3. Si ves tus datos + ✅ verde = **¡FUNCIONA!**

---

## ✅ Checklist Rápido

- [ ] Archivos descargados
- [ ] Carpeta creada con estructura correcta
- [ ] GitHub repo creado (o listo para despliegue manual)
- [ ] Conectado a Netlify
- [ ] Variable GOOGLE_SHEETS_CREDENTIALS agregada
- [ ] Redeploy ejecutado
- [ ] Dashboard abierto y probado
- [ ] "Recargar desde Google Sheets" funciona

---

## 🆘 Si algo no funciona

1. **"Error de conexión"**
   - ¿Agregaste la variable de entorno? 
   - ¿Hiciste Redeploy después?

2. **"No se cargan los datos"**
   - ¿Compartiste el Google Sheets con `dashboard-bot@...`?
   - ¿El ID del Sheet es correcto?
   - Abre F12 (Consola) para ver errores

3. **Otra cosa**
   - Lee `INSTRUCCIONES_DESPLEGAR_NETLIFY.md` sección "Solución de Problemas"

---

## 📚 Documentos Disponibles

- **INICIO_RAPIDO.md** ← Estás aquí (5 pasos rápidos)
- **INSTRUCCIONES_DESPLEGAR_NETLIFY.md** ← Guía detallada con troubleshooting
- **ARQUITECTURA_SOLUCION.md** ← Explica cómo funciona todo internamente

---

## 🎉 Una vez desplegado

Tu dashboard:
- ✅ Sincroniza bidireccional con Google Sheets
- ✅ Auto-actualiza cada 5 minutos
- ✅ Funciona offline (guarda datos localmente)
- ✅ Sin problemas de CORS
- ✅ Credenciales seguras en servidor
- ✅ Responsive en cualquier dispositivo

**¡Listo!** 🚀
