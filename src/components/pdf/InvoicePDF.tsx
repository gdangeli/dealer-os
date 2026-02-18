import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';
import { Invoice, InvoiceItem, Customer, getCustomerDisplayName, toCHF } from '@/types/billing';

const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontSize: 10,
    fontFamily: 'Helvetica',
  },
  header: {
    marginBottom: 30,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 12,
    color: '#666',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#333',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    paddingBottom: 4,
  },
  customerBox: {
    backgroundColor: '#f9f9f9',
    padding: 12,
    borderRadius: 4,
  },
  customerName: {
    fontSize: 12,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  customerAddress: {
    color: '#555',
    lineHeight: 1.4,
  },
  table: {
    marginTop: 10,
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#f3f4f6',
    padding: 8,
    fontWeight: 'bold',
    fontSize: 9,
  },
  tableRow: {
    flexDirection: 'row',
    padding: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  colPos: { width: '8%' },
  colDesc: { width: '42%' },
  colQty: { width: '12%', textAlign: 'right' },
  colPrice: { width: '18%', textAlign: 'right' },
  colTotal: { width: '20%', textAlign: 'right' },
  itemTitle: {
    fontWeight: 'bold',
  },
  itemDescription: {
    fontSize: 9,
    color: '#666',
    marginTop: 2,
  },
  totalsBox: {
    marginTop: 20,
    marginLeft: 'auto',
    width: 200,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  totalLabel: {
    color: '#555',
  },
  totalValue: {
    textAlign: 'right',
  },
  grandTotal: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderTopWidth: 2,
    borderTopColor: '#333',
    marginTop: 8,
    fontWeight: 'bold',
    fontSize: 14,
  },
  discountRow: {
    color: '#dc2626',
  },
  tradeInRow: {
    color: '#16a34a',
  },
  paymentBox: {
    marginTop: 20,
    padding: 12,
    backgroundColor: '#eff6ff',
    borderRadius: 4,
  },
  paymentTitle: {
    fontWeight: 'bold',
    marginBottom: 8,
    fontSize: 11,
  },
  paymentRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  dueDate: {
    marginTop: 10,
    padding: 10,
    backgroundColor: '#fef3c7',
    borderRadius: 4,
    textAlign: 'center',
    fontWeight: 'bold',
  },
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 40,
    right: 40,
    textAlign: 'center',
    color: '#999',
    fontSize: 8,
    borderTopWidth: 1,
    borderTopColor: '#eee',
    paddingTop: 10,
  },
  metaInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
    fontSize: 9,
    color: '#666',
  },
  qrPlaceholder: {
    marginTop: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: '#ddd',
    borderStyle: 'dashed',
    textAlign: 'center',
    color: '#999',
  },
});

interface InvoicePDFProps {
  invoice: Invoice & { customer: Customer; items: InvoiceItem[] };
  companyName?: string;
  companyAddress?: string;
  bankInfo?: {
    iban?: string;
    bank?: string;
  };
}

