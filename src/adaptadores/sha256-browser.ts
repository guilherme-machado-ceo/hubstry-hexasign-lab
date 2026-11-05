export async function sha256Hex(bytes: Uint8Array): Promise<string> {
  if (!globalThis.crypto?.subtle) {
    throw new Error("Web Crypto SHA-256 indisponível neste ambiente");
  }
  const copia = Uint8Array.from(bytes);
  const resumo = await globalThis.crypto.subtle.digest("SHA-256", copia.buffer);
  return Array.from(new Uint8Array(resumo), (byte) => byte.toString(16).padStart(2, "0")).join("");
}
