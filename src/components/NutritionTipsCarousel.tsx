"use client";

import { useEffect, useState } from "react";

const TIPS = [
  "Un equivalente de fruta ≈ 60 kcal; puedes intercambiar manzana por mandarina si respetas la porción SMAE.",
  "Dentro del mismo grupo, prioriza preparaciones al vapor, a la plancha o crudas frente a frituras.",
  "Dos alimentos del mismo grupo SMAE son intercambiables cuando la porción mantiene calorías y macros similares.",
  "La verdura de libre consumo aporta volumen y saciedad con muy pocas calorías: úsala para completar platos.",
  "Si intercambias cereales, mira también la fibra: avena y pan integral suelen llenar más que el refinado.",
  "Hidratate con agua entre comidas; no sustituye un grupo del plan, pero ayuda a sostener la adherencia.",
];

export function NutritionTipsCarousel() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduceMotion) return;

    const id = window.setInterval(() => {
      setIndex((i) => (i + 1) % TIPS.length);
    }, 5200);
    return () => window.clearInterval(id);
  }, []);

  return (
    <div className="su-tips" aria-live="polite">
      <p className="su-label">Consejo SMAE</p>
      <div className="su-tips__viewport">
        <p key={index} className="su-tips__text">
          {TIPS[index]}
        </p>
      </div>
      <div className="su-tips__dots" role="tablist" aria-label="Consejos">
        {TIPS.map((_, i) => (
          <button
            key={i}
            type="button"
            role="tab"
            aria-selected={i === index}
            aria-label={`Consejo ${i + 1}`}
            className={`su-tips__dot${i === index ? " is-active" : ""}`}
            onClick={() => setIndex(i)}
          />
        ))}
      </div>
    </div>
  );
}