export function InvoicePDF({ 
  invoice, 
  companyName = 'Ihre Garage', 
  companyAddress,
  bankInfo 
}: InvoicePDFProps) {
  const items = invoice.items?.sort((a, b) => a.position - b.position) || [];
  const openAmount = invoice.total - invoice.paid_amount;
  
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Rechnung</Text>
          <Text style={styles.subtitle}>{invoice.invoice_number}</Text>
        </View>

        {/* Meta Info */}
        <View style={styles.metaInfo}>
          <Text>Rechnungsdatum: {new Date(invoice.invoice_date).toLocaleDateString('de-CH')}</Text>
          {invoice.due_date && (
            <Text>Zahlbar bis: {new Date(invoice.due_date).toLocaleDateString('de-CH')}</Text>
          )}
        </View>

        {/* Company and Customer */}
        <View style={styles.row}>
          <View style={{ width: '45%' }}>
            <Text style={styles.sectionTitle}>Von</Text>
            <Text style={styles.customerName}>{companyName}</Text>
            {companyAddress && <Text style={styles.customerAddress}>{companyAddress}</Text>}
          </View>
          <View style={{ width: '45%' }}>
            <Text style={styles.sectionTitle}>An</Text>
            <View style={styles.customerBox}>
              <Text style={styles.customerName}>
                {invoice.customer ? getCustomerDisplayName(invoice.customer) : 'Kunde'}
              </Text>
              {invoice.customer && (
                <View style={styles.customerAddress}>
                  {invoice.customer.street && <Text>{invoice.customer.street}</Text>}
                  {invoice.customer.postal_code && (
                    <Text>{invoice.customer.postal_code} {invoice.customer.city}</Text>
                  )}
                </View>
              )}
            </View>
          </View>
        </View>

        {/* Items Table */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Positionen</Text>
          <View style={styles.table}>
            <View style={styles.tableHeader}>
              <Text style={styles.colPos}>Pos</Text>
              <Text style={styles.colDesc}>Bezeichnung</Text>
              <Text style={styles.colQty}>Menge</Text>
              <Text style={styles.colPrice}>Preis</Text>
              <Text style={styles.colTotal}>Total</Text>
            </View>
            {items.map((item) => (
              <View key={item.id} style={styles.tableRow}>
                <Text style={styles.colPos}>{item.position}</Text>
                <View style={styles.colDesc}>
                  <Text style={styles.itemTitle}>{item.title}</Text>
                  {item.description && (
                    <Text style={styles.itemDescription}>{item.description}</Text>
                  )}
                </View>
                <Text style={styles.colQty}>{item.quantity}</Text>
                <Text style={styles.colPrice}>CHF {toCHF(item.unit_price).toLocaleString('de-CH', { minimumFractionDigits: 2 })}</Text>
                <Text style={styles.colTotal}>CHF {toCHF(item.total).toLocaleString('de-CH', { minimumFractionDigits: 2 })}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Totals */}
        <View style={styles.totalsBox}>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Zwischensumme</Text>
            <Text style={styles.totalValue}>CHF {toCHF(invoice.subtotal).toLocaleString('de-CH', { minimumFractionDigits: 2 })}</Text>
          </View>
          {invoice.discount_amount > 0 && (
            <View style={[styles.totalRow, styles.discountRow]}>
              <Text>Rabatt</Text>
              <Text style={styles.totalValue}>- CHF {toCHF(invoice.discount_amount).toLocaleString('de-CH', { minimumFractionDigits: 2 })}</Text>
            </View>
          )}
          {invoice.trade_in_value > 0 && (
            <View style={[styles.totalRow, styles.tradeInRow]}>
              <Text>Eintausch</Text>
              <Text style={styles.totalValue}>- CHF {toCHF(invoice.trade_in_value).toLocaleString('de-CH', { minimumFractionDigits: 2 })}</Text>
            </View>
          )}
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>MwSt. ({invoice.vat_rate}%)</Text>
            <Text style={styles.totalValue}>CHF {toCHF(invoice.vat_amount).toLocaleString('de-CH', { minimumFractionDigits: 2 })}</Text>
          </View>
          <View style={styles.grandTotal}>
            <Text>Total</Text>
            <Text>CHF {toCHF(invoice.total).toLocaleString('de-CH', { minimumFractionDigits: 2 })}</Text>
          </View>
        </View>

        {/* Payment Info */}
        <View style={styles.paymentBox}>
          <Text style={styles.paymentTitle}>Zahlungsinformationen</Text>
          <View style={styles.paymentRow}>
            <Text>Rechnungsbetrag:</Text>
            <Text>CHF {toCHF(invoice.total).toLocaleString('de-CH', { minimumFractionDigits: 2 })}</Text>
          </View>
          {invoice.paid_amount > 0 && (
            <View style={styles.paymentRow}>
              <Text>Bereits bezahlt:</Text>
              <Text>CHF {toCHF(invoice.paid_amount).toLocaleString('de-CH', { minimumFractionDigits: 2 })}</Text>
            </View>
          )}
          <View style={[styles.paymentRow, { fontWeight: 'bold', marginTop: 4 }]}>
            <Text>Zahlbar:</Text>
            <Text>CHF {toCHF(openAmount).toLocaleString('de-CH', { minimumFractionDigits: 2 })}</Text>
          </View>
          {bankInfo?.iban && (
            <View style={{ marginTop: 8 }}>
              <Text>IBAN: {bankInfo.iban}</Text>
              {bankInfo.bank && <Text>Bank: {bankInfo.bank}</Text>}
            </View>
          )}
        </View>

        {/* Due Date */}
        {invoice.due_date && openAmount > 0 && (
          <View style={styles.dueDate}>
            <Text>Bitte zahlen Sie bis {new Date(invoice.due_date).toLocaleDateString('de-CH')}</Text>
            {invoice.payment_terms && <Text style={{ fontWeight: 'normal', marginTop: 4 }}>{invoice.payment_terms}</Text>}
          </View>
        )}

        {/* Footer */}
        <View style={styles.footer}>
          <Text>{companyName} • Erstellt mit Dealer OS</Text>
        </View>
      </Page>
    </Document>
  );
}
