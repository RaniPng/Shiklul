import { CURRENCY_SYMBOLS } from '../constants/defaults'

export function formatCurrency(amount: number, currency: string = 'USD'): string {
  const symbol = CURRENCY_SYMBOLS[currency] ?? currency
  const formatted = Math.abs(amount).toFixed(2)
  if (amount < 0) {
    return `-${symbol}${formatted}`
  }
  return `${symbol}${formatted}`
}

export function toCents(amount: number): number {
  return Math.round(amount * 100)
}

export function fromCents(cents: number): number {
  return cents / 100
}
