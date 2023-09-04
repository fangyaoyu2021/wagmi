import {
  type GetEnsNameParameters as viem_GetEnsNameParameters,
  type GetEnsNameReturnType as viem_GetEnsNameReturnType,
  getEnsName as viem_getEnsName,
} from 'viem/actions'

import { type Config } from '../createConfig.js'
import type { ChainIdParameter } from '../types/properties.js'
import type { Evaluate } from '../types/utils.js'

export type GetEnsNameParameters<config extends Config = Config> = Evaluate<
  viem_GetEnsNameParameters & ChainIdParameter<config>
>

export type GetEnsNameReturnType = viem_GetEnsNameReturnType

export type GetEnsNameError = Error

/** https://alpha.wagmi.sh/core/actions/getEnsName */
export function getEnsName<config extends Config>(
  config: config,
  parameters: GetEnsNameParameters<config>,
): Promise<GetEnsNameReturnType> {
  const { chainId } = parameters
  const client = config.getClient({ chainId })
  return viem_getEnsName(client, parameters)
}
