export async function onRequest({ request, params }) {
  const filename = params.filename;

  if (!/^nexguard-[0-9]+\.apk$/.test(filename)) {
    return new Response("Archivo no válido", { status: 404 });
  }

  if (request.method !== "GET" && request.method !== "HEAD") {
    return new Response("Método no permitido", {
      status: 405,
      headers: { Allow: "GET, HEAD" }
    });
  }

  const githubUrl = `https://raw.githubusercontent.com/khleoalba-blip/nexguard/main/releases/${filename}`;

  const upstreamHeaders = new Headers({
    "User-Agent": "nexguard-pages-proxy"
  });

  const range = request.headers.get("Range");
  if (range) upstreamHeaders.set("Range", range);

  const response = await fetch(githubUrl, {
    method: request.method,
    headers: upstreamHeaders,
    redirect: "follow"
  });

  if (!response.ok && response.status !== 206) {
    return new Response("No se encontró el APK", {
      status: response.status
    });
  }

  const outputHeaders = new Headers();
  outputHeaders.set("Content-Type", "application/vnd.android.package-archive");
  outputHeaders.set("Content-Disposition", `attachment; filename="${filename}"`);
  outputHeaders.set("Accept-Ranges", "bytes");
  outputHeaders.set("Cache-Control", "public, max-age=300");

  if (request.method === "GET") {
    const contentLength = response.headers.get("Content-Length");
    if (contentLength) outputHeaders.set("Content-Length", contentLength);
  }

  const contentRange = response.headers.get("Content-Range");
  if (contentRange) outputHeaders.set("Content-Range", contentRange);

  return new Response(request.method === "HEAD" ? null : response.body, {
    status: response.status,
    headers: outputHeaders
  });
}
