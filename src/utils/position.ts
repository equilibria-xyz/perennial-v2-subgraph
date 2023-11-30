import { Address, BigInt } from '@graphprotocol/graph-ts'
import { Market } from '../../generated/templates/Market/Market'
import { OracleProvider } from '../../generated/templates/Market/OracleProvider'
import { PayoffProvider } from '../../generated/templates/Market/PayoffProvider'

export function side(maker: BigInt, long: BigInt, short: BigInt): string {
  if (maker.gt(BigInt.zero())) return 'maker'
  if (long.gt(BigInt.zero())) return 'long'
  if (short.gt(BigInt.zero())) return 'short'
  return 'none'
}

export function magnitude(maker: BigInt, long: BigInt, short: BigInt): BigInt {
  return max(max(maker, long), short)
}

function max(a: BigInt, b: BigInt): BigInt {
  return a.gt(b) ? a : b
}

class OracleVersion {
  price: BigInt
  timestamp: BigInt
  valid: boolean

  constructor(price: BigInt, timestamp: BigInt, valid: boolean) {
    this.price = price
    this.timestamp = timestamp
    this.valid = valid
  }
}

export function price(market: Address, version: BigInt): OracleVersion {
  const marketContract = Market.bind(market)
  const oracleContract = OracleProvider.bind(marketContract.oracle())
  const oracleVersion = oracleContract.at(version)
  let price = oracleVersion.price
  const payoffAddress = marketContract.payoff()
  if (!payoffAddress.equals(Address.zero())) {
    price = PayoffProvider.bind(payoffAddress).payoff(price)
  }

  return new OracleVersion(price, oracleVersion.timestamp, oracleVersion.valid)
}

export function latestPrice(market: Address): BigInt {
  const marketContract = Market.bind(market)
  const oracleContract = OracleProvider.bind(marketContract.oracle())
  const price = oracleContract.latest()
  const payoffAddress = marketContract.payoff()
  if (payoffAddress.equals(Address.zero())) {
    return price.price
  }

  return PayoffProvider.bind(payoffAddress).payoff(price.price)
}
