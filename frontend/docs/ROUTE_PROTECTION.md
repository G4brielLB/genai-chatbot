# 🛡️ Sistema de Proteção de Rotas

## Visão Geral

Sistema completo de proteção de rotas que garante que:
- ✅ Usuários **autenticados** não podem acessar `/login` ou `/register`
- ✅ Usuários **não autenticados** não podem acessar rotas protegidas (`/`, `/chat/:id`)
- ✅ Redirecionamentos automáticos baseados no estado de autenticação

## Arquitetura

### 1. **ProtectedRoute** - Para rotas autenticadas

Protege rotas que **requerem** autenticação.

```tsx
<ProtectedRoute>
  <MainLayout />
</ProtectedRoute>
```

**Comportamento:**
- Se `isAuthenticated = true` → permite acesso
- Se `isAuthenticated = false` → redireciona para `/login`
- Durante `loading = true` → mostra tela de carregamento

**Rotas protegidas:**
- `/` (HomePage)
- `/chat/:id` (ChatPage)

### 2. **GuestRoute** - Para rotas de visitante

Protege rotas que devem ser acessadas **apenas por não autenticados**.

```tsx
<GuestRoute>
  <LoginPage />
</GuestRoute>
```

**Comportamento:**
- Se `isAuthenticated = false` → permite acesso
- Se `isAuthenticated = true` → redireciona para `/`
- Durante `loading = true` → mostra tela de carregamento

**Rotas de visitante:**
- `/login` (LoginPage)
- `/register` (RegisterPage)

## Fluxo de Navegação

### Cenário 1: Usuário NÃO autenticado

```
Tenta acessar: /
↓
ProtectedRoute verifica: isAuthenticated = false
↓
Redireciona para: /login
```

```
Acessa: /login
↓
GuestRoute verifica: isAuthenticated = false
↓
Permite acesso ✅
```

### Cenário 2: Usuário autenticado

```
Tenta acessar: /login
↓
GuestRoute verifica: isAuthenticated = true
↓
Redireciona para: /
```

```
Acessa: /
↓
ProtectedRoute verifica: isAuthenticated = true
↓
Permite acesso ✅
```

### Cenário 3: Durante verificação de autenticação

```
Aplicação carrega
↓
AuthContext verifica autenticação (loading = true)
↓
Ambos ProtectedRoute e GuestRoute mostram tela de loading
↓
Após verificação (loading = false)
↓
Redireciona conforme estado de autenticação
```

## Implementação

### App.tsx

```tsx
<Routes>
  {/* Rotas de visitante (apenas não autenticados) */}
  <Route
    path="/login"
    element={
      <GuestRoute>
        <LoginPage />
      </GuestRoute>
    }
  />
  <Route
    path="/register"
    element={
      <GuestRoute>
        <RegisterPage />
      </GuestRoute>
    }
  />

  {/* Rotas protegidas (apenas autenticados) */}
  <Route
    path="/"
    element={
      <ProtectedRoute>
        <MainLayout />
      </ProtectedRoute>
    }
  >
    <Route index element={<HomePage />} />
    <Route path="chat/:id" element={<ChatPage />} />
  </Route>

  {/* Fallback: redireciona para home */}
  <Route path="*" element={<Navigate to="/" replace />} />
</Routes>
```

## AuthContext

Gerencia o estado de autenticação:

```tsx
interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  isAuthenticated: boolean;  // true se user !== null
  loading: boolean;          // true durante verificação inicial
}
```

**Verificação inicial:**
```tsx
useEffect(() => {
  const checkAuth = async () => {
    try {
      const userData = await apiService.getCurrentUser();
      setUser(userData); // isAuthenticated = true
    } catch (error) {
      setUser(null);     // isAuthenticated = false
    } finally {
      setLoading(false);
    }
  };
  checkAuth();
}, []);
```

## Tela de Loading

Ambos os componentes mostram a mesma tela durante verificação:

```tsx
if (loading) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900">
      <div className="text-center">
        <div className="text-6xl mb-4 animate-bounce">🤖</div>
        <div className="text-white text-lg">Carregando...</div>
      </div>
    </div>
  );
}
```

## Testes Manuais

### ✅ Teste 1: Login com sucesso
1. Acesse `/login` (deve funcionar)
2. Faça login com credenciais válidas
3. Deve redirecionar para `/`
4. Tente acessar `/login` novamente → deve redirecionar para `/`

### ✅ Teste 2: Acesso sem autenticação
1. Abra navegador em modo anônimo
2. Acesse `/` → deve redirecionar para `/login`
3. Acesse `/chat/123` → deve redirecionar para `/login`
4. Acesse `/login` → deve funcionar
5. Acesse `/register` → deve funcionar

### ✅ Teste 3: Logout
1. Estando autenticado, clique em logout
2. Deve redirecionar para `/login`
3. Tente acessar `/` → deve redirecionar para `/login`

### ✅ Teste 4: Refresh com autenticação
1. Faça login
2. Atualize a página (F5)
3. Deve permanecer na mesma rota (autenticação persiste via cookie)

### ✅ Teste 5: URL direto estando autenticado
1. Estando autenticado
2. Digite `/login` na barra de endereços
3. Deve redirecionar para `/`

### ✅ Teste 6: Registro e auto-login
1. Acesse `/register`
2. Crie uma conta
3. Deve fazer login automático e redirecionar para `/`
4. Tente acessar `/register` → deve redirecionar para `/`

## Matriz de Decisão

| Rota | Autenticado | Não Autenticado |
|------|-------------|-----------------|
| `/login` | ❌ Redireciona → `/` | ✅ Acesso permitido |
| `/register` | ❌ Redireciona → `/` | ✅ Acesso permitido |
| `/` | ✅ Acesso permitido | ❌ Redireciona → `/login` |
| `/chat/:id` | ✅ Acesso permitido | ❌ Redireciona → `/login` |
| `/qualquer-rota` | Redireciona → `/` | Redireciona → `/` → `/login` |

## Benefícios

✅ **UX Melhorada**: Não mostra páginas de login para quem já está logado  
✅ **Segurança**: Impede acesso a rotas protegidas sem autenticação  
✅ **Consistência**: Comportamento previsível em todas as rotas  
✅ **Performance**: Loading state unificado evita flashes de conteúdo  
✅ **Manutenível**: Lógica centralizada em 2 componentes reutilizáveis

## Stack Técnica

- **React Router**: Navegação e redirecionamentos
- **React Context**: Estado global de autenticação
- **TypeScript**: Type safety completo
- **JWT + HttpOnly Cookies**: Autenticação segura

## Observações

1. **Cookie HttpOnly**: O token JWT está em cookie HttpOnly, então persiste entre reloads
2. **Verificação assíncrona**: A verificação inicial é assíncrona, por isso o loading state
3. **Replace history**: Usamos `replace` nos redirecionamentos para não poluir o histórico
4. **Fallback route**: Qualquer rota desconhecida redireciona para `/`, que por sua vez redireciona para `/login` se não autenticado
