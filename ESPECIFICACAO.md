### 🚀 Resumo da Arquitetura: Protótipo AWS Free Tier

Visão geral: Uma arquitetura desacoplada que coloca o processamento pesado (LLM) fora do servidor e usa serviços gerenciados gratuitos (S3, CloudFront) para o frontend, mantendo a instância de backend (EC2) o mais leve e barata possível.

-----

### frontend 🎨 Frontend: React + S3 + CloudFront

  * **Tecnologia:** React (Vite).
  * **Hospedagem:** Arquivos estáticos (HTML/CSS/JS) do *build* do React hospedados em um **AWS S3 Bucket**.
  * **Entrega:** **AWS CloudFront (CDN)** configurado na frente do S3.
  * **Custo:** Gratuito (Free Tier de 1 ano do S3 + CloudFront).
  * **Performance:** Excelente (CDN global) e **zero** carga na EC2.

-----

### backend ⚙️ Backend: EC2 (t2.micro) + FastAPI

  * **Instância:** **EC2 `t2.micro`** (1GB RAM, Free Tier de 1 ano).
  * **Tecnologia:** **FastAPI** (Python) rodando via Docker.
  * **Função:** Lida com a API (`/api/...`), autenticação, e orquestra a lógica do chat.
  * **Performance:** A `t2.micro` é suficiente, pois o FastAPI é leve e o LLM (Gemini) é processado externamente.

-----

### database 🔐 Gerenciamento de Sessão (JWT) e Banco de Dados (SQLite)

O gerenciamento de sessão será **stateless (sem estado)**, o que é perfeito para a `t2.micro`, pois não consome RAM para armazenar sessões.

#### Fluxo de Autenticação (JWT)

1.  **Login:** O usuário envia `email` e `senha` para `POST /api/auth/login`.
2.  **Validação:** O FastAPI verifica o `email` e o `hashed_password` na tabela `users` do SQLite.
3.  **Criação do Token:** Se válido, o FastAPI cria um **Token JWT** contendo o `user_id` e uma data de expiração (ex: 7 dias).
4.  **Armazenamento (Frontend):** O frontend (React) recebe esse token e o armazena no **LocalStorage** do navegador.
5.  **Requisições Futuras:** A cada chamada para rotas protegidas (ex: `/api/chat`), o frontend adiciona o token ao cabeçalho: `Authorization: Bearer <token>`.
6.  **Autorização (Backend):** O FastAPI valida o token (verifica a assinatura) em cada requisição, extrai o `user_id` e sabe *quem* está fazendo a chamada, sem precisar de uma tabela de sessões.

#### Esquema do Banco de Dados (SQLite)

Usaremos um único arquivo **`chat.db`** (persistido por um Volume Docker) com três tabelas principais, gerenciadas via **SQLAlchemy**:

**1. Tabela `users`** (Para gerenciar quem pode logar)

  * `id` (Integer, Primary Key)
  * `email` (String, Unique, Not Null)
  * `hashed_password` (String, Not Null)
  * `created_at` (DateTime, Default: now)

**2. Tabela `conversations`** (Para agrupar os chats de um usuário)

  * `id` (Integer, Primary Key)
  * `user_id` (Integer, ForeignKey('users.id'))
  * `title` (String, Not Null, ex: "Dúvidas sobre Python")
  * `created_at` (DateTime, Default: now)

**3. Tabela `messages`** (O histórico de cada conversa)

  * `id` (Integer, Primary Key)
  * `conversation_id` (Integer, ForeignKey('conversations.id'))
  * `role` (String, Not Null, ex: "user" ou "assistant")
  * `content` (Text, Not Null)
  * `created_at` (DateTime, Default: now)

-----

### brain 🧠 Lógica do Chat: LangChain + Google Gemini

  * **Tecnologia:** **LangChain** (orquestração) e **API do Google Gemini** (LLM).
  * **Fluxo Atualizado:**
    1.  O FastAPI recebe uma mensagem (`POST /api/chat`) com um `conversation_id`.
    2.  O middleware de Auth valida o JWT e extrai o `user_id`.
    3.  O FastAPI/LangChain busca no SQLite o histórico: `SELECT * FROM messages WHERE conversation_id = ?` (após verificar se `conversation_id` pertence ao `user_id`).
    4.  O LangChain formata o histórico e a nova mensagem, e faz uma **chamada de API** para o Google Gemini.
    5.  O Gemini retorna a resposta.
    6.  O FastAPI salva a resposta (role: "assistant") na tabela `messages` e a retorna ao frontend.
  * **Vantagem:** O processamento pesado fica **fora** da `t2.micro`, nos servidores do Google (Free Tier).

-----

### docker 🐳 Estratégia Docker (Desenvolvimento -\> Deploy)

Usaremos uma abordagem com **Docker** e **Docker Compose** para garantir que o ambiente de desenvolvimento seja idêntico ao de produção.

**1. `Dockerfile` (na raiz do backend)**

  * Define a imagem de produção.
  * Usa uma base leve (ex: `python:3.12-slim`).
  * Instala as dependências do `requirements.txt`.
  * Copia o código-fonte da aplicação (`COPY . /app`).
  * Define o comando para iniciar o servidor (ex: `CMD ["uvicorn", ...]`).

**2. `docker-compose.yml` (Arquivo principal, focado no Deploy)**

  * Define o *serviço* `app` que usa o `Dockerfile`.
  * Mapeia a porta da EC2 para o container (ex: `ports: - "8000:8000"`).
  * **Crucial:** Define um **volume nomeado** para persistir o banco SQLite, garantindo que os dados não sumam se o container reiniciar.
    ```yaml
    # Exemplo conceitual
    services:
      app:
        build: .
        ports:
          - "8000:8000"
        volumes:
          - sqlite_data:/app/data # Mapeia o volume 'sqlite_data' para a pasta /data
    volumes:
      sqlite_data: # Declara o volume que o Docker vai gerenciar
    ```
  * **No Deploy (EC2):** Você roda `docker-compose up -d --build`.

**3. `docker-compose.override.yml` (Arquivo opcional, só para Desenvolvimento Local)**

  * Este arquivo é lido *automaticamente* pelo Docker Compose (se existir), **apenas localmente**.
  * **Crucial:** Ele *sobrescreve* a configuração para habilitar o **hot-reload**.
    ```yaml
    # Exemplo conceitual
    services:
      app:
        command: uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
        volumes:
          - .:/app # Mapeia o código local (hot-reload), sobrescrevendo o volume de dados
    ```
  * **No Desenvolvimento (Local):** Você roda `docker-compose up`. As mudanças no seu código local são refletidas instantaneamente no container.