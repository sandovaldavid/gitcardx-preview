import React from 'react';

export function GitframeLogo({ className = 'w-6 h-6' }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-label="Gitframe Logo"
    >
      {/* Escuadras de encuadre (Frame) en Índigo Blueprint y Cobalto */}
      <path
        d="M3 8V5C3 3.89543 3.89543 3 5 3H8"
        stroke="#5E6AD2"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <path
        d="M16 3H19C20.1046 3 21 3.89543 21 5V8"
        stroke="#3B82F6"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <path
        d="M21 16V19C21 20.1046 20.1046 21 19 21H16"
        stroke="#5E6AD2"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <path
        d="M8 21H5C3.89543 21 3 20.1046 3 19V16"
        stroke="#3B82F6"
        strokeWidth="2"
        strokeLinecap="round"
      />

      {/* Grafo Git central en Blanco Técnico */}
      <path
        d="M8.5 8.5V15.5M8.5 12H12.5C13.6 12 14.5 11.1 14.5 10V8.5"
        stroke="#FAFAFA"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="8.5" cy="7.5" r="2" fill="#FAFAFA" />
      <circle cx="8.5" cy="16.5" r="2" fill="#FAFAFA" />
      <circle cx="14.5" cy="7.5" r="2" fill="#5E6AD2" stroke="#FAFAFA" strokeWidth="1.5" />
    </svg>
  );
}
