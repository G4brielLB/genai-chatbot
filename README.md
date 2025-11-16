# GenAI Chatbot

Aplicação de IA conversacional pronta para produção, construída com tecnologias web modernas e o modelo de linguagem Gemini do Google. O sistema implementa uma arquitetura de autenticação stateless com histórico persistente de conversas, projetado para implantação na infraestrutura AWS Free Tier.

## Visão Geral da Arquitetura

A aplicação segue um padrão de arquitetura desacoplada onde o frontend é servido como arquivos estáticos enquanto o backend gerencia requisições da API e orquestra interações com LLM. Este design minimiza os requisitos computacionais na instância EC2 ao transferir o processamento pesado para a API Gemini do Google.

### Stack Tecnológica

**Backend**
- FastAPI 0.121.1 - Framework web assíncrono de alta performance
- LangChain 1.0.5 - Orquestração de LLM e gerenciamento de prompts
- LangChain Google GenAI 3.0.2 - Integração com Google Gemini
- SQLAlchemy 2.0.44 - ORM para operações de banco de dados
- SQLite - Banco de dados relacional embarcado
- Python-Jose - Geração e validação de tokens JWT
- Passlib - Hash de senhas com bcrypt
- Uvicorn - Servidor ASGI

**Frontend**
- React 19.2.0 - Biblioteca UI baseada em componentes
- TypeScript 5.9 - Verificação estática de tipos
- Vite 7.2 - Ferramenta de build e servidor de desenvolvimento
- React Router 7.9.5 - Roteamento client-side
- TailwindCSS 3.4 - Framework CSS utility-first
- React Markdown 10.1.0 - Renderização de markdown para respostas da IA

**Infraestrutura**
- AWS EC2 t3.micro - Servidor de aplicação
- Nginx - Proxy reverso e servidor de arquivos estáticos
- Docker - Containerização
- Docker Compose - Orquestração multi-container

## Arquitetura do Backend

### Fluxo de Autenticação

O sistema implementa autenticação JWT stateless armazenada em cookies HttpOnly, eliminando requisitos de armazenamento de sessão no servidor:

1. Credenciais do usuário são validadas contra senhas com hash no SQLite
2. Após autenticação bem-sucedida, um token JWT é gerado contendo ID do usuário e expiração
3. Token é definido como cookie HttpOnly (proteção XSS)
4. Requisições subsequentes incluem o cookie automaticamente
5. Middleware valida assinatura do token e extrai contexto do usuário

### Integração LangChain

O serviço de chat aproveita a camada de abstração do LangChain para interações com LLM:

```python
# Recuperação do histórico de conversas do SQLite
messages = db.query(Message).filter(
    Message.conversation_id == conversation_id
).order_by(Message.created_at).all()

# Formatação para API Gemini
history = [
    {"role": msg.role, "content": msg.content}
    for msg in messages
]

# LangChain gerencia comunicação com Gemini
response = langchain_service.chat(history, new_message)
```

O serviço mantém contexto da conversa ao incluir mensagens históricas em cada chamada de API, permitindo diálogos multi-turno coerentes sem necessidade de fine-tuning do modelo.

### Esquema do Banco de Dados

Estrutura relacional de três tabelas otimizada para gerenciamento de conversas:

**users**
- Armazena credenciais de autenticação com hash bcrypt
- Suporta identificação baseada em email

**conversations**
- Agrupa mensagens por usuário e tópico
- Títulos auto-gerados a partir da primeira mensagem (15 caracteres)
- Suporte para exclusão lógica

**messages**
- Armazena tanto prompts do usuário quanto respostas do assistente
- Campo role distingue origem da mensagem
- Ordenação por timestamp mantém fluxo da conversa

### Endpoints da API

**Autenticação**
- `POST /auth/register` - Registro de usuário
- `POST /auth/login` - Criação de sessão
- `POST /auth/logout` - Término de sessão
- `GET /auth/me` - Informações do usuário atual

