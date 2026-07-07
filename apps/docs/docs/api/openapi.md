# OpenAPI / Swagger

FastAPI auto-generates an OpenAPI 3 schema from route definitions and Pydantic DTOs.

## Live interactive docs

When the API is running:

| Resource     | URL                      |
| ------------ | ------------------------ |
| Swagger UI   | `{API_URL}/docs`         |
| ReDoc        | `{API_URL}/redoc`        |
| OpenAPI JSON | `{API_URL}/openapi.json` |

Examples:

- Local: http://localhost:8000/docs
- Production: https://api.quoteflow.yourdomain.com/docs

## Embedded explorer

Set the API base URL below (must be running and allow browser CORS from this docs origin, or use same host in prod):

<div class="api-url-form">
  <label for="api-url-input"><strong>API base URL</strong></label>
  <input id="api-url-input" type="url" placeholder="http://localhost:8000" />
  <button type="button" id="api-url-save">Load Swagger</button>
</div>

<div id="swagger-ui" class="swagger-wrap"></div>

<script src="https://unpkg.com/swagger-ui-dist@5/swagger-ui-bundle.js"></script>
<script src="https://unpkg.com/swagger-ui-dist@5/swagger-ui-standalone-preset.js"></script>
<link rel="stylesheet" href="https://unpkg.com/swagger-ui-dist@5/swagger-ui.css" />
<script>
  (function () {
    var input = document.getElementById("api-url-input");
    var btn = document.getElementById("api-url-save");
    if (!input || !btn) return;

    var initial = window.getQuoteFlowApiUrl
      ? window.getQuoteFlowApiUrl()
      : "http://localhost:8000";
    input.value = initial;

    function mountSwagger(base) {
      var url = base.replace(/\/$/, "") + "/openapi.json";
      window.SwaggerUIBundle({
        url: url,
        dom_id: "#swagger-ui",
        deepLinking: true,
        presets: [
          window.SwaggerUIBundle.presets.apis,
          window.SwaggerUIBundle.SwaggerUIStandalonePreset,
        ],
        layout: "BaseLayout",
      });
    }

    btn.addEventListener("click", function () {
      var base = input.value.trim();
      if (!base) return;
      localStorage.setItem("quoteflow_docs_api_url", base);
      document.getElementById("swagger-ui").innerHTML = "";
      mountSwagger(base);
    });

    mountSwagger(initial);

})();
</script>

> **Tip:** open docs with `?api=https://api.quoteflow.haroonabidawan.com` to point Swagger at production.

## Schema highlights

- All success responses use generic `ApiResponse` wrapper.
- Tags: `auth`, `clients`, `quotations`, `ai`, `system`
- Auth: HTTP Bearer JWT (obtain via `/auth/login`)

For narrative endpoint docs see the [API reference](overview.md) sections.
