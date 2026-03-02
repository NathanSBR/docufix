# 🚀 Desplegar DocuFix en Railway o Render

Esta guía te explica cómo desplegar DocuFix en la nube manteniendo todas las funcionalidades (comillas, notas al pie y PDF).

---

## Opción 1: Railway (Recomendado)

### Paso 1: Crear cuenta en Railway
1. Ve a [railway.app](https://railway.app)
2. Haz clic en **"Start a New Project"**
3. Conecta tu cuenta de GitHub

### Paso 2: Subir el código a GitHub
1. Crea un nuevo repositorio en GitHub
2. Sube todos los archivos de la carpeta `docufix-app`

```bash
# En tu computadora, dentro de la carpeta descomprimida
git init
git add .
git commit -m "Initial commit - DocuFix"
git branch -M main
git remote add origin https://github.com/TU_USUARIO/docufix.git
git push -u origin main
```

### Paso 3: Desplegar en Railway
1. En Railway, selecciona **"Deploy from GitHub repo"**
2. Elige tu repositorio `docufix`
3. Railway detectará automáticamente el `Dockerfile`
4. Haz clic en **"Deploy"**

### Paso 4: Configurar variables (opcional)
En Railway, ve a **Variables** y agrega:
- `NODE_ENV` = `production`

### Paso 5: Obtener tu URL
Railway te dará una URL como:
```
https://docufix-production-abc123.up.railway.app
```

---

## Opción 2: Render

### Paso 1: Crear cuenta en Render
1. Ve a [render.com](https://render.com)
2. Regístrate con tu cuenta de GitHub

### Paso 2: Crear nuevo Web Service
1. Haz clic en **"New"** → **"Web Service"**
2. Conecta tu repositorio de GitHub
3. Selecciona el repositorio `docufix`

### Paso 3: Configurar el servicio
- **Name:** docufix
- **Runtime:** Docker
- **Region:** Oregon (o la más cercana)
- **Branch:** main
- **Dockerfile Path:** `./Dockerfile`

### Paso 4: Desplegar
1. Haz clic en **"Create Web Service"**
2. Espera unos minutos mientras se construye
3. Render te dará una URL como:
   ```
   https://docufix.onrender.com
   ```

---

## 📁 Estructura necesaria

Asegúrate de que tu repositorio tenga estos archivos:

```
docufix/
├── Dockerfile          ← Importante para Railway/Render
├── railway.toml        ← Configuración de Railway
├── render.yaml         ← Configuración de Render
├── .dockerignore       ← Archivos a ignorar en Docker
├── package.json
├── next.config.ts
├── tsconfig.json
├── tailwind.config.ts
├── postcss.config.mjs
├── components.json
├── bun.lock
├── src/
│   ├── app/
│   ├── components/
│   ├── hooks/
│   └── lib/
├── scripts/
│   └── process_docx.py
└── public/
    └── test-documento-lector.docx
```

---

## ✅ Verificar el despliegue

Una vez desplegado, verifica:

1. **La página carga:** Abre la URL proporcionada
2. **Subir archivo:** Prueba subir un documento .docx
3. **Procesar:** Haz clic en "Procesar documento"
4. **Descargar:** Verifica que puedas descargar el .docx procesado
5. **PDF:** Si activaste PDF, verifica que también se descargue

---

## 💰 Costos

| Plataforma | Plan | Notas |
|------------|------|-------|
| Railway | Gratis $5/mes | Suficiente para uso personal |
| Render | Gratis | Puede ser más lento al inicio |

---

## ❌ Problemas comunes

### "Build failed"
- Verifica que el `Dockerfile` esté en la raíz
- Asegúrate de que todos los archivos estén subidos

### "Application error"
- Revisa los logs en Railway/Render
- Verifica que el puerto sea 3000

### "PDF no funciona"
- LibreOffice puede tardar en arrancar la primera vez
- Espera unos segundos y vuelve a intentar

---

## 🔧 Comandos útiles

### Ver logs en Railway
```bash
railway logs
```

### Ver logs en Render
Ve al dashboard → Tu servicio → **Logs**

### Reiniciar el servicio
- Railway: Botón "Redeploy"
- Render: Botón "Manual Deploy" → "Deploy latest commit"

---

## 📞 Soporte

Si tienes problemas, verifica:
1. Que el repositorio tenga todos los archivos
2. Que el `Dockerfile` no haya sido modificado
3. Los logs de la plataforma para ver errores específicos

---

¡Listo! Tu aplicación **DocuFix** estará online y accesible desde cualquier lugar. 🎉
