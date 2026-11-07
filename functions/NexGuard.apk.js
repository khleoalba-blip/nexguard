export async function onRequest({ request }) {
  if (request.method !== "GET" && request.method !== "HEAD") {
    return new Response("Método no permitido", {
      status: 405,
      headers: { Allow: "GET, HEAD" }
    });
  }

  const otaUrl = new URL("/ota/nexguard.json", request.url);
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

  const origin = new URL(request.url).origin;

  let target;
  try {
    target = new URL(ota.url, origin);
  } catch {
    return new Response("La URL de descarga no es válida.", {
      status: 500,
      headers: { "Content-Type": "text/plain; charset=utf-8" }
    });
  }

  if (
    target.origin !== origin ||
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
