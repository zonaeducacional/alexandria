export async function onRequest(context) {
  const { request, env } = context;

  // Clone a requisição do usuário (o Alexandria React Frontend)
  const url = new URL(request.url);
  
  // Apontar a URL para os servidores reais da Agnes
  // O frontend mandou para /api/agnes/v1/chat/completions
  // Isso substitui para https://apihub.agnes-ai.com/v1/chat/completions
  const targetUrl = request.url.replace(url.origin + '/api/agnes', 'https://apihub.agnes-ai.com');
  
  const headers = new Headers(request.headers);
  // Aqui está a magia! O Cloudflare injeta a sua chave secreta que só existe no painel web!
  if (env.AGNES_API_KEY) {
    headers.set('Authorization', `Bearer ${env.AGNES_API_KEY}`);
  }

  // Se for uma requisição OPTIONS (CORS preflight)
  if (request.method === "OPTIONS") {
    return new Response(null, {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization",
      }
    });
  }

  // Encaminha a requisição com os cabeçalhos seguros para a IA
  const response = await fetch(targetUrl, {
    method: request.method,
    headers: headers,
    body: request.method !== 'GET' && request.method !== 'HEAD' ? request.body : null
  });

  return response;
}
