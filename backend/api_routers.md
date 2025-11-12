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

## 🚀 Endpoints Futuros (Em Desenvolvimento)

### Conversas
- `GET /conversations` - Listar conversas do usuário
- `POST /conversations` - Criar nova conversa
- `GET /conversations/{id}` - Buscar conversa específica
- `DELETE /conversations/{id}` - Deletar conversa

### Chat
- `POST /chat` - Enviar mensagem e receber resposta do Gemini
- `GET /conversations/{id}/messages` - Listar mensagens de uma conversa

---

## 📞 Suporte

Para dúvidas ou problemas, consulte:
- Documentação interativa: http://localhost:8000/docs
- Logs do container: `docker-compose logs -f app`
- Health check: http://localhost:8000/health
