const { config } = require('dotenv')
config()

const { writeFileSync } = require('fs')
const { request } = require('graphql-request')

const live = process.env.DIFF_TEST_LIVE_VERSION_URL
const test = process.env.DIFF_TEST_TEST_VERSION_URL

const entitiesToTest = [
  {
    collection: 'marketAccountPositions',
    fields: [
      'id',
      'market',
      'account',
      'maker',
      'long',
      'short',
      'pendingMaker',
      'pendingLong',
      'pendingShort',
      'collateral',
      'makerInvalidation',
      'longInvalidation',
      'shortInvalidation',
      'netDeposits',
      'accumulatedPnl',
      'accumulatedFunding',
      'accumulatedInterest',
      'accumulatedMakerPositionFee',
      'accumulatedValue',
      'accumulatedReward',
      'accumulatedCollateral',
      'accumulatedPositionFees',
      'accumulatedPriceImpactFees',
      'accumulatedKeeperFees',
      'accumulatedInterfaceFees',
      'accumulatedOrderFees',

      'openSize',
      'openNotional',
      'openPriceImpactFees',
      'closeSize',
      'closeNotional',
      'closePriceImpactFees',
      'weightedFunding',
      'weightedInterest',
      'weightedMakerPositionFees',
      'totalWeight',

      'lastUpdatedVersion',
      'lastUpdatedBlockNumber',
      'lastUpdatedBlockTimestamp',
    ],
    sort: 'lastUpdatedBlockNumber',
  },
  {
    collection: 'marketAccountCheckpoints',
    fields: [
      'id',
      'market',
      'account',
      'version',
      'type',
      'side',
      'startMagnitude',
      'collateral',

      'netDeposits',
      'accumulatedPnl',
      'accumulatedFunding',
      'accumulatedInterest',
      'accumulatedMakerPositionFee',
      'accumulatedValue',
      'accumulatedReward',
      'accumulatedCollateral',
      'accumulatedPositionFees',
      'accumulatedPriceImpactFees',
      'accumulatedKeeperFees',
      'accumulatedInterfaceFees',
      'accumulatedOrderFees',

      'openSize',
      'openNotional',
      'openPriceImpactFees',
      'closeSize',
      'closeNotional',
      'closePriceImpactFees',
      'weightedFunding',
      'weightedInterest',
      'weightedMakerPositionFees',
      'totalWeight',

      'update',
      'blockNumber',
      'blockTimestamp',
      'transactionHash',
    ],
    sort: 'blockNumber',
  },
  {
    collection: 'marketGlobalPositions',
    fields: [
      'id',
      'market',
      'timestamp',
      'maker',
      'long',
      'short',
      'pendingMaker',
      'pendingLong',
      'pendingShort',
      'makerInvalidation',
      'longInvalidation',
      'shortInvalidation',
    ],
    sort: 'timestamp',
  },
]

async function runDiff({ collection, fields, sort }) {
  const query = `
    query ${collection}_Diff {
      ${collection}(first: 1000, orderBy: ${sort}, orderDirection: desc) {
        ${fields.join(',')}
      }
    }
  `

  const liveRes = await request(live, query)
  const testRes = await request(test, query)

  return {
    collection,
    liveRes,
    testRes,
  }
}

for (const entity of entitiesToTest) {
  runDiff(entity).then(({ collection, liveRes, testRes }) => {
    const str = JSON.stringify(liveRes, null, 2)
    const str2 = JSON.stringify(testRes, null, 2)

    writeFileSync(`./test/data/${collection}_live.json`, str)
    writeFileSync(`./test/data/${collection}_test.json`, str2)
    console.log(`${collection}: Checking Equality`, str === str2)
  })
}
