// Supplier Model - CRUD Operations
// ============================================

export type CreateSupplierInput = {
  name: string
  phone?: string
  address?: string
}

export type UpdateSupplierInput = {
  name?: string
  phone?: string
  address?: string
}

// CREATE - Create new supplier
export async function createSupplier(data: CreateSupplierInput) {
  const { prisma } = await import('@/lib/prisma')
  return await prisma.supplier.create({
    data: {
      name: data.name,
      phone: data.phone,
      address: data.address,
    },
  })
}

// READ - Get all suppliers
export async function getAllSuppliers() {
  const { prisma } = await import('@/lib/prisma')
  return await prisma.supplier.findMany({
    orderBy: { createdAt: 'desc' },
  })
}

// READ - Get supplier by ID
export async function getSupplierById(id: string) {
  const { prisma } = await import('@/lib/prisma')
  return await prisma.supplier.findUnique({
    where: { id },
    include: {
      purchases: {
        orderBy: { purchaseDate: 'desc' },
      },
    },
  })
}

// UPDATE - Update supplier
export async function updateSupplier(id: string, data: UpdateSupplierInput) {
  const { prisma } = await import('@/lib/prisma')
  return await prisma.supplier.update({
    where: { id },
    data,
  })
}

// DELETE - Delete supplier
export async function deleteSupplier(id: string) {
  const { prisma } = await import('@/lib/prisma')
  return await prisma.supplier.delete({
    where: { id },
  })
}

// SEARCH - Search suppliers
export async function searchSuppliers(query: string) {
  const { prisma } = await import('@/lib/prisma')
  return await prisma.supplier.findMany({
    where: {
      OR: [
        { name: { contains: query, mode: 'insensitive' } },
        { phone: { contains: query, mode: 'insensitive' } },
      ],
    },
    orderBy: { name: 'asc' },
  })
}
