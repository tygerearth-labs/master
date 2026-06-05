export type ModelField = {
  name: string
  type: 'string' | 'number' | 'boolean' | 'datetime' | 'select'
  required: boolean
  editable: boolean
  label: string
  options?: string[]
  relation?: { model: string; field: string; label: string }
}

export type ModelMeta = {
  name: string
  label: string
  icon: string
  fields: ModelField[]
  include?: Record<string, boolean | Record<string, boolean>>
  searchFields?: string[]
}

export const MODEL_METADATA: Record<string, ModelMeta> = {
  // ==================== OUTLET ====================
  Outlet: {
    name: 'Outlet',
    label: 'Outlet',
    icon: 'Store',
    fields: [
      { name: 'id', type: 'string', required: false, editable: false, label: 'ID' },
      { name: 'name', type: 'string', required: true, editable: true, label: 'Nama Outlet' },
      { name: 'address', type: 'string', required: false, editable: true, label: 'Alamat' },
      { name: 'phone', type: 'string', required: false, editable: true, label: 'Telepon' },
      {
        name: 'accountType',
        type: 'select',
        required: true,
        editable: true,
        label: 'Tipe Akun',
        options: ['free', 'pro', 'enterprise'],
      },
      { name: 'createdAt', type: 'datetime', required: false, editable: false, label: 'Dibuat' },
      { name: 'updatedAt', type: 'datetime', required: false, editable: false, label: 'Diperbarui' },
    ],
    include: {
      users: true,
      products: true,
      customers: true,
      categories: true,
      transactions: true,
      auditLogs: true,
      setting: true,
      promos: true,
      crewPermissions: true,
      productVariants: true,
    },
    searchFields: ['name', 'address', 'phone'],
  },

  // ==================== USER ====================
  User: {
    name: 'User',
    label: 'Pengguna',
    icon: 'Users',
    fields: [
      { name: 'id', type: 'string', required: false, editable: false, label: 'ID' },
      { name: 'name', type: 'string', required: true, editable: true, label: 'Nama' },
      { name: 'email', type: 'string', required: true, editable: true, label: 'Email' },
      { name: 'password', type: 'string', required: true, editable: true, label: 'Password' },
      {
        name: 'role',
        type: 'select',
        required: true,
        editable: true,
        label: 'Peran',
        options: ['OWNER', 'CREW'],
      },
      {
        name: 'outletId',
        type: 'string',
        required: true,
        editable: true,
        label: 'Outlet',
        relation: { model: 'Outlet', field: 'outletId', label: 'name' },
      },
      { name: 'createdAt', type: 'datetime', required: false, editable: false, label: 'Dibuat' },
      { name: 'updatedAt', type: 'datetime', required: false, editable: false, label: 'Diperbarui' },
    ],
    include: { outlet: true, crewPermission: true },
    searchFields: ['name', 'email'],
  },

  // ==================== CATEGORY ====================
  Category: {
    name: 'Category',
    label: 'Kategori',
    icon: 'Tag',
    fields: [
      { name: 'id', type: 'string', required: false, editable: false, label: 'ID' },
      { name: 'name', type: 'string', required: true, editable: true, label: 'Nama Kategori' },
      { name: 'color', type: 'string', required: false, editable: true, label: 'Warna' },
      {
        name: 'outletId',
        type: 'string',
        required: true,
        editable: true,
        label: 'Outlet',
        relation: { model: 'Outlet', field: 'outletId', label: 'name' },
      },
      { name: 'createdAt', type: 'datetime', required: false, editable: false, label: 'Dibuat' },
      { name: 'updatedAt', type: 'datetime', required: false, editable: false, label: 'Diperbarui' },
    ],
    include: { outlet: true, products: true },
    searchFields: ['name'],
  },

  // ==================== PRODUCT ====================
  Product: {
    name: 'Product',
    label: 'Produk',
    icon: 'Package',
    fields: [
      { name: 'id', type: 'string', required: false, editable: false, label: 'ID' },
      { name: 'name', type: 'string', required: true, editable: true, label: 'Nama Produk' },
      { name: 'sku', type: 'string', required: false, editable: true, label: 'SKU' },
      { name: 'barcode', type: 'string', required: false, editable: true, label: 'Barcode' },
      { name: 'hpp', type: 'number', required: false, editable: true, label: 'HPP (Harga Pokok)' },
      { name: 'price', type: 'number', required: true, editable: true, label: 'Harga Jual' },
      { name: 'bruto', type: 'number', required: false, editable: true, label: 'Bruto' },
      { name: 'netto', type: 'number', required: false, editable: true, label: 'Netto' },
      { name: 'stock', type: 'number', required: false, editable: true, label: 'Stok' },
      { name: 'lowStockAlert', type: 'number', required: false, editable: true, label: 'Batas Stok Rendah' },
      { name: 'unit', type: 'string', required: false, editable: true, label: 'Satuan' },
      { name: 'image', type: 'string', required: false, editable: true, label: 'Gambar' },
      {
        name: 'categoryId',
        type: 'string',
        required: false,
        editable: true,
        label: 'Kategori',
        relation: { model: 'Category', field: 'categoryId', label: 'name' },
      },
      {
        name: 'outletId',
        type: 'string',
        required: true,
        editable: true,
        label: 'Outlet',
        relation: { model: 'Outlet', field: 'outletId', label: 'name' },
      },
      { name: 'createdAt', type: 'datetime', required: false, editable: false, label: 'Dibuat' },
      { name: 'updatedAt', type: 'datetime', required: false, editable: false, label: 'Diperbarui' },
      { name: 'hasVariants', type: 'boolean', required: false, editable: true, label: 'Punya Varian' },
    ],
    include: { outlet: true, category: true, variants: true },
    searchFields: ['name', 'sku', 'barcode'],
  },

  // ==================== PRODUCT VARIANT ====================
  ProductVariant: {
    name: 'ProductVariant',
    label: 'Varian Produk',
    icon: 'Layers',
    fields: [
      { name: 'id', type: 'string', required: false, editable: false, label: 'ID' },
      {
        name: 'productId',
        type: 'string',
        required: true,
        editable: true,
        label: 'Produk',
        relation: { model: 'Product', field: 'productId', label: 'name' },
      },
      { name: 'name', type: 'string', required: true, editable: true, label: 'Nama Varian' },
      { name: 'sku', type: 'string', required: false, editable: true, label: 'SKU' },
      { name: 'barcode', type: 'string', required: false, editable: true, label: 'Barcode' },
      { name: 'hpp', type: 'number', required: false, editable: true, label: 'HPP (Harga Pokok)' },
      { name: 'price', type: 'number', required: true, editable: true, label: 'Harga Jual' },
      { name: 'stock', type: 'number', required: false, editable: true, label: 'Stok' },
      {
        name: 'outletId',
        type: 'string',
        required: true,
        editable: true,
        label: 'Outlet',
        relation: { model: 'Outlet', field: 'outletId', label: 'name' },
      },
      { name: 'createdAt', type: 'datetime', required: false, editable: false, label: 'Dibuat' },
      { name: 'updatedAt', type: 'datetime', required: false, editable: false, label: 'Diperbarui' },
    ],
    include: { product: true, outlet: true },
    searchFields: ['name', 'sku', 'barcode'],
  },

  // ==================== CUSTOMER ====================
  Customer: {
    name: 'Customer',
    label: 'Pelanggan',
    icon: 'UserCheck',
    fields: [
      { name: 'id', type: 'string', required: false, editable: false, label: 'ID' },
      { name: 'name', type: 'string', required: true, editable: true, label: 'Nama Pelanggan' },
      { name: 'whatsapp', type: 'string', required: true, editable: true, label: 'WhatsApp' },
      { name: 'totalSpend', type: 'number', required: false, editable: true, label: 'Total Belanja' },
      { name: 'points', type: 'number', required: false, editable: true, label: 'Poin' },
      {
        name: 'outletId',
        type: 'string',
        required: true,
        editable: true,
        label: 'Outlet',
        relation: { model: 'Outlet', field: 'outletId', label: 'name' },
      },
      { name: 'createdAt', type: 'datetime', required: false, editable: false, label: 'Dibuat' },
      { name: 'updatedAt', type: 'datetime', required: false, editable: false, label: 'Diperbarui' },
    ],
    include: { outlet: true },
    searchFields: ['name', 'whatsapp'],
  },

  // ==================== TRANSACTION ====================
  Transaction: {
    name: 'Transaction',
    label: 'Transaksi',
    icon: 'Receipt',
    fields: [
      { name: 'id', type: 'string', required: false, editable: false, label: 'ID' },
      { name: 'invoiceNumber', type: 'string', required: true, editable: true, label: 'No. Invoice' },
      { name: 'subtotal', type: 'number', required: true, editable: true, label: 'Subtotal' },
      { name: 'discount', type: 'number', required: false, editable: true, label: 'Diskon' },
      { name: 'pointsUsed', type: 'number', required: false, editable: true, label: 'Poin Digunakan' },
      { name: 'taxAmount', type: 'number', required: false, editable: true, label: 'Pajak' },
      { name: 'total', type: 'number', required: true, editable: true, label: 'Total' },
      {
        name: 'paymentMethod',
        type: 'select',
        required: true,
        editable: true,
        label: 'Metode Pembayaran',
        options: ['CASH', 'QRIS', 'DEBIT'],
      },
      { name: 'paidAmount', type: 'number', required: false, editable: true, label: 'Jumlah Dibayar' },
      { name: 'change', type: 'number', required: false, editable: true, label: 'Kembalian' },
      { name: 'note', type: 'string', required: false, editable: true, label: 'Catatan' },
      {
        name: 'outletId',
        type: 'string',
        required: true,
        editable: true,
        label: 'Outlet',
        relation: { model: 'Outlet', field: 'outletId', label: 'name' },
      },
      {
        name: 'customerId',
        type: 'string',
        required: false,
        editable: true,
        label: 'Pelanggan',
        relation: { model: 'Customer', field: 'customerId', label: 'name' },
      },
      {
        name: 'userId',
        type: 'string',
        required: true,
        editable: true,
        label: 'Kasir',
        relation: { model: 'User', field: 'userId', label: 'name' },
      },
      { name: 'createdAt', type: 'datetime', required: false, editable: false, label: 'Dibuat' },
    ],
    include: {
      outlet: true,
      customer: true,
      user: true,
      items: true,
    },
    searchFields: ['invoiceNumber'],
  },

  // ==================== TRANSACTION ITEM ====================
  TransactionItem: {
    name: 'TransactionItem',
    label: 'Item Transaksi',
    icon: 'ShoppingCart',
    fields: [
      { name: 'id', type: 'string', required: false, editable: false, label: 'ID' },
      {
        name: 'productId',
        type: 'string',
        required: false,
        editable: true,
        label: 'Produk',
        relation: { model: 'Product', field: 'productId', label: 'name' },
      },
      {
        name: 'variantId',
        type: 'string',
        required: false,
        editable: true,
        label: 'Varian',
        relation: { model: 'ProductVariant', field: 'variantId', label: 'name' },
      },
      { name: 'productName', type: 'string', required: true, editable: true, label: 'Nama Produk' },
      { name: 'variantName', type: 'string', required: false, editable: true, label: 'Nama Varian' },
      { name: 'price', type: 'number', required: true, editable: true, label: 'Harga' },
      { name: 'qty', type: 'number', required: true, editable: true, label: 'Jumlah' },
      { name: 'subtotal', type: 'number', required: true, editable: true, label: 'Subtotal' },
      { name: 'hpp', type: 'number', required: true, editable: true, label: 'HPP' },
      {
        name: 'transactionId',
        type: 'string',
        required: true,
        editable: true,
        label: 'Transaksi',
        relation: { model: 'Transaction', field: 'transactionId', label: 'invoiceNumber' },
      },
    ],
    include: { product: true, variant: true, transaction: true },
    searchFields: ['productName', 'variantName'],
  },

  // ==================== LOYALTY LOG ====================
  LoyaltyLog: {
    name: 'LoyaltyLog',
    label: 'Log Loyalitas',
    icon: 'Heart',
    fields: [
      { name: 'id', type: 'string', required: false, editable: false, label: 'ID' },
      {
        name: 'type',
        type: 'select',
        required: true,
        editable: true,
        label: 'Tipe',
        options: ['EARN', 'REDEEM'],
      },
      { name: 'points', type: 'number', required: true, editable: true, label: 'Poin' },
      { name: 'description', type: 'string', required: true, editable: true, label: 'Deskripsi' },
      {
        name: 'customerId',
        type: 'string',
        required: true,
        editable: true,
        label: 'Pelanggan',
        relation: { model: 'Customer', field: 'customerId', label: 'name' },
      },
      {
        name: 'transactionId',
        type: 'string',
        required: false,
        editable: true,
        label: 'Transaksi',
        relation: { model: 'Transaction', field: 'transactionId', label: 'invoiceNumber' },
      },
      { name: 'createdAt', type: 'datetime', required: false, editable: false, label: 'Dibuat' },
    ],
    include: { customer: true, transaction: true },
    searchFields: ['description'],
  },

  // ==================== AUDIT LOG ====================
  AuditLog: {
    name: 'AuditLog',
    label: 'Log Audit',
    icon: 'ClipboardList',
    fields: [
      { name: 'id', type: 'string', required: false, editable: false, label: 'ID' },
      {
        name: 'action',
        type: 'select',
        required: true,
        editable: true,
        label: 'Aksi',
        options: ['CREATE', 'RESTOCK', 'SALE', 'ADJUSTMENT', 'UPDATE'],
      },
      {
        name: 'entityType',
        type: 'select',
        required: true,
        editable: true,
        label: 'Tipe Entitas',
        options: ['PRODUCT', 'STOCK', 'OUTLET', 'SETTINGS', 'TRANSACTION'],
      },
      { name: 'entityId', type: 'string', required: false, editable: true, label: 'ID Entitas' },
      { name: 'details', type: 'string', required: false, editable: true, label: 'Detail' },
      {
        name: 'outletId',
        type: 'string',
        required: true,
        editable: true,
        label: 'Outlet',
        relation: { model: 'Outlet', field: 'outletId', label: 'name' },
      },
      {
        name: 'userId',
        type: 'string',
        required: true,
        editable: true,
        label: 'Pengguna',
        relation: { model: 'User', field: 'userId', label: 'name' },
      },
      { name: 'createdAt', type: 'datetime', required: false, editable: false, label: 'Dibuat' },
    ],
    include: { outlet: true, user: true },
    searchFields: ['action', 'entityType', 'details'],
  },

  // ==================== OUTLET SETTING ====================
  OutletSetting: {
    name: 'OutletSetting',
    label: 'Pengaturan Outlet',
    icon: 'Settings',
    fields: [
      { name: 'id', type: 'string', required: false, editable: false, label: 'ID' },
      {
        name: 'outletId',
        type: 'string',
        required: true,
        editable: true,
        label: 'Outlet',
        relation: { model: 'Outlet', field: 'outletId', label: 'name' },
      },
      { name: 'paymentMethods', type: 'string', required: false, editable: true, label: 'Metode Pembayaran' },
      { name: 'loyaltyEnabled', type: 'boolean', required: false, editable: true, label: 'Loyalitas Aktif' },
      { name: 'loyaltyPointsPerAmount', type: 'number', required: false, editable: true, label: 'Poin per Jumlah' },
      { name: 'loyaltyPointValue', type: 'number', required: false, editable: true, label: 'Nilai Poin' },
      { name: 'receiptBusinessName', type: 'string', required: false, editable: true, label: 'Nama Bisnis (Struk)' },
      { name: 'receiptAddress', type: 'string', required: false, editable: true, label: 'Alamat (Struk)' },
      { name: 'receiptPhone', type: 'string', required: false, editable: true, label: 'Telepon (Struk)' },
      { name: 'receiptFooter', type: 'string', required: false, editable: true, label: 'Footer (Struk)' },
      { name: 'receiptLogo', type: 'string', required: false, editable: true, label: 'Logo (Struk)' },
      { name: 'ppnEnabled', type: 'boolean', required: false, editable: true, label: 'PPN Aktif' },
      { name: 'ppnRate', type: 'number', required: false, editable: true, label: 'Tarif PPN (%)' },
      { name: 'themePrimaryColor', type: 'string', required: false, editable: true, label: 'Warna Tema' },
      { name: 'telegramBotToken', type: 'string', required: false, editable: true, label: 'Token Bot Telegram' },
      { name: 'telegramChatId', type: 'string', required: false, editable: true, label: 'Chat ID Telegram' },
      { name: 'notifyOnTransaction', type: 'boolean', required: false, editable: true, label: 'Notif Transaksi' },
      { name: 'notifyOnCustomer', type: 'boolean', required: false, editable: true, label: 'Notif Pelanggan Baru' },
      { name: 'notifyDailyReport', type: 'boolean', required: false, editable: true, label: 'Laporan Harian' },
      { name: 'notifyWeeklyReport', type: 'boolean', required: false, editable: true, label: 'Laporan Mingguan' },
      { name: 'notifyMonthlyReport', type: 'boolean', required: false, editable: true, label: 'Laporan Bulanan' },
      { name: 'notifyOnInsight', type: 'boolean', required: false, editable: true, label: 'Notif Insight' },
      { name: 'createdAt', type: 'datetime', required: false, editable: false, label: 'Dibuat' },
      { name: 'updatedAt', type: 'datetime', required: false, editable: false, label: 'Diperbarui' },
    ],
    include: { outlet: true },
    searchFields: ['receiptBusinessName'],
  },

  // ==================== PROMO ====================
  Promo: {
    name: 'Promo',
    label: 'Promo',
    icon: 'Percent',
    fields: [
      { name: 'id', type: 'string', required: false, editable: false, label: 'ID' },
      { name: 'name', type: 'string', required: true, editable: true, label: 'Nama Promo' },
      {
        name: 'type',
        type: 'select',
        required: true,
        editable: true,
        label: 'Tipe',
        options: ['PERCENTAGE', 'NOMINAL', 'BUY_X_GET_DISCOUNT'],
      },
      { name: 'value', type: 'number', required: true, editable: true, label: 'Nilai' },
      { name: 'minPurchase', type: 'number', required: false, editable: true, label: 'Min. Pembelian' },
      { name: 'maxDiscount', type: 'number', required: false, editable: true, label: 'Maks. Diskon' },
      { name: 'active', type: 'boolean', required: false, editable: true, label: 'Aktif' },
      {
        name: 'outletId',
        type: 'string',
        required: true,
        editable: true,
        label: 'Outlet',
        relation: { model: 'Outlet', field: 'outletId', label: 'name' },
      },
      { name: 'buyMinQty', type: 'number', required: false, editable: true, label: 'Min. Qty Beli' },
      {
        name: 'discountType',
        type: 'select',
        required: false,
        editable: true,
        label: 'Tipe Diskon',
        options: ['PERCENTAGE', 'NOMINAL'],
      },
      {
        name: 'categoryId',
        type: 'string',
        required: false,
        editable: true,
        label: 'Kategori',
        relation: { model: 'Category', field: 'categoryId', label: 'name' },
      },
      { name: 'createdAt', type: 'datetime', required: false, editable: false, label: 'Dibuat' },
      { name: 'updatedAt', type: 'datetime', required: false, editable: false, label: 'Diperbarui' },
    ],
    include: { outlet: true, category: true },
    searchFields: ['name'],
  },

  // ==================== CREW PERMISSION ====================
  CrewPermission: {
    name: 'CrewPermission',
    label: 'Izin Kru',
    icon: 'Shield',
    fields: [
      { name: 'id', type: 'string', required: false, editable: false, label: 'ID' },
      {
        name: 'userId',
        type: 'string',
        required: true,
        editable: true,
        label: 'Pengguna',
        relation: { model: 'User', field: 'userId', label: 'name' },
      },
      { name: 'pages', type: 'string', required: false, editable: true, label: 'Halaman' },
      {
        name: 'outletId',
        type: 'string',
        required: true,
        editable: true,
        label: 'Outlet',
        relation: { model: 'Outlet', field: 'outletId', label: 'name' },
      },
      { name: 'createdAt', type: 'datetime', required: false, editable: false, label: 'Dibuat' },
      { name: 'updatedAt', type: 'datetime', required: false, editable: false, label: 'Diperbarui' },
    ],
    include: { user: true, outlet: true },
    searchFields: ['pages'],
  },
}

/** List of all valid model names */
export const MODEL_NAMES = Object.keys(MODEL_METADATA) as (keyof typeof MODEL_METADATA)[]
