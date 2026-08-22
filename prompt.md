# PROMPT GSD — LUXJSON COMMUNITY SYSTEM
 
> Leia todo este documento antes de escrever qualquer linha de código. Implemente tudo na ordem indicada. Não pule etapas, não invente rotas, modelos ou arquivos que não existem — trabalhe apenas sobre a base real descrita abaixo.
 
---
 
## 1. CONTEXTO DO PROJETO
 
### Stack
- **App:** Expo Router 57 + React Native 0.86 + React 19 (JSX, não TSX)
- **Backend:** Node.js + Express + PostgreSQL (via `pg` pool)
- **Auth atual:** JWT com `jsonwebtoken` + `bcrypt`, armazenado em `lux-token` via `expo-secure-store`
- **Icons:** `@react-native-vector-icons/material-icons/static`
- **HTTP:** Axios (`lib/api.js`) com interceptors de auth e token em memória
- **Docs:** Swagger JSDoc + Scalar API Reference em `/docs`
### Estrutura atual do app
```
app/
  (tabs)/
    _layout.jsx        ← exporta BottomTabs
    index.jsx          ← Home
    projects.jsx
    games.jsx          ← SERÁ SUBSTITUÍDA
    blog.jsx
    settings.jsx
  admin/
    index.jsx          ← Dashboard admin
    posts/
      index.jsx / form.jsx / new.jsx / edit/[id].jsx
  blog/[slug].jsx
  login.jsx
  settings/[section].jsx
  _layout.jsx
 
components/
  BottomTabs.jsx       ← define as 5 abas com FloatingTabBar
  FloatingTabBar.jsx   ← renderizador customizado
  AppHeader.jsx / AppText.jsx / BackButton.jsx / Screen.jsx
  AuthGuard.jsx / LoadingView.jsx / ServerStatusCard.jsx
  InfoSheet.jsx / ContactSheet.jsx / ProjectCard.jsx
 
context/
  AuthContext.jsx      ← admin (state), login(), logout(), isAuthenticated, api
  LanguageContext.jsx  ← t (dicionário pt/en/es), locale
  ThemeContext.jsx
 
lib/
  api.js               ← axios instance, setAuthToken, clearAuthToken, unwrapList, unwrapObject, apiMessage
  storage.js           ← getItem / setItem / removeItem (expo-secure-store)
  external.js / github.js / itch.js / email.js
 
constants/
  config.js            ← API_URL = 'https://api.luxjson.is-a.dev/api'
```
 
### Estrutura atual do backend
```
src/
  config/
    database.js        ← pool PostgreSQL via DATABASE_URL
    swagger.js         ← swaggerJSDoc spec
  controllers/
    authController.js  ← login(), me()
  middleware/
    auth.js            ← verifica Bearer JWT, injeta req.admin = { id, username }
    errorHandler.js
  models/
    Admin.js           ← findByUsername, findById, create, updatePassword
    BlogPost.js        ← findById, findAll, findBySlug, create, update, delete, incrementViews, getStats
  routes/
    authRoutes.js      ← POST /api/auth/login, GET /api/auth/me
    blogRoutes.js      ← GET/POST/PUT/DELETE /api/blog/posts, GET /api/blog/stats
  utils/
    helpers.js         ← slugify()
server.js              ← monta express, cors, helmet, rate limit, swagger, /api/health, /
public/
  style.css / BOLD.ttf
```
 
### Auth Context atual (importante — não quebre)
```js
// context/AuthContext.jsx — estado relevante
const [admin, setAdmin] = useState(null);
// Exporta: admin, loading, login, logout, api, isAuthenticated
// login() chama POST /api/auth/login e salva 'lux-token'
// me() restaura sessão via GET /api/auth/me
// O campo retornado pela API é `admin` (não `user`)
```
 
---
 
## 2. O QUE DEVE SER IMPLEMENTADO
 
### VISÃO GERAL
Substituir a aba **Games** por uma aba **Comunidade** — um feed estilo Twitter, somente texto. Usuários comuns se cadastram pelo app e podem postar, curtir e denunciar. Admins existentes podem também postar na comunidade (marcados com badge "Admin"). Posts denunciados ficam ocultos até aprovação do admin. Perfil só é acessível via Configurações → Conta.
 
---
 
## 3. SQL — EXECUTE NO BANCO POSTGRESQL
 
