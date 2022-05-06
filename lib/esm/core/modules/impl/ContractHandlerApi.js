import { deepCopy, LoggerFactory, timeout } from '../../..';
export class ContractHandlerApi {
    constructor(swGlobal, 
    // eslint-disable-next-line
    contractFunction, contractDefinition) {
        this.swGlobal = swGlobal;
        this.contractFunction = contractFunction;
        this.contractDefinition = contractDefinition;
        this.logger = LoggerFactory.INST.create('ContractHandlerApi');
        this.contractLogger = LoggerFactory.INST.create(swGlobal.contract.id);
        this.assignReadContractState = this.assignReadContractState.bind(this);
        this.assignViewContractState = this.assignViewContractState.bind(this);
        this.assignWrite = this.assignWrite.bind(this);
        this.assignRefreshState = this.assignRefreshState.bind(this);
    }
    async handle(executionContext, currentResult, interactionData) {
        const { timeoutId, timeoutPromise } = timeout(executionContext.evaluationOptions.maxInteractionEvaluationTimeSeconds);
        try {
            const { interaction, interactionTx, currentTx } = interactionData;
            const stateCopy = deepCopy(currentResult.state, executionContext.evaluationOptions.useFastCopy);
            this.swGlobal._activeTx = interactionTx;
            this.swGlobal.caller = interaction.caller; // either contract tx id (for internal writes) or transaction.owner
            this.assignReadContractState(executionContext, currentTx, currentResult, interactionTx);
            this.assignViewContractState(executionContext);
            this.assignWrite(executionContext, currentTx);
            this.assignRefreshState(executionContext);
            const handlerResult = await Promise.race([timeoutPromise, this.contractFunction(stateCopy, interaction)]);
            if (handlerResult && (handlerResult.state !== undefined || handlerResult.result !== undefined)) {
                return {
                    type: 'ok',
                    result: handlerResult.result,
                    state: handlerResult.state || currentResult.state
                };
            }
            // Will be caught below as unexpected exception.
            throw new Error(`Unexpected result from contract: ${JSON.stringify(handlerResult)}`);
        }
        catch (err) {
            switch (err.name) {
                case 'ContractError':
                    return {
                        type: 'error',
                        errorMessage: err.message,
                        state: currentResult.state,
                        // note: previous version was writing error message to a "result" field,
                        // which fucks-up the HandlerResult type definition -
                        // HandlerResult.result had to be declared as 'Result | string' - and that led to a poor dev exp.
                        // TODO: this might be breaking change!
                        result: null
                    };
                default:
                    return {
                        type: 'exception',
                        errorMessage: `${(err && err.stack) || (err && err.message) || err}`,
                        state: currentResult.state,
                        result: null
                    };
            }
        }
        finally {
            if (timeoutId !== null) {
                // it is important to clear the timeout promise
                // - promise.race won't "cancel" it automatically if the "handler" promise "wins"
                // - and this would ofc. cause a waste in cpu cycles
                // (+ Jest complains about async operations not being stopped properly).
                clearTimeout(timeoutId);
            }
        }
    }
    assignWrite(executionContext, currentTx) {
        this.swGlobal.contracts.write = async (contractTxId, input) => {
            if (!executionContext.evaluationOptions.internalWrites) {
                throw new Error("Internal writes feature switched off. Change EvaluationOptions.internalWrites flag to 'true'");
            }
            this.logger.debug('swGlobal.write call:', {
                from: this.contractDefinition.txId,
                to: contractTxId,
                input
            });
            // The contract that we want to call and modify its state
            const calleeContract = executionContext.smartweave.contract(contractTxId, executionContext.contract, this.swGlobal._activeTx);
            const result = await calleeContract.dryWriteFromTx(input, this.swGlobal._activeTx, [
                ...(currentTx || []),
                {
                    contractTxId: this.contractDefinition.txId,
                    interactionTxId: this.swGlobal.transaction.id
                }
            ]);
            this.logger.debug('Cache result?:', !this.swGlobal._activeTx.dry);
            await executionContext.smartweave.stateEvaluator.onInternalWriteStateUpdate(this.swGlobal._activeTx, contractTxId, {
                state: result.state,
                validity: {}
            });
            return result;
        };
    }
    assignViewContractState(executionContext) {
        this.swGlobal.contracts.viewContractState = async (contractTxId, input) => {
            this.logger.debug('swGlobal.viewContractState call:', {
                from: this.contractDefinition.txId,
                to: contractTxId,
                input
            });
            const childContract = executionContext.smartweave.contract(contractTxId, executionContext.contract, this.swGlobal._activeTx);
            return await childContract.viewStateForTx(input, this.swGlobal._activeTx);
        };
    }
    assignReadContractState(executionContext, currentTx, currentResult, interactionTx) {
        this.swGlobal.contracts.readContractState = async (contractTxId, height, returnValidity) => {
            const requestedHeight = height || this.swGlobal.block.height;
            this.logger.debug('swGlobal.readContractState call:', {
                from: this.contractDefinition.txId,
                to: contractTxId,
                height: requestedHeight,
                transaction: this.swGlobal.transaction.id
            });
            const { stateEvaluator } = executionContext.smartweave;
            const childContract = executionContext.smartweave.contract(contractTxId, executionContext.contract, interactionTx);
            await stateEvaluator.onContractCall(interactionTx, executionContext, currentResult);
            const stateWithValidity = await childContract.readState(requestedHeight, [
                ...(currentTx || []),
                {
                    contractTxId: this.contractDefinition.txId,
                    interactionTxId: this.swGlobal.transaction.id
                }
            ]);
            // TODO: it should be up to the client's code to decide which part of the result to use
            // (by simply using destructuring operator)...
            // but this (i.e. returning always stateWithValidity from here) would break backwards compatibility
            // in current contract's source code..:/
            return returnValidity ? deepCopy(stateWithValidity) : deepCopy(stateWithValidity.state);
        };
    }
    assignRefreshState(executionContext) {
        this.swGlobal.contracts.refreshState = async () => {
            const stateEvaluator = executionContext.smartweave.stateEvaluator;
            const result = await stateEvaluator.latestAvailableState(this.swGlobal.contract.id, this.swGlobal.block.height);
            return result === null || result === void 0 ? void 0 : result.cachedValue.state;
        };
    }
    initState(state) {
        // nth to do in this impl...
    }
}
//# sourceMappingURL=ContractHandlerApi.js.map