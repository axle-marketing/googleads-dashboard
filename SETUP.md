# Google Ads Dashboard - Setup Guide

## 📋 Pré-requisitos

- Node.js 18+ instalado
- Conta Supabase criada
- Developer Token do Google Ads
- Refresh Token do Google Ads OAuth
- Acesso ao servidor da agência

## 🚀 Setup Local

### 1. Variáveis de Ambiente

Crie um arquivo `.env.local` na raiz do projeto:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://seu-projeto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua-chave-anonima
SUPABASE_SERVICE_ROLE_KEY=sua-chave-service-role

# Google Ads API
GOOGLE_ADS_DEVELOPER_TOKEN=seu-token-desenvolvedor
GOOGLE_ADS_CLIENT_ID=seu-client-id
GOOGLE_ADS_CLIENT_SECRET=seu-client-secret
GOOGLE_ADS_REFRESH_TOKEN=seu-refresh-token

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 2. Instalar Dependências

```bash
npm install
```

### 3. Setup do Banco de Dados

1. Acesse seu projeto no [Supabase](https://supabase.com)
2. Vá para SQL Editor
3. Cole o conteúdo do arquivo `supabase/migrations/001_create_tables.sql`
4. Execute o script

### 4. Rodar Localmente

```bash
npm run dev
```

Acesse `http://localhost:3000`

## 📦 Deploy no Servidor

### 1. Clonar no Servidor

```bash
cd /home/seu-usuario/apps
git clone https://github.com/axle-marketing/googleads-dashboard.git
cd googleads-dashboard
npm install
```

### 2. Variáveis de Ambiente

Crie `.env.local` no servidor com as mesmas variáveis do setup local.

### 3. Build

```bash
npm run build
```

### 4. Rodar em Produção

Você pode usar PM2 para gerenciar o processo:

```bash
npm install -g pm2
pm2 start npm --name "googleads-dashboard" -- start
pm2 save
```

### 5. Configurar Nginx/Traefik

Se estiver usando Traefik (como no seu servidor):

```yaml
# docker-compose.yml
version: '3.8'

services:
  googleads-dashboard:
    image: node:18-alpine
    working_dir: /app
    volumes:
      - ./:/app
    environment:
      - NEXT_PUBLIC_SUPABASE_URL=${NEXT_PUBLIC_SUPABASE_URL}
      - NEXT_PUBLIC_SUPABASE_ANON_KEY=${NEXT_PUBLIC_SUPABASE_ANON_KEY}
      - SUPABASE_SERVICE_ROLE_KEY=${SUPABASE_SERVICE_ROLE_KEY}
      - GOOGLE_ADS_DEVELOPER_TOKEN=${GOOGLE_ADS_DEVELOPER_TOKEN}
      - GOOGLE_ADS_CLIENT_ID=${GOOGLE_ADS_CLIENT_ID}
      - GOOGLE_ADS_CLIENT_SECRET=${GOOGLE_ADS_CLIENT_SECRET}
      - GOOGLE_ADS_REFRESH_TOKEN=${GOOGLE_ADS_REFRESH_TOKEN}
      - NODE_ENV=production
    command: sh -c "npm install && npm run build && npm start"
    labels:
      - "traefik.enable=true"
      - "traefik.http.routers.googleads-dashboard.rule=Host(`dash.google.axlemarketingroup.com`)"
      - "traefik.http.routers.googleads-dashboard.entrypoints=websecure"
      - "traefik.http.routers.googleads-dashboard.tls.certresolver=letsencrypt"
      - "traefik.http.services.googleads-dashboard.loadbalancer.server.port=3000"
    networks:
      - traefik-network

networks:
  traefik-network:
    external: true
```

## 🎯 Features

- ✅ Dropdown de clientes (puxado da MCC do Google Ads)
- ✅ Dropdown de nichos (gerenciável via BD)
- ✅ Dropdown de estratégias (gerenciável via BD)
- ✅ Criação de rascunho de campanha
- ✅ Interface responsiva para mobile
- ✅ Autenticação com Supabase
- ✅ Integração com Google Ads API

## 📱 Responsividade

O dashboard é totalmente responsivo usando Tailwind CSS:
- Desktop: 3 cards de informação lado a lado
- Tablet: 2 cards
- Mobile: 1 card por linha

## 🔐 Segurança

- Tokens do Google Ads guardados em variáveis de ambiente
- Row Level Security habilitado no Supabase
- Validação de inputs em todas as APIs

## 📝 Próximas Etapas

1. Configurar Google OAuth corretamente
2. Adicionar admin panel para gerenciar nichos e estratégias
3. Adicionar histórico de campanhas criadas
4. Implementar webhook do Google Ads para sync de status
5. Adicionar relatórios de performance
