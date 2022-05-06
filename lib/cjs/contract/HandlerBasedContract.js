"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.HandlerBasedContract = void 0;
const _smartweave_1 = require("..");
const safe_stable_stringify_1 = __importDefault(require("safe-stable-stringify"));
const crypto = __importStar(require("crypto"));
/**
 * An implementation of {@link Contract} that is backwards compatible with current style
 * of writing SW contracts (ie. using the "handle" function).
 *
 * It requires {@link ExecutorFactory} that is using {@link HandlerApi} generic type.
 */
class HandlerBasedContract {
    constructor(_contractTxId, smartweave, _parentContract = null, _callingInteraction = null) {
        this._contractTxId = _contractTxId;
        this.smartweave = smartweave;
        this._parentContract = _parentContract;
        this._callingInteraction = _callingInteraction;
        this.logger = _smartweave_1.LoggerFactory.INST.create('HandlerBasedContract');
        this._evaluationOptions = new _smartweave_1.DefaultEvaluationOptions();
        /**
         * current Arweave networkInfo that will be used for all operations of the SmartWeave protocol.
         * Only the 'root' contract call should read this data from Arweave - all the inner calls ("child" contracts)
         * should reuse this data from the parent ("calling") contract.
         */
        this._networkInfo = null;
        this._rootBlockHeight = null;
        this._innerWritesEvaluator = new _smartweave_1.InnerWritesEvaluator();
        this._benchmarkStats = null;
        this.waitForConfirmation = this.waitForConfirmation.bind(this);
        this._arweaveWrapper = new _smartweave_1.ArweaveWrapper(smartweave.arweave);
        if (_parentContract != null) {
            this._networkInfo = _parentContract.getNetworkInfo();
            this._rootBlockHeight = _parentContract.getRootBlockHeight();
            this._evaluationOptions = _parentContract.evaluationOptions();
            this._callDepth = _parentContract.callDepth() + 1;
            const interaction = _parentContract.getCallStack().getInteraction(_callingInteraction.id);
            if (this._callDepth > this._evaluationOptions.maxCallDepth) {
                throw Error(`Max call depth of ${this._evaluationOptions.maxCallDepth} has been exceeded for interaction ${JSON.stringify(interaction.interactionInput)}`);
            }
            // sanity-check...
            if (this._networkInfo == null) {
                throw Error('Calling contract should have the network info already set!');
            }
            this.logger.debug('Calling interaction id', _callingInteraction.id);
            const callStack = new _smartweave_1.ContractCallStack(_contractTxId, this._callDepth);
            interaction.interactionInput.foreignContractCalls.set(_contractTxId, callStack);
            this._callStack = callStack;
        }
        else {
            this._callDepth = 0;
            this._callStack = new _smartweave_1.ContractCallStack(_contractTxId, 0);
        }
    }
    async readState(blockHeight, currentTx) {
        return this.readStateSequencer(blockHeight, undefined, currentTx);
    }
    async readStateSequencer(blockHeight, upToTransactionId, currentTx) {
        var _a, _b;
        this.logger.info('Read state for', {
            contractTxId: this._contractTxId,
            currentTx
        });
        const initBenchmark = _smartweave_1.Benchmark.measure();
        this.maybeResetRootContract(blockHeight);
        const { stateEvaluator } = this.smartweave;
        const executionContext = await this.createExecutionContext(this._contractTxId, blockHeight, false, upToTransactionId);
        this.logger.info('Execution Context', {
            blockHeight: executionContext.blockHeight,
            srcTxId: (_a = executionContext.contractDefinition) === null || _a === void 0 ? void 0 : _a.srcTxId,
            missingInteractions: executionContext.sortedInteractions.length,
            cachedStateHeight: (_b = executionContext.cachedState) === null || _b === void 0 ? void 0 : _b.cachedHeight,
            upToTransactionId
        });
        initBenchmark.stop();
        const stateBenchmark = _smartweave_1.Benchmark.measure();
        const result = await stateEvaluator.eval(executionContext, currentTx || []);
        stateBenchmark.stop();
        const total = initBenchmark.elapsed(true) + stateBenchmark.elapsed(true);
        this._benchmarkStats = {
            gatewayCommunication: initBenchmark.elapsed(true),
            stateEvaluation: stateBenchmark.elapsed(true),
            total
        };
        this.logger.info('Benchmark', {
            'Gateway communication  ': initBenchmark.elapsed(),
            'Contract evaluation    ': stateBenchmark.elapsed(),
            'Total:                 ': `${total.toFixed(0)}ms`
        });
        return result;
    }
    async viewState(input, blockHeight, tags = [], transfer = _smartweave_1.emptyTransfer) {
        this.logger.info('View state for', this._contractTxId);
        return await this.callContract(input, undefined, blockHeight, tags, transfer);
    }
    async viewStateForTx(input, interactionTx) {
        this.logger.info(`View state for ${this._contractTxId}`, interactionTx);
        return await this.callContractForTx(input, interactionTx);
    }
    async dryWrite(input, caller, tags, transfer) {
        this.logger.info('Dry-write for', this._contractTxId);
        return await this.callContract(input, caller, undefined, tags, transfer);
    }
    async dryWriteFromTx(input, transaction, currentTx) {
        this.logger.info(`Dry-write from transaction ${transaction.id} for ${this._contractTxId}`);
        return await this.callContractForTx(input, transaction, currentTx || []);
    }
    async writeInteraction(input, tags = [], transfer = _smartweave_1.emptyTransfer, strict = false) {
        this.logger.info('Write interaction input', input);
        if (!this.signer) {
            throw new Error("Wallet not connected. Use 'connect' method first.");
        }
        const { arweave } = this.smartweave;
        const interactionTx = await this.createInteraction(input, tags, transfer, strict);
        const response = await arweave.transactions.post(interactionTx);
        if (response.status !== 200) {
            this.logger.error('Error while posting transaction', response);
            return null;
        }
        if (this._evaluationOptions.waitForConfirmation) {
            this.logger.info('Waiting for confirmation of', interactionTx.id);
            const benchmark = _smartweave_1.Benchmark.measure();
            await this.waitForConfirmation(interactionTx.id);
            this.logger.info('Transaction confirmed after', benchmark.elapsed());
        }
        return interactionTx.id;
    }
    async bundleInteraction(input, tags = [], strict = false) {
        this.logger.info('Bundle interaction input', input);
        if (!this.signer) {
            throw new _smartweave_1.BundleInteractionError('NoWalletConnected', "Wallet not connected. Use 'connect' method first.");
        }
        let interactionTx;
        try {
            interactionTx = await this.createInteraction(input, tags, _smartweave_1.emptyTransfer, strict);
        }
        catch (e) {
            if (e instanceof _smartweave_1.InteractionLoaderError) {
                throw new _smartweave_1.BundleInteractionError('BadGatewayResponse');
            }
            else {
                throw new _smartweave_1.BundleInteractionError('InvalidInteraction');
            }
        }
        const response = await fetch(`${this._evaluationOptions.bundlerAddress}gateway/sequencer/register`, {
            method: 'POST',
            body: JSON.stringify(interactionTx),
            headers: {
                'Accept-Encoding': 'gzip, deflate, br',
                'Content-Type': 'application/json',
                Accept: 'application/json'
            }
        })
            .then((res) => {
            this.logger.debug(res);
            return res.ok ? res.json() : Promise.reject(res);
        })
            .catch((error) => {
            var _a;
            this.logger.error(error);
            if ((_a = error.body) === null || _a === void 0 ? void 0 : _a.message) {
                this.logger.error(error.body.message);
            }
            throw new _smartweave_1.BundleInteractionError('CannotBundle', `Unable to bundle interaction: ${JSON.stringify(error)}`);
        });
        return {
            bundlrResponse: response,
            originalTxId: interactionTx.id
        };
    }
    async createInteraction(input, tags, transfer, strict) {
        if (this._evaluationOptions.internalWrites) {
            // Call contract and verify if there are any internal writes:
            // 1. Evaluate current contract state
            // 2. Apply input as "dry-run" transaction
            // 3. Verify the callStack and search for any "internalWrites" transactions
            // 4. For each found "internalWrite" transaction - generate additional tag:
            // {name: 'InternalWrite', value: callingContractTxId}
            const handlerResult = await this.callContract(input, undefined, undefined, tags, transfer);
            if (strict && handlerResult.type !== 'ok') {
                throw new Error(`Cannot create interaction: ${handlerResult.errorMessage}`);
            }
            const callStack = this.getCallStack();
            const innerWrites = this._innerWritesEvaluator.eval(callStack);
            this.logger.debug('Input', input);
            this.logger.debug('Callstack', callStack.print());
            innerWrites.forEach((contractTxId) => {
                tags.push({
                    name: _smartweave_1.SmartWeaveTags.INTERACT_WRITE,
                    value: contractTxId
                });
            });
            this.logger.debug('Tags with inner calls', tags);
        }
        else {
            if (strict) {
                const handlerResult = await this.callContract(input, undefined, undefined, tags, transfer);
                if (handlerResult.type !== 'ok') {
                    throw new Error(`Cannot create interaction: ${handlerResult.errorMessage}`);
                }
            }
        }
        const interactionTx = await (0, _smartweave_1.createTx)(this.smartweave.arweave, this.signer, this._contractTxId, input, tags, transfer.target, transfer.winstonQty);
        return interactionTx;
    }
    txId() {
        return this._contractTxId;
    }
    getCallStack() {
        return this._callStack;
    }
    getNetworkInfo() {
        return this._networkInfo;
    }
    connect(signer) {
        if (typeof signer == 'function') {
            this.signer = signer;
        }
        else {
            this.signer = async (tx) => {
                await this.smartweave.arweave.transactions.sign(tx, signer);
            };
        }
        return this;
    }
    setEvaluationOptions(options) {
        this._evaluationOptions = {
            ...this._evaluationOptions,
            ...options
        };
        return this;
    }
    getRootBlockHeight() {
        return this._rootBlockHeight;
    }
    async waitForConfirmation(transactionId) {
        const { arweave } = this.smartweave;
        const status = await arweave.transactions.getStatus(transactionId);
        if (status.confirmed === null) {
            this.logger.info(`Transaction ${transactionId} not yet confirmed. Waiting another 20 seconds before next check.`);
            await (0, _smartweave_1.sleep)(20000);
            await this.waitForConfirmation(transactionId);
        }
        else {
            this.logger.info(`Transaction ${transactionId} confirmed`, status);
            return status;
        }
    }
    async createExecutionContext(contractTxId, blockHeight, forceDefinitionLoad = false, upToTransactionId = undefined) {
        var _a;
        const { definitionLoader, interactionsLoader, interactionsSorter, executorFactory, stateEvaluator, useRedstoneGwInfo } = this.smartweave;
        let currentNetworkInfo;
        const benchmark = _smartweave_1.Benchmark.measure();
        // if this is a "root" call (ie. original call from SmartWeave's client)
        if (this._parentContract == null) {
            if (blockHeight) {
                this._networkInfo = {
                    height: blockHeight
                };
            }
            else {
                this.logger.debug('Reading network info for root call');
                currentNetworkInfo = useRedstoneGwInfo
                    ? await this._arweaveWrapper.rGwInfo()
                    : await this._arweaveWrapper.info();
                this._networkInfo = currentNetworkInfo;
            }
        }
        else {
            // if that's a call from within contract's source code
            this.logger.debug('Reusing network info from the calling contract');
            // note: the whole execution tree should use the same network info!
            // this requirement was not fulfilled in the "v1" SDK - each subsequent
            // call to contract (from contract's source code) was loading network info independently
            // if the contract was evaluating for many minutes/hours, this could effectively lead to reading
            // state on different block heights...
            currentNetworkInfo = this._parentContract._networkInfo;
        }
        if (blockHeight == null) {
            blockHeight = currentNetworkInfo.height;
        }
        this.logger.debug('network info', benchmark.elapsed());
        benchmark.reset();
        const cachedState = await stateEvaluator.latestAvailableState(contractTxId, blockHeight);
        let cachedBlockHeight = -1;
        if (cachedState != null) {
            cachedBlockHeight = cachedState.cachedHeight;
        }
        this.logger.debug('cache lookup', benchmark.elapsed());
        benchmark.reset();
        const evolvedSrcTxId = _smartweave_1.Evolve.evolvedSrcTxId((_a = cachedState === null || cachedState === void 0 ? void 0 : cachedState.cachedValue) === null || _a === void 0 ? void 0 : _a.state);
        let contractDefinition, interactions = [], sortedInteractions = [], handler;
        if (cachedBlockHeight != blockHeight) {
            [contractDefinition, interactions] = await Promise.all([
                definitionLoader.load(contractTxId, evolvedSrcTxId),
                // note: "eagerly" loading all of the interactions up to the originally requested block height
                // (instead of the blockHeight requested for this specific read state call).
                // as dumb as it may seem - this in fact significantly speeds up the processing
                // - because the InteractionsLoader (usually CacheableContractInteractionsLoader)
                // doesn't have to download missing interactions during the contract execution
                // (eg. if contract is calling different contracts on different block heights).
                // This basically limits the amount of interactions with Arweave GraphQL endpoint -
                // each such interaction takes at least ~500ms.
                interactionsLoader.load(contractTxId, cachedBlockHeight + 1, this._rootBlockHeight || this._networkInfo.height, this._evaluationOptions, upToTransactionId)
            ]);
            this.logger.debug('contract and interactions load', benchmark.elapsed());
            sortedInteractions = await interactionsSorter.sort(interactions);
            this.logger.trace('Sorted interactions', sortedInteractions);
            handler = (await executorFactory.create(contractDefinition, this._evaluationOptions));
        }
        else {
            this.logger.debug('State fully cached, not loading interactions.');
            if (forceDefinitionLoad || evolvedSrcTxId) {
                contractDefinition = await definitionLoader.load(contractTxId, evolvedSrcTxId);
                handler = (await executorFactory.create(contractDefinition, this._evaluationOptions));
            }
        }
        const containsInteractionsFromSequencer = interactions.some((i) => i.node.source == _smartweave_1.SourceType.REDSTONE_SEQUENCER);
        this.logger.debug('containsInteractionsFromSequencer', containsInteractionsFromSequencer);
        return {
            contractDefinition,
            blockHeight,
            sortedInteractions,
            handler,
            smartweave: this.smartweave,
            contract: this,
            evaluationOptions: this._evaluationOptions,
            currentNetworkInfo,
            cachedState,
            containsInteractionsFromSequencer,
            upToTransactionId
        };
    }
    async createExecutionContextFromTx(contractTxId, transaction) {
        const benchmark = _smartweave_1.Benchmark.measure();
        const { definitionLoader, interactionsLoader, interactionsSorter, executorFactory, stateEvaluator } = this.smartweave;
        const blockHeight = transaction.block.height;
        const caller = transaction.owner.address;
        const cachedState = await stateEvaluator.latestAvailableState(contractTxId, blockHeight);
        let cachedBlockHeight = -1;
        if (cachedState != null) {
            cachedBlockHeight = cachedState.cachedHeight;
        }
        let contractDefinition, interactions = [], sortedInteractions = [];
        if (cachedBlockHeight != blockHeight) {
            [contractDefinition, interactions] = await Promise.all([
                definitionLoader.load(contractTxId),
                await interactionsLoader.load(contractTxId, 0, blockHeight, this._evaluationOptions)
            ]);
            sortedInteractions = await interactionsSorter.sort(interactions);
        }
        else {
            this.logger.debug('State fully cached, not loading interactions.');
            contractDefinition = await definitionLoader.load(contractTxId);
        }
        const handler = (await executorFactory.create(contractDefinition, this._evaluationOptions));
        this.logger.debug('Creating execution context from tx:', benchmark.elapsed());
        const containsInteractionsFromSequencer = interactions.some((i) => i.node.source == _smartweave_1.SourceType.REDSTONE_SEQUENCER);
        return {
            contractDefinition,
            blockHeight,
            sortedInteractions,
            handler,
            smartweave: this.smartweave,
            contract: this,
            evaluationOptions: this._evaluationOptions,
            caller,
            cachedState,
            containsInteractionsFromSequencer
        };
    }
    maybeResetRootContract(blockHeight) {
        if (this._parentContract == null) {
            this.logger.debug('Clearing network info and call stack for the root contract');
            this._networkInfo = null;
            this._callStack = new _smartweave_1.ContractCallStack(this.txId(), 0);
            this._rootBlockHeight = blockHeight;
        }
    }
    async callContract(input, caller, blockHeight, tags = [], transfer = _smartweave_1.emptyTransfer) {
        var _a;
        this.logger.info('Call contract input', input);
        this.maybeResetRootContract();
        if (!this.signer) {
            this.logger.warn('Wallet not set.');
        }
        const { arweave, stateEvaluator } = this.smartweave;
        // create execution context
        let executionContext = await this.createExecutionContext(this._contractTxId, blockHeight, true);
        // add block data to execution context
        if (!executionContext.currentBlockData) {
            const currentBlockData = ((_a = executionContext.currentNetworkInfo) === null || _a === void 0 ? void 0 : _a.current)
                ? // trying to optimise calls to arweave as much as possible...
                    await arweave.blocks.get(executionContext.currentNetworkInfo.current)
                : await arweave.blocks.getCurrent();
            executionContext = {
                ...executionContext,
                currentBlockData
            };
        }
        // add caller info to execution context
        let effectiveCaller;
        if (caller) {
            effectiveCaller = caller;
        }
        else if (this.signer) {
            const dummyTx = await arweave.createTransaction({ data: Math.random().toString().slice(-4) });
            await this.signer(dummyTx);
            effectiveCaller = await arweave.wallets.ownerToAddress(dummyTx.owner);
        }
        else {
            effectiveCaller = '';
        }
        this.logger.info('effectiveCaller', effectiveCaller);
        executionContext = {
            ...executionContext,
            caller: effectiveCaller
        };
        // eval current state
        const evalStateResult = await stateEvaluator.eval(executionContext, []);
        // create interaction transaction
        const interaction = {
            input,
            caller: executionContext.caller
        };
        this.logger.debug('interaction', interaction);
        const tx = await (0, _smartweave_1.createTx)(arweave, this.signer, this._contractTxId, input, tags, transfer.target, transfer.winstonQty);
        const dummyTx = (0, _smartweave_1.createDummyTx)(tx, executionContext.caller, executionContext.currentBlockData);
        const handleResult = await this.evalInteraction({
            interaction,
            interactionTx: dummyTx,
            currentTx: []
        }, executionContext, evalStateResult);
        if (handleResult.type !== 'ok') {
            this.logger.fatal('Error while interacting with contract', {
                type: handleResult.type,
                error: handleResult.errorMessage
            });
        }
        return handleResult;
    }
    async callContractForTx(input, interactionTx, currentTx) {
        this.maybeResetRootContract();
        const executionContext = await this.createExecutionContextFromTx(this._contractTxId, interactionTx);
        const evalStateResult = await this.smartweave.stateEvaluator.eval(executionContext, currentTx);
        this.logger.debug('callContractForTx - evalStateResult', {
            result: evalStateResult.state,
            txId: this._contractTxId
        });
        const interaction = {
            input,
            caller: this._parentContract.txId()
        };
        const interactionData = {
            interaction,
            interactionTx,
            currentTx
        };
        return await this.evalInteraction(interactionData, executionContext, evalStateResult);
    }
    async evalInteraction(interactionData, executionContext, evalStateResult) {
        const interactionCall = this.getCallStack().addInteractionData(interactionData);
        const benchmark = _smartweave_1.Benchmark.measure();
        const result = await executionContext.handler.handle(executionContext, evalStateResult, interactionData);
        interactionCall.update({
            cacheHit: false,
            intermediaryCacheHit: false,
            outputState: this._evaluationOptions.stackTrace.saveState ? result.state : undefined,
            executionTime: benchmark.elapsed(true),
            valid: result.type === 'ok',
            errorMessage: result.errorMessage,
            gasUsed: result.gasUsed
        });
        return result;
    }
    parent() {
        return this._parentContract;
    }
    callDepth() {
        return this._callDepth;
    }
    evaluationOptions() {
        return this._evaluationOptions;
    }
    lastReadStateStats() {
        return this._benchmarkStats;
    }
    stateHash(state) {
        const jsonState = (0, safe_stable_stringify_1.default)(state);
        // note: cannot reuse:
        // "The Hash object can not be used again after hash.digest() method has been called.
        // Multiple calls will cause an error to be thrown."
        const hash = crypto.createHash('sha256');
        hash.update(jsonState);
        return hash.digest('hex');
    }
    async syncState(nodeAddress) {
        const { stateEvaluator } = this.smartweave;
        const response = await fetch(`${nodeAddress}/state?id=${this._contractTxId}&validity=true&safeHeight=true`)
            .then((res) => {
            return res.ok ? res.json() : Promise.reject(res);
        })
            .catch((error) => {
            var _a, _b;
            if ((_a = error.body) === null || _a === void 0 ? void 0 : _a.message) {
                this.logger.error(error.body.message);
            }
            throw new Error(`Unable to retrieve state. ${error.status}: ${(_b = error.body) === null || _b === void 0 ? void 0 : _b.message}`);
        });
        await stateEvaluator.syncState(this._contractTxId, response.height, response.lastTransactionId, response.state, response.validity);
        return this;
    }
}
exports.HandlerBasedContract = HandlerBasedContract;
//# sourceMappingURL=HandlerBasedContract.js.map