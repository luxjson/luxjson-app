# API e CORS no navegador

O aplicativo usa exclusivamente `https://api.luxjson.is-a.dev/api` para a API do luxjson.

No Android/iOS, as chamadas nativas não são bloqueadas pela política CORS do navegador.

Se o projeto for executado com `npx expo start --web`, o navegador exige que o servidor da API devolva `Access-Control-Allow-Origin` para a origem do aplicativo e responda corretamente ao preflight `OPTIONS` de endpoints como `/auth/login`.

Esse cabeçalho não pode ser adicionado pelo React Native/Expo no cliente. Tentar usar `mode: no-cors` ou um proxy público para contornar isso quebraria a leitura da resposta ou exporia credenciais.

Para o domínio de produção do site/app web, configure o backend para permitir a origem correspondente e os métodos/headers usados pelo cliente, incluindo `Authorization` e `Content-Type` quando aplicável.
