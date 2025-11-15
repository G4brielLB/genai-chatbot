# 📚 Documentação da API - GenAI Chatbot

## 🔗 Base URL
```
http://localhost:8000
```

## 📖 Documentação Interativa
- **Swagger UI**: http://localhost:8000/docs

---

## 🔐 Autenticação

Todos os endpoints de autenticação usam **cookies HttpOnly** para armazenar o token JWT. O frontend não precisa gerenciar o token manualmente, pois o navegador envia automaticamente o cookie em todas as requisições.

### 🔑 Endpoints de Autenticação

#### **POST** `/auth/register`
Registra um novo usuário no sistema.

**Request Body:**
```json
{
  "email": "usuario@exemplo.com",
  "password": "Senha@123"
}
```

**Validações da Senha:**
- Mínimo 8 caracteres
- Pelo menos 1 número
- Pelo menos 1 letra maiúscula
- Pelo menos 1 caractere especial (!@#$%&*)

**Response (201 Created):**
```json
{
  "id": 1,
  "email": "usuario@exemplo.com",
  "created_at": "2025-11-12T10:30:00.000Z"
}
```

**Erros Possíveis:**
- `400 Bad Request`: Email já cadastrado ou senha não atende aos requisitos
- `422 Unprocessable Entity`: Formato de email inválido

---

#### **POST** `/auth/login`
Realiza login e define um cookie HttpOnly com o token JWT.

**Request Body:**
```json
{
  "email": "usuario@exemplo.com",
  "password": "Senha@123"
}
```

**Response (200 OK):**
```json
{
  "message": "Login realizado com sucesso",
  "user": {
    "id": 1,
    "email": "usuario@exemplo.com"
  }
}
```

**Cookie Definido:**
- Nome: `access_token`
- Tipo: HttpOnly (JavaScript não pode acessar)
- Duração: 7 dias (10080 minutos)
- Path: `/`

**Erros Possíveis:**
- `401 Unauthorized`: Email ou senha incorretos

**Exemplo de uso no Frontend (Fetch API):**
```javascript
const response = await fetch('http://localhost:8000/auth/login', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  credentials: 'include', // IMPORTANTE: Envia e recebe cookies
  body: JSON.stringify({
    email: 'usuario@exemplo.com',
    password: 'Senha@123'
  })
});

const data = await response.json();
console.log(data.user);
```

**Exemplo de uso no Frontend (Axios):**
```javascript
const response = await axios.post(
  'http://localhost:8000/auth/login',
  {
    email: 'usuario@exemplo.com',
    password: 'Senha@123'
  },
  {
    withCredentials: true // IMPORTANTE: Envia e recebe cookies
  }
);

console.log(response.data.user);
```

---

#### **POST** `/auth/logout`
Realiza logout removendo o cookie de autenticação.

**Request:** Nenhum body necessário (cookie é enviado automaticamente)

**Response (200 OK):**
```json
{
  "message": "Logout realizado com sucesso"
}
```

**Exemplo de uso no Frontend:**
```javascript
// Fetch API
await fetch('http://localhost:8000/auth/logout', {
  method: 'POST',
  credentials: 'include'
});

// Axios
await axios.post(
  'http://localhost:8000/auth/logout',
  {},
  { withCredentials: true }
);
```

---

#### **GET** `/auth/me`
Retorna os dados do usuário autenticado.

**Request:** Nenhum parâmetro necessário (cookie é enviado automaticamente)

**Headers Necessários:** Cookie `access_token` (enviado automaticamente pelo navegador)

**Response (200 OK):**
```json
{
  "id": 1,
  "email": "usuario@exemplo.com",
  "created_at": "2025-11-12T10:30:00.000Z"
}
```

**Erros Possíveis:**
- `401 Unauthorized`: Token inválido, expirado ou ausente

**Exemplo de uso no Frontend:**
```javascript
// Fetch API
const response = await fetch('http://localhost:8000/auth/me', {
  method: 'GET',
  credentials: 'include' // IMPORTANTE: Envia cookies
});

const user = await response.json();

// Axios
const response = await axios.get(
  'http://localhost:8000/auth/me',
  { withCredentials: true }
);

const user = response.data;
```

---

## 🔒 Segurança

### CORS (Cross-Origin Resource Sharing)
A API está configurada para aceitar requisições apenas das seguintes origens:
- `http://localhost:5173` (Vite dev server)
- `http://localhost:8000` (Backend local)

Para que os cookies funcionem, é **OBRIGATÓRIO** configurar:
- **Fetch API**: `credentials: 'include'`
- **Axios**: `withCredentials: true`

### JWT (JSON Web Token)
- **Algoritmo**: HS256
- **Expiração**: 7 dias (configurável via `.env`)
- **Armazenamento**: Cookie HttpOnly (não acessível via JavaScript)
- **Proteção**: XSS (HttpOnly), CSRF (SameSite=Lax)

---

## 🛠️ Testando a API

### Via Swagger UI (Navegador)
1. Acesse http://localhost:8000/docs
2. Clique no endpoint desejado
3. Clique em "Try it out"
4. Preencha os dados
5. Clique em "Execute"

### Via cURL (Terminal)

**Registrar usuário:**
```bash
curl -X POST "http://localhost:8000/auth/register" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "teste@exemplo.com",
    "password": "Senha@123"
  }'
```

**Login (salvar cookie):**
```bash
curl -X POST "http://localhost:8000/auth/login" \
  -H "Content-Type: application/json" \
  -c cookies.txt \
  -d '{
    "email": "teste@exemplo.com",
    "password": "Senha@123"
  }'
```

**Buscar usuário autenticado (usar cookie):**
```bash
curl -X GET "http://localhost:8000/auth/me" \
  -b cookies.txt
```

**Logout:**
```bash
curl -X POST "http://localhost:8000/auth/logout" \
  -b cookies.txt
```

---

## 📝 Notas Importantes para o Frontend

1. **Sempre use `credentials: 'include'` (Fetch) ou `withCredentials: true` (Axios)**
   - Sem isso, os cookies não serão enviados/recebidos

2. **Não precisa armazenar o token no localStorage ou sessionStorage**
   - O navegador gerencia automaticamente via cookies

3. **Tratamento de erros 401 (Unauthorized)**
   - Redirecione o usuário para a página de login
   - Limpe qualquer estado de autenticação no frontend

4. **Verificação de autenticação ao carregar a aplicação**
   - Faça uma chamada para `/auth/me` ao iniciar
   - Se retornar 401, o usuário não está autenticado

5. **Interceptor de requisições (Axios)**
```javascript
// Configurar Axios para sempre enviar cookies
axios.defaults.withCredentials = true;

// Interceptor para tratar 401
axios.interceptors.response.use(
  response => response,
  error => {
    if (error.response?.status === 401) {
      // Redirecionar para login
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);
```

---

## 💬 Conversas

Todos os endpoints de conversas requerem autenticação (cookie HttpOnly).

### **GET** `/conversations`
Lista todas as conversas do usuário autenticado.

**Query Parameters:**
- `skip` (opcional): Quantidade de registros para pular (paginação). Padrão: 0
- `limit` (opcional): Limite de registros a retornar. Padrão: 100, Máximo: 100

**Response (200 OK):**
```json
[
  {
    "id": 1,
    "user_id": 123,
    "title": "Dúvidas sobre IA Generativa",
    "created_at": "2025-11-14T10:30:00.000Z"
  },
  {
    "id": 2,
    "user_id": 123,
    "title": "Ajuda com Python",
    "created_at": "2025-11-14T11:45:00.000Z"
  }
]
```

**Exemplo de uso no Frontend:**
```javascript
// Fetch API
const response = await fetch('http://localhost:8000/conversations?skip=0&limit=20', {
  credentials: 'include'
});
const conversations = await response.json();

// Axios
const response = await axios.get(
  'http://localhost:8000/conversations',
  { 
    withCredentials: true,
    params: { skip: 0, limit: 20 }
  }
);
```

---

### **POST** `/conversations`
Cria uma nova conversa para o usuário autenticado.

**Request Body:**
```json
{
  "title": "Dúvidas sobre IA Generativa"
}
```

**Response (201 Created):**
```json
{
  "id": 1,
  "user_id": 123,
  "title": "Dúvidas sobre IA Generativa",
  "created_at": "2025-11-14T10:30:00.000Z"
}
```

**Erros Possíveis:**
- `401 Unauthorized`: Usuário não autenticado
- `500 Internal Server Error`: Erro ao criar conversa

**Exemplo de uso no Frontend:**
```javascript
// Fetch API
const response = await fetch('http://localhost:8000/conversations', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  credentials: 'include',
  body: JSON.stringify({ title: 'Dúvidas sobre IA Generativa' })
});

// Axios
const response = await axios.post(
  'http://localhost:8000/conversations',
  { title: 'Dúvidas sobre IA Generativa' },
  { withCredentials: true }
);
```

---

### **GET** `/conversations/{conversation_id}`
Busca uma conversa específica com todas as suas mensagens.

**Path Parameters:**
- `conversation_id`: ID da conversa

**Response (200 OK):**
```json
{
  "id": 1,
  "user_id": 123,
  "title": "Dúvidas sobre IA Generativa",
  "created_at": "2025-11-14T10:30:00.000Z",
  "messages": [
    {
      "id": 1,
      "conversation_id": 1,
      "role": "user",
      "content": "o que é ia generativa?",
      "created_at": "2025-11-14T10:31:00.000Z"
    },
    {
      "id": 2,
      "conversation_id": 1,
      "role": "assistant",
      "content": "IA Generativa é uma categoria de inteligência artificial...",
      "created_at": "2025-11-14T10:31:05.000Z"
    }
  ]
}
```

**Erros Possíveis:**
- `401 Unauthorized`: Usuário não autenticado
- `404 Not Found`: Conversa não encontrada ou não pertence ao usuário

**Exemplo de uso no Frontend:**
```javascript
// Fetch API
const response = await fetch('http://localhost:8000/conversations/1', {
  credentials: 'include'
});
const conversation = await response.json();

// Axios
const response = await axios.get(
  'http://localhost:8000/conversations/1',
  { withCredentials: true }
);
```

---

### **DELETE** `/conversations/{conversation_id}`
Deleta uma conversa e todas as suas mensagens (cascata).

**Path Parameters:**
- `conversation_id`: ID da conversa

**Response (204 No Content):**
Sem corpo de resposta.

**Erros Possíveis:**
- `401 Unauthorized`: Usuário não autenticado
- `404 Not Found`: Conversa não encontrada ou não pertence ao usuário
- `500 Internal Server Error`: Erro ao deletar conversa

**Exemplo de uso no Frontend:**
```javascript
// Fetch API
await fetch('http://localhost:8000/conversations/1', {
  method: 'DELETE',
  credentials: 'include'
});

// Axios
await axios.delete(
  'http://localhost:8000/conversations/1',
  { withCredentials: true }
);
```

---

## 🤖 Chat (Integração com Google Gemini)

### **POST** `/chat`
Envia uma mensagem em uma conversa e recebe a resposta do assistente (Google Gemini via LangChain).

**Request Body:**
```json
{
  "conversation_id": 1,
  "message": "o que é ia generativa?"
}
```

**Fluxo do Sistema:**
1. Verifica se a conversa pertence ao usuário autenticado
2. Valida se há tokens disponíveis (limite: 8192 tokens por conversa)
3. Busca o histórico de mensagens da conversa
4. Adiciona um system prompt invisível (define comportamento do chatbot)
5. Envia o contexto completo para o Google Gemini
6. Salva ambas as mensagens (usuário e assistente) no banco
7. Atualiza a contagem de tokens da conversa

**Response (200 OK):**
```json
{
  "user_message": {
    "id": 1,
    "conversation_id": 1,
    "role": "user",
    "content": "o que é ia generativa?",
    "created_at": "2025-11-14T10:31:00.000Z"
  },
  "assistant_message": {
    "id": 2,
    "conversation_id": 1,
    "role": "assistant",
    "content": "IA Generativa é uma categoria de inteligência artificial que cria conteúdo novo e original...",
    "created_at": "2025-11-14T10:31:05.000Z"
  }
}
```

**Erros Possíveis:**
- `401 Unauthorized`: Usuário não autenticado
- `404 Not Found`: Conversa não encontrada ou não pertence ao usuário
- `429 Too Many Requests`: Limite de tokens atingido para esta conversa
  ```json
  {
    "detail": "Limite de tokens atingido para esta conversa. Tokens usados: 8500/8192. Crie uma nova conversa para continuar."
  }
  ```
- `500 Internal Server Error`: Erro ao processar mensagem ou comunicação com Gemini

**Exemplo de uso no Frontend:**
```javascript
// Fetch API
const response = await fetch('http://localhost:8000/chat', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  credentials: 'include',
  body: JSON.stringify({
    conversation_id: 1,
    message: 'o que é ia generativa?'
  })
});

const data = await response.json();
console.log('Usuário:', data.user_message.content);
console.log('Assistente:', data.assistant_message.content);

// Axios
const response = await axios.post(
  'http://localhost:8000/chat',
  {
    conversation_id: 1,
    message: 'o que é ia generativa?'
  },
  { withCredentials: true }
);
```

**Tratamento de Erro 429 (Limite de Tokens):**
```javascript
try {
  const response = await axios.post(
    'http://localhost:8000/chat',
    { conversation_id: 1, message: 'nova mensagem' },
    { withCredentials: true }
  );
} catch (error) {
  if (error.response?.status === 429) {
    alert('Limite de tokens atingido! Crie uma nova conversa.');
    // Redirecionar para criar nova conversa
  }
}
```

---

## 📊 Sistema de Tokens

### Como Funciona
- **Limite por conversa**: 8192 tokens (configurável via `QTD_TOKENS_DEFAULT` no `.env`)
- **Contagem**: Usa `tiktoken` (cl100k_base) para contagem precisa
- **Acumulação**: Soma de todas as mensagens (usuário + assistente) na conversa
- **System Prompt**: Também consome tokens, mas é reutilizado a cada chamada

### O que acontece quando o limite é atingido?
- O endpoint `/chat` retorna erro **429 Too Many Requests**
- O usuário deve criar uma **nova conversa** para continuar
- Conversas antigas permanecem acessíveis para leitura

### Exemplo de Cálculo
```
Conversa com 3 interações:
- Mensagem 1 (usuário):    150 tokens
- Resposta 1 (assistente): 300 tokens
- Mensagem 2 (usuário):    100 tokens
- Resposta 2 (assistente): 250 tokens
- Mensagem 3 (usuário):    120 tokens
- Resposta 3 (assistente): 280 tokens
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Total: 1200 tokens
Restante: 6992 tokens (8192 - 1200)
```
