export async function onRequest({ request, params }) {
  const filename = params.filename;

  if (!/^nexguard-[0-9]+\.apk$/.test(filename)) {
    return new Response("Archivo no válido", { status: 404 });
  }

  if (!["GET", "HEAD"].includes(request.method)) {
    return new Response("Método no permitido", { status: 405 });
  }

  const githubUrl =
    https://raw.githubusercontent.com/khleoalba-blip/nexguard/main/releases/${filename};

  const headers = new Headers();

  const range = request.headers.get("Range");
  if (range) headers.set("Range", range);

  const response = await fetch(githubUrl, {
    method: request.method,
    headers
  });

  if (!response.ok && response.status !== 206) {
    return new Response("No se encontró el APK", {
      status: response.status
    });
  }

  const outputHeaders = new Headers(response.headers);

  outputHeaders.set(
    "Content-Type",
    "application/vnd.android.package-archive"
  );

  outputHeaders.set(
    "Content-Disposition",
    attachment; filename="${filename}"
  );

  return new Response(response.body, {
    status: response.status,
    headers: outputHeaders
  });
}