```sql
-- =============================================
-- TABELA DE USUÁRIOS DA COMUNIDADE
-- =============================================
CREATE TABLE IF NOT EXISTS community_users (
    id              SERIAL PRIMARY KEY,
    registration_number SERIAL UNIQUE,     -- #1, #2, #3...
    name            VARCHAR(100) NOT NULL,
    username        VARCHAR(50)  NOT NULL UNIQUE,
    password_hash   TEXT         NOT NULL,
    avatar_url      TEXT,
    created_at      TIMESTAMPTZ  DEFAULT NOW(),
    updated_at      TIMESTAMPTZ  DEFAULT NOW()
);
 
-- Index para busca por username
CREATE UNIQUE INDEX IF NOT EXISTS idx_community_users_username_lower
    ON community_users (LOWER(username));
 
-- =============================================
-- TABELA DE POSTS DA COMUNIDADE
-- =============================================
CREATE TABLE IF NOT EXISTS community_posts (
    id              SERIAL PRIMARY KEY,
    content         TEXT         NOT NULL CHECK (char_length(content) BETWEEN 1 AND 500),
    author_user_id  INTEGER REFERENCES community_users(id) ON DELETE CASCADE,
    author_admin_id INTEGER REFERENCES admins(id) ON DELETE CASCADE,
    is_admin_post   BOOLEAN      NOT NULL DEFAULT FALSE,
    status          VARCHAR(20)  NOT NULL DEFAULT 'active'
                        CHECK (status IN ('active', 'reported', 'approved', 'removed')),
    created_at      TIMESTAMPTZ  DEFAULT NOW(),
    -- Garante que sempre há exatamente um autor
    CONSTRAINT chk_one_author CHECK (
        (author_user_id IS NOT NULL AND author_admin_id IS NULL AND is_admin_post = FALSE) OR
        (author_admin_id IS NOT NULL AND author_user_id IS NULL AND is_admin_post = TRUE)
    )
);
 
-- =============================================
-- TABELA DE LIKES
-- =============================================
CREATE TABLE IF NOT EXISTS community_likes (
    id              SERIAL PRIMARY KEY,
    post_id         INTEGER      NOT NULL REFERENCES community_posts(id) ON DELETE CASCADE,
    user_id         INTEGER REFERENCES community_users(id) ON DELETE CASCADE,
    admin_id        INTEGER REFERENCES admins(id) ON DELETE CASCADE,
    created_at      TIMESTAMPTZ  DEFAULT NOW(),
    CONSTRAINT chk_like_one_author CHECK (
        (user_id IS NOT NULL AND admin_id IS NULL) OR
        (admin_id IS NOT NULL AND user_id IS NULL)
    ),
    CONSTRAINT uq_like_user  UNIQUE (post_id, user_id),
    CONSTRAINT uq_like_admin UNIQUE (post_id, admin_id)
);
 
-- =============================================
-- TABELA DE DENÚNCIAS
-- =============================================
CREATE TABLE IF NOT EXISTS community_reports (
    id              SERIAL PRIMARY KEY,
    post_id         INTEGER      NOT NULL REFERENCES community_posts(id) ON DELETE CASCADE,
    reporter_user_id  INTEGER REFERENCES community_users(id) ON DELETE SET NULL,
    reporter_admin_id INTEGER REFERENCES admins(id) ON DELETE SET NULL,
    reason          TEXT,
    created_at      TIMESTAMPTZ  DEFAULT NOW(),
    CONSTRAINT chk_reporter CHECK (
        (reporter_user_id IS NOT NULL AND reporter_admin_id IS NULL) OR
        (reporter_admin_id IS NOT NULL AND reporter_user_id IS NULL)
    )
);
```
 
---
 
## 4. BACKEND — O QUE CRIAR/MODIFICAR
 
### 4.1 Novo middleware: `src/middleware/authFlex.js`
 
Middleware que aceita tanto token de admin quanto de usuário comum (sem rejeitar quem não está logado — apenas identifica quem está):
 
```js
// src/middleware/authFlex.js
// Injeta req.authUser = { id, username, role: 'user'|'admin' } se token válido
// Caso contrário, req.authUser = null (não rejeita a request)
const jwt = require('jsonwebtoken');
 
module.exports = (req, res, next) => {
    const header = req.headers.authorization;
    if (!header || !header.startsWith('Bearer ')) {
        req.authUser = null;
        return next();
    }
    const token = header.split(' ')[1];
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        // decoded.role distingue 'user' de 'admin'
        req.authUser = decoded;
    } catch {
        req.authUser = null;
    }
    next();
};
```
 
