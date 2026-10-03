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

# Cria um template de configuração do Nginx usando a variável ${PORT} do Cloud Run
RUN printf 'server {\n\
    listen ${PORT};\n\
    server_name localhost;\n\
    root /usr/share/nginx/html;\n\
    index index.html;\n\
    location / {\n\
        try_files $uri $uri/ /index.html;\n\
    }\n\
}\n' > /etc/nginx/conf.d/default.conf.template

# Injeta a porta do Cloud Run no Nginx no momento da inicialização do container
CMD /bin/sh -c "envsubst '\$PORT' < /etc/nginx/conf.d/default.conf.template > /etc/nginx/conf.d/default.conf && nginx -g 'daemon off;'"
