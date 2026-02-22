// ============================================
// CONTOH PENGGUNAAN MODEL / EXAMPLE USAGE
// ============================================
// Import dari model yang sudah dibuat

import { createProduct, getAllProducts, getProductById, updateProduct, deleteProduct } from '@/app/models/product'
import { createSupplier, getAllSuppliers } from '@/app/models/supplier'
import { createPurchase, getAllPurchases } from '@/app/models/purchase'
import { createSale, getAllSales, getSalesSummary } from '@/app/models/sale'
import { createStockIn, createStockOut, getAllStockMovements } from '@/app/models/stock'

// ============================================
// 1. CONTOH PENGGUNAAN PRODUCT
// ============================================

// Create Product
async function contohCreateProduct() {
  const product = await createProduct({
    barcode: '1234567890123',
    name: 'Kopi Luwak 100g',
    unit: 'pcs',
    sellingPrice: 25000,
    averageCost: 15000,
    currentStock: 100,
    minStock: 10,
  })
  console.log('Product created:', product)
}

// Get All Products
async function contohGetProducts() {
  const products = await getAllProducts()
  console.log('All products:', products)
}

// Get Product by ID
async function contohGetProductById() {
  const product = await getProductById('uuid-product-123')
  console.log('Product:', product)
}

// Update Product
async function contohUpdateProduct() {
  const product = await updateProduct('uuid-product-123', {
    sellingPrice: 30000,
    currentStock: 50,
  })
  console.log('Updated product:', product)
}

// Delete Product (soft delete)
async function contohDeleteProduct() {
  const product = await deleteProduct('uuid-product-123')
  console.log('Deleted product:', product)
}

// ============================================
// 2. CONTOH PENGGUNAAN SUPPLIER
// ============================================

// Create Supplier
async function contohCreateSupplier() {
  const supplier = await createSupplier({
    name: 'PT Sumber Jaya',
    phone: '021-1234567',
    address: 'Jakarta Selatan',
  })
  console.log('Supplier created:', supplier)
}

// Get All Suppliers
async function contohGetSuppliers() {
  const suppliers = await getAllSuppliers()
  console.log('All suppliers:', suppliers)
}

// ============================================
// 3. CONTOH PENGGUNAAN PURCHASE (Barang Masuk)
// ============================================

// Create Purchase with Items
async function contohCreatePurchase() {
  // Pertama, buat supplier
  const supplier = await createSupplier({
    name: 'PT Barang Baru',
  })

  // Buat product jika belum ada
  const product = await createProduct({
    barcode: '9876543210987',
    name: 'Teh Botol',
    unit: 'pcs',
    sellingPrice: 5000,
    currentStock: 0,
  })

  // Buat purchase dengan items
  const purchase = await createPurchase(
    {
      invoiceNumber: 'PO-001',
      supplierId: supplier.id,
      purchaseDate: new Date(),
      totalAmount: 0, // akan dihitung otomatis
    },
    [
      {
        purchaseId: '', // akan di-set otomatis
        productId: product.id,
        quantity: 50,
        costPrice: 3000,
        subtotal: 150000,
      },
    ]
  )

  // Update stock produk setelah purchase
  // (Ini bisa dilakukan dengan trigger atau manual)
  console.log('Purchase created:', purchase)
}

// Get All Purchases
async function contohGetPurchases() {
  const purchases = await getAllPurchases()
  console.log('All purchases:', purchases)
}

// ============================================
// 4. CONTOH PENGGUNAAN SALE (Penjualan)
// ============================================

// Create Sale with Items
async function contohCreateSale() {
  // Ambil product yang ada
  const products = await getAllProducts()
  if (products.length === 0) {
    console.log('Tidak ada produk')
    return
  }

  const product = products[0]

  // Buat sale dengan items
  const sale = await createSale(
    {
      invoiceNumber: 'SJ-001',
      totalAmount: 0,
      totalProfit: 0,
      paymentMethod: 'CASH',
    },
    [
      {
        saleId: '',
        productId: product.id,
        quantity: 2,
        sellingPrice: Number(product.sellingPrice),
        costPriceSnapshot: Number(product.averageCost),
        profit: Number(product.sellingPrice) - Number(product.averageCost),
        subtotal: Number(product.sellingPrice) * 2,
      },
    ]
  )

  console.log('Sale created:', sale)
}

