import {
  ADDRESS_PREFIX_SYMBOL_COUNT,
  ADDRESS_SUFFIX_SYMBOL_COUNT,
} from '../constants/app'

export function toShortAddress(address: string): string {
  const minLength = ADDRESS_PREFIX_SYMBOL_COUNT + ADDRESS_SUFFIX_SYMBOL_COUNT

  if (address.length <= minLength) {
    return address
  }

  const prefix = address.slice(0, ADDRESS_PREFIX_SYMBOL_COUNT)
  const suffix = address.slice(-ADDRESS_SUFFIX_SYMBOL_COUNT)

  return `${prefix}...${suffix}`
}
