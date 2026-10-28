/** UTF-8 safe base64 (btoa/atob only handle Latin-1). GitHub's contents API speaks base64. */
export function encodeBase64Utf8(text: string): string {
  return encodeBase64Bytes(new TextEncoder().encode(text));
}

export function encodeBase64Bytes(bytes: Uint8Array): string {
  let binary = '';
  for (let i = 0; i < bytes.length; i += 0x8000) {
    binary += String.fromCharCode(...bytes.subarray(i, i + 0x8000));
  }
  return btoa(binary);
}

export function decodeBase64Utf8(base64: string): string {
  const binary = atob(base64.replace(/\s/g, ''));
  return new TextDecoder().decode(Uint8Array.from(binary, (c) => c.charCodeAt(0)));
}
