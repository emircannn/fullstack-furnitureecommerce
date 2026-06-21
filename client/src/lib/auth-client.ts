// ============================================================
// Belenay Mobilya - Auth API İstemcisi (Client)
// Backend yerine local mock database (localStorage) ile çalışır.
// ============================================================

import axios, { AxiosInstance, AxiosResponse } from 'axios';
import { getDb, saveDb } from './mock-db';

// ---- API Temel URL ----
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001/api';

// ---- Token saklama anahtarları ----
const ACCESS_TOKEN_KEY = 'belenay_access_token';

// ---- API Yanıt Tipi ----
export interface ApiResponse<T = unknown> {
  success: boolean;
  data: T;
  message: string;
  statusCode: number;
  timestamp: string;
}

// ---- Kullanıcı tipi ----
export interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: 'customer' | 'admin';
  avatar?: string;
  provider: 'local' | 'google' | 'apple';
}

// ---- Token çifti ----
export interface TokenPair {
  accessToken: string;
}

// ---- Kayıt verisi ----
export interface RegisterData {
  name: string;
  email: string;
  password: string;
  phone?: string;
  gender?: 'male' | 'female' | 'other';
}

// ---- Giriş verisi ----
export interface LoginData {
  email: string;
  password: string;
}

// ---- Auth Yanıtı ----
export interface AuthResponse {
  user: AuthUser;
  accessToken: string;
}

// ================================================================
// MOCK HTTP ADAPTER (CLIENT-SIDE DATABASE MAPPING)
// ================================================================

// Helper to convert File to Base64 data URL
const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (error) => reject(error);
    reader.readAsDataURL(file);
  });
};

const mockAxiosAdapter = async (config: any): Promise<AxiosResponse<any>> => {
  const method = (config.method || 'get').toLowerCase();
  let urlPath = config.url || '';
  
  // Remove Base URL from urlPath if present
  if (urlPath.startsWith(API_BASE_URL)) {
    urlPath = urlPath.slice(API_BASE_URL.length);
  }
  // Strip query parameters
  const [cleanPath, queryString] = urlPath.split('?');
  
  // Combine config.params and parsed query string
  const queryParams = { ...config.params };
  if (queryString) {
    const searchParams = new URLSearchParams(queryString);
    searchParams.forEach((val, key) => {
      queryParams[key] = val;
    });
  }

  // Parse Body Data
  let body: any = {};
  if (config.data instanceof FormData) {
    const fd = config.data;
    for (const [key, value] of (fd as any).entries()) {
      body[key] = value;
    }
  } else if (typeof config.data === 'string') {
    try {
      body = JSON.parse(config.data);
    } catch {
      body = {};
    }
  } else {
    body = config.data || {};
  }

  const db = getDb();
  let responseData: any = null;
  let status = 200;

  try {
    // ------------------------------------------------------------
    // 1. FILE UPLOAD MOCK
    // ------------------------------------------------------------
    if (cleanPath.startsWith('/upload/') && method === 'post') {
      const file = body.file;
      if (file instanceof File) {
        const base64Data = await fileToBase64(file);
        responseData = {
          success: true,
          data: { url: base64Data },
          url: base64Data
        };
      } else {
        responseData = {
          success: true,
          data: { url: 'https://images.unsplash.com/photo-1524758631624-e2822e304c36?q=80&w=2070' },
          url: 'https://images.unsplash.com/photo-1524758631624-e2822e304c36?q=80&w=2070'
        };
      }
    }
    // ------------------------------------------------------------
    // 2. AUTHENTICATION MOCK
    // ------------------------------------------------------------
    else if (cleanPath === '/auth/login' && method === 'post') {
      const matchedUser = db.users.find(u => u.email === body.email) || db.users[0];
      responseData = {
        success: true,
        data: {
          user: {
            id: matchedUser.id,
            email: matchedUser.email,
            name: `${matchedUser.firstName} ${matchedUser.lastName}`,
            role: matchedUser.role,
            provider: 'local'
          },
          accessToken: 'mock-jwt-token'
        }
      };
    } else if (cleanPath === '/auth/register' && method === 'post') {
      const newUser = {
        id: `user-${Date.now()}`,
        email: body.email,
        firstName: body.name.split(' ')[0] || body.name,
        lastName: body.name.split(' ').slice(1).join(' ') || '',
        role: 'customer' as const,
        phone: body.phone || '',
        gender: body.gender || 'other'
      };
      db.users.push(newUser);
      saveDb(db);
      responseData = {
        success: true,
        data: {
          user: {
            id: newUser.id,
            email: newUser.email,
            name: body.name,
            role: newUser.role,
            provider: 'local'
          },
          accessToken: 'mock-jwt-token'
        }
      };
    } else if (cleanPath === '/auth/me' && method === 'get') {
      responseData = {
        success: true,
        data: {
          id: db.users[0].id,
          email: db.users[0].email,
          name: `${db.users[0].firstName} ${db.users[0].lastName}`,
          role: db.users[0].role,
          provider: 'local'
        }
      };
    } else if (cleanPath === '/auth/logout' && method === 'post') {
      responseData = { success: true, message: 'Logged out successfully' };
    } else if (cleanPath === '/auth/refresh' && method === 'post') {
      responseData = {
        success: true,
        data: { accessToken: 'mock-jwt-token' }
      };
    }
    // ------------------------------------------------------------
    // 3. PRODUCTS MOCK
    // ------------------------------------------------------------
    else if (cleanPath === '/products' && method === 'get') {
      let filtered = [...db.products];

      // Category filter
      if (queryParams.category) {
        filtered = filtered.filter(p => {
          const categorySlug = queryParams.category;
          const matchCat = db.categories.find(c => c.slug === categorySlug || c.id === categorySlug);
          return matchCat ? p.categoryId === matchCat.id : false;
        });
      }

      // Search filter
      if (queryParams.search) {
        const query = queryParams.search.toLowerCase();
        filtered = filtered.filter(p => 
          p.name_tr.toLowerCase().includes(query) ||
          p.name_ru.toLowerCase().includes(query) ||
          p.name_ky.toLowerCase().includes(query) ||
          p.description_tr.toLowerCase().includes(query)
        );
      }

      // Price filter
      if (queryParams.minPrice) {
        filtered = filtered.filter(p => (p.discountPrice || p.price) >= parseFloat(queryParams.minPrice));
      }
      if (queryParams.maxPrice) {
        filtered = filtered.filter(p => (p.discountPrice || p.price) <= parseFloat(queryParams.maxPrice));
      }

      // In Stock filter
      if (queryParams.onlyInStock === 'true' || queryParams.onlyInStock === true) {
        filtered = filtered.filter(p => p.stockQty > 0);
      }

      // Sorting
      if (queryParams.sortBy) {
        if (queryParams.sortBy === 'price-asc') {
          filtered.sort((a, b) => (a.discountPrice || a.price) - (b.discountPrice || b.price));
        } else if (queryParams.sortBy === 'price-desc') {
          filtered.sort((a, b) => (b.discountPrice || b.price) - (a.discountPrice || a.price));
        } else if (queryParams.sortBy === 'rating') {
          filtered.sort((a, b) => b.averageRating - a.averageRating);
        }
      }

      // Inject categories list mapping for each product
      const mapped = filtered.map(p => {
        const cat = db.categories.find(c => c.id === p.categoryId);
        return {
          ...p,
          categories: cat ? [cat] : []
        };
      });

      responseData = { success: true, data: mapped };
    } else if (cleanPath === '/products/bulk/price' && method === 'patch') {
      const { categoryIds, type, action, value } = body;
      let count = 0;
      db.products = db.products.map(p => {
        if (!categoryIds || categoryIds.includes(p.categoryId)) {
          count++;
          const factor = action === 'increase' ? 1 : -1;
          const change = type === 'percentage' ? (p.price * (value / 100)) : value;
          p.price = Math.max(0, p.price + (factor * change));
          if (p.discountPrice) {
            const discChange = type === 'percentage' ? (p.discountPrice * (value / 100)) : value;
            p.discountPrice = Math.max(0, p.discountPrice + (factor * discChange));
          }
        }
        return p;
      });
      saveDb(db);
      responseData = { success: true, count };
    } else if (cleanPath.startsWith('/products/slug/') && method === 'get') {
      const slug = cleanPath.split('/').pop();
      const product = db.products.find(p => p.slug === slug);
      if (product) {
        const cat = db.categories.find(c => c.id === product.categoryId);
        responseData = {
          success: true,
          data: {
            ...product,
            categories: cat ? [cat] : []
          }
        };
      } else {
        status = 404;
        responseData = { success: false, message: 'Product not found' };
      }
    } else if (cleanPath.startsWith('/products/') && method === 'patch') {
      const id = cleanPath.split('/').pop();
      const idx = db.products.findIndex(p => p.id === id);
      if (idx > -1) {
        db.products[idx] = { ...db.products[idx], ...body };
        saveDb(db);
        responseData = { success: true, data: db.products[idx] };
      } else {
        status = 404;
        responseData = { success: false, message: 'Product not found' };
      }
    } else if (cleanPath === '/products' && method === 'post') {
      const newProduct = {
        ...body,
        id: `prod-${Date.now()}`,
        slug: body.name_tr.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
        price: parseFloat(body.price) || 0,
        discountPrice: body.discountPrice ? parseFloat(body.discountPrice) : null,
        stockQty: parseInt(body.stockQty) || 0,
        averageRating: 0,
        reviewCount: 0
      };
      db.products.push(newProduct);
      saveDb(db);
      responseData = { success: true, data: newProduct };
    } else if (cleanPath.startsWith('/products/') && method === 'delete') {
      const id = cleanPath.split('/').pop();
      db.products = db.products.filter(p => p.id !== id);
      saveDb(db);
      responseData = { success: true };
    }
    // ------------------------------------------------------------
    // 4. CATEGORIES MOCK
    // ------------------------------------------------------------
    else if (cleanPath === '/categories' && method === 'get') {
      responseData = { success: true, data: db.categories };
    } else if (cleanPath.startsWith('/categories/slug/') && method === 'get') {
      const slug = cleanPath.split('/').pop();
      const category = db.categories.find(c => c.slug === slug);
      if (category) {
        // Embed child products count
        const prods = db.products.filter(p => p.categoryId === category.id);
        responseData = {
          success: true,
          data: {
            ...category,
            products: prods
          }
        };
      } else {
        status = 404;
        responseData = { success: false, message: 'Category not found' };
      }
    } else if (cleanPath.startsWith('/categories/') && method === 'patch') {
      const id = cleanPath.split('/').pop();
      const idx = db.categories.findIndex(c => c.id === id);
      if (idx > -1) {
        db.categories[idx] = { ...db.categories[idx], ...body };
        saveDb(db);
        responseData = { success: true, data: db.categories[idx] };
      } else {
        status = 404;
        responseData = { success: false, message: 'Category not found' };
      }
    } else if (cleanPath === '/categories' && method === 'post') {
      const newCat = {
        ...body,
        id: `cat-${Date.now()}`,
        slug: body.name_tr.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
        showInHeader: body.showInHeader || false,
        order: parseInt(body.order) || 0
      };
      db.categories.push(newCat);
      saveDb(db);
      responseData = { success: true, data: newCat };
    } else if (cleanPath.startsWith('/categories/') && method === 'delete') {
      const id = cleanPath.split('/').pop();
      db.categories = db.categories.filter(c => c.id !== id);
      saveDb(db);
      responseData = { success: true };
    }
    // ------------------------------------------------------------
    // 5. SLIDERS MOCK
    // ------------------------------------------------------------
    else if (cleanPath === '/homepage-design/slider' && method === 'get') {
      responseData = { success: true, data: db.sliders };
    } else if (cleanPath.startsWith('/homepage-design/slider/') && method === 'patch') {
      const id = cleanPath.split('/').pop();
      const idx = db.sliders.findIndex(s => s.id === id);
      if (idx > -1) {
        db.sliders[idx] = { ...db.sliders[idx], ...body };
        saveDb(db);
        responseData = { success: true, data: db.sliders[idx] };
      } else {
        status = 404;
      }
    } else if (cleanPath === '/homepage-design/slider' && method === 'post') {
      const newSlider = {
        ...body,
        id: `slide-${Date.now()}`,
        isActive: body.isActive ?? true
      };
      db.sliders.push(newSlider);
      saveDb(db);
      responseData = { success: true, data: newSlider };
    } else if (cleanPath.startsWith('/homepage-design/slider/') && method === 'delete') {
      const id = cleanPath.split('/').pop();
      db.sliders = db.sliders.filter(s => s.id !== id);
      saveDb(db);
      responseData = { success: true };
    }
    // ------------------------------------------------------------
    // 6. BLOG POSTS MOCK
    // ------------------------------------------------------------
    else if (cleanPath === '/blog' && method === 'get') {
      responseData = { success: true, data: db.blogPosts };
    } else if (cleanPath.startsWith('/blog/slug/') && method === 'get') {
      const slug = cleanPath.split('/').pop();
      const post = db.blogPosts.find(b => b.slug === slug);
      if (post) {
        responseData = { success: true, data: post };
      } else {
        status = 404;
      }
    } else if (cleanPath.startsWith('/blog/') && method === 'patch') {
      const id = cleanPath.split('/').pop();
      const idx = db.blogPosts.findIndex(b => b.id === id);
      if (idx > -1) {
        db.blogPosts[idx] = { ...db.blogPosts[idx], ...body };
        saveDb(db);
        responseData = { success: true, data: db.blogPosts[idx] };
      } else {
        status = 404;
      }
    } else if (cleanPath === '/blog' && method === 'post') {
      const newPost = {
        ...body,
        id: `blog-${Date.now()}`,
        slug: body.title_tr.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
        publishedAt: new Date().toISOString(),
        createdAt: new Date().toISOString(),
        isPublished: body.isPublished ?? true
      };
      db.blogPosts.push(newPost);
      saveDb(db);
      responseData = { success: true, data: newPost };
    } else if (cleanPath.startsWith('/blog/') && method === 'delete') {
      const id = cleanPath.split('/').pop();
      db.blogPosts = db.blogPosts.filter(b => b.id !== id);
      saveDb(db);
      responseData = { success: true };
    }
    // ------------------------------------------------------------
    // 7. ORDERS MOCK
    // ------------------------------------------------------------
    else if (cleanPath === '/orders' && method === 'get') {
      responseData = { success: true, data: db.orders };
    } else if (cleanPath.startsWith('/orders/user/') && method === 'get') {
      const userId = cleanPath.split('/').pop();
      const userOrders = db.orders.filter(o => o.userId === userId);
      responseData = { success: true, data: userOrders };
    } else if (cleanPath === '/orders' && method === 'post') {
      const newOrder = {
        id: `ord-${Date.now()}`,
        status: 'PENDING_APPROVAL',
        totalAmount: parseFloat(body.totalAmount) || 0,
        address: body.address || 'Demonstrative Address',
        phone: body.phone || '',
        receiptPath: body.receiptPath || '',
        adminNote: '',
        couponCode: body.couponCode || null,
        discountAmount: parseFloat(body.discountAmount) || 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        userId: db.users[0].id,
        user: { name: `${db.users[0].firstName} ${db.users[0].lastName}`, email: db.users[0].email },
        // Parse items
        orderItems: typeof body.items === 'string' ? JSON.parse(body.items) : (body.items || [])
      };
      db.orders.push(newOrder);
      // Empty mock cart on checkout success
      db.cart = [];
      saveDb(db);
      responseData = { success: true, data: newOrder };
    } else if (cleanPath.startsWith('/orders/') && method === 'patch') {
      const id = cleanPath.split('/').pop();
      const idx = db.orders.findIndex(o => o.id === id);
      if (idx > -1) {
        db.orders[idx] = { 
          ...db.orders[idx], 
          status: body.status || db.orders[idx].status,
          adminNote: body.adminNote !== undefined ? body.adminNote : db.orders[idx].adminNote,
          updatedAt: new Date().toISOString()
        };
        saveDb(db);
        responseData = { success: true, data: db.orders[idx] };
      } else {
        status = 404;
      }
    }
    // ------------------------------------------------------------
    // 8. COUPONS & DISCOUNTS MOCK
    // ------------------------------------------------------------
    else if (cleanPath === '/coupons/validate' && method === 'post') {
      const coupon = db.coupons.find(c => c.code.toUpperCase() === body.code.toUpperCase() && c.isActive);
      if (coupon) {
        const orderTotal = parseFloat(body.orderTotal) || 0;
        let discount = 0;
        if (coupon.type === 'percentage') {
          discount = orderTotal * (coupon.value / 100);
        } else {
          discount = coupon.value;
        }
        responseData = {
          success: true,
          data: {
            valid: true,
            code: coupon.code,
            type: coupon.type,
            value: coupon.value,
            discountAmount: discount
          }
        };
      } else {
        responseData = {
          success: true,
          data: { valid: false, message: 'Invalid or inactive coupon' }
        };
      }
    } else if (cleanPath === '/coupons' && method === 'get') {
      responseData = { success: true, data: db.coupons };
    } else if (cleanPath === '/coupons' && method === 'post') {
      const newCoupon = {
        ...body,
        id: `coup-${Date.now()}`,
        value: parseFloat(body.value) || 0,
        isActive: body.isActive ?? true
      };
      db.coupons.push(newCoupon);
      saveDb(db);
      responseData = { success: true, data: newCoupon };
    } else if (cleanPath.startsWith('/coupons/') && method === 'patch') {
      const id = cleanPath.split('/').pop();
      const idx = db.coupons.findIndex(c => c.id === id);
      if (idx > -1) {
        db.coupons[idx] = { ...db.coupons[idx], ...body };
        saveDb(db);
        responseData = { success: true, data: db.coupons[idx] };
      } else {
        status = 404;
      }
    } else if (cleanPath.startsWith('/coupons/') && method === 'delete') {
      const id = cleanPath.split('/').pop();
      db.coupons = db.coupons.filter(c => c.id !== id);
      saveDb(db);
      responseData = { success: true };
    } else if (cleanPath === '/discounts' && method === 'get') {
      responseData = { success: true, data: db.discounts };
    } else if (cleanPath === '/discounts' && method === 'post') {
      const newDisc = {
        ...body,
        id: `disc-${Date.now()}`,
        value: parseFloat(body.value) || 0,
        isActive: body.isActive ?? true
      };
      db.discounts.push(newDisc);
      saveDb(db);
      responseData = { success: true, data: newDisc };
    } else if (cleanPath.startsWith('/discounts/') && method === 'patch') {
      const id = cleanPath.split('/').pop();
      const idx = db.discounts.findIndex(d => d.id === id);
      if (idx > -1) {
        db.discounts[idx] = { ...db.discounts[idx], ...body };
        saveDb(db);
        responseData = { success: true, data: db.discounts[idx] };
      } else {
        status = 404;
      }
    } else if (cleanPath.startsWith('/discounts/') && method === 'delete') {
      const id = cleanPath.split('/').pop();
      db.discounts = db.discounts.filter(d => d.id !== id);
      saveDb(db);
      responseData = { success: true };
    }
    // ------------------------------------------------------------
    // 9. REVIEWS & QUESTIONS MOCK
    // ------------------------------------------------------------
    else if ((cleanPath === '/reviews' || cleanPath === '/reviews/admin') && method === 'get') {
      let filtered = [...db.reviews];
      if (queryParams.productId) {
        filtered = filtered.filter(r => r.productId === queryParams.productId);
      }
      if (queryParams.isApproved !== undefined) {
        const approved = queryParams.isApproved === 'true' || queryParams.isApproved === true;
        filtered = filtered.filter(r => r.isApproved === approved);
      }
      responseData = { success: true, data: filtered };
    } else if (cleanPath === '/reviews' && method === 'post') {
      const newRev = {
        id: `rev-${Date.now()}`,
        productId: body.productId,
        userId: body.userId || db.users[0].id,
        userName: db.users.find(u => u.id === body.userId)?.firstName || 'Misafir',
        rating: parseInt(body.rating) || 5,
        comment: body.comment,
        isApproved: false,
        createdAt: new Date().toISOString()
      };
      db.reviews.push(newRev);
      saveDb(db);
      responseData = { success: true, data: newRev };
    } else if (cleanPath.startsWith('/reviews/') && cleanPath.endsWith('/approve') && method === 'patch') {
      const id = cleanPath.split('/')[2];
      const idx = db.reviews.findIndex(r => r.id === id);
      if (idx > -1) {
        db.reviews[idx].isApproved = true;
        saveDb(db);
        responseData = { success: true, data: db.reviews[idx] };
      } else {
        status = 404;
      }
    } else if (cleanPath.startsWith('/reviews/') && method === 'patch') {
      const id = cleanPath.split('/').pop();
      const idx = db.reviews.findIndex(r => r.id === id);
      if (idx > -1) {
        db.reviews[idx] = { ...db.reviews[idx], ...body };
        saveDb(db);
        responseData = { success: true, data: db.reviews[idx] };
      } else {
        status = 404;
      }
    } else if (cleanPath.startsWith('/reviews/') && method === 'delete') {
      const id = cleanPath.split('/').pop();
      db.reviews = db.reviews.filter(r => r.id !== id);
      saveDb(db);
      responseData = { success: true };
    } else if ((cleanPath === '/questions' || cleanPath === '/questions/admin') && method === 'get') {
      let filtered = [...db.questions];
      if (queryParams.productId) {
        filtered = filtered.filter(q => q.productId === queryParams.productId);
      }
      responseData = { success: true, data: filtered };
    } else if (cleanPath === '/questions' && method === 'post') {
      const newQ = {
        id: `q-${Date.now()}`,
        productId: body.productId,
        userId: body.userId || db.users[0].id,
        userName: db.users.find(u => u.id === body.userId)?.firstName || 'Misafir',
        question: body.question,
        answer: null,
        createdAt: new Date().toISOString()
      };
      db.questions.push(newQ);
      saveDb(db);
      responseData = { success: true, data: newQ };
    } else if (cleanPath.startsWith('/questions/') && method === 'patch') {
      const id = cleanPath.split('/').pop();
      const idx = db.questions.findIndex(q => q.id === id);
      if (idx > -1) {
        db.questions[idx] = { ...db.questions[idx], ...body };
        saveDb(db);
        responseData = { success: true, data: db.questions[idx] };
      } else {
        status = 404;
      }
    } else if (cleanPath.startsWith('/questions/') && method === 'delete') {
      const id = cleanPath.split('/').pop();
      db.questions = db.questions.filter(q => q.id !== id);
      saveDb(db);
      responseData = { success: true };
    }
    // ------------------------------------------------------------
    // 10. SETTINGS MOCK
    // ------------------------------------------------------------
    else if (cleanPath === '/settings' && method === 'get') {
      responseData = { success: true, data: db.settings };
    } else if (cleanPath === '/settings' && method === 'post') {
      const { key, value } = body;
      const idx = db.settings.findIndex(s => s.key === key);
      if (idx > -1) {
        db.settings[idx].value = value;
      } else {
        db.settings.push({ key, value });
      }
      saveDb(db);
      responseData = { success: true, data: db.settings };
    } else if (cleanPath.startsWith('/settings/') && method === 'patch') {
      const key = cleanPath.split('/').pop();
      const idx = db.settings.findIndex(s => s.key === key);
      if (idx > -1) {
        db.settings[idx].value = body.value;
        saveDb(db);
        responseData = { success: true, data: db.settings[idx] };
      } else {
        status = 404;
      }
    }
    // ------------------------------------------------------------
    // 11. USERS MOCK
    // ------------------------------------------------------------
    else if (cleanPath === '/users' && method === 'get') {
      responseData = { success: true, data: db.users };
    } else if (cleanPath.startsWith('/users/') && method === 'patch') {
      const id = cleanPath.split('/').pop();
      const idx = db.users.findIndex(u => u.id === id);
      if (idx > -1) {
        db.users[idx] = { ...db.users[idx], ...body };
        saveDb(db);
        responseData = { success: true, data: db.users[idx] };
      } else {
        status = 404;
      }
    }
    // ------------------------------------------------------------
    // 12. ACCOUNTING MOCK
    // ------------------------------------------------------------
    else if (cleanPath === '/accounting' && method === 'get') {
      responseData = { success: true, data: db.accounting };
    } else if (cleanPath === '/accounting' && method === 'post') {
      const newAcc = {
        ...body,
        id: `acc-${Date.now()}`,
        amount: parseFloat(body.amount) || 0,
        date: body.date || new Date().toISOString().split('T')[0]
      };
      db.accounting.push(newAcc);
      saveDb(db);
      responseData = { success: true, data: newAcc };
    } else if (cleanPath.startsWith('/accounting/') && method === 'delete') {
      const id = cleanPath.split('/').pop();
      db.accounting = db.accounting.filter(a => a.id !== id);
      saveDb(db);
      responseData = { success: true };
    } else if (cleanPath.startsWith('/accounting/employees/') && method === 'get') {
      // Return details for ledger
      responseData = { success: true, data: [] };
    } else if (cleanPath.startsWith('/accounting/employees/') && method === 'patch') {
      const id = cleanPath.split('/').pop();
      const idx = db.accountingEmployees.findIndex(e => e.id === id);
      if (idx > -1) {
        db.accountingEmployees[idx] = { ...db.accountingEmployees[idx], ...body };
        saveDb(db);
        responseData = { success: true, data: db.accountingEmployees[idx] };
      } else {
        status = 404;
      }
    } else if (cleanPath === '/accounting/employees' && method === 'post') {
      const newEmp = {
        ...body,
        id: `emp-${Date.now()}`,
        salary: parseFloat(body.salary) || 0,
        isActive: true
      };
      db.accountingEmployees.push(newEmp);
      saveDb(db);
      responseData = { success: true, data: newEmp };
    }
    // ------------------------------------------------------------
    // 13. CONTACT MESSAGES MOCK
    // ------------------------------------------------------------
    else if (cleanPath === '/contact' && method === 'get') {
      responseData = { success: true, data: db.contact };
    } else if (cleanPath.startsWith('/contact/') && method === 'delete') {
      const id = cleanPath.split('/').pop();
      db.contact = db.contact.filter(m => m.id !== id);
      saveDb(db);
      responseData = { success: true };
    }
    // ------------------------------------------------------------
    // 14. SPECIAL PAGES MOCK
    // ------------------------------------------------------------
    else if (cleanPath === '/special-pages' && method === 'get') {
      responseData = { success: true, data: db.specialPages };
    } else if (cleanPath === '/special-pages' && method === 'post') {
      const newSp = {
        ...body,
        id: `sp-${Date.now()}`,
        slug: body.title_tr.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
        isActive: body.isActive ?? true
      };
      db.specialPages.push(newSp);
      saveDb(db);
      responseData = { success: true, data: newSp };
    } else if (cleanPath.startsWith('/special-pages/') && method === 'patch') {
      const id = cleanPath.split('/').pop();
      const idx = db.specialPages.findIndex(s => s.id === id);
      if (idx > -1) {
        db.specialPages[idx] = { ...db.specialPages[idx], ...body };
        saveDb(db);
        responseData = { success: true, data: db.specialPages[idx] };
      } else {
        status = 404;
      }
    } else if (cleanPath.startsWith('/special-pages/') && method === 'delete') {
      const id = cleanPath.split('/').pop();
      db.specialPages = db.specialPages.filter(s => s.id !== id);
      saveDb(db);
      responseData = { success: true };
    }
    // ------------------------------------------------------------
    // 15. INVENTORY MOCK
    // ------------------------------------------------------------
    else if (cleanPath === '/inventory' && method === 'get') {
      // Map products to inventory structure
      const inventory = db.products.map(p => ({
        id: p.id,
        productId: p.id,
        product: p,
        stockCode: p.stockCode,
        qty: p.stockQty,
        updatedAt: new Date().toISOString()
      }));
      responseData = { success: true, data: inventory };
    } else if (cleanPath.startsWith('/inventory/') && method === 'patch') {
      const id = cleanPath.split('/').pop();
      const idx = db.products.findIndex(p => p.id === id);
      if (idx > -1) {
        if (body.qty !== undefined) {
          db.products[idx].stockQty = parseInt(body.qty) || 0;
        }
        if (body.stockCode !== undefined) {
          db.products[idx].stockCode = body.stockCode;
        }
        saveDb(db);
        responseData = {
          success: true,
          data: {
            id,
            productId: id,
            product: db.products[idx],
            stockCode: db.products[idx].stockCode,
            qty: db.products[idx].stockQty,
            updatedAt: new Date().toISOString()
          }
        };
      } else {
        status = 404;
      }
    }
    // ------------------------------------------------------------
    // 16. CART MOCK
    // ------------------------------------------------------------
    else if (cleanPath === '/cart' && method === 'get') {
      responseData = { success: true, data: db.cart || [] };
    } else if (cleanPath === '/cart' && method === 'post') {
      const prod = db.products.find(p => p.id === body.productId);
      if (prod) {
        const existing = db.cart.find(c => c.productId === body.productId);
        if (existing) {
          existing.quantity += (body.quantity || 1);
        } else {
          db.cart.push({
            id: `ci-${Date.now()}`,
            productId: body.productId,
            quantity: body.quantity || 1,
            product: prod
          });
        }
        saveDb(db);
      }
      responseData = { success: true, data: db.cart };
    } else if (cleanPath.startsWith('/cart/') && method === 'patch') {
      const pId = cleanPath.split('/').pop();
      const item = db.cart.find(c => c.productId === pId);
      if (item) {
        item.quantity = body.quantity || 1;
        saveDb(db);
      }
      responseData = { success: true, data: db.cart };
    } else if (cleanPath.startsWith('/cart/') && method === 'delete') {
      const pId = cleanPath.split('/').pop();
      db.cart = db.cart.filter(c => c.productId !== pId);
      saveDb(db);
      responseData = { success: true, data: db.cart };
    } else if (cleanPath === '/cart' && method === 'delete') {
      db.cart = [];
      saveDb(db);
      responseData = { success: true, data: [] };
    } else if (cleanPath === '/cart/sync' && method === 'post') {
      // Sync local cart items
      const items = body.items || [];
      db.cart = items.map((it: any) => {
        const p = db.products.find(prod => prod.id === it.productId);
        return {
          id: `ci-${Date.now()}-${Math.random()}`,
          productId: it.productId,
          quantity: it.quantity,
          product: p
        };
      }).filter((it: any) => it.product);
      saveDb(db);
      responseData = { success: true, data: db.cart };
    }
    // ------------------------------------------------------------
    // 17. FAVORITES MOCK
    // ------------------------------------------------------------
    else if (cleanPath === '/favorites' && method === 'get') {
      const favs = db.favorites.map(f => {
        const p = db.products.find(prod => prod.id === f.productId);
        return {
          id: f.id,
          productId: f.productId,
          product: p
        };
      }).filter(f => f.product);
      responseData = { success: true, data: favs };
    } else if (cleanPath.startsWith('/favorites/') && method === 'post') {
      const pId = cleanPath.split('/').pop();
      if (!db.favorites.some(f => f.productId === pId)) {
        db.favorites.push({ id: `fav-${Date.now()}`, productId: pId });
        saveDb(db);
      }
      responseData = { success: true };
    } else if (cleanPath.startsWith('/favorites/') && method === 'delete') {
      const pId = cleanPath.split('/').pop();
      db.favorites = db.favorites.filter(f => f.productId !== pId);
      saveDb(db);
      responseData = { success: true };
    }
    // ------------------------------------------------------------
    // 18. DASHBOARD STATISTICS MOCK
    // ------------------------------------------------------------
    else if (cleanPath === '/dashboard/stats' && method === 'get') {
      const totalSales = db.orders
        .filter(o => o.status === 'COMPLETED' || o.status === 'APPROVED')
        .reduce((sum, o) => sum + o.totalAmount, 0);
      const pendingOrders = db.orders.filter(o => o.status === 'PENDING_APPROVAL').length;
      const totalOrders = db.orders.length;
      const totalProducts = db.products.length;
      const totalCustomers = db.users.filter(u => u.role === 'customer').length;
      
      const monthlyAnalytics = [
        { name: 'Oca', Gelir: 85000, Gider: 50000 },
        { name: 'Şub', Gelir: 95000, Gider: 60000 },
        { name: 'Mar', Gelir: 110000, Gider: 75000 },
        { name: 'Nis', Gelir: 130000, Gider: 80000 },
        { name: 'May', Gelir: 165000, Gider: 95000 },
        { name: 'Haz', Gelir: totalSales + 49000, Gider: 115000 }
      ];

      responseData = {
        success: true,
        data: {
          totalSales,
          totalOrders,
          pendingOrders,
          totalProducts,
          totalCustomers,
          monthlyAnalytics
        }
      };
    }
    // ------------------------------------------------------------
    // 19. FALLBACK MOCK (NOT FOUND OR OTHER REQUESTS)
    // ------------------------------------------------------------
    else {
      console.warn(`Mock API fallthrough: ${method.toUpperCase()} ${cleanPath}`);
      responseData = { success: true, data: [] };
    }

  } catch (err: any) {
    console.error(`Mock Adapter Error for ${cleanPath}:`, err);
    status = 500;
    responseData = { success: false, message: err.message || 'Internal Mock Server Error' };
  }

  return {
    data: responseData,
    status,
    statusText: status === 200 ? 'OK' : 'Error',
    headers: {},
    config,
    request: {}
  } as AxiosResponse;
};

// ================================================================
// AXIOS CLIENT INITIALIZATION WITH MOCK ADAPTER
// ================================================================

const authApiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
  adapter: mockAxiosAdapter
});

// Rest of interceptors are simplified since mock adapter already resolves successfully
authApiClient.interceptors.request.use(
  (config) => {
    const token = typeof window !== 'undefined' ? localStorage.getItem(ACCESS_TOKEN_KEY) : null;
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// We keep interfaces for compatibility
export const register = async (data: RegisterData): Promise<AuthResponse> => {
  const response = await authApiClient.post<ApiResponse<AuthResponse>>('/auth/register', data);
  const { accessToken, user } = response.data.data;
  if (typeof window !== 'undefined') {
    localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
  }
  return { user, accessToken };
};

export const login = async (data: LoginData): Promise<AuthResponse> => {
  const response = await authApiClient.post<ApiResponse<AuthResponse>>('/auth/login', data);
  const { accessToken, user } = response.data.data;
  if (typeof window !== 'undefined') {
    localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
  }
  return { user, accessToken };
};

export const getCurrentUser = async (): Promise<AuthUser> => {
  const response = await authApiClient.get<ApiResponse<AuthUser>>('/auth/me');
  return response.data.data;
};

export const logout = async (): Promise<void> => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(ACCESS_TOKEN_KEY);
  }
};

export const loginWithGoogle = (): void => {
  if (typeof window !== 'undefined') {
    window.location.href = '/';
  }
};

export const loginWithApple = (): void => {
  if (typeof window !== 'undefined') {
    window.location.href = '/';
  }
};

export const getAccessToken = (): string | null => {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(ACCESS_TOKEN_KEY);
};

export { authApiClient };
