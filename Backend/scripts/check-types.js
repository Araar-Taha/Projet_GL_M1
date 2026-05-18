import prisma from '../src/lib/prisma.js'

async function main() {
  const types = await prisma.transaction.groupBy({
    by: ['type_transaction'],
    _count: {
      identifiant: true
    }
  })
  console.log(JSON.stringify(types, null, 2))
}

main()
  .catch(e => console.error(e))
  .finally(async () => await prisma.$disconnect())
