# luxjson — React Native + Expo

Migração do projeto original React + Vite para React Native + Expo, preservando a lógica principal, rotas, APIs, blog, autenticação, GitHub e links externos.

## Identidade

- App: luxjson
- Android Application ID: `com.luxjson`
- Ícone: `assets/icon/luxjson-icon.png`
- UI: mobile-first, Material 3 / Material You
- Tema: Sistema, Claro e Escuro
- Material You: pode ser ligado/desligado em Ajustes

## O que foi adaptado

- `react-router-dom` → Expo Router
- HTML/CSS → componentes nativos React Native
- `localStorage` de autenticação → `expo-secure-store`
- links externos → navegador padrão via Expo Linking
- `window.confirm`/`alert` → diálogos nativos
- `EmailJS browser` → endpoint REST do EmailJS, mantendo os mesmos identificadores da integração original
- cursor/hover desktop → feedback de toque nativo
- tabelas administrativas → cards mobile
- navegação desktop → bottom tabs + stack

## API

A URL padrão é `https://api.luxjson.is-a.dev/api`. Para mudar, crie `.env` a partir de `.env.example` e defina `EXPO_PUBLIC_API_URL`.

Se o backend estiver em `localhost`, não use `localhost` no Android físico: informe o endereço de rede acessível pelo dispositivo, ou publique o backend. A migração não remove nem substitui as APIs originais por mocks.

## Instalação

```bash
npm install
npx expo start
```

Para Android local:

```bash
npx expo run:android
```

## APK com EAS

O perfil `preview` já está configurado para gerar `.apk`:

```bash
npm install --global eas-cli
eas login
eas build -p android --profile preview
```

O perfil `production` está configurado como `.aab` para distribuição de loja.

## Observação sobre Material You

`@pchmn/expo-material3-theme` recupera cores dinâmicas do Android 12+ quando o ambiente nativo oferece suporte e fornece fallback para dispositivos incompatíveis. O switch em Ajustes controla se a aplicação usa o tema dinâmico ou a paleta fixa luxjson.


## Backend e autenticação

O backend do aplicativo é exclusivamente `https://api.luxjson.is-a.dev/api`. O contrato original foi preservado: `POST /auth/login` recebe `{ username, password }`, retorna `token` e `admin`, e o token é salvo no `expo-secure-store` como `lux-token`. As chamadas autenticadas enviam `Authorization: Bearer <token>` automaticamente. A sessão é restaurada com `GET /auth/me`.

Não existe token administrativo hardcoded no aplicativo. O token usado no Android é o token real retornado pelo login.

GitHub e EmailJS continuam sendo integrações externas porque fazem parte do projeto original; não foram inventados endpoints no backend luxjson para substituí-las.