### 4.2 Middleware: `src/middleware/requireUser.js`
 
Rejeita se não tiver token válido de usuário ou admin:
 
```js
// src/middleware/requireUser.js
module.exports = (req, res, next) => {
    if (!req.authUser) {
        return res.status(401).json({ success: false, message: 'Login required' });
    }
    next();
};
```
 
### 4.3 Novo controller: `src/controllers/communityAuthController.js`
 
```
Implementar:
 
register(req, res, next)
  - Recebe: { name, username, password, confirmPassword }
  - Valida: todos obrigatórios, password === confirmPassword, username único
    (comparar LOWER(username) com LOWER de admins.username E community_users.username)
  - Hash bcrypt de password
  - Insere em community_users
  - Retorna: { success: true, user: { id, registration_number, name, username, created_at } }
 
loginUser(req, res, next)
  - Recebe: { username, password }
  - Busca em community_users por LOWER(username)
  - Se não achar, busca em admins (assim o mesmo endpoint /community/auth/login serve para ambos)
  - Verifica bcrypt
  - Gera JWT com payload:
      Para usuário: { id, username, role: 'user', registration_number }
      Para admin:   { id, username, role: 'admin' }
  - Retorna: { success: true, token, role: 'user'|'admin', user/admin: {...} }
 
meUser(req, res, next)  [requer requireUser]
  - Se req.authUser.role === 'admin': busca em admins
  - Se 'user': busca em community_users
  - Retorna dados sem password_hash
 
updateProfile(req, res, next)  [requer requireUser + role === 'user']
  - Recebe: { name?, username?, avatar_url? }
  - Valida unicidade do novo username (LOWER, contra admins E community_users, exceto si mesmo)
  - Atualiza community_users
  - Retorna user atualizado
 
deletePost(req, res, next)  [requer requireUser]
  - Só permite se post.author_user_id === req.authUser.id (user) ou role === 'admin'
```
 
### 4.4 Novo controller: `src/controllers/communityController.js`
 
```
Implementar:
 
getPosts(req, res, next)  [authFlex — sem auth obrigatória]
  - Query: SELECT community_posts.*, 
           COALESCE(u.name, a.username) as author_name,
           COALESCE(u.username, a.username) as author_username,
           COALESCE(u.registration_number, NULL) as registration_number,
           community_posts.is_admin_post,
           COUNT(DISTINCT l.id) as likes_count,
           EXISTS(SELECT 1 FROM community_likes WHERE post_id = p.id 
                  AND (user_id = $caller_user_id OR admin_id = $caller_admin_id)) as liked_by_me
    FROM community_posts p
    LEFT JOIN community_users u ON p.author_user_id = u.id
    LEFT JOIN admins a ON p.author_admin_id = a.id
    LEFT JOIN community_likes l ON l.post_id = p.id
    WHERE p.status IN ('active', 'approved')
    GROUP BY p.id, u.name, u.username, u.registration_number, a.username
    ORDER BY p.created_at DESC
    LIMIT $limit OFFSET $offset
  - liked_by_me = false se não estiver logado
 
createPost(req, res, next)  [requireUser]
  - Recebe: { content }
  - Valida: 1-500 chars
  - Se role === 'admin': author_admin_id = id, is_admin_post = true
  - Se role === 'user':  author_user_id = id
  - Retorna post criado com dados do autor
 
likePost(req, res, next)  [requireUser]
  - Toggle: se já existe like -> remove (unlike). Se não -> insere.
  - Retorna { liked: boolean, likes_count: number }
 
reportPost(req, res, next)  [requireUser]
  - Insere em community_reports
  - Atualiza community_posts SET status = 'reported' WHERE id = $post_id AND status = 'active'
  - Retorna { success: true }
 
getUserPosts(req, res, next)  [requireUser — só pro próprio user ou admin]
  - Lista posts de req.authUser.id (role user) ou do user passado no param (role admin)
  - Inclui posts com status 'active', 'reported', 'approved', 'removed'
 
--- ADMIN ONLY ---
 
getReportedPosts(req, res, next)  [requireUser + role admin]
  - Lista posts com status = 'reported'
  - JOIN com community_reports para mostrar razão e quem denunciou
 
moderatePost(req, res, next)  [requireUser + role admin]
  - Recebe: { action: 'approve' | 'remove' }
  - 'approve' → SET status = 'active'   (volta ao feed)
  - 'remove'  → SET status = 'removed'  (fica oculto permanentemente)
  - Retorna post atualizado
```
 
