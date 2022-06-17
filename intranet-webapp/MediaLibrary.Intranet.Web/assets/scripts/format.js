import { format } from 'date-fns'

const DATE_FORMAT = 'd MMM yyyy h:mm a'
const SHORT_DATE_FORMAT = 'd/M/yyyy h:mm a'
const SHORT_DATE = 'd/M/yyyy'
const SHORT_TIME = 'h:mm a'

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

export function formatDateOnly(date) {
  return format(new Date(date), SHORT_DATE)
}

export function formatTimeOnly(date) {
  return format(new Date(date), SHORT_TIME)
}
