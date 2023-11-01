import { type QueryOptions } from '@tanstack/query-core'

import {
  type GetEnsResolverErrorType,
  type GetEnsResolverParameters,
  type GetEnsResolverReturnType,
  getEnsResolver,
} from '../actions/getEnsResolver.js'
import { type Config } from '../createConfig.js'
import type { Evaluate, ExactPartial } from '../types/utils.js'
import type { ScopeKeyParameter } from './types.js'
import { filterQueryOptions } from './utils.js'

export type GetEnsResolverOptions<config extends Config> = Evaluate<
  ExactPartial<GetEnsResolverParameters<config>> & ScopeKeyParameter
>

export function getEnsResolverQueryOptions<config extends Config>(
  config: config,
  options: GetEnsResolverOptions<config> = {},
) {
  return {
    async queryFn({ queryKey }) {
      const { name, scopeKey: _, ...parameters } = queryKey[1]
      if (!name) throw new Error('name is required')
      return getEnsResolver(config, { ...parameters, name })
    },
    queryKey: getEnsResolverQueryKey(options),
  } as const satisfies QueryOptions<
    GetEnsResolverQueryFnData,
    GetEnsResolverErrorType,
    GetEnsResolverData,
    GetEnsResolverQueryKey<config>
  >
}

export type GetEnsResolverQueryFnData = GetEnsResolverReturnType

export type GetEnsResolverData = GetEnsResolverQueryFnData

export function getEnsResolverQueryKey<config extends Config>(
  options: GetEnsResolverOptions<config> = {},
) {
  return ['ensResolver', filterQueryOptions(options)] as const
}

export type GetEnsResolverQueryKey<config extends Config> = ReturnType<
  typeof getEnsResolverQueryKey<config>
>
