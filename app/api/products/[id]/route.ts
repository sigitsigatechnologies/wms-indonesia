import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/products/[id] - Get a single product by ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const product = await prisma.product.findUnique({
      where: { id },
    });

    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    return NextResponse.json(product);
  } catch (error) {
    console.error('Error fetching product:', error);
    return NextResponse.json({ error: 'Failed to fetch product' }, { status: 500 });
  }
}

// PUT /api/products/[id] - Update a product
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { barcode, name, unit, sellingPrice, averageCost, currentStock, minStock, isActive } = body;

    // Check if product exists
    const existingProduct = await prisma.product.findUnique({
      where: { id },
    });

    if (!existingProduct) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    // Check if barcode is being changed and if it already exists
    if (barcode && barcode !== existingProduct.barcode) {
      const barcodeExists = await prisma.product.findUnique({
        where: { barcode },
      });
      if (barcodeExists) {
        return NextResponse.json({ error: 'Barcode already exists' }, { status: 400 });
      }
    }

    const product = await prisma.product.update({
      where: { id },
      data: {
        ...(barcode && { barcode }),
        ...(name && { name }),
        ...(unit !== undefined && { unit }),
        ...(sellingPrice !== undefined && { sellingPrice: parseFloat(sellingPrice) }),
        ...(averageCost !== undefined && { averageCost: parseFloat(body.averageCost) }),
        ...(currentStock !== undefined && { currentStock: parseFloat(body.currentStock) }),
        ...(minStock !== undefined && { minStock: parseFloat(minStock) }),
        ...(isActive !== undefined && { isActive }),
      },
    });

    return NextResponse.json(product);
  } catch (error) {
    console.error('Error updating product:', error);
    return NextResponse.json({ error: 'Failed to update product' }, { status: 500 });
  }
}

// DELETE /api/products/[id] - Delete a product
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Check if product exists
    const existingProduct = await prisma.product.findUnique({
      where: { id },
    });

    if (!existingProduct) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    await prisma.product.delete({
      where: { id },
    });

    return NextResponse.json({ message: 'Product deleted successfully' });
  } catch (error) {
    console.error('Error deleting product:', error);
    return NextResponse.json({ error: 'Failed to delete product' }, { status: 500 });
  }
}
