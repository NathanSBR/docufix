# DocuFix - Aplicación para procesar documentos .docx

## ¿Qué hace esta aplicación?

Esta aplicación web procesa documentos Word (.docx) aplicando:

1. **Conversión de comillas**: Comillas inglesas `" "` a comillas latinas `« »`
2. **Inserción de notas al pie**: Las notas al pie de Word se insertan en el texto como `[Nota al pie: contenido]`
3. **Conversión a PDF**: Opcionalmente, convierte el documento procesado directamente a PDF

---

## 🚀 Instalación rápida

### Requisitos previos

Antes de empezar, necesitas tener instalado:

1. **Node.js 18+** 
   - Descarga: https://nodejs.org
   - Elige la versión "LTS" (recomendada)
   - Para verificar si lo tienes: `node --version`

2. **Python 3**
   - Descarga: https://python.org
   - Asegúrate de marcar "Add Python to PATH" durante la instalación
   - Para verificar si lo tienes: `python --version` o `python3 --version`

3. **LibreOffice** (opcional, solo para conversión a PDF)
   - Descarga: https://www.libreoffice.org/download/
   - Necesario para la función de convertir a PDF

---

### Pasos de instalación

#### En Windows:

1. **Descomprime** el archivo `lector-word-app.zip` en una carpeta

2. **Abre PowerShell o CMD** en esa carpeta (clic derecho → "Abrir en terminal")

3. **Instala las dependencias de Node.js:**
   ```bash
   npm install
   ```

4. **Instala python-docx:**
   ```bash
   pip install python-docx
   ```
   
   Si da error, intenta:
   ```bash
   pip install python-docx --break-system-packages
   ```

5. **Ejecuta la aplicación:**
   ```bash
   npm run dev
   ```

6. **Abre tu navegador** en: http://localhost:3000

---

#### En Mac/Linux:

1. **Descomprime** el archivo `lector-word-app.zip`

2. **Abre una terminal** en esa carpeta

3. **Instala las dependencias:**
   ```bash
   npm install
   pip3 install python-docx
   ```

4. **Ejecuta la aplicación:**
   ```bash
   npm run dev
   ```

5. **Abre tu navegador** en: http://localhost:3000

---

## 📖 Cómo usar la aplicación

1. Abre http://localhost:3000 en tu navegador
2. **Arrastra un archivo .docx** al área punteada (o haz clic para seleccionar)
3. **Marca la casilla** "Generar también versión PDF" si quieres el PDF
4. Presiona el botón **"Procesar documento"**
5. **Descarga los archivos procesados:**
   - `.docx` - Documento Word procesado
   - `.pdf` - Versión PDF (si lo seleccionaste)

---

## 🧪 Documento de prueba

El ZIP incluye un documento de prueba: `public/test-documento-lector.docx`

Es una historia marítima con:
- ~30 comillas inglesas para convertir
- 17 notas al pie para insertar

---

## ❌ Solución de problemas

### Error: "python-docx not found"
```bash
pip install python-docx
```

### Error: "Cannot find module"
```bash
npm install
```

### Error: "Python not found"
- Asegúrate de que Python esté instalado y en el PATH
- En Windows: reinstala Python marcando "Add Python to PATH"

### Error: "npm no se reconoce"
- Asegúrate de tener Node.js instalado
- Reinicia la terminal después de instalar Node.js
- Prueba con: `npx npm install`

### La conversión a PDF no funciona
- Asegúrate de tener LibreOffice instalado
- En Windows: agrega LibreOffice al PATH del sistema
- O simplemente usa la opción de solo .docx

### Puerto 3000 ocupado
- Next.js usará automáticamente otro puerto (3001, 3002, etc.)
- Revisa la terminal para ver qué puerto se está usando

### Error de permisos en Mac/Linux
```bash
chmod +x scripts/process_docx.py
```

---

## 📁 Estructura del proyecto

```
lector-word-app/
├── src/
│   ├── app/
│   │   ├── page.tsx           # Página principal
│   │   ├── layout.tsx         # Layout de la app
│   │   ├── globals.css        # Estilos globales
│   │   └── api/
│   │       └── process-docx/
│   │           └── route.ts   # API de procesamiento
│   ├── components/ui/         # Componentes de interfaz
│   ├── hooks/                 # Hooks de React
│   └── lib/                   # Utilidades
├── scripts/
│   └── process_docx.py        # Script Python para transformaciones
├── public/
│   └── test-documento-lector.docx  # Documento de prueba
├── package.json               # Dependencias de Node.js
├── tsconfig.json              # Configuración de TypeScript
├── next.config.ts             # Configuración de Next.js
├── tailwind.config.ts         # Configuración de Tailwind CSS
└── README-USUARIO.md          # Este archivo
```

---

## ✅ Verificar que todo funciona

1. Ejecuta `npm run dev`
2. Abre http://localhost:3000
3. Descarga el documento de prueba (botón en la página)
4. Sube el documento a la aplicación
5. Marca "Generar también versión PDF"
6. Procesa y descarga el resultado
7. Abre los documentos y verifica:
   - Las comillas `" "` se convirtieron en `« »`
   - Las notas al pie están insertadas como `[Nota al pie: ...]`
   - El PDF se generó correctamente

---

## 📝 Licencia

Uso libre para propósitos personales y educativos.
