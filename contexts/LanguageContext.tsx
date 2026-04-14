'use client'

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'

type Language = 'en' | 'id'

interface Translations {
  [key: string]: string | Translations
}

// Dictionary matching keys used across all pages
const dictionaries: Record<Language, Translations> = {
  en: {
    // Navigation
    dashboard: 'Dashboard',
    products: 'Products',
    suppliers: 'Suppliers',
    purchases: 'Purchases',
    sales: 'Sales',
    stock: 'Stock',
    checkPrice: 'Check Price',
    reports: 'Reports',

    // Dashboard
    totalProducts: 'Total Products',
    totalSuppliers: 'Total Suppliers',
    totalPurchases: 'Total Purchases',
    totalSales: 'Total Sales',
    totalRevenue: 'Total Revenue',
    totalProfit: 'Total Profit',
    lowStockAlert: 'Low Stock Alert:',
    productsLowStock: 'products are running low on stock!',
    salesTrend: 'Sales Trend (Last 7 Days)',
    itemsAttention: 'Items Needing Attention',
    viewAllProducts: 'View All Products →',
    product: 'Product',
    stockLevel: 'Stock',
    status: 'Status',
    outOfStock: 'Out of Stock',
    lowStock: 'Low Stock',
    inStock: 'In Stock',
    moreLowStock: 'more products are low on stock',
    loading: 'Loading...',

    // Common table / actions
    barcode: 'Barcode',
    name: 'Name',
    price: 'Price',
    cost: 'Cost',
    minStock: 'Min Stock',
    active: 'Active',
    inactive: 'Inactive',
    actions: 'Actions',
    noDataFound: 'No data found',
    search: 'Search by name or barcode...',
    newProduct: 'New Product',
    newPurchase: 'New Purchase',
    newSale: 'New Sale',
    deleteConfirm: 'Are you sure you want to delete this?',

    // Form labels
    editProduct: 'Edit Product',
    addProduct: 'Add Product',
    editSupplier: 'Edit Supplier',
    addSupplier: 'Add Supplier',
    addPurchase: 'New Purchase',
    addSale: 'New Sale',
    productName: 'Product Name',
    unit: 'Unit',
    sellingPrice: 'Selling Price',
    averageCost: 'Average Cost',
    currentStock: 'Current Stock',
    barcodeAutoHint: 'Scan, enter barcode, or leave blank to auto-generate',
    invoiceAutoHint: 'Leave blank to auto-generate',
    save: 'Save',
    saving: 'Saving...',
    cancel: 'Cancel',
    back: '← Back',
    required: 'Required',
    supplierNameLabel: 'Supplier Name',
    phoneLabel: 'Phone',
    addressLabel: 'Address',
    checkPrice: 'Check Price',
    scanBarcode: '📷 Scan Barcode',
    scanning: 'Scanning...',
    enterBarcodeManually: 'Enter Barcode Manually',
    typeBarcode: 'Type barcode...',
    searchBtn: 'Search',
    searching: 'Searching...',
    productNotFound: 'Product not found',
    productName_label: 'PRODUCT NAME',
    sellingPrice_label: 'SELLING PRICE',

    // Products page
    noProductsFound: 'No products found',

    // Purchases page
    invoice: 'Invoice',
    date: 'Date',
    total: 'Total',
    items: 'Items',
    supplier: 'Supplier',
    noPurchasesFound: 'No purchases found',

    // Sales page
    profit: 'Profit',
    payment: 'Payment',
    noSalesFound: 'No sales found',

    // Stock page
    stockManagement: 'Stock Management',
    currentStock: 'Current Stock',
    movements: 'Movements',
    type: 'Type',
    reference: 'Reference',
    qty: 'Qty',
    before: 'Before',
    after: 'After',
    stockIn: 'Stock In',
    stockOut: 'Stock Out',
    noMovementsFound: 'No movements found',

    // Reports page
    monthlyReports: 'Monthly Reports',
    exportPDF: 'Export to PDF',
    totalSalesLabel: 'Total Sales',
    totalPurchasesLabel: 'Total Purchases',
    netProfit: 'Net Profit',
    basedOnSales: 'Based on sales profit',
    unitsReceived: 'Units received',
    unitsDispatched: 'Units dispatched',
    topSellingProducts: 'Top Selling Products',
    qtySold: 'Qty Sold',
    revenue: 'Revenue',
    transactions: 'Transactions',
    noDataAvailable: 'No data available for the selected period.',
    loadingReport: 'Loading report data...',

    // Suppliers page
    supplierName: 'Supplier Name',
    phone: 'Phone',
    address: 'Address',
    noSuppliersFound: 'No suppliers found',
    newSupplier: 'New Supplier',
  },
  id: {
    // Navigation
    dashboard: 'Dasbor',
    products: 'Produk',
    suppliers: 'Pemasok',
    purchases: 'Pembelian',
    sales: 'Penjualan',
    stock: 'Stok Barang',
    checkPrice: 'Cek Harga',
    reports: 'Laporan',

    // Dashboard
    totalProducts: 'Total Produk',
    totalSuppliers: 'Total Pemasok',
    totalPurchases: 'Total Pembelian',
    totalSales: 'Total Penjualan',
    totalRevenue: 'Total Pendapatan',
    totalProfit: 'Total Keuntungan',
    lowStockAlert: 'Peringatan Stok Tipis:',
    productsLowStock: 'produk memiliki stok hampir habis!',
    salesTrend: 'Tren Penjualan (7 Hari Terakhir)',
    itemsAttention: 'Barang Perlu Perhatian',
    viewAllProducts: 'Lihat Semua Produk →',
    product: 'Produk',
    stockLevel: 'Sisa Stok',
    status: 'Status',
    outOfStock: 'Stok Habis',
    lowStock: 'Stok Tipis',
    inStock: 'Stok Aman',
    moreLowStock: 'produk lainnya memiliki stok tipis',
    loading: 'Memuat...',

    // Common table / actions
    barcode: 'Barcode',
    name: 'Nama',
    price: 'Harga',
    cost: 'Modal',
    minStock: 'Min Stok',
    active: 'Aktif',
    inactive: 'Tidak Aktif',
    actions: 'Aksi',
    noDataFound: 'Data tidak ditemukan',
    search: 'Cari nama atau barcode...',
    newProduct: 'Tambah Produk',
    newPurchase: 'Tambah Pembelian',
    newSale: 'Tambah Penjualan',
    deleteConfirm: 'Apakah Anda yakin ingin menghapus data ini?',

    // Products page
    noProductsFound: 'Produk tidak ditemukan',

    // Purchases page
    invoice: 'No. Invoice',
    date: 'Tanggal',
    total: 'Total',
    items: 'Item',
    supplier: 'Pemasok',
    noPurchasesFound: 'Data pembelian tidak ditemukan',

    // Sales page
    profit: 'Keuntungan',
    payment: 'Pembayaran',
    noSalesFound: 'Data penjualan tidak ditemukan',

    // Stock page
    stockManagement: 'Manajemen Stok',
    currentStock: 'Stok Saat Ini',
    movements: 'Pergerakan Stok',
    type: 'Tipe',
    reference: 'Referensi',
    qty: 'Jumlah',
    before: 'Sebelum',
    after: 'Sesudah',
    stockIn: 'Stok Masuk',
    stockOut: 'Stok Keluar',
    noMovementsFound: 'Pergerakan stok tidak ditemukan',

    // Reports page
    monthlyReports: 'Laporan Bulanan',
    exportPDF: 'Ekspor ke PDF',
    totalSalesLabel: 'Total Penjualan',
    totalPurchasesLabel: 'Total Pembelian',
    netProfit: 'Laba Bersih',
    basedOnSales: 'Berdasarkan keuntungan penjualan',
    unitsReceived: 'Unit diterima',
    unitsDispatched: 'Unit dikirim',
    topSellingProducts: 'Produk Terlaris',
    qtySold: 'Jumlah Terjual',
    revenue: 'Pendapatan',
    transactions: 'Transaksi',
    noDataAvailable: 'Tidak ada data untuk periode yang dipilih.',
    loadingReport: 'Memuat data laporan...',

    // Suppliers page
    supplierName: 'Nama Pemasok',
    phone: 'Telepon',
    address: 'Alamat',
    noSuppliersFound: 'Data pemasok tidak ditemukan',
    newSupplier: 'Tambah Pemasok',

    // Form labels
    editProduct: 'Edit Produk',
    addProduct: 'Tambah Produk',
    editSupplier: 'Edit Pemasok',
    addSupplier: 'Tambah Pemasok',
    addPurchase: 'Tambah Pembelian',
    addSale: 'Tambah Penjualan',
    productName: 'Nama Produk',
    unit: 'Satuan',
    sellingPrice: 'Harga Jual',
    averageCost: 'Harga Modal',
    currentStock: 'Stok Saat Ini',
    barcodeAutoHint: 'Scan, masukkan barcode, atau kosongkan untuk generate otomatis',
    invoiceAutoHint: 'Kosongkan untuk generate otomatis',
    save: 'Simpan',
    saving: 'Menyimpan...',
    cancel: 'Batal',
    back: '← Kembali',
    required: 'Wajib diisi',
    supplierNameLabel: 'Nama Pemasok',
    phoneLabel: 'Telepon',
    addressLabel: 'Alamat',
    scanBarcode: '📷 Scan Barcode',
    scanning: 'Memindai...',
    enterBarcodeManually: 'Masukkan Barcode Manual',
    typeBarcode: 'Ketik barcode...',
    searchBtn: 'Cari',
    searching: 'Mencari...',
    productNotFound: 'Produk tidak ditemukan',
    productName_label: 'NAMA PRODUK',
    sellingPrice_label: 'HARGA JUAL',
  }
}

interface LanguageContextProps {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextProps | undefined>(undefined)

// Default t() function for before mount — always returns English
const defaultT = (key: string): string => {
  return (dictionaries['id'][key] as string) || key
}

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>('id') // Default to Bahasa Indonesia
  const [mounted, setMounted] = useState(false)

  // Initialize from localStorage on mount
  useEffect(() => {
    setMounted(true)
    const saved = localStorage.getItem('app-language') as Language
    if (saved === 'en' || saved === 'id') {
      setLanguageState(saved)
    }
  }, [])

  const setLanguage = (lang: Language) => {
    setLanguageState(lang)
    localStorage.setItem('app-language', lang)
  }

  const t = (key: string): string => {
    const translation = dictionaries[language][key] as string
    if (!translation) {
      const fallback = dictionaries['en'][key] as string
      return fallback || key
    }
    return translation
  }

  // Always wrap in Provider so useLanguage() works even before mount.
  // When not yet mounted, use defaultT to avoid potential mismatches.
  return (
    <LanguageContext.Provider value={{ language, setLanguage, t: mounted ? t : defaultT }}>
      {children}
    </LanguageContext.Provider>
  )
}

export function useLanguage() {
  const context = useContext(LanguageContext)
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider')
  }
  return context
}