### 4.5 Novo arquivo de rotas: `src/routes/communityRoutes.js`
 
Rotas a implementar com JSDoc Swagger completo (todas com description contendo "(Authentication Required)" nas que precisam):
 
```
POST   /api/community/auth/register        → communityAuthController.register
POST   /api/community/auth/login           → communityAuthController.loginUser
GET    /api/community/auth/me              → requireUser → communityAuthController.meUser
PUT    /api/community/auth/profile         → requireUser → communityAuthController.updateProfile
 
GET    /api/community/posts                → authFlex → communityController.getPosts
POST   /api/community/posts                → requireUser → communityController.createPost
DELETE /api/community/posts/:id            → requireUser → communityController.deletePost
POST   /api/community/posts/:id/like       → requireUser → communityController.likePost
POST   /api/community/posts/:id/report     → requireUser → communityController.reportPost
GET    /api/community/users/:id/posts      → requireUser → communityController.getUserPosts
 
GET    /api/community/admin/reports        → requireUser (admin) → communityController.getReportedPosts
PUT    /api/community/admin/posts/:id/moderate → requireUser (admin) → communityController.moderatePost
```
 
**Swagger doc de cada rota:**
- As protegidas por requireUser devem ter `security: [{ BearerAuth: [] }]` no JSDoc
- Adicionar `summary` descrevendo o que faz
- O token usado aqui é o mesmo JWT_SECRET do sistema, mas com payload diferente (`role` field)
### 4.6 Registrar rotas no `server.js`
 
Adicionar após `app.use('/api/blog', blogRoutes)`:
```js
const communityRoutes = require('./src/routes/communityRoutes');
app.use('/api/community', communityRoutes);
```
 
### 4.7 Atualizar página inicial do servidor (`server.js` — rota GET `/`)
 
A página web que lista os endpoints já lê dinamicamente do swagger.json, então automaticamente mostrará as novas rotas. Não precisa mudar nada além de registrar as rotas.
 
---
 
## 5. APP — O QUE CRIAR/MODIFICAR
 
### 5.1 Atualizar `context/AuthContext.jsx`
 
O AuthContext precisa suportar tanto admin quanto user comum. **Não quebre o contrato existente** (`admin`, `isAuthenticated`, `login`, `logout`, `api`). Adicionar:
 
```
Novos estados/funções a adicionar ao AuthContext:
- currentUser: objeto do usuário logado (pode ser admin ou user)
- userRole: 'admin' | 'user' | null
- loginUser(username, password): chama POST /community/auth/login
    - Salva token em 'lux-community-token'
    - Seta currentUser e userRole
- logoutUser(): remove 'lux-community-token', limpa currentUser
- isUserAuthenticated: boolean
 
Restauração de sessão:
- Ao inicializar, verifica 'lux-token' (admin) E 'lux-community-token' (user)
- Admin usa GET /auth/me como antes
- User usa GET /community/auth/me
 
IMPORTANTE: login() existente (admin) deve continuar funcionando como antes.
O novo loginUser() é para usuários comuns. Ambos coexistem.
Se admin estiver logado: isAuthenticated = true, admin = {...}
Se user estiver logado:  isUserAuthenticated = true, currentUser = {...}, userRole = 'user'
```
 
### 5.2 Criar `lib/communityApi.js`
 
Funções utilitárias para chamadas à comunidade:
 
```js
// Usar a instância `api` de lib/api.js
// Funções: fetchPosts, createPost, likePost, reportPost, deletePost
// registerUser, loginUser, fetchMe, updateProfile
// fetchReportedPosts, moderatePost, fetchUserPosts
// Cada função trata erros e retorna { success, data, message }
```
 
### 5.3 Substituir `app/(tabs)/games.jsx` → `app/(tabs)/community.jsx`
 
**Renomear o arquivo** de `games.jsx` para `community.jsx`. Implementar a tela de feed:
 
