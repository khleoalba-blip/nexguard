const APK_PATH = "/nexguard.apk";

export async function onRequest(context) {
  const { request, next } = context;
  const url = new URL(request.url);

  // Acepta /nexguard.apk y /NexGuard.apk (el routing de Pages es case-sensitive).
  if (url.pathname.toLowerCase() !== APK_PATH) {
    return next();
  }

  if (request.method !== "GET" && request.method !== "HEAD") {
    return new Response("Método no permitido", {
      status: 405,
      headers: { Allow: "GET, HEAD" }
    });
  }

  const otaUrl = new URL("/ota/nexguard.json", url.origin);
  const otaResponse = await fetch(otaUrl.toString());

  if (!otaResponse.ok) {
    return new Response("No hay ninguna versión disponible todavía.", {
      status: 404,
      headers: { "Content-Type": "text/plain; charset=utf-8" }
    });
  }

  let ota;
  try {
    ota = await otaResponse.json();
  } catch {
    return new Response("El archivo de actualizaciones no es válido.", {
      status: 500,
      headers: { "Content-Type": "text/plain; charset=utf-8" }
    });
  }

  let target;
  try {
    target = new URL(ota.url, url.origin);
  } catch {
    return new Response("La URL de descarga no es válida.", {
      status: 500,
      headers: { "Content-Type": "text/plain; charset=utf-8" }
    });
  }

  if (
    target.origin !== url.origin ||
    !/^\/releases\/nexguard-[0-9]+\.apk$/.test(target.pathname)
  ) {
    return new Response("Destino de descarga no permitido.", {
      status: 500,
      headers: { "Content-Type": "text/plain; charset=utf-8" }
    });
  }

  return new Response(null, {
    status: 302,
    headers: {
      Location: target.toString(),
      "Cache-Control": "no-store",
      "Content-Type": "text/plain; charset=utf-8"
    }
  });
}
