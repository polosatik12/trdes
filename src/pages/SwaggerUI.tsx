import React, { useEffect, useRef, useState } from "react";

const SwaggerUI: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Load Swagger UI CSS and JS from CDN
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = "https://unpkg.com/swagger-ui-dist@5/swagger-ui.css";
    document.head.appendChild(link);

    const script = document.createElement("script");
    script.src = "https://unpkg.com/swagger-ui-dist@5/swagger-ui-bundle.js";
    script.onload = () => {
      initSwagger();
    };
    script.onerror = () => {
      setError("Не удалось загрузить Swagger UI");
      setLoading(false);
    };
    document.body.appendChild(script);

    return () => {
      document.head.removeChild(link);
      document.body.removeChild(script);
    };
  }, []);

  const initSwagger = async () => {
    try {
      const apiUrl = import.meta.env.VITE_API_URL || '/api';
      const response = await fetch(`${apiUrl}/openapi-spec`);

      if (!response.ok) throw new Error('Failed to load API specification');

      const data = await response.json();

      // @ts-ignore - SwaggerUIBundle is loaded from CDN
      window.SwaggerUIBundle({
        spec: data,
        dom_id: "#swagger-container",
        presets: [
          // @ts-ignore
          window.SwaggerUIBundle.presets.apis,
        ],
        layout: "BaseLayout",
        deepLinking: true,
      });
      setLoading(false);
    } catch (err: any) {
      setError(err.message || "Ошибка загрузки спецификации");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="bg-[#003051] text-white py-4 px-6">
        <h1 className="text-xl font-bold">
          Tour de Russie — API Documentation
        </h1>
        <p className="text-sm text-white/70 mt-1">Swagger / OpenAPI 3.0</p>
      </div>
      {loading && (
        <div className="flex items-center justify-center py-20">
          <div className="text-muted-foreground">Загрузка документации...</div>
        </div>
      )}
      {error && (
        <div className="flex items-center justify-center py-20">
          <div className="text-red-500">{error}</div>
        </div>
      )}
      <div id="swagger-container" ref={containerRef} />
    </div>
  );
};

export default SwaggerUI;