// Get Sales Summary
async function contohGetSalesSummary() {
  const summary = await getSalesSummary()
  console.log('Sales summary:', summary)
  // Output: { totalRevenue: 50000, totalProfit: 10000, transactionCount: 5 }
}

// ============================================
// 5. CONTOH PENGGUNAAN STOCK MOVEMENT (Audit Log)
// ============================================

// Record Stock In (dari Purchase)
async function contohStockIn() {
  const products = await getAllProducts()
  if (products.length === 0) return

  const product = products[0]
  const currentStock = Number(product.currentStock)

  const movement = await createStockIn(
    product.id,
    'purchase-uuid-123', // ID dari purchase
    50, // quantity
    currentStock
  )

  console.log('Stock in recorded:', movement)
}

// Record Stock Out (dari Sale)
async function contohStockOut() {
  const products = await getAllProducts()
  if (products.length === 0) return

  const product = products[0]
  const currentStock = Number(product.currentStock)

  const movement = await createStockOut(
    product.id,
    'sale-uuid-456', // ID dari sale
    2, // quantity
    currentStock
  )

  console.log('Stock out recorded:', movement)
}

// Get All Stock Movements
async function contohGetStockMovements() {
  const movements = await getAllStockMovements()
  console.log('All stock movements:', movements)
}

// ============================================
// WORKFLOW LENGKAP: Purchase -> Stock In -> Sale -> Stock Out
// ============================================

async function workflowLengkap() {
  console.log('=== Starting Workflow ===')

  // 1. Buat Supplier
  const supplier = await createSupplier({
    name: 'Pabrik Minuman',
    phone: '021-5551234',
  })
  console.log('1. Supplier created:', supplier.name)

  // 2. Buat Product
  const product = await createProduct({
    barcode: '9998887776665',
    name: 'Air Mineral 600ml',
    unit: 'pcs',
    sellingPrice: 3000,
    averageCost: 2000,
    currentStock: 0,
    minStock: 20,
  })
  console.log('2. Product created:', product.name)

  // 3. Buat Purchase (Barang Masuk)
  const purchase = await createPurchase(
    {
      invoiceNumber: 'PO-2024-001',
      supplierId: supplier.id,
      purchaseDate: new Date(),
      totalAmount: 0,
    },
    [
      {
        purchaseId: '',
        productId: product.id,
        quantity: 100,
        costPrice: 2000,
        subtotal: 200000,
      },
    ]
  )
  console.log('3. Purchase created:', purchase.invoiceNumber)

  // 4. Record Stock In
  const stockIn = await createStockIn(
    product.id,
    purchase.id,
    100,
    0
  )
  console.log('4. Stock in recorded. Stock before:', stockIn.stockBefore, '-> Stock after:', stockIn.stockAfter)

  // 5. Buat Sale (Penjualan)
  const sale = await createSale(
    {
      invoiceNumber: 'SJ-2024-001',
      totalAmount: 0,
      totalProfit: 0,
      paymentMethod: 'QRIS',
    },
    [
      {
        saleId: '',
        productId: product.id,
        quantity: 5,
        sellingPrice: 3000,
        costPriceSnapshot: 2000,
        profit: 1000,
        subtotal: 15000,
      },
    ]
  )
  console.log('5. Sale created:', sale.invoiceNumber)

  // 6. Record Stock Out
  const stockOut = await createStockOut(
    product.id,
    sale.id,
    5,
    100
  )
  console.log('6. Stock out recorded. Stock before:', stockOut.stockBefore, '-> Stock after:', stockOut.stockAfter)

  // 7. Lihat Semua Transaksi
  const allSales = await getAllSales()
  const allPurchases = await getAllPurchases()
  const movements = await getAllStockMovements()

  console.log('=== Summary ===')
  console.log('Total Purchases:', allPurchases.length)
  console.log('Total Sales:', allSales.length)
  console.log('Total Stock Movements:', movements.length)

  // 8. Lihat Ringkasan Penjualan
  const summary = await getSalesSummary()
  console.log('Sales Summary:', summary)
}

export {
  contohCreateProduct,
  contohGetProducts,
  contohGetProductById,
  contohUpdateProduct,
  contohDeleteProduct,
  contohCreateSupplier,
  contohGetSuppliers,
  contohCreatePurchase,
  contohGetPurchases,
  contohCreateSale,
  contohGetSalesSummary,
  contohStockIn,
  contohStockOut,
  contohGetStockMovements,
  workflowLengkap,
}
