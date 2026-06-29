/**
 * Run once to generate the Google Ads OAuth refresh token.
 * Set CLIENT_ID and CLIENT_SECRET as environment variables before running:
 *
 *   CLIENT_ID=xxx CLIENT_SECRET=yyy node scripts/get-refresh-token.js
 */

const https = require('https');
const http = require('http');
const url = require('url');

const CLIENT_ID = process.env.CLIENT_ID;
const CLIENT_SECRET = process.env.CLIENT_SECRET;
const REDIRECT_URI = 'http://localhost:9999/callback';
const SCOPE = 'https://www.googleapis.com/auth/adwords';

if (!CLIENT_ID || !CLIENT_SECRET) {
  console.error('\n❌ Missing required env vars: CLIENT_ID and CLIENT_SECRET\n');
  console.error('Usage: CLIENT_ID=xxx CLIENT_SECRET=yyy node scripts/get-refresh-token.js\n');
  process.exit(1);
}

const authUrl =
  `https://accounts.google.com/o/oauth2/auth` +
  `?client_id=${CLIENT_ID}` +
  `&redirect_uri=${encodeURIComponent(REDIRECT_URI)}` +
  `&response_type=code` +
  `&scope=${encodeURIComponent(SCOPE)}` +
  `&access_type=offline` +
  `&prompt=consent`;

console.log('\n🔐 Abrindo servidor local para capturar o código OAuth...\n');
console.log('👉 Acesse esta URL no navegador com a conta que tem acesso à MCC:\n');
console.log(authUrl);
console.log('\n⏳ Aguardando autorização...\n');

const server = http.createServer(async (req, res) => {
  const parsedUrl = url.parse(req.url, true);
  if (!parsedUrl.pathname.startsWith('/callback')) return;

  const code = parsedUrl.query.code;
  if (!code) {
    res.end('Nenhum código recebido.');
    return;
  }

  const postData = new URLSearchParams({
    code,
    client_id: CLIENT_ID,
    client_secret: CLIENT_SECRET,
    redirect_uri: REDIRECT_URI,
    grant_type: 'authorization_code',
  }).toString();

  const options = {
    hostname: 'oauth2.googleapis.com',
    path: '/token',
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Content-Length': Buffer.byteLength(postData),
    },
  };

  const tokenReq = https.request(options, (tokenRes) => {
    let data = '';
    tokenRes.on('data', (chunk) => { data += chunk; });
    tokenRes.on('end', () => {
      const token = JSON.parse(data);
      if (token.refresh_token) {
        console.log('\n✅ SUCESSO! Seu refresh_token:\n');
        console.log(token.refresh_token);
        console.log('\n📋 Adicione essa linha no .env.local:');
        console.log(`GOOGLE_ADS_REFRESH_TOKEN=${token.refresh_token}\n`);
        res.end('<h2>✅ Autorizado! Volte ao terminal e copie o refresh_token.</h2>');
      } else {
        console.error('\n❌ Erro:', token);
        res.end('<h2>❌ Erro ao obter token. Veja o terminal.</h2>');
      }
      server.close();
    });
  });

  tokenReq.write(postData);
  tokenReq.end();
});

server.listen(9999, () => {
  console.log('Servidor local rodando em http://localhost:9999');
});
