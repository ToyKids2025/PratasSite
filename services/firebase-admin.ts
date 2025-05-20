export async function getAllProductsAdmin(): Promise<any[]> {
  try {
    // Verificar se o Firebase Admin está inicializado
    if (!admin.apps.length) {
      console.warn("Firebase Admin não inicializado em getAllProductsAdmin")
      return []
    }

    const db = admin.firestore()
    const productsRef = db.collection("products")
    const snapshot = await productsRef.orderBy("createdAt", "desc").get()

    if (snapshot.empty) {
      console.log("Nenhum produto encontrado")
      return []
    }

    const products = snapshot.docs.map((doc) => {
      try {
        const data = doc.data()
        // Converter timestamps para objetos Date
        const processedData = {
          ...data,
          id: doc.id,
          createdAt: data.createdAt ? data.createdAt.toDate() : new Date(),
          updatedAt: data.updatedAt ? data.updatedAt.toDate() : new Date(),
        }

        // Processar promoção com segurança
        if (data.promotion && typeof data.promotion === "object") {
          processedData.promotion = {
            ...data.promotion,
            endDate: data.promotion.endDate ? data.promotion.endDate.toDate() : null,
          }
        }

        return processedData
      } catch (error) {
        console.error(`Erro ao processar documento ${doc.id}:`, error)
        // Retornar um objeto mínimo com ID para não quebrar o mapeamento
        return { id: doc.id }
      }
    })

    return products
  } catch (error) {
    console.error("Erro em getAllProductsAdmin:", error)
    return []
  }
}
