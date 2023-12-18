import {
  type Abi,
  type Account,
  type Address,
  type Chain,
  type ContractFunctionArgs,
  type ContractFunctionName,
  type SimulateContractParameters as viem_SimulateContractParameters,
} from 'viem'

import { type Config } from '../../createConfig.js'
import { type SelectChains } from '../../types/chain.js'
import {
  type ChainIdParameter,
  type ConnectorParameter,
} from '../../types/properties.js'
import { type UnionEvaluate, type UnionOmit } from '../../types/utils.js'
import { getAccount } from '../getAccount.js'
import { getChainId } from '../getChainId.js'
import {
  type SimulateContractReturnType,
  simulateContract,
} from '../simulateContract.js'

type stateMutability = 'nonpayable' | 'payable'

export type CreateSimulateContractParameters<
  abi extends Abi | readonly unknown[],
  address extends Address | Record<number, Address> | undefined = undefined,
> = {
  abi: abi | Abi | readonly unknown[]
  address?: address | Address | Record<number, Address> | undefined
}

export type CreateSimulateContractReturnType<
  abi extends Abi | readonly unknown[],
  address extends Address | Record<number, Address> | undefined,
> = <
  config extends Config,
  functionName extends ContractFunctionName<abi, stateMutability>,
  args extends ContractFunctionArgs<abi, stateMutability, functionName>,
  chainId extends config['chains'][number]['id'] | undefined = undefined,
  ///
  chains extends readonly Chain[] = SelectChains<config, chainId>,
>(
  config: config,
  parameters: {
    [key in keyof chains]: UnionEvaluate<
      UnionOmit<
        viem_SimulateContractParameters<
          abi,
          functionName,
          args,
          chains[key],
          chains[key],
          Account | Address
        >,
        'abi' | 'chain' | (address extends undefined ? never : 'address')
      >
    > &
      ChainIdParameter<config, chainId> &
      ConnectorParameter & {
        chainId?: address extends Record<number, Address>
          ?
              | keyof address
              | (chainId extends keyof address ? chainId : never)
              | undefined
          : chainId | number | undefined
      }
  }[number],
) => Promise<
  SimulateContractReturnType<abi, functionName, args, config, chainId>
>

export function createSimulateContract<
  const abi extends Abi | readonly unknown[],
  const address extends
    | Address
    | Record<number, Address>
    | undefined = undefined,
>(
  c: CreateSimulateContractParameters<abi, address>,
): CreateSimulateContractReturnType<abi, address> {
  if (c.address !== undefined && typeof c.address === 'object')
    return (config, parameters) => {
      const configChainId = getChainId(config)
      const account = getAccount(config)
      const chainId =
        (parameters as { chainId?: number })?.chainId ??
        account.chainId ??
        configChainId
      const address = c.address?.[chainId]
      return simulateContract(config, { ...(parameters as any), ...c, address })
    }

  return (config, parameters) => {
    return simulateContract(config, { ...(parameters as any), ...c })
  }
}
