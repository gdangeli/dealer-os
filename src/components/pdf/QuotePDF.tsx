import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';
import { Quote, QuoteItem, Customer, formatCHF, getCustomerDisplayName, toCHF } from '@/types/billing';

// Register fonts (optional - uses default sans-serif)
// Font.register({ family: 'Helvetica', src: '...' });

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
  notesSection: {
    marginTop: 30,
    padding: 12,
    backgroundColor: '#fefce8',
    borderRadius: 4,
  },
  notesTitle: {
    fontWeight: 'bold',
    marginBottom: 4,
  },
  notesText: {
    color: '#555',
    lineHeight: 1.4,
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
  validUntil: {
    marginTop: 10,
    padding: 8,
    backgroundColor: '#eff6ff',
    borderRadius: 4,
    textAlign: 'center',
  },
  metaInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
    fontSize: 9,
    color: '#666',
  },
});

interface QuotePDFProps {
  quote: Quote & { customer: Customer; items: QuoteItem[] };
  companyName?: string;
  companyAddress?: string;
}

export function QuotePDF({ quote, companyName = 'Ihre Garage', companyAddress }: QuotePDFProps) {
  const items = quote.items?.sort((a, b) => a.position - b.position) || [];
  
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Offerte</Text>
          <Text style={styles.subtitle}>{quote.quote_number}</Text>
        </View>

        {/* Meta Info */}
        <View style={styles.metaInfo}>
          <Text>Datum: {new Date(quote.created_at).toLocaleDateString('de-CH')}</Text>
          {quote.valid_until && (
            <Text>Gültig bis: {new Date(quote.valid_until).toLocaleDateString('de-CH')}</Text>
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
                {quote.customer ? getCustomerDisplayName(quote.customer) : 'Kunde'}
              </Text>
              {quote.customer && (
                <View style={styles.customerAddress}>
                  {quote.customer.street && <Text>{quote.customer.street}</Text>}
                  {quote.customer.postal_code && (
                    <Text>{quote.customer.postal_code} {quote.customer.city}</Text>
                  )}
                  {quote.customer.email && <Text>{quote.customer.email}</Text>}
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
            <Text style={styles.totalValue}>CHF {toCHF(quote.subtotal).toLocaleString('de-CH', { minimumFractionDigits: 2 })}</Text>
          </View>
          {quote.discount_amount > 0 && (
            <View style={[styles.totalRow, styles.discountRow]}>
              <Text>Rabatt ({quote.discount_percent}%)</Text>
              <Text style={styles.totalValue}>- CHF {toCHF(quote.discount_amount).toLocaleString('de-CH', { minimumFractionDigits: 2 })}</Text>
            </View>
          )}
          {quote.trade_in_value > 0 && (
            <View style={[styles.totalRow, styles.tradeInRow]}>
              <Text>Eintausch</Text>
              <Text style={styles.totalValue}>- CHF {toCHF(quote.trade_in_value).toLocaleString('de-CH', { minimumFractionDigits: 2 })}</Text>
            </View>
          )}
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>MwSt. ({quote.vat_rate}%)</Text>
            <Text style={styles.totalValue}>CHF {toCHF(quote.vat_amount).toLocaleString('de-CH', { minimumFractionDigits: 2 })}</Text>
          </View>
          <View style={styles.grandTotal}>
            <Text>Total</Text>
            <Text>CHF {toCHF(quote.total).toLocaleString('de-CH', { minimumFractionDigits: 2 })}</Text>
          </View>
        </View>

        {/* Trade-in Description */}
        {quote.trade_in_value > 0 && quote.trade_in_description && (
          <View style={styles.notesSection}>
            <Text style={styles.notesTitle}>Eintausch</Text>
            <Text style={styles.notesText}>{quote.trade_in_description}</Text>
          </View>
        )}

        {/* Customer Notes */}
        {quote.customer_notes && (
          <View style={[styles.notesSection, { backgroundColor: '#f0fdf4' }]}>
            <Text style={styles.notesTitle}>Bemerkungen</Text>
            <Text style={styles.notesText}>{quote.customer_notes}</Text>
          </View>
        )}

        {/* Validity */}
        {quote.valid_until && (
          <View style={styles.validUntil}>
            <Text>Diese Offerte ist gültig bis {new Date(quote.valid_until).toLocaleDateString('de-CH')}</Text>
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