```
Layout:
- AppHeader com title={t.community}
- Se NÃO estiver logado (nem como user nem como admin):
    → Banner no topo: card/faixa com ícone, texto "Esta aba requer cadastro/login" + botão "Entrar / Cadastrar" → vai para /login (que agora tem link de cadastro)
- Lista de posts (FlatList com pull-to-refresh)
- Cada PostCard mostra:
    • Avatar placeholder com inicial do nome
    • Nome do autor
    • Tag: se is_admin_post → badge "ADMIN" colorido; se user → "#N" (registration_number)
    • Conteúdo do post (texto)
    • Data relativa (hoje às HH:MM, ontem, DD/MM/YYYY)
    • Botões de ação:
        ◦ Like: ícone coração (filled se liked_by_me). Se não logado → vai para /login
        ◦ Denunciar: ícone flag. Se não logado → /login. Se logado → confirmação → reportPost
        ◦ Excluir: só aparece se post.author_user_id === currentUser.id OU se role === 'admin'. Ícone lixo.
- FAB (Floating Action Button) com ícone "add" no canto inferior direito
    → Só aparece se logado. Se não logado, não mostra.
    → Ao clicar: abre modal de composição (campo de texto 1-500 chars + botão publicar)
```
 
### 5.4 Atualizar `components/BottomTabs.jsx`
 
Trocar a aba `games` pela aba `community`:
 
```jsx
// ANTES:
<Tabs.Screen name="games" options={{ title: t.games, tabBarIcon: ... 'sports-esports' }} />
 
// DEPOIS:
<Tabs.Screen name="community" options={{ title: t.community, tabBarIcon: ... 'people' }} />
```
 
### 5.5 Atualizar `app/login.jsx`
 
Transformar em tela que serve tanto para admin quanto para usuário comum. Adicionar:
 
```
Layout atual preservado (username + password + botão Login).
Adicionar abaixo do botão Login:
- Link/Pressable "Não tem conta? Cadastre-se" → navega para /register
 
O botão Login agora chama loginUser() (do AuthContext).
A função loginUser() já tenta community_users, se não achar tenta admins.
Se o login retornar role === 'admin' → router.replace('/admin')
Se retornar role === 'user' → router.replace('/(tabs)/settings') 
   (pois o perfil fica em settings/account, não na comunidade)
```
 
### 5.6 Criar `app/register.jsx`
 
Tela de cadastro de usuário comum:
 
```
Layout similar ao login.jsx (mesmo card centralizado, mesmo estilo):
- Campos: Nome completo, Username, Senha, Confirmar senha
- Botão "Cadastrar" → chama POST /api/community/auth/register
- Link "Já tem conta? Entrar" → volta para /login
- Após cadastro bem-sucedido: faz login automático e vai para /(tabs)/community
- Erros: mostrar inline (username já existe, senhas não coincidem, etc.)
```
 
### 5.7 Atualizar `app/settings/[section].jsx`
 
Substituir a seção `admin` pela seção `account`:
 
```
sections array: trocar 'admin' por 'account'
titleMap: account → t.accountTitle
 
Componente <Account /> (substitui <Admin />):
 
Se NÃO estiver logado (nem user nem admin):
  - Dois campos: username + senha
  - Botão primário "Login"
  - Link abaixo "Não tem conta? Cadastre-se" → router.push('/register')
 
Se logado como USER (isUserAuthenticated && userRole === 'user'):
  - Mostra: Avatar (placeholder circular com inicial), Nome, Username, Tag #N
  - Campos editáveis: Nome, Username, Avatar URL
  - Botão "Salvar alterações" → PUT /api/community/auth/profile
  - Seção "Meus Posts" → lista com opção de excluir cada um
  - Botão "Sair" na parte inferior
 
Se logado como ADMIN (isAuthenticated && admin):
  - Mostra: "Sessão: admin/@username"
  - Botão "Abrir Painel" → router.push('/admin')
  - Botão "Sair"
```
 
### 5.8 Atualizar `app/(tabs)/settings.jsx`
 
No array `items`, trocar o item `admin` pelo `account`:
 
```js
// ANTES:
['admin', 'admin-panel-settings', t.adminTitle, t.adminDesc, t.adminArea],
 
// DEPOIS:
['account', 'account-circle', t.accountTitle, t.accountDesc, `${t.login} ${t.register}`],
```
 
### 5.9 Atualizar `app/admin/index.jsx` — Dashboard do Admin
 
Adicionar nova seção de denúncias ao dashboard existente. **Não remover nada que já existe.** Adicionar:
 
```
Nova card/seção no dashboard (após as existentes):
  - Título: "Denúncias da Comunidade"
  - Botão "Ver Denúncias" → router.push('/admin/reports')
  - Badge com contagem de posts reportados (busca de /api/community/admin/reports)
```
 
