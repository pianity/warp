"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DefaultEvaluationOptions = exports.EvalStateResult = void 0;
class EvalStateResult {
    constructor(state, validity, transactionId, blockId) {
        this.state = state;
        this.validity = validity;
        this.transactionId = transactionId;
        this.blockId = blockId;
    }
}
exports.EvalStateResult = EvalStateResult;
class DefaultEvaluationOptions {
    constructor() {
        // default = true - still cannot decide whether true or false should be the default.
        // "false" may lead to some fairly simple attacks on contract, if the contract
        // does not properly validate input data.
        // "true" may lead to wrongly calculated state, even without noticing the problem
        // (eg. when using unsafe client and Arweave does not respond properly for a while)
        this.ignoreExceptions = true;
        this.waitForConfirmation = false;
        this.updateCacheForEachInteraction = false;
        this.internalWrites = false;
        this.maxCallDepth = 7; // your lucky number...
        this.maxInteractionEvaluationTimeSeconds = 60;
        this.stackTrace = {
            saveState: false
        };
        this.bundlerAddress = 'https://gateway.redstone.finance/';
        this.gasLimit = Number.MAX_SAFE_INTEGER;
        this.useFastCopy = true;
        this.manualCacheFlush = false;
        this.useVM2 = false;
        this.allowUnsafeClient = false;
    }
}
exports.DefaultEvaluationOptions = DefaultEvaluationOptions;
//# sourceMappingURL=StateEvaluator.js.map