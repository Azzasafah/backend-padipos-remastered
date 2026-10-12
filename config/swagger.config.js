const swaggerUi = require('swagger-ui-express')

const swaggerDocument = {
  openapi: '3.0.3',
  info: {
    title: 'POS (Point of Sale) API Documentation',
    version: '1.0.0',
    description: 'Dokumentasi RESTful API untuk Sistem Point of Sale (POS) backend dengan Express, Prisma ORM, MySQL, dan Midtrans.'
  },
  servers: [
    {
      url: 'http://localhost:5000',
      description: 'Development Server'
    }
  ],
  components: {
    securitySchemes: {
      BearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: 'Masukkan JWT token format: Bearer <token>'
      }
    },
    schemas: {
      ErrorResponse: {
        type: 'object',
        properties: {
          error: { type: 'string' },
          message: { type: 'string' }
        }
      },
      ValidationErrorResponse: {
        type: 'object',
        properties: {
          message: { type: 'string', example: 'Validation failed' },
          errors: {
            type: 'array',
            items: { type: 'string' }
          }
        }
      },
      RegisterRequest: {
        type: 'object',
        required: ['username', 'email', 'password', 'confirmPassword'],
        properties: {
          username: { type: 'string', example: 'kasir1', minLength: 3 },
          email: { type: 'string', format: 'email', example: 'kasir1@example.com' },
          password: { type: 'string', example: 'Password123', minLength: 6 },
          confirmPassword: { type: 'string', example: 'Password123' }
        }
      },
      LoginRequest: {
        type: 'object',
        required: ['username', 'password'],
        properties: {
          username: { type: 'string', example: 'kasir1' },
          password: { type: 'string', example: 'Password123' }
        }
      },
      ForgotPasswordRequest: {
        type: 'object',
        required: ['email'],
        properties: {
          email: { type: 'string', format: 'email', example: 'kasir1@example.com' }
        }
      },
      ResetPasswordRequest: {
        type: 'object',
        required: ['email', 'otp', 'password'],
        properties: {
          email: { type: 'string', format: 'email', example: 'kasir1@example.com' },
          otp: { type: 'string', example: '1234' },
          password: { type: 'string', example: 'NewPassword123', minLength: 6 }
        }
      },
      UpdatePasswordRequest: {
        type: 'object',
        required: ['email', 'password'],
        properties: {
          email: { type: 'string', format: 'email', example: 'kasir1@example.com' },
          password: { type: 'string', example: 'UpdatedPassword123', minLength: 6 }
        }
      },
      CategoryRequest: {
        type: 'object',
        required: ['name'],
        properties: {
          name: { type: 'string', example: 'Makanan' },
          icon: { type: 'string', example: 'utensils' }
        }
      },
      TransactionItem: {
        type: 'object',
        required: ['productId', 'qty'],
        properties: {
          productId: { type: 'integer', example: 1 },
          qty: { type: 'integer', example: 2 }
        }
      },
      CreateTransactionRequest: {
        type: 'object',
        required: ['orderType', 'paymentMethod', 'items'],
        properties: {
          orderType: {
            type: 'string',
            enum: ['dine_in', 'take_away'],
            example: 'dine_in'
          },
          paymentMethod: {
            type: 'string',
            enum: ['cash', 'midtrans'],
            example: 'cash'
          },
          customerName: { type: 'string', example: 'Budi' },
          tableNumber: { type: 'integer', example: 5 },
          paid: { type: 'number', example: 50000, description: 'Wajib jika paymentMethod adalah cash' },
          note: { type: 'string', example: 'Tanpa sambal' },
          items: {
            type: 'array',
            items: { $ref: '#/components/schemas/TransactionItem' }
          }
        }
      },
      MidtransCallbackRequest: {
        type: 'object',
        required: ['order_id', 'transaction_status'],
        properties: {
          order_id: { type: 'string', example: 'ORDER-1712345678-1' },
          transaction_status: { type: 'string', example: 'settlement' },
          fraud_status: { type: 'string', example: 'accept' }
        }
      }
    }
  },
  paths: {
    '/health': {
      get: {
        summary: 'Pemeriksaan Kesehatan Server',
        tags: ['Health'],
        responses: {
          200: {
            description: 'Server aktif dan berjalan'
          }
        }
      }
    },
    '/api/auth/register': {
      post: {
        summary: 'Pendaftaran Akun Baru (Default Role: cashier)',
        tags: ['Auth'],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/RegisterRequest' }
            }
          }
        },
        responses: {
          201: { description: 'User berhasil didaftarkan' },
          400: { description: 'Validasi gagal / email / username sudah terdaftar' }
        }
      }
    },
    '/api/auth/login': {
      post: {
        summary: 'Login User & Mendapatkan JWT Token',
        tags: ['Auth'],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/LoginRequest' }
            }
          }
        },
        responses: {
          200: { description: 'Login berhasil dan token dikembalikan' },
          400: { description: 'Username atau password salah' },
          429: { description: 'Terlalu banyak percobaan login (rate limited)' }
        }
      }
    },
    '/api/auth/forgot-password': {
      post: {
        summary: 'Permintaan OTP Reset Password via Email',
        tags: ['Auth'],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/ForgotPasswordRequest' }
            }
          }
        },
        responses: {
          200: { description: 'OTP berhasil dikirim ke email' },
          400: { description: 'Email tidak ditemukan' }
        }
      }
    },
    '/api/auth/reset-password': {
      post: {
        summary: 'Reset Password Menggunakan Kode OTP',
        tags: ['Auth'],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/ResetPasswordRequest' }
            }
          }
        },
        responses: {
          200: { description: 'Password berhasil diubah' },
          400: { description: 'OTP salah atau kadaluarsa' }
        }
      }
    },
    '/api/auth/update-password': {
      post: {
        summary: 'Update Password Pengguna Terotentikasi',
        tags: ['Auth'],
        security: [{ BearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/UpdatePasswordRequest' }
            }
          }
        },
        responses: {
          200: { description: 'Password berhasil diperbarui' },
          401: { description: 'Token tidak valid' }
        }
      }
    },
    '/api/auth/me': {
      get: {
        summary: 'Mendapatkan Profil User Sedang Login',
        tags: ['Auth'],
        security: [{ BearerAuth: [] }],
        responses: {
          200: { description: 'Profil berhasil ditemukan' },
          401: { description: 'Tidak terotentikasi' }
        }
      }
    },
    '/api/auth/logout': {
      post: {
        summary: 'Logout Sesi User',
        tags: ['Auth'],
        security: [{ BearerAuth: [] }],
        responses: {
          200: { description: 'Logout berhasil' }
        }
      }
    },
    '/api/categories': {
      get: {
        summary: 'Daftar Kategori beserta Produk di Dalamnya',
        tags: ['Categories'],
        security: [{ BearerAuth: [] }],
        parameters: [
          { in: 'query', name: 'page', schema: { type: 'integer', default: 1 } },
          { in: 'query', name: 'limit', schema: { type: 'integer', default: 10 } },
          { in: 'query', name: 'search', schema: { type: 'string' } }
        ],
        responses: {
          200: { description: 'Daftar kategori berhasil dibaca' }
        }
      },
      post: {
        summary: 'Tambah Kategori Baru (Admin Only)',
        tags: ['Categories'],
        security: [{ BearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/CategoryRequest' }
            }
          }
        },
        responses: {
          201: { description: 'Kategori berhasil dibuat' },
          403: { description: 'Hanya admin yang diizinkan' }
        }
      }
    },
    '/api/categories/{id}': {
      get: {
        summary: 'Detail Kategori berdasarkan ID',
        tags: ['Categories'],
        security: [{ BearerAuth: [] }],
        parameters: [
          { in: 'path', name: 'id', required: true, schema: { type: 'integer' } }
        ],
        responses: {
          200: { description: 'Data kategori berhasil dibaca' },
          404: { description: 'Kategori tidak ditemukan' }
        }
      },
      put: {
        summary: 'Ubah Data Kategori (Admin Only)',
        tags: ['Categories'],
        security: [{ BearerAuth: [] }],
        parameters: [
          { in: 'path', name: 'id', required: true, schema: { type: 'integer' } }
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/CategoryRequest' }
            }
          }
        },
        responses: {
          200: { description: 'Kategori berhasil diperbarui' },
          404: { description: 'Kategori tidak ditemukan' }
        }
      },
      delete: {
        summary: 'Hapus Kategori (Admin Only)',
        tags: ['Categories'],
        security: [{ BearerAuth: [] }],
        parameters: [
          { in: 'path', name: 'id', required: true, schema: { type: 'integer' } }
        ],
        responses: {
          200: { description: 'Kategori berhasil dihapus' },
          404: { description: 'Kategori tidak ditemukan' }
        }
      }
    },
    '/api/products': {
      get: {
        summary: 'Daftar Seluruh Produk (Filter, Pencarian, Paginasi)',
        tags: ['Products'],
        security: [{ BearerAuth: [] }],
        parameters: [
          { in: 'query', name: 'page', schema: { type: 'integer', default: 1 } },
          { in: 'query', name: 'limit', schema: { type: 'integer', default: 10 } },
          { in: 'query', name: 'search', schema: { type: 'string' } },
          { in: 'query', name: 'categoryId', schema: { type: 'integer' } }
        ],
        responses: {
          200: { description: 'Daftar produk berhasil dibaca' }
        }
      },
      post: {
        summary: 'Tambah Produk Baru beserta Gambar (Admin Only)',
        tags: ['Products'],
        security: [{ BearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'multipart/form-data': {
              schema: {
                type: 'object',
                required: ['name', 'price', 'categoryId', 'stock', 'image'],
                properties: {
                  name: { type: 'string', example: 'Nasi Goreng Spesial' },
                  price: { type: 'number', example: 25000 },
                  categoryId: { type: 'integer', example: 1 },
                  stock: { type: 'integer', example: 50 },
                  description: { type: 'string', example: 'Nasi goreng dengan telur dan ayam' },
                  image: { type: 'string', format: 'binary' }
                }
              }
            }
          }
        },
        responses: {
          201: { description: 'Produk berhasil dibuat' }
        }
      }
    },
    '/api/products/{id}': {
      get: {
        summary: 'Detail Produk berdasarkan ID',
        tags: ['Products'],
        security: [{ BearerAuth: [] }],
        parameters: [
          { in: 'path', name: 'id', required: true, schema: { type: 'integer' } }
        ],
        responses: {
          200: { description: 'Produk berhasil dibaca' },
          404: { description: 'Produk tidak ditemukan' }
        }
      },
      put: {
        summary: 'Update Data Produk beserta Gambar Opsional (Admin Only)',
        tags: ['Products'],
        security: [{ BearerAuth: [] }],
        parameters: [
          { in: 'path', name: 'id', required: true, schema: { type: 'integer' } }
        ],
        requestBody: {
          content: {
            'multipart/form-data': {
              schema: {
                type: 'object',
                properties: {
                  name: { type: 'string', example: 'Nasi Goreng Spesial Jumbo' },
                  price: { type: 'number', example: 30000 },
                  categoryId: { type: 'integer', example: 1 },
                  stock: { type: 'integer', example: 45 },
                  description: { type: 'string', example: 'Porsi lebih banyak' },
                  image: { type: 'string', format: 'binary' }
                }
              }
            }
          }
        },
        responses: {
          200: { description: 'Produk berhasil diupdate' },
          404: { description: 'Produk tidak ditemukan' }
        }
      },
      delete: {
        summary: 'Hapus Produk (Admin Only)',
        tags: ['Products'],
        security: [{ BearerAuth: [] }],
        parameters: [
          { in: 'path', name: 'id', required: true, schema: { type: 'integer' } }
        ],
        responses: {
          200: { description: 'Produk berhasil dihapus' },
          404: { description: 'Produk tidak ditemukan' }
        }
      }
    },
    '/api/transactions': {
      get: {
        summary: 'Daftar Riwayat Transaksi',
        tags: ['Transactions'],
        security: [{ BearerAuth: [] }],
        parameters: [
          { in: 'query', name: 'search', schema: { type: 'string' }, description: 'Nama customer' },
          { in: 'query', name: 'orderType', schema: { type: 'string', enum: ['dine_in', 'take_away'] } },
          { in: 'query', name: 'paymentStatus', schema: { type: 'string', enum: ['pending', 'paid', 'failed', 'expired'] } }
        ],
        responses: {
          200: { description: 'Transaksi berhasil dibaca' }
        }
      },
      post: {
        summary: 'Buat Transaksi Baru (Cash atau Midtrans)',
        tags: ['Transactions'],
        security: [{ BearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/CreateTransactionRequest' }
            }
          }
        },
        responses: {
          200: { description: 'Midtrans token berhasil digenerate' },
          201: { description: 'Pembayaran cash berhasil diselesaikan' },
          400: { description: 'Validasi / stok tidak mencukupi / nominal bayar kurang' }
        }
      }
    },
    '/api/transactions/{id}': {
      get: {
        summary: 'Detail Transaksi Lengkap berdasarkan ID',
        tags: ['Transactions'],
        security: [{ BearerAuth: [] }],
        parameters: [
          { in: 'path', name: 'id', required: true, schema: { type: 'integer' } }
        ],
        responses: {
          200: { description: 'Detail transaksi berhasil dibaca' },
          404: { description: 'Transaksi tidak ditemukan' }
        }
      }
    },
    '/api/transactions/midtrans/callback': {
      post: {
        summary: 'Webhook Callback dari Midtrans Payment Gateway',
        tags: ['Transactions'],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/MidtransCallbackRequest' }
            }
          }
        },
        responses: {
          200: { description: 'Callback berhasil diproses' }
        }
      }
    },
    '/api/reports/dashboard': {
      get: {
        summary: 'Ringkasan Statistik Dashboard POS',
        tags: ['Reports'],
        security: [{ BearerAuth: [] }],
        responses: {
          200: { description: 'Total order, omzet, item terjual, dan per kategori' }
        }
      }
    },
    '/api/reports/transaction': {
      get: {
        summary: 'Laporan Transaksi dengan Filter Tanggal & Kategori',
        tags: ['Reports'],
        security: [{ BearerAuth: [] }],
        parameters: [
          { in: 'query', name: 'startDate', schema: { type: 'string', format: 'date' } },
          { in: 'query', name: 'endDate', schema: { type: 'string', format: 'date' } },
          { in: 'query', name: 'categoryId', schema: { type: 'integer' } },
          { in: 'query', name: 'orderType', schema: { type: 'string', enum: ['dine_in', 'take_away'] } }
        ],
        responses: {
          200: { description: 'Data laporan transaksi berhasil dibaca' }
        }
      }
    },
    '/api/reports/export': {
      get: {
        summary: 'Export Laporan Transaksi ke Format Excel (.xlsx)',
        tags: ['Reports'],
        security: [{ BearerAuth: [] }],
        parameters: [
          { in: 'query', name: 'startDate', schema: { type: 'string', format: 'date' } },
          { in: 'query', name: 'endDate', schema: { type: 'string', format: 'date' } },
          { in: 'query', name: 'categoryId', schema: { type: 'integer' } },
          { in: 'query', name: 'orderType', schema: { type: 'string', enum: ['dine_in', 'take_away'] } }
        ],
        responses: {
          200: {
            description: 'File Excel (.xlsx) berhasil di-download',
            content: {
              'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': {}
            }
          }
        }
      }
    },
    '/api/reports/category/{categoryId}': {
      get: {
        summary: 'Laporan Penjualan Item dalam Satu Kategori',
        tags: ['Reports'],
        security: [{ BearerAuth: [] }],
        parameters: [
          { in: 'path', name: 'categoryId', required: true, schema: { type: 'integer' } }
        ],
        responses: {
          200: { description: 'Daftar menu dan total penjualan dalam kategori' }
        }
      }
    }
  }
}

module.exports = {
  swaggerUi,
  swaggerDocument
}
