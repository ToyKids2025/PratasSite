// Este arquivo deve ser importado antes de qualquer outro código Firebase
// para garantir que as configurações sejam aplicadas corretamente

// Desabilitar logging do Firebase antes de qualquer importação
if (typeof window !== "undefined") {
  // Cliente (browser)
  // @ts-ignore
  window.FIREBASE_LOGGING_DISABLED = true
  // @ts-ignore
  window.FIREBASE_APPCHECK_DEBUG_TOKEN = true

  // Patch para evitar o erro de conversão
  const originalToString = Object.prototype.toString
  Object.prototype.toString = function () {
    // Evitar erros em objetos do Firebase
    try {
      return originalToString.call(this)
    } catch (e) {
      return "[object Object]"
    }
  }
}

// No lado do servidor
if (typeof process !== "undefined") {
  // @ts-ignore
  process.env.FIREBASE_LOGGING_DISABLED = "true"
  // @ts-ignore
  process.env.FIREBASE_LOG_LEVEL = "error"
}

export const firebaseInitialized = true
