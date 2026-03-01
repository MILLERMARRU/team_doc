"use client";
// ============================================================
//  components/docs/MermaidBlock.tsx
//  Renderizador de diagramas Mermaid (compatible con v11)
//  Inicializa mermaid solo una vez y usa IDs únicos por render
// ============================================================

import { useEffect, useRef, useState } from "react";
import { useTheme } from "next-themes";

// ── Preprocesador de código Mermaid ──────────────────────
// Mermaid v11 falla al parsear labels con paréntesis, tildes u otros
// caracteres especiales dentro de corchetes [ ] sin comillas.
// Ejemplo: A[texto (x)]  →  A["texto (x)"]
function preprocessMermaid(code: string): string {
  // Reemplaza [label] por ["label"] cuando el label:
  //   - no empieza ya por " o '
  //   - contiene paréntesis, tildes, ñ, $, %, & u otros chars especiales
  return code.replace(/\[([^\]"']+)\]/g, (_match, label: string) => {
    if (/[()áéíóúüñÁÉÍÓÚÜÑ$%&#@!¿?¡]/.test(label)) {
      // Escapar las comillas internas que pudiera tener el label
      const escaped = label.replace(/"/g, '\\"');
      return `["${escaped}"]`;
    }
    return `[${label}]`;
  });
}

// ── Singleton de inicialización ───────────────────────────
// mermaid.initialize() solo se llama la primera vez; en cambios
// de tema solo actualizamos la config sin reinicializar todo.
let _mermaidReady = false;

async function getMermaid(theme: "dark" | "neutral") {
  const { default: mermaid } = await import("mermaid");

  if (!_mermaidReady) {
    mermaid.initialize({
      startOnLoad: false,
      theme,
      securityLevel: "loose",
      fontFamily:
        "var(--font-geist-sans, ui-sans-serif, system-ui, sans-serif)",
      fontSize: 9,
      flowchart: { nodeSpacing: 15, rankSpacing: 22, padding: 5 },
    });
    _mermaidReady = true;
  } else {
    mermaid.initialize({
      theme,
      fontSize: 9,
      flowchart: { nodeSpacing: 15, rankSpacing: 22, padding: 5 },
    });
  }

  return mermaid;
}

interface MermaidBlockProps {
  code: string;
}

export function MermaidBlock({ code }: MermaidBlockProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const { resolvedTheme } = useTheme();
  const [error, setError] = useState<string | null>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (!containerRef.current || !code?.trim()) return;

    let cancelled = false;

    const renderDiagram = async () => {
      // Limpiar estado previo
      setLoaded(false);
      setError(null);

      try {
        const theme = resolvedTheme === "dark" ? "dark" : "neutral";
        const mermaid = await getMermaid(theme);

        if (cancelled) return;

        // Preprocesar para escapar caracteres especiales en labels
        const processedCode = preprocessMermaid(code.trim());

        // Validar sintaxis primero para obtener error descriptivo
        await mermaid.parse(processedCode);

        if (cancelled) return;

        // ID único por render: evita colisiones con renders anteriores
        const id = `mermaid-${Date.now().toString(36)}-${Math.random()
          .toString(36)
          .slice(2, 6)}`;

        const { svg } = await mermaid.render(id, processedCode);

        if (cancelled) return;

        if (containerRef.current) {
          containerRef.current.innerHTML = svg;
          // Ajustar tamaño: limitar ancho y hacer responsive
          const svgEl = containerRef.current.querySelector("svg");
          if (svgEl) {
            // Guardamos el width original para poder escalar con viewBox
            const originalWidth = svgEl.getAttribute("width");
            const originalHeight = svgEl.getAttribute("height");
            if (originalWidth && originalHeight && !svgEl.getAttribute("viewBox")) {
              svgEl.setAttribute("viewBox", `0 0 ${originalWidth} ${originalHeight}`);
            }
            svgEl.removeAttribute("width");
            svgEl.removeAttribute("height");
            svgEl.style.width = "100%";
            svgEl.style.height = "auto";
            svgEl.style.maxWidth = "200px";
          }
          setLoaded(true);
        }
      } catch (err) {
        if (!cancelled) {
          const msg = err instanceof Error ? err.message : String(err);
          setError(msg);
          console.error("[MermaidBlock]", err);
        }
      }
    };

    renderDiagram();

    return () => {
      cancelled = true;
    };
  }, [code, resolvedTheme]);

  // ── Estado de error ───────────────────────────────────────
  if (error) {
    return (
      <div className="my-6 rounded-lg border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-950/20 p-4">
        <p className="text-xs font-semibold text-red-600 dark:text-red-400 mb-2">
          Error en el diagrama Mermaid
        </p>
        <pre className="text-xs text-red-500/80 dark:text-red-400/60 overflow-x-auto whitespace-pre-wrap">
          {error}
        </pre>
      </div>
    );
  }

  return (
    <div className="my-4 flex justify-center overflow-x-auto rounded-lg border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 py-4 px-3">
      {!loaded && (
        <div className="flex items-center gap-2 text-neutral-400 dark:text-neutral-500 text-sm py-4">
          <svg
            className="animate-spin h-4 w-4"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
            />
          </svg>
          Cargando diagrama…
        </div>
      )}
      <div
        ref={containerRef}
        className="flex justify-center w-full [&_svg]:max-w-full [&_svg]:h-auto"
      />
    </div>
  );
}
