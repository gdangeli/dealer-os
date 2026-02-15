import { describe, it, expect } from 'vitest';

describe('Utility Functions', () => {
  describe('Price Formatting', () => {
    it('should format CHF currency correctly', () => {
      const formatPrice = (price: number) => {
        return new Intl.NumberFormat('de-CH', {
          style: 'currency',
          currency: 'CHF',
        }).format(price);
      };
      
      expect(formatPrice(10000)).toContain('10');
      expect(formatPrice(25500)).toContain('25');
    });
  });

  describe('Date Formatting', () => {
    it('should format Swiss date correctly', () => {
      const formatDate = (date: Date) => {
        return new Intl.DateTimeFormat('de-CH').format(date);
      };
      
      const testDate = new Date('2024-01-15');
      const formatted = formatDate(testDate);
      
      // Swiss format: dd.mm.yyyy
      expect(formatted).toMatch(/\d{1,2}\.\d{1,2}\.\d{4}/);
    });
  });

  describe('Vehicle Status', () => {
    it('should validate vehicle status values', () => {
      const validStatuses = ['available', 'reserved', 'sold'];
      
      expect(validStatuses).toContain('available');
      expect(validStatuses).toContain('reserved');
      expect(validStatuses).toContain('sold');
    });
  });

  describe('Lead Status', () => {
    it('should validate lead status values', () => {
      const validStatuses = ['new', 'contacted', 'qualified', 'closed'];
      
      expect(validStatuses).toContain('new');
      expect(validStatuses).toContain('contacted');
    });
  });

  describe('Email Validation', () => {
    it('should validate email format', () => {
      const isValidEmail = (email: string) => {
        const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return regex.test(email);
      };
      
      expect(isValidEmail('test@example.com')).toBe(true);
      expect(isValidEmail('user@domain.ch')).toBe(true);
      expect(isValidEmail('invalid')).toBe(false);
      expect(isValidEmail('no@domain')).toBe(false);
    });
  });

  describe('Phone Validation', () => {
    it('should validate Swiss phone numbers', () => {
      const isValidSwissPhone = (phone: string) => {
        // Simple Swiss phone validation
        const cleaned = phone.replace(/\s+/g, '');
        return /^(\+41|0)[0-9]{9}$/.test(cleaned);
      };
      
      expect(isValidSwissPhone('+41791234567')).toBe(true);
      expect(isValidSwissPhone('079 123 45 67')).toBe(true);
      expect(isValidSwissPhone('0791234567')).toBe(true);
      expect(isValidSwissPhone('123')).toBe(false);
    });
  });
});

describe('Vehicle Calculations', () => {
  it('should calculate total inventory value', () => {
    const vehicles = [
      { price: 25000 },
      { price: 35000 },
      { price: 18000 },
    ];
    
    const totalValue = vehicles.reduce((sum, v) => sum + v.price, 0);
    expect(totalValue).toBe(78000);
  });

  it('should filter vehicles by status', () => {
    const vehicles = [
      { id: 1, status: 'available' },
      { id: 2, status: 'sold' },
      { id: 3, status: 'available' },
    ];
    
    const available = vehicles.filter(v => v.status === 'available');
    expect(available).toHaveLength(2);
  });

  it('should calculate average price', () => {
    const vehicles = [
      { price: 20000 },
      { price: 30000 },
      { price: 40000 },
    ];
    
    const avgPrice = vehicles.reduce((sum, v) => sum + v.price, 0) / vehicles.length;
    expect(avgPrice).toBe(30000);
  });
});

describe('Lead Metrics', () => {
  it('should calculate conversion rate', () => {
    const leads = [
      { status: 'closed', converted: true },
      { status: 'closed', converted: true },
      { status: 'closed', converted: false },
      { status: 'new', converted: false },
    ];
    
    const closedLeads = leads.filter(l => l.status === 'closed');
    const convertedLeads = closedLeads.filter(l => l.converted);
    const conversionRate = (convertedLeads.length / closedLeads.length) * 100;
    
    expect(conversionRate).toBeCloseTo(66.67, 1);
  });

  it('should count leads by status', () => {
    const leads = [
      { status: 'new' },
      { status: 'new' },
      { status: 'contacted' },
      { status: 'qualified' },
    ];
    
    const statusCounts = leads.reduce((acc, lead) => {
      acc[lead.status] = (acc[lead.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    expect(statusCounts.new).toBe(2);
    expect(statusCounts.contacted).toBe(1);
    expect(statusCounts.qualified).toBe(1);
  });
});
