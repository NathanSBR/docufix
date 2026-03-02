# DocuFix - Dockerfile para Railway/Render
FROM node:20-slim

# Instalar Python y LibreOffice
RUN apt-get update && apt-get install -y \
    python3 \
    python3-pip \
    python3-venv \
    libreoffice-writer \
    libreoffice-core \
    fonts-liberation \
    fonts-noto \
    fonts-dejavu \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

# Crear enlace simbólico para python
RUN ln -sf /usr/bin/python3 /usr/bin/python

# Instalar python-docx
RUN pip3 install python-docx --break-system-packages

# Crear directorio de la app
WORKDIR /app

# Copiar archivos de dependencias primero (para caché de Docker)
COPY package.json bun.lock* package-lock.json* yarn.lock* ./

# Instalar dependencias con npm
RUN npm install

# Copiar todo el código fuente
COPY . .

# Construir la aplicación Next.js
RUN npm run build

# Copiar archivos estáticos para standalone mode
# Next.js standalone no incluye estos archivos por defecto
RUN cp -r public .next/standalone/ && \
    cp -r .next/static .next/standalone/.next/ && \
    cp -r scripts .next/standalone/

# Exponer puerto
EXPOSE 3000

# Variables de entorno
ENV NODE_ENV=production
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# Comando de inicio
CMD ["node", ".next/standalone/server.js"]
