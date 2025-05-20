// Este arquivo deve ser importado antes de qualquer código Firebase
// Ele implementa patches globais para evitar erros de logging

// Patch global para Object.prototype.toString
// Este é o método que causa o erro no google-logging-utils
if (typeof Object.prototype.toString === "function") {
  const originalToString = Object.prototype.toString

  // Sobrescrever o método toString com uma versão segura
  Object.prototype.toString = function safeToString() {
    try {
      return originalToString.call(this)
    } catch (e) {
      // Se falhar, retornar uma string segura
      return "[object Object]"
    }
  }
}

// Desativar console.debug globalmente para evitar logs excessivos
if (typeof console !== "undefined" && console.debug) {
  console.debug = () => {}
}

// Criar um objeto global para configurações do Firebase
const globalConfig = {
  loggingDisabled: true,
  logLevel: "error",
}

// Definir variáveis globais para o Firebase
if (typeof window !== "undefined") {
  // Cliente
  // @ts-ignore
  window.FIREBASE_LOGGING_DISABLED = true
  // @ts-ignore
  window.FIREBASE_LOG_LEVEL = "error"
  // @ts-ignore
  window.__FIREBASE_CONFIG__ = globalConfig
} else if (typeof global !== "undefined") {
  // Servidor
  // @ts-ignore
  global.FIREBASE_LOGGING_DISABLED = true
  // @ts-ignore
  global.FIREBASE_LOG_LEVEL = "error"
  // @ts-ignore
  global.__FIREBASE_CONFIG__ = globalConfig
}

// Função para desativar logging em qualquer objeto
function disableLogging(obj: any) {
  if (!obj) return // Desativar métodos de logging comuns
  ;["log", "debug", "info", "warn", "error"].forEach((method) => {
    if (obj[method] && typeof obj[method] === "function") {
      obj[method] = () => {}
    }
  })

  // Desativar propriedades de configuração de logging
  ;["logging", "logger", "logLevel", "enableLogging"].forEach((prop) => {
    if (prop in obj) {
      try {
        obj[prop] = null
      } catch (e) {
        // Ignorar erros de propriedades somente leitura
      }
    }
  })
}

// Exportar uma função que pode ser usada para desativar logging em objetos específicos
export function disableFirebaseLogging(firebaseInstance: any) {
  if (!firebaseInstance) return

  disableLogging(firebaseInstance)

  // Desativar logging em propriedades comuns do Firebase
  ;["app", "auth", "firestore", "storage", "database"].forEach((prop) => {
    if (firebaseInstance[prop]) {
      disableLogging(firebaseInstance[prop])
    }
  })
}

// Exportar configuração global
export const firebaseConfig = globalConfig

// Exportar uma mensagem para confirmar que o patch foi carregado
export const patchLoaded = true

console.log("Firebase logging patch applied")
