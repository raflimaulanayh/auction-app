import i18n from '../i18n'

export function formatRupiah(value: number, compact = false): string {
  return new Intl.NumberFormat(i18n.language?.startsWith('en') ? 'en-ID' : 'id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: compact ? 1 : 0,
    notation: compact ? 'compact' : 'standard',
  }).format(value)
}

export function parseRupiah(input: string): number {
  return Number(input.replace(/[^\d]/g, '')) || 0
}

export function formatThousands(value: number): string {
  return value ? new Intl.NumberFormat('id-ID').format(value) : ''
}
