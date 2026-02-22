import { prisma } from '@/lib/prisma'

// ============================================
// TYPES
// ============================================

export type Product = Awaited<
  ReturnType<typeof prisma.product.findFirst>
>

export type CreateProductInput = {
  barcode: string
  name: string
  unit?: string
  sellingPrice: number
  averageCost?: number
  currentStock?: number
  minStock?: number
  isActive?: boolean
}

export type UpdateProductInput = {
  barcode?: string
  name?: string
  unit?: string
  sellingPrice?: number
  averageCost?: number
  currentStock?: number
  minStock?: number
  isActive?: boolean
}

// ============================================
// CRUD OPERATIONS
// ============================================

/**
 * Create a new product
 */
export async function createProduct(data: CreateProductInput): Promise<Product> {
  return await prisma.product.create({
    data: {
      barcode: data.barcode,
      name: data.name,
      unit: data.unit,
      sellingPrice: data.sellingPrice,
      averageCost: data.averageCost ?? 0,
      currentStock: data.currentStock ?? 0,
      minStock: data.minStock ?? 0,
      isActive: data.isActive ?? true,
    },
  })
}

/**
 * Get all products
 */
export async function getAllProducts(): Promise<Product[]> {
  return await prisma.product.findMany({
    orderBy: { createdAt: 'desc' },
  })
}

/**
 * Get active products only
 */
export async function getActiveProducts(): Promise<Product[]> {
  return await prisma.product.findMany({
    where: { isActive: true },
    orderBy: { name: 'asc' },
  })
}

/**
 * Get product by ID
 */
export async function getProductById(id: string): Promise<Product | null> {
  return await prisma.product.findUnique({
    where: { id },
  })
}

/**
 * Get product by barcode
 */
export async function getProductByBarcode(barcode: string): Promise<Product | null> {
  return await prisma.product.findUnique({
    where: { barcode },
  })
}

/**
 * Update product
 */
export async function updateProduct(id: string, data: UpdateProductInput): Promise<Product> {
  return await prisma.product.update({
    where: { id },
    data,
  })
}

/**
 * Delete product (soft delete - set isActive to false)
 */
export async function deleteProduct(id: string): Promise<Product> {
  return await prisma.product.update({
    where: { id },
    data: { isActive: false },
  })
}

/**
 * Hard delete product
 */
export async function hardDeleteProduct(id: string): Promise<void> {
  await prisma.product.delete({
    where: { id },
  })
}

/**
 * Update product stock
 */
export async function updateProductStock(
  id: string, 
  newStock: number
): Promise<Product> {
  return await prisma.product.update({
    where: { id },
    data: { currentStock: newStock },
  })
}

/**
 * Update average cost
 */
export async function updateAverageCost(
  id: string, 
  newAverageCost: number
): Promise<Product> {
  return await prisma.product.update({
    where: { id },
    data: { averageCost: newAverageCost },
  })
}

/**
 * Get products with low stock
 */
export async function getLowStockProducts(): Promise<Product[]> {
  return await prisma.product.findMany({
    where: {
      isActive: true,
      currentStock: {
        lte: 0, // sementara pakai angka tetap
      },
    },
    orderBy: { currentStock: 'asc' },
  })
}

/**
 * Search products by name or barcode
 */
export async function searchProducts(query: string): Promise<Product[]> {
  return await prisma.product.findMany({
    where: {
      isActive: true,
      OR: [
        { name: { contains: query, mode: 'insensitive' } },
        { barcode: { contains: query, mode: 'insensitive' } },
      ],
    },
    orderBy: { name: 'asc' },
  })
}

export default prisma
