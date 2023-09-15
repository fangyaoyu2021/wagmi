import { rest } from 'msw'
import { setupServer } from 'msw/node'
import { afterAll, afterEach, beforeAll, expect, test } from 'vitest'

import { depositAbi } from '../../test/constants.js'
import { sourcify } from './sourcify.js'

export const baseUrl = 'https://repo.sourcify.dev/contracts/full_match'
export const address = '0x00000000219ab540356cbb839cbe05303d7705fa'
export const chainId = 1
export const multichainAddress = '0xC4c622862a8F548997699bE24EA4bc504e5cA865'
export const multichainIdGnosis = 100
export const multichainIdPolygon = 137
export const successJson = {
  compiler: { version: '0.6.11+commit.5ef660b1' },
  language: 'Solidity',
  output: {
    abi: depositAbi,
    devdoc: {},
    userdoc: {},
  },
  settings: {},
  sources: {},
  version: 1,
}

export const handlers = [
  rest.get(
    `${baseUrl}/${chainId}/${address}/metadata.json`,
    async (_req, res, ctx) => {
      return res(ctx.status(200), ctx.json(successJson))
    },
  ),
  rest.get(
    `${baseUrl}/${multichainIdGnosis}/${address}/metadata.json`,
    async (_req, res, ctx) => {
      return res(ctx.status(404))
    },
  ),
  rest.get(
    `${baseUrl}/${multichainIdGnosis}/${multichainAddress}/metadata.json`,
    async (_req, res, ctx) => {
      return res(ctx.status(200), ctx.json(successJson))
    },
  ),
  rest.get(
    `${baseUrl}/${multichainIdPolygon}/${multichainAddress}/metadata.json`,
    async (_req, res, ctx) => {
      return res(ctx.status(200), ctx.json(successJson))
    },
  ),
]

const server = setupServer(...handlers)

beforeAll(() => server.listen())
afterEach(() => server.resetHandlers())
afterAll(() => server.close())

test('fetches ABI', async () => {
  await expect(
    sourcify({
      chainId: chainId,
      contracts: [{ name: 'DepositContract', address }],
    }).contracts(),
  ).resolves.toMatchSnapshot()
})

test('fetches ABI with multichain deployment', async () => {
  await expect(
    sourcify({
      chainId: 100,
      contracts: [
        {
          name: 'Community',
          address: { 100: multichainAddress, 137: multichainAddress },
        },
      ],
    }).contracts(),
  ).resolves.toMatchSnapshot()
})

test('fails to fetch for unverified contract', async () => {
  await expect(
    sourcify({
      chainId: 100,
      contracts: [{ name: 'DepositContract', address }],
    }).contracts(),
  ).rejects.toThrowErrorMatchingInlineSnapshot(
    '"Contract not found in Sourcify repository."',
  )
})

test('missing address for chainId', async () => {
  await expect(
    sourcify({
      chainId: 1,
      // @ts-expect-error `chainId` and `keyof typeof contracts[number].address` mismatch
      contracts: [{ name: 'DepositContract', address: { 10: address } }],
    }).contracts(),
  ).rejects.toThrowErrorMatchingInlineSnapshot(
    '"No address found for chainId \\"1\\". Make sure chainId \\"1\\" is set as an address."',
  )
})