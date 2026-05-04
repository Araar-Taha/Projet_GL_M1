import { PrismaClient } from '@prisma/client'
import 'dotenv/config'

const prismaClientSingleton = () => {
  // On revient à un constructeur vide, le lien se fera via le npx prisma generate
  return new PrismaClient()
}

const globalForPrisma = globalThis

const prisma = globalForPrisma.prisma ?? prismaClientSingleton()

export default prisma

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma