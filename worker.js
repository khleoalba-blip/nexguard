export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    // Descarga de APK alojados en GitHub
    if (url.pathname.startsWith("/releases/")) {
      const filename = url.pathname.slice("/releases/".length);

      if (!/^nexguard-[0-9]+\.apk$/.test(filename)) {
        return new Response("Archivo no válido", { status: 404 });
      }

      const githubUrl =
        https://raw.githubusercontent.com/khleoalba-blip/nexguard/main/releases/${filename};

      const upstreamRequest = new Request(githubUrl, request);
      const response = await fetch(upstreamRequest);

      if (!response.ok) {
        return new Response("APK no encontrado", {
          status: response.status
        });
      }

      const headers = new Headers(response.headers);
      headers.set(
        "Content-Type",
        "application/vnd.android.package-archive"
      );
      headers.set(
        "Content-Disposition",
        attachment; filename="${filename}"
      );

      return new Response(response.body, {
        status: response.status,
        headers
      });
    }

    // Servir el resto de la página
    return env.ASSETS.fetch(request);
  }
};
