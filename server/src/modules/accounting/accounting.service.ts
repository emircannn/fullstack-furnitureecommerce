import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Transaction } from './entities/transaction.entity';
import { Employee } from './entities/employee.entity';
import { TransactionType } from './enums/transaction-type.enum';
import { TransactionCategory } from './enums/transaction-category.enum';

@Injectable()
export class AccountingService {
  constructor(
    @InjectRepository(Transaction)
    private readonly repository: Repository<Transaction>,
    @InjectRepository(Employee)
    private readonly employeeRepository: Repository<Employee>,
  ) {}

  // ==========================================
  // TRANSACTION METHODS
  // ==========================================

  async findAll(filters?: { startDate?: string; endDate?: string; employeeId?: string }) {
    const queryBuilder = this.repository
      .createQueryBuilder('transaction')
      .leftJoinAndSelect('transaction.employee', 'employee');

    if (filters?.employeeId) {
      queryBuilder.andWhere('transaction.employeeId = :employeeId', { employeeId: filters.employeeId });
    }

    if (filters?.startDate) {
      queryBuilder.andWhere('transaction.date >= :startDate', { startDate: filters.startDate });
    }

    if (filters?.endDate) {
      queryBuilder.andWhere('transaction.date <= :endDate', { endDate: filters.endDate });
    }

    queryBuilder.orderBy('transaction.date', 'DESC').addOrderBy('transaction.createdAt', 'DESC');

    return queryBuilder.getMany();
  }

  async findOne(id: any) {
    const entity = await this.repository.findOne({
      where: { id },
      relations: ['employee'],
    } as any);
    if (!entity) throw new NotFoundException('Kayıt bulunamadı');
    return entity;
  }

  async create(createDto: any) {
    const entity = this.repository.create(createDto as any) as unknown as Transaction;
    const saved: Transaction = await this.repository.save(entity);
    if (saved.category === TransactionCategory.EMPLOYEE_SALARY && saved.employeeId) {
      await this.recalculateEmployeeTotalPaid(saved.employeeId);
    }
    return saved;
  }

  async update(id: any, updateDto: any) {
    const original = await this.findOne(id);
    const oldEmployeeId = original.employeeId;

    await this.repository.update(id, updateDto);
    const updated = await this.findOne(id);

    if (oldEmployeeId) {
      await this.recalculateEmployeeTotalPaid(oldEmployeeId);
    }
    if (updated.employeeId && updated.employeeId !== oldEmployeeId) {
      await this.recalculateEmployeeTotalPaid(updated.employeeId);
    }
    return updated;
  }

  async remove(id: any) {
    const entity = await this.findOne(id);
    const employeeId = entity.employeeId;
    await this.repository.remove(entity);
    if (employeeId) {
      await this.recalculateEmployeeTotalPaid(employeeId);
    }
    return entity;
  }

  // ==========================================
  // EMPLOYEE METHODS
  // ==========================================

  async findAllEmployees() {
    const employees = await this.employeeRepository.find({
      order: { createdAt: 'DESC' },
    });
    return employees.map((emp) => this.calculateEmployeeBalance(emp));
  }

  async findOneEmployee(id: string) {
    const employee = await this.employeeRepository.findOne({
      where: { id },
      relations: ['transactions'],
    });
    if (!employee) throw new NotFoundException('Çalışan bulunamadı');
    return this.calculateEmployeeBalance(employee);
  }

  async createEmployee(dto: any) {
    const entity = this.employeeRepository.create(dto as any) as unknown as Employee;
    const saved: Employee = await this.employeeRepository.save(entity);
    return this.calculateEmployeeBalance(saved);
  }

  async updateEmployee(id: string, dto: any) {
    await this.employeeRepository.update(id, dto);
    return this.findOneEmployee(id);
  }

  async removeEmployee(id: string) {
    const employee = await this.employeeRepository.findOne({ where: { id } });
    if (!employee) throw new NotFoundException('Çalışan bulunamadı');
    await this.employeeRepository.remove(employee);
    return employee;
  }

  // ==========================================
  // UTILITY METHODS
  // ==========================================

  async recalculateEmployeeTotalPaid(employeeId: string) {
    const employee = await this.employeeRepository.findOne({ where: { id: employeeId } });
    if (!employee) return;

    const result = await this.repository
      .createQueryBuilder('transaction')
      .select('SUM(transaction.amount)', 'sum')
      .where('transaction.employeeId = :employeeId', { employeeId })
      .andWhere('transaction.type = :type', { type: TransactionType.EXPENSE })
      .andWhere('transaction.category = :category', { category: TransactionCategory.EMPLOYEE_SALARY })
      .getRawOne();

    employee.totalPaid = parseFloat(result?.sum || '0');
    await this.employeeRepository.save(employee);
  }

  private calculateEmployeeBalance(employee: Employee) {
    const currentDate = new Date();
    const startDate = employee.createdAt || new Date();
    
    // Calculate difference in months
    const yearsDiff = currentDate.getFullYear() - startDate.getFullYear();
    const monthsDiff = currentDate.getMonth() - startDate.getMonth();
    const monthsWorked = Math.max(1, (yearsDiff * 12) + monthsDiff + 1);
    
    const totalDeserved = employee.monthlySalary * monthsWorked;
    const balance = Number(employee.totalPaid) - totalDeserved;

    return {
      ...employee,
      monthsWorked,
      totalDeserved,
      balance,
    };
  }
}