### 5.10 Criar `app/admin/reports/index.jsx`
 
Tela de moderação de denúncias para o admin:
 
```
- AppHeader "Denúncias"
- BackButton para /admin
- FlatList de posts com status 'reported'
- Cada item mostra:
    • Conteúdo do post
    • Autor (nome + tag)
    • Data do post
    • Quem denunciou + quando
    • Dois botões: "Aprovar" (volta ao feed) e "Remover" (oculta permanentemente)
- Feedback visual após ação (item some da lista)
```
 
### 5.11 Atualizar `app/_layout.jsx`
 
Garantir que `/register` e `/admin/reports` estejam acessíveis (não precisam de entry especial no Expo Router, mas verificar se há algum AuthGuard impedindo acesso não autenticado ao register).
 
### 5.12 Atualizar `app/(tabs)/index.jsx` — Home
 
Substituir referências a Games/itch.io pela Comunidade:
 
```
No grid de Quick Access:
  ANTES: icon="sports-esports" title={t.games} onPress={() => router.push('/(tabs)/games')}
  DEPOIS: icon="people" title={t.community} onPress={() => router.push('/(tabs)/community')}
 
No statsGrid (cards de estatística):
  ANTES: icon="sports-esports" value="02" label={t.gamesStat}
  DEPOIS: icon="people" value={communityPostsCount} label={t.communityStat}
  (buscar contagem de posts via GET /api/community/posts?limit=1 e usar total, ou hardcode "∞" se não quiser fetch)
 
No buildList (seção "Ideas into Reality"):
  ANTES: icon="sports-esports" title={t.gamesBuild} description={t.gamesBuildDesc} number="02"
  DEPOIS: icon="people" title={t.communityBuild} description={t.communityBuildDesc} number="02"
```
 
---
 
## 6. DICIONÁRIO DE TRADUÇÕES — `context/LanguageContext.jsx`
 
Adicionar as seguintes chaves nos três idiomas (`pt`, `en`, `es`). **Não remover nenhuma chave existente.**
 
