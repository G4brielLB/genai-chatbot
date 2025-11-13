# 🛡️ Tratamento de Erros - Frontend

## Visão Geral

Sistema robusto de tratamento de erros para lidar com respostas de erro do backend FastAPI/Pydantic, transformando erros técnicos em mensagens claras e amigáveis para o usuário.

## Problema Resolvido

**Antes:**
```
Erro exibido: [object Object]
```

**Depois:**
```
Senha: Senha deve ter no mínimo 1 caractere especial (!@#$%&*).
```

## Arquitetura

### 1. **Error Handler Utility** (`utils/errorHandler.ts`)

Função central que processa diferentes tipos de erro:

```typescript
extractErrorMessage(error: unknown): string
```

#### Tipos de erro suportados:

1. **Erros de Validação do Pydantic** (array de objetos)
   ```json
   {
     "detail": [
       {
         "type": "value_error",
         "loc": ["body", "password"],
         "msg": "Value error, Senha deve ter no mínimo 1 caractere especial",
         "input": "Gabriel123"
       }
     ]
   }
   ```
   **Resultado:** "Senha: Senha deve ter no mínimo 1 caractere especial"

2. **Erros Simples** (string)
   ```json
   {
     "detail": "Email já cadastrado"
   }
   ```
   **Resultado:** "Email já cadastrado"

3. **Múltiplos Erros no Mesmo Campo**
   ```json
   {
     "detail": [
       {
         "loc": ["body", "password"],
         "msg": "Senha deve ter no mínimo 8 caracteres"
       },
       {
         "loc": ["body", "password"],
         "msg": "Senha deve ter 1 número"
       }
     ]
   }
   ```
   **Resultado:**
   ```
   Senha:
     • Senha deve ter no mínimo 8 caracteres
     • Senha deve ter 1 número
   ```

### 2. **API Service** (`services/api.service.ts`)

Modificado para preservar a estrutura completa do erro:

```typescript
if (!response.ok) {
  const errorData = await response.json();
  // Serializa o erro completo como JSON
  const error = new Error(JSON.stringify(errorData));
  error.name = 'ApiError';
  throw error;
}
```

### 3. **Páginas de Login e Registro**

Ambas usam o `extractErrorMessage`:

```typescript
import { extractErrorMessage } from '../utils/errorHandler';

try {
  await register({ email, password });
  // ...
} catch (err) {
  const errorMessage = extractErrorMessage(err);
  setError(errorMessage);
}
```

Exibição com suporte a múltiplas linhas:

```tsx
{error && (
  <div className="p-3 rounded-lg bg-red-500/10 border border-red-500 text-red-500 text-sm whitespace-pre-line">
    {error}
  </div>
)}
```

## Funcionalidades

### ✅ Limpeza de Mensagens

Remove prefixos técnicos do Pydantic:
- `"Value error, "` → removido
- `"Assertion failed, "` → removido
- `"String should "` → `"Deve "`
- `"Input should "` → `"Deve "`

### ✅ Tradução de Campos

```typescript
const translations = {
  email: 'Email',
  password: 'Senha',
  name: 'Nome',
  confirmPassword: 'Confirmação de senha'
};
```

### ✅ Agrupamento de Erros

Erros do mesmo campo são agrupados e exibidos juntos.

### ✅ Formatação Multi-linha

Suporta exibição de múltiplos erros com formatação clara usando `whitespace-pre-line`.

## Melhorias de UX Adicionadas

### Requisitos de Senha Visíveis

Na página de registro, adicionado hint abaixo do campo de senha:

```
Mínimo 8 caracteres, 1 número, 1 maiúscula e 1 caractere especial (!@#$%&*)
```

Isso reduz erros evitáveis e melhora a experiência do usuário.

## Exemplos de Uso

### Exemplo 1: Senha Inválida

**Request:**
```json
{
  "email": "user@example.com",
  "password": "Gabriel123"
}
```

**Response do Backend:**
```json
{
  "detail": [
    {
      "type": "value_error",
      "loc": ["body", "password"],
      "msg": "Value error, Senha deve ter no mínimo 1 caractere especial (!@#$%&*)."
    }
  ]
}
```

**Exibido ao Usuário:**
```
Senha: Senha deve ter no mínimo 1 caractere especial (!@#$%&*).
```

### Exemplo 2: Email Duplicado

**Response do Backend:**
```json
{
  "detail": "Email já cadastrado"
}
```

**Exibido ao Usuário:**
```
Email já cadastrado
```

### Exemplo 3: Múltiplos Erros

**Response do Backend:**
```json
{
  "detail": [
    {
      "loc": ["body", "email"],
      "msg": "Value error, Email inválido"
    },
    {
      "loc": ["body", "password"],
      "msg": "Value error, Senha muito curta"
    }
  ]
}
```

**Exibido ao Usuário:**
```
Email: Email inválido
Senha: Senha muito curta
```

## Manutenção

### Adicionar Nova Tradução de Campo

Edite `utils/errorHandler.ts`:

```typescript
const translations: Record<string, string> = {
  email: 'Email',
  password: 'Senha',
  // Adicione aqui:
  username: 'Nome de usuário',
};
```

### Adicionar Nova Regra de Limpeza

Edite a função `cleanErrorMessage`:

```typescript
function cleanErrorMessage(msg: string): string {
  return msg
    .replace(/^Value error,\s*/i, '')
    .replace(/^Novo padrão,\s*/i, '') // Nova regra
    .trim();
}
```

## Testes Recomendados

1. ✅ Senha sem caractere especial
2. ✅ Senha sem número
3. ✅ Senha sem maiúscula
4. ✅ Senha muito curta (< 8 caracteres)
5. ✅ Email inválido
6. ✅ Email duplicado
7. ✅ Múltiplos erros simultâneos
8. ✅ Credenciais de login incorretas

## Stack Técnica

- **TypeScript**: Type safety completo
- **React**: Hooks e componentes funcionais
- **Tailwind CSS**: Estilização com `whitespace-pre-line` para multi-linha
- **FastAPI**: Backend com validação Pydantic

## Benefícios

✅ **UX Melhorada**: Erros claros e em português  
✅ **Type Safety**: TypeScript em todos os níveis  
✅ **Manutenível**: Código centralizado e fácil de estender  
✅ **Robusto**: Fallbacks para erros inesperados  
✅ **Escalável**: Fácil adicionar novos campos e traduções
