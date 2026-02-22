import 'dotenv/config'
import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import { Pool } from 'pg'

console.log('DATABASE_URL:', process.env.DATABASE_URL)

const prisma = new PrismaClient({
  adapter: new PrismaPg(new Pool({ connectionString: process.env.DATABASE_URL })),
})

async function main() {
  console.log('🌱 Starting seed...')

  // 1. Create Suppliers
  console.log('Creating suppliers...')
  const supplier1 = await prisma.supplier.create({
    data: {
      name: 'PT Sumber Jaya',
      phone: '021-1234567',
      address: 'Jakarta Selatan',
    },
  })
  const supplier2 = await prisma.supplier.create({
    data: {
      name: 'Pabrik Minuman Segar',
      phone: '021-5551234',
      address: 'Jakarta Barat',
    },
  })
  console.log('✓ Suppliers created')

  // 2. Create Products
  console.log('Creating products...')
  const product1 = await prisma.product.create({
    data: {
      barcode: '8999999999999',
      name: 'Air Mineral 600ml',
      unit: 'pcs',
      sellingPrice: 3000,
      averageCost: 2000,
      currentStock: 0,
      minStock: 20,
    },
  })
  const product2 = await prisma.product.create({
    data: {
      barcode: '8888888888888',
      name: 'Kopi Luwak 100g',
      unit: 'pcs',
      sellingPrice: 25000,
      averageCost: 15000,
      currentStock: 0,
      minStock: 10,
    },
  })
  const product3 = await prisma.product.create({
    data: {
      barcode: '8777777777777',
      name: 'Teh Botol',
      unit: 'pcs',
      sellingPrice: 5000,
      averageCost: 3000,
      currentStock: 0,
      minStock: 15,
    },
  })
  console.log('✓ Products created')

  // 3. Create Purchase (Stock In)
  console.log('Creating purchase (stock in)...')
  const purchase1 = await prisma.purchase.create({
    data: {
      invoiceNumber: 'PO-2026-001',
      supplierId: supplier1.id,
      purchaseDate: new Date(),
      totalAmount: 200000,
      items: {
        create: [
          {
            productId: product1.id,
            quantity: 100,
            costPrice: 2000,
            subtotal: 200000,
          },
        ],
      },
    },
    include: {
      items: true,
    },
  })

  // Update product stock after purchase
  await prisma.product.update({
    where: { id: product1.id },
    data: { currentStock: 100, averageCost: 2000 },
  })

  // Create stock movement
  await prisma.stockMovement.create({
    data: {
      productId: product1.id,
      referenceType: 'PURCHASE',
      referenceId: purchase1.id,
      movementType: 'IN',
      quantity: 100,
      stockBefore: 0,
      stockAfter: 100,
    },
  })
  console.log('✓ Purchase created')

  // 4. Create another Purchase
  const purchase2 = await prisma.purchase.create({
    data: {
      invoiceNumber: 'PO-2026-002',
      supplierId: supplier2.id,
      purchaseDate: new Date(),
      totalAmount: 750000,
      items: {
        create: [
          {
            productId: product2.id,
            quantity: 30,
            costPrice: 15000,
            subtotal: 450000,
          },
          {
            productId: product3.id,
            quantity: 50,
            costPrice: 3000,
            subtotal: 150000,
          },
          {
            productId: product1.id,
            quantity: 20,
            costPrice: 15000,
            subtotal: 150000,
          },
        ],
      },
    },
    include: {
      items: true,
    },
  })

  // Update stock for all products in purchase
  await prisma.product.update({
    where: { id: product2.id },
    data: { currentStock: 30, averageCost: 15000 },
  })
  await prisma.product.update({
    where: { id: product3.id },
    data: { currentStock: 50, averageCost: 3000 },
  })
  await prisma.product.update({
    where: { id: product1.id },
    data: { currentStock: 120 },
  })

  // Create stock movements
  await prisma.stockMovement.createMany({
    data: [
      {
        productId: product2.id,
        referenceType: 'PURCHASE',
        referenceId: purchase2.id,
        movementType: 'IN',
        quantity: 30,
        stockBefore: 0,
        stockAfter: 30,
      },
      {
        productId: product3.id,
        referenceType: 'PURCHASE',
        referenceId: purchase2.id,
        movementType: 'IN',
        quantity: 50,
        stockBefore: 0,
        stockAfter: 50,
      },
      {
        productId: product1.id,
        referenceType: 'PURCHASE',
        referenceId: purchase2.id,
        movementType: 'IN',
        quantity: 20,
        stockBefore: 100,
        stockAfter: 120,
      },
    ],
  })
  console.log('✓ Purchase 2 created')

  // 5. Create Sale (Stock Out)
  console.log('Creating sale (stock out)...')
  const sale1 = await prisma.sale.create({
    data: {
      invoiceNumber: 'SJ-2026-001',
      totalAmount: 15000,
      totalProfit: 5000,
      paymentMethod: 'CASH',
      items: {
        create: [
          {
            productId: product1.id,
            quantity: 5,
            sellingPrice: 3000,
            costPriceSnapshot: 2000,
            profit: 5000,
            subtotal: 15000,
          },
        ],
      },
    },
    include: {
      items: true,
    },
  })

  // Update product stock after sale
  await prisma.product.update({
    where: { id: product1.id },
    data: { currentStock: 115 },
  })

  // Create stock movement
  await prisma.stockMovement.create({
    data: {
      productId: product1.id,
      referenceType: 'SALE',
      referenceId: sale1.id,
      movementType: 'OUT',
      quantity: 5,
      stockBefore: 120,
      stockAfter: 115,
    },
  })
  console.log('✓ Sale created')

  // 6. Create another Sale
  const sale2 = await prisma.sale.create({
    data: {
      invoiceNumber: 'SJ-2026-002',
      totalAmount: 80000,
      totalProfit: 35000,
      paymentMethod: 'QRIS',
      items: {
        create: [
          {
            productId: product2.id,
            quantity: 2,
            sellingPrice: 25000,
            costPriceSnapshot: 15000,
            profit: 20000,
            subtotal: 50000,
          },
          {
            productId: product3.id,
            quantity: 6,
            sellingPrice: 5000,
            costPriceSnapshot: 3000,
            profit: 12000,
            subtotal: 30000,
          },
        ],
      },
    },
    include: {
      items: true,
    },
  })

  // Update product stock after sale
  await prisma.product.update({
    where: { id: product2.id },
    data: { currentStock: 28 },
  })
  await prisma.product.update({
    where: { id: product3.id },
    data: { currentStock: 44 },
  })

  // Create stock movements
  await prisma.stockMovement.createMany({
    data: [
      {
        productId: product2.id,
        referenceType: 'SALE',
        referenceId: sale2.id,
        movementType: 'OUT',
        quantity: 2,
        stockBefore: 30,
        stockAfter: 28,
      },
      {
        productId: product3.id,
        referenceType: 'SALE',
        referenceId: sale2.id,
        movementType: 'OUT',
        quantity: 6,
        stockBefore: 50,
        stockAfter: 44,
      },
    ],
  })
  console.log('✓ Sale 2 created')

  // Summary
  console.log('\n📊 Seed Summary:')
  console.log('===============')
  console.log(`Suppliers: ${await prisma.supplier.count()}`)
  console.log(`Products: ${await prisma.product.count()}`)
  console.log(`Purchases: ${await prisma.purchase.count()}`)
  console.log(`Sales: ${await prisma.sale.count()}`)
  console.log(`Stock Movements: ${await prisma.stockMovement.count()}`)

  // Show current stock
  const products = await prisma.product.findMany()
  console.log('\n📦 Current Stock:')
  for (const p of products) {
    console.log(`  - ${p.name}: ${p.currentStock} ${p.unit}`)
  }

  console.log('\n✅ Seed completed!')
}

main()
  .catch((e) => {
    console.error('Error during seed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
