# Imagen base: Node.js 20 en Debian Slim para una imagen más ligera
FROM node:20-slim

# Directorio de trabajo dentro del contenedor
WORKDIR /app

# Copiamos primero los archivos de dependencias para aprovechar la caché de Docker.
# Si package.json no cambia, Docker no reinstala los paquetes en cada build.
COPY package*.json ./
# COPY prisma ./prisma/ # Descomentar si se necesitan las migraciones en el contenedor

# Instalamos OpenSSL para generar certificados autofirmados si es necesario
RUN apt-get update && \
  apt-get install -y openssl ca-certificates

# Instalamos dependencias
RUN npm install

# Copiamos el resto del código fuente
COPY . .

# Verificamos la versión de OpenSSL para asegurarnos de que está instalado correctamente
RUN openssl version

# Generamos el cliente de Prisma (esto crea los tipos TypeScript)
RUN npx prisma generate

# Compilamos TypeScript a JavaScript
RUN npm run build

# Puerto que exponemos (el mismo que en .env)
# EXPOSE 3001 # Descomentar si se compila TypeScript a JavaScript

# Comando que se ejecuta al iniciar el contenedor
# Primero aplica migraciones, luego inicia el servidor
# CMD ["sh", "-c", "npx prisma migrate deploy && node dist/index.js"] # Descomentar si se compila TypeScript a JavaScript
CMD ["sh", "-c", "npx prisma migrate deploy && npm start"]