// Use CommonJS require to avoid TS error when the module's exports don't match
// the expected ES module shape in this environment.
const { PrismaClient } = require('@prisma/client')

// PrismaClient es el objeto que usamos para hacer queries a la base de datos.
// Creamos UNA SOLA instancia y la exportamos.
const prisma = new PrismaClient({
  log: ['query', 'error', 'warn'], // En desarrollo, muestra todas las queries SQL
})

export default prisma