```js
// Chaves a adicionar em pt:
community: 'Comunidade',
communityDesc: 'Veja e participe das discussões da comunidade.',
communityBuild: 'Comunidade',
communityBuildDesc: 'Interaja com outros usuários e compartilhe ideias.',
communityStat: 'posts',
loginRequired: 'Esta aba requer cadastro/login no app.',
loginToInteract: 'Faça login para interagir.',
postPlaceholder: 'O que você está pensando?',
publish: 'Publicar',
publishing: 'Publicando...',
deletePost: 'Excluir post',
deleteConfirm: 'Tem certeza que deseja excluir este post?',
reportPost: 'Denunciar post',
reportConfirm: 'Denunciar este post para moderação?',
reported: 'Denunciado',
liked: 'Curtido',
likes: 'curtidas',
accountTitle: 'Conta',
accountDesc: 'Gerencie sua conta e perfil.',
register: 'Cadastre-se',
registerTitle: 'Criar conta',
confirmPassword: 'Confirmar senha',
passwordMismatch: 'As senhas não coincidem.',
usernameExists: 'Este username já está em uso.',
registerSuccess: 'Conta criada com sucesso!',
myPosts: 'Meus posts',
editProfile: 'Editar perfil',
saveChanges: 'Salvar alterações',
saving: 'Salvando...',
fullName: 'Nome completo',
avatarUrl: 'URL do avatar (opcional)',
reportedPosts: 'Denúncias',
approvePost: 'Aprovar',
removePost: 'Remover',
moderationDone: 'Moderação realizada.',
noReports: 'Nenhuma denúncia pendente.',
 
// Chaves a adicionar em en:
community: 'Community',
communityDesc: 'See and join community discussions.',
communityBuild: 'Community',
communityBuildDesc: 'Interact with other users and share ideas.',
communityStat: 'posts',
loginRequired: 'This tab requires signup/login in the app.',
loginToInteract: 'Log in to interact.',
postPlaceholder: 'What are you thinking?',
publish: 'Publish',
publishing: 'Publishing...',
deletePost: 'Delete post',
deleteConfirm: 'Are you sure you want to delete this post?',
reportPost: 'Report post',
reportConfirm: 'Report this post for moderation?',
reported: 'Reported',
liked: 'Liked',
likes: 'likes',
accountTitle: 'Account',
accountDesc: 'Manage your account and profile.',
register: 'Sign up',
registerTitle: 'Create account',
confirmPassword: 'Confirm password',
passwordMismatch: 'Passwords do not match.',
usernameExists: 'This username is already taken.',
registerSuccess: 'Account created successfully!',
myPosts: 'My posts',
editProfile: 'Edit profile',
saveChanges: 'Save changes',
saving: 'Saving...',
fullName: 'Full name',
avatarUrl: 'Avatar URL (optional)',
reportedPosts: 'Reports',
approvePost: 'Approve',
removePost: 'Remove',
moderationDone: 'Moderation done.',
noReports: 'No pending reports.',
 
// Chaves a adicionar em es:
community: 'Comunidad',
communityDesc: 'Ve y participa en las discusiones de la comunidad.',
communityBuild: 'Comunidad',
communityBuildDesc: 'Interactúa con otros usuarios y comparte ideas.',
communityStat: 'publicaciones',
loginRequired: 'Esta pestaña requiere registro/inicio de sesión.',
loginToInteract: 'Inicia sesión para interactuar.',
postPlaceholder: '¿Qué estás pensando?',
publish: 'Publicar',
publishing: 'Publicando...',
deletePost: 'Eliminar publicación',
deleteConfirm: '¿Seguro que deseas eliminar esta publicación?',
reportPost: 'Denunciar publicación',
reportConfirm: '¿Denunciar esta publicación para moderación?',
reported: 'Denunciado',
liked: 'Gustó',
likes: 'me gusta',
accountTitle: 'Cuenta',
accountDesc: 'Gestiona tu cuenta y perfil.',
register: 'Regístrate',
registerTitle: 'Crear cuenta',
confirmPassword: 'Confirmar contraseña',
passwordMismatch: 'Las contraseñas no coinciden.',
usernameExists: 'Este nombre de usuario ya está en uso.',
registerSuccess: '¡Cuenta creada con éxito!',
myPosts: 'Mis publicaciones',
editProfile: 'Editar perfil',
saveChanges: 'Guardar cambios',
saving: 'Guardando...',
fullName: 'Nombre completo',
avatarUrl: 'URL del avatar (opcional)',
reportedPosts: 'Denuncias',
approvePost: 'Aprobar',
removePost: 'Eliminar',
moderationDone: 'Moderación realizada.',
noReports: 'No hay denuncias pendientes.',
```
 
---
 
## 7. REGRAS DE NEGÓCIO CRÍTICAS
 
### Username único global
O username de um usuário comum **não pode ser igual** (case-insensitive) ao username de:
- Qualquer outro `community_users.username`
- Qualquer `admins.username`
Verificar nos endpoints de `register` e `updateProfile` com queries:
```sql
SELECT COUNT(*) FROM (
  SELECT username FROM community_users WHERE LOWER(username) = LOWER($1) AND id != $excludeId
  UNION ALL
  SELECT username FROM admins WHERE LOWER(username) = LOWER($1)
) t
```
 
### Sistema de denúncias
1. Usuário ou admin denuncia um post → status muda de `'active'` para `'reported'`
2. Post `'reported'` **não aparece** no feed público (filtro no getPosts: `status IN ('active', 'approved')`)
3. Admin vê os posts reportados em `/admin/reports`
4. Admin pode:
   - **Aprovar** (achar que é falso alarme) → status volta para `'active'`
   - **Remover** (confirmar a denúncia) → status = `'removed'` (permanente)
### Tags de identificação nos posts
- Usuário comum: exibir `#${registration_number}` (ex: `#1`, `#42`)
- Admin: exibir badge `ADMIN` (estilizado, ex: fundo com cor primary, texto onPrimary)
### Perfil acessível apenas por Configurações → Conta
- **NÃO** criar link de perfil dentro da aba Comunidade
- Posts mostram nome + tag mas **não são clicáveis** para ver perfil
- Para editar perfil: Configurações → Conta (settings/account)
### Post delete
- Usuário só pode deletar seus próprios posts
- Admin pode deletar qualquer post
- Verificação no backend: se `req.authUser.role === 'user'` → verificar `post.author_user_id === req.authUser.id`
---
 
## 8. FLUXO COMPLETO DAS ABAS — REVISÃO FINAL
 
Após implementar tudo, garantir que este fluxo funcione ponta a ponta:
 