**Conversas**
- `GET /conversations` - Listar conversas do usuário
- `POST /conversations` - Criar nova conversa
- `GET /conversations/{id}` - Recuperar conversa com mensagens
- `DELETE /conversations/{id}` - Remover conversa

**Chat**
- `POST /chat` - Enviar mensagem e receber resposta da IA

## Arquitetura do Frontend

A aplicação React implementa um padrão de gerenciamento de estado baseado em contextos com três contextos primários:

**AuthContext** - Gerencia estado de autenticação do usuário e ciclo de vida da sessão

**ChatContext** - Manipula lista de conversas, histórico de mensagens e respostas em streaming

**ThemeContext** - Persiste preferência de modo escuro/claro

### Funcionalidades Principais

**Animação de Resposta em Streaming**
Mensagens da IA são renderizadas palavra por palavra com intervalos de 50ms, simulando geração em tempo real enquanto a resposta completa é recebida do backend.

**Criação Automática de Conversa**
Primeira mensagem em um novo chat cria automaticamente uma conversa com título derivado do prompt inicial, reduzindo fricção do usuário.

**Proteção de Rotas**
Guards do React Router previnem acesso não autorizado à interface de chat, redirecionando usuários não autenticados para login.

**Renderização Markdown**
Respostas da IA suportam sintaxe markdown completa incluindo blocos de código, listas e formatação, renderizados com estilização consciente de sintaxe.

## Configuração de Desenvolvimento

### Pré-requisitos

- Node.js 18 ou superior
- Python 3.12
- Docker e Docker Compose
- Chave de API Google Gemini

### Configuração do Backend

```bash
cd backend

# Criar arquivo de ambiente
cp .env.example .env

# Adicionar variáveis necessárias
GOOGLE_API_KEY=sua_chave_api_gemini
SECRET_KEY=string_aleatoria_gerada
DATABASE_URL=sqlite:///./data/chat.db

# Iniciar com Docker Compose
docker-compose up --build
```

O backend estará disponível em `http://localhost:8000` com documentação da API em `/docs`.

### Configuração do Frontend

```bash
cd frontend

# Instalar dependências
npm install

# Configurar endpoint da API
echo "VITE_API_URL=http://localhost:8000" > .env

# Iniciar servidor de desenvolvimento
npm run dev
```

Acesse a aplicação em `http://localhost:5173`.

## Deploy em Produção

### Configuração EC2

A aplicação está configurada para deploy em instâncias AWS EC2 t3.micro:

1. Backend roda em container Docker na porta 8000
2. Artefatos de build do frontend servidos de `/var/www/genai-chatbot`
3. Nginx faz proxy de requisições `/api/*` para o backend
4. Arquivos estáticos servidos diretamente pelo Nginx

### Configuração Nginx

```nginx
server {
    listen 80;
    server_name _;

    root /var/www/genai-chatbot;
    index index.html;

    # Roteamento SPA
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Proxy backend
    location /api/ {
        rewrite ^/api/(.*)$ /$1 break;
        proxy_pass http://localhost:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

### Build e Deploy

```bash
# Backend
cd backend
docker-compose up -d --build

# Frontend
cd frontend
npm run build
sudo cp -r dist/* /var/www/genai-chatbot/

# Recarregar Nginx
sudo systemctl reload nginx
```

## Considerações de Segurança

- Tokens JWT armazenados em cookies HttpOnly previnem ataques XSS
- Senhas com hash bcrypt antes do armazenamento
- CORS configurado para aceitar credenciais
- Injeção SQL prevenida através de parametrização ORM
- Rate limiting recomendado para produção (não implementado)

## Otimização de Performance

A arquitetura transfere operações computacionalmente intensivas:

- Inferência de LLM gerenciada pela infraestrutura do Google
- Frontend servido como arquivos estáticos pré-construídos
- Consultas ao banco de dados otimizadas com indexação apropriada
- Connection pooling no SQLAlchemy

Este design permite que a instância t3.micro (1GB RAM) manipule múltiplos usuários simultâneos eficientemente.
