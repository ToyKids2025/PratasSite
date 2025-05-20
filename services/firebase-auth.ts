import { getAuth, signInWithEmailAndPassword, onAuthStateChanged, signOut } from "firebase/auth"
import { app } from "./firebase-config"

const auth = getAuth(app)

// Intervalo de renovação do token (a cada 55 minutos - tokens expiram em 1 hora)
const TOKEN_REFRESH_INTERVAL = 55 * 60 * 1000

// Armazenar o intervalo para poder limpar depois
let tokenRefreshInterval: NodeJS.Timeout | null = null

// Função para obter o token atual
export async function getCurrentToken(): Promise<string | null> {
  try {
    const user = auth.currentUser
    if (!user) return null

    return await user.getIdToken(true)
  } catch (error) {
    console.error("Erro ao obter token:", error)
    return null
  }
}

// Função para iniciar a renovação periódica do token
export function startTokenRefresh() {
  // Limpar qualquer intervalo existente
  if (tokenRefreshInterval) {
    clearInterval(tokenRefreshInterval)
  }

  // Obter token imediatamente
  getCurrentToken()

  // Configurar renovação periódica
  tokenRefreshInterval = setInterval(async () => {
    const token = await getCurrentToken()
    if (token) {
      console.log("Token renovado com sucesso")
    } else {
      console.warn("Falha ao renovar token - usuário pode estar desconectado")
    }
  }, TOKEN_REFRESH_INTERVAL)
}

// Função para parar a renovação do token
export function stopTokenRefresh() {
  if (tokenRefreshInterval) {
    clearInterval(tokenRefreshInterval)
    tokenRefreshInterval = null
  }
}

// Login com email e senha
export async function loginWithEmailPassword(email: string, password: string) {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password)

    // Iniciar renovação de token após login bem-sucedido
    startTokenRefresh()

    // Forçar obtenção do token inicial
    const token = await userCredential.user.getIdToken()
    console.log("Login bem-sucedido, token obtido")

    return userCredential.user
  } catch (error) {
    console.error("Erro ao fazer login:", error)
    throw error
  }
}

// Logout
export async function logoutUser() {
  try {
    // Parar renovação de token
    stopTokenRefresh()

    await signOut(auth)
    return true
  } catch (error) {
    console.error("Erro ao fazer logout:", error)
    throw error
  }
}

// Verificar estado de autenticação
export function onAuthChange(callback: (user: any) => void) {
  return onAuthStateChanged(auth, (user) => {
    if (user) {
      // Iniciar renovação de token quando o usuário já está autenticado
      startTokenRefresh()
    } else {
      // Parar renovação quando não há usuário
      stopTokenRefresh()
    }

    callback(user)
  })
}

// Verificar se o usuário está autenticado
export function isAuthenticated(): boolean {
  return auth.currentUser !== null
}

// Obter usuário atual
export function getCurrentUser() {
  return auth.currentUser
}