```
TAB: Home (index)
  ✓ Grid de Quick Access: Projetos, Comunidade, Blog, Ajustes
  ✓ Stats: repos GitHub (dinâmico), posts comunidade (dinâmico ou ∞), artigos blog (hardcode ou dinâmico), ideias (∞)
  ✓ Build section: Software, Comunidade, Web
  ✓ Zero referências a itch.io ou games nesta tela
 
TAB: Projetos
  ✓ Sem alterações
 
TAB: Comunidade (era Games)
  ✓ Não logado: banner de aviso + feed visível mas botões de like/report/post bloqueados
  ✓ Logado como user: feed completo + FAB + like/report/delete próprio
  ✓ Logado como admin: igual user + pode deletar qualquer post
  ✓ Posts reportados: invisíveis no feed
  ✓ Pull-to-refresh funciona
 
TAB: Blog
  ✓ Sem alterações
 
TAB: Ajustes (Settings)
  ✓ Lista: Aparência, Idioma, Conexões, CONTA (era Admin), Apoie, Links
  ✓ Aba Conta: lógica condicional (não logado / logado como user / logado como admin)
 
FORA DAS ABAS:
  /login
    ✓ Aceita user ou admin com mesmo endpoint
    ✓ Link "Cadastrar" visível
    ✓ Redireciona: admin → /admin | user → /(tabs)/settings
 
  /register
    ✓ Nome, username, senha, confirmar senha
    ✓ Após cadastro: login automático → /(tabs)/community
 
  /admin (dashboard)
    ✓ Stats de blog preservadas
    ✓ Nova card: Denúncias da Comunidade + botão + badge de contagem
    
  /admin/reports
    ✓ Lista de posts denunciados
    ✓ Ações: Aprovar / Remover
```
 
---
 
## 9. QUALIDADE E BOAS PRÁTICAS
 
- Usar `AppText`, `DisplayText`, `Screen`, `AppHeader`, `BackButton` de forma consistente com o restante do app
- Manter o padrão visual: `borderRadius: 26-32`, `gap: 12-16`, cards com `backgroundColor: theme.card, borderColor: theme.surfaceVariant, borderWidth: 1`
- Todos os botões primários: `backgroundColor: theme.primary`, texto `theme.onPrimary`, `borderRadius: 27`, `minHeight: 50-54`
- Posts em FlatList com `showsVerticalScrollIndicator={false}` e `contentContainerStyle={{ padding: 18, paddingBottom: 130 }}`
- Tratamento de erros em todas as chamadas de API com `apiMessage(error)` de `lib/api.js`
- Loading states com `<LoadingView />` ou skeleton simples
- Não usar `console.log` em produção; usar early return em condicionais longas
- Backend: sempre `next(error)` nos catch para o errorHandler centralizado
- Sanitizar o `content` dos posts no backend (pode usar `sanitize-html` já instalado, ou simplesmente `trim()` + `length check` já que é só texto plano)
---
 
## 10. ORDEM DE IMPLEMENTAÇÃO SUGERIDA
 
1. SQL → executar no banco
2. Backend: `authFlex.js` + `requireUser.js` (middlewares)
3. Backend: `communityAuthController.js` (register, login, me, updateProfile)
4. Backend: `communityController.js` (getPosts, createPost, likePost, reportPost, deletePost, getUserPosts, getReportedPosts, moderatePost)
5. Backend: `communityRoutes.js` com toda a documentação Swagger
6. Backend: registrar rotas no `server.js`
7. App: atualizar `context/AuthContext.jsx` (adicionar user auth sem quebrar admin)
8. App: criar `lib/communityApi.js`
9. App: adicionar traduções em `context/LanguageContext.jsx`
10. App: renomear `games.jsx` → `community.jsx` e implementar feed
11. App: atualizar `BottomTabs.jsx`
12. App: atualizar `login.jsx` (adicionar link cadastro + suporte user/admin)
13. App: criar `register.jsx`
14. App: atualizar `settings/[section].jsx` (account em vez de admin)
15. App: atualizar `settings.jsx` (item account)
16. App: atualizar `index.jsx` (home — trocar games por community)
17. App: atualizar `admin/index.jsx` (adicionar card de denúncias)
18. App: criar `admin/reports/index.jsx`
19. Revisão final do fluxo completo (seção 8)
---
 
**FIM DO PROMPT. Implemente tudo na ordem acima. Se tiver dúvida sobre algum trecho do código existente, peça o arquivo específico antes de inventar uma implementação.**
