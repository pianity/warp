import { CustomError, EvaluationOptions, GQLEdgeInterface } from '../..';
export declare type InteractionLoaderErrorKind = 'BadGatewayResponse500' | 'BadGatewayResponse504' | 'BadGatewayResponse';
export declare class InteractionLoaderError extends CustomError<InteractionLoaderErrorKind> {
}
/**
 * Implementors of this interface add functionality of loading contract's interaction transactions.
 * These transactions are then used to evaluate contract's state to a required block height.
 *
 * Note: InteractionsLoaders are not responsible for sorting interaction transactions!
 */
export interface InteractionsLoader {
    load(contractId: string, fromBlockHeight: number, toBlockHeight: number, evaluationOptions?: EvaluationOptions, upToTransactionId?: string): Promise<GQLEdgeInterface[]>;
}
//# sourceMappingURL=InteractionsLoader.d.ts.map