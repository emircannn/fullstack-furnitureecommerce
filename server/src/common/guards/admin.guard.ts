// ============================================================
// Belenay Mobilya - Admin Guard Re-export
// Common katmanından kolayca erişilebilmesi için
// auth modülündeki AdminGuard'ı yeniden export eder.
// Kullanım: import { AdminGuard } from 'common/guards'
// ============================================================

export { AdminGuard } from '../../modules/auth/guards/admin.guard';
