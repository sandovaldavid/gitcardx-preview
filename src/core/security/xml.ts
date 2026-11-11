const XML_ENTITIES: Record<string, string> = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&apos;',
};

/** Escapes untrusted text before it is embedded in SVG/XML output. */
export function escapeXml(value: string): string {
  return value.replace(/[&<>"']/g, (character) => XML_ENTITIES[character]);
}
