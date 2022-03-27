import { format } from 'date-fns'

const DATE_FORMAT = 'd MMM yyyy'
const SHORT_DATE_FORMAT = 'd/M/yyyy'

/**
 * Formats a JSON date string into an abbreviated date string
 * @param {string} date a (ISO8601) JSON date string
 * @returns the formatted date string
 */
export function formatDate(date) {
  return format(new Date(date), DATE_FORMAT)
}

/**
 * Formats a JSON date string into a short date string
 * @param {string} date a (ISO8601) JSON date string
 * @returns the formatted date string
 */
export function formatShortDate(date) {
  return format(new Date(date), SHORT_DATE_FORMAT)
}
