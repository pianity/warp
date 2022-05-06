import { BlockHeightSwCache, EvaluationOptions, GQLEdgeInterface, InteractionsLoader } from '..';
/**
 * This implementation of the {@link InteractionsLoader} tries to limit the amount of interactions
 * with GraphQL endpoint. Additionally, it is downloading only the missing interactions
 * (starting from the latest already cached) - to additionally limit the amount of "paging".
 */
export declare class CacheableContractInteractionsLoader implements InteractionsLoader {
    private readonly baseImplementation;
    private readonly cache;
    private readonly logger;
    constructor(baseImplementation: InteractionsLoader, cache: BlockHeightSwCache<GQLEdgeInterface[]>);
    load(contractId: string, fromBlockHeight: number, toBlockHeight: number, evaluationOptions?: EvaluationOptions): Promise<GQLEdgeInterface[]>;
}
//# sourceMappingURL=CacheableContractInteractionsLoader.d.ts.map