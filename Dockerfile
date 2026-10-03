FROM node:20-slim AS builder
WORKDIR /app

RUN corepack enable && corepack prepare pnpm@latest --activate

# Copia dependências e workspace
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
RUN pnpm install --frozen-lockfile

# Copia código e compila
COPY . .
RUN pnpm run build

# Estágio de Produção com Nginx
FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html

# Cria o arquivo de configuração do Nginx de forma segura para SPA (React Router)
RUN printf 'server {\n\
    listen 80;\n\
    server_name localhost;\n\
    root /usr/share/nginx/html;\n\
    index index.html;\n\
    location / {\n\
        try_files $uri $uri/ /index.html;\n\
    }\n\
}\n' > /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
