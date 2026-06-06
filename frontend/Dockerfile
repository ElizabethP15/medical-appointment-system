# Etapa 1: Build — Node compila React
FROM node:20-alpine AS builder

WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .

# ARG recibe el valor que se pasa desde docker-compose (la URL del backend)
ARG VITE_API_URL
ENV VITE_API_URL=$VITE_API_URL

# Compilamos React → genera la carpeta dist/ con HTML, CSS, JS estáticos
RUN npm run build

# Etapa 2: Producción — Nginx sirve los archivos estáticos
# Nginx es mucho más eficiente que Node para servir archivos estáticos
FROM nginx:alpine

COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]