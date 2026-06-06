# Imagen base: Node.js 20 en Alpine (Alpine es una versión minimalista de Linux, muy liviana)
FROM node:20-alpine

# Directorio de trabajo dentro del contenedor
WORKDIR /app

# Copiamos primero los archivos de dependencias para aprovechar la caché de Docker.
# Si package.json no cambia, Docker no reinstala los paquetes en cada build.
COPY package*.json ./
COPY prisma ./prisma/

# Instalamos dependencias
RUN npm install

# Generamos el cliente de Prisma (esto crea los tipos TypeScript)
RUN npx prisma generate

# Copiamos el resto del código fuente
COPY . .

# Compilamos TypeScript a JavaScript
RUN npm run build

# Puerto que exponemos (el mismo que en .env)
EXPOSE 3001

# Comando que se ejecuta al iniciar el contenedor
# Primero aplica migraciones, luego inicia el servidor
CMD ["sh", "-c", "npx prisma migrate deploy && node dist/index.js"]