import { ContractDefinition, EvalStateResult, ExecutionContext, HandlerApi, InteractionData, InteractionResult, SmartWeaveGlobal } from '../../..';
export declare class ContractHandlerApi<State> implements HandlerApi<State> {
    private readonly swGlobal;
    private readonly contractFunction;
    private readonly contractDefinition;
    private readonly contractLogger;
    private readonly logger;
    constructor(swGlobal: SmartWeaveGlobal, contractFunction: Function, contractDefinition: ContractDefinition<State>);
    handle<Input, Result>(executionContext: ExecutionContext<State>, currentResult: EvalStateResult<State>, interactionData: InteractionData<Input>): Promise<InteractionResult<State, Result>>;
    private assignWrite;
    private assignViewContractState;
    private assignReadContractState;
    private assignRefreshState;
    initState(state: State): void;
}
//# sourceMappingURL=ContractHandlerApi.d.ts.map