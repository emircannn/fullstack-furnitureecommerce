import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Order } from '../orders/entities/order.entity';
import { User } from '../users/entities/user.entity';
import { Product } from '../products/entities/product.entity';
import { Transaction } from '../accounting/entities/transaction.entity';
import { OrderStatus } from '../orders/enums/order-status.enum';

@Injectable()
export class DashboardService {
  constructor(
    @InjectRepository(Order)
    private readonly orderRepository: Repository<Order>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
    @InjectRepository(Transaction)
    private readonly transactionRepository: Repository<Transaction>,
  ) {}

  async getStats() {
    // 1. Total Completed Orders Amount
    const completedOrdersResult = await this.orderRepository
      .createQueryBuilder('order')
      .select('SUM(order.totalAmount)', 'total')
      .where('order.status = :status', { status: OrderStatus.COMPLETED })
      .getRawOne();
    const totalSales = parseFloat(completedOrdersResult?.total || '0');

    // 2. Orders Counts
    const totalOrders = await this.orderRepository.count();
    const pendingOrders = await this.orderRepository.count({ where: { status: OrderStatus.PENDING_APPROVAL } });

    // 3. Total Customers
    const totalCustomers = await this.userRepository.count({ where: { role: 'CUSTOMER' } as any });

    // 4. Total Products
    const totalProducts = await this.productRepository.count();

    // 5. Total Accounting Income & Expense
    const incomeResult = await this.transactionRepository
      .createQueryBuilder('tx')
      .select('SUM(tx.amount)', 'total')
      .where("tx.type = 'INCOME'")
      .getRawOne();
    const totalIncome = parseFloat(incomeResult?.total || '0');

    const expenseResult = await this.transactionRepository
      .createQueryBuilder('tx')
      .select('SUM(tx.amount)', 'total')
      .where("tx.type = 'EXPENSE'")
      .getRawOne();
    const totalExpense = parseFloat(expenseResult?.total || '0');

    // 6. Monthly Analytics (last 6 months)
    const monthlyAnalytics = [];
    const now = new Date();
    for (let i = 5; i >= 0; i--) {
      const dateCursor = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const year = dateCursor.getFullYear();
      const month = dateCursor.getMonth() + 1; // 1-indexed

      // Format month name (Turkish)
      const monthNames = [
        "Ocak", "Şubat", "Mart", "Nisan", "Mayıs", "Haziran", 
        "Temmuz", "Ağustos", "Eylül", "Ekim", "Kasım", "Aralık"
      ];
      const label = monthNames[dateCursor.getMonth()];

      const monthStartStr = `${year}-${String(month).padStart(2, '0')}-01`;
      const lastDay = new Date(year, month, 0).getDate();
      const monthEndStr = `${year}-${String(month).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`;

      // Sum income in month
      const mIncomeRes = await this.transactionRepository
        .createQueryBuilder('tx')
        .select('SUM(tx.amount)', 'total')
        .where("tx.type = 'INCOME'")
        .andWhere('tx.date >= :start AND tx.date <= :end', { start: monthStartStr, end: monthEndStr })
        .getRawOne();
      const income = parseFloat(mIncomeRes?.total || '0');

      // Sum expense in month
      const mExpenseRes = await this.transactionRepository
        .createQueryBuilder('tx')
        .select('SUM(tx.amount)', 'total')
        .where("tx.type = 'EXPENSE'")
        .andWhere('tx.date >= :start AND tx.date <= :end', { start: monthStartStr, end: monthEndStr })
        .getRawOne();
      const expense = parseFloat(mExpenseRes?.total || '0');

      monthlyAnalytics.push({
        name: label,
        Gelir: income,
        Gider: expense,
      });
    }

    return {
      totalSales,
      totalOrders,
      pendingOrders,
      totalCustomers,
      totalProducts,
      totalIncome,
      totalExpense,
      netProfit: totalIncome - totalExpense,
      monthlyAnalytics,
    };
  }
}
