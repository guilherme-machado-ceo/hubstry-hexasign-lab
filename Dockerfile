FROM node:20-slim AS builder
WORKDIR /app

RUN corepack enable && corepack prepare pnpm@latest --activate

# Copia os arquivos de dependência e o workspace
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
RUN pnpm install --frozen-lockfile

# Copia o restante do código e faz o build
COPY . .
RUN pnpm run build

# Servidor Nginx otimizado para produção
FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html

COPY << 'NGINX_EOF' /etc/nginx/conf.d/default.conf
server {
    listen 80;
    server_name localhost;
    root /usr/share/nginx/html;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }
}
NGINX_EOF

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
