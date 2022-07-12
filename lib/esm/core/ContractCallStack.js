import { mapReplacer } from '..';
export class ContractCallStack {
    constructor(contractTxId, depth, label = '') {
        this.contractTxId = contractTxId;
        this.depth = depth;
        this.label = label;
        this.interactions = new Map();
    }
    addInteractionData(interactionData) {
        const { interaction, interactionTx } = interactionData;
        const interactionCall = InteractionCall.create(new InteractionInput(interactionTx.id, interactionTx.block.height, interactionTx.block.timestamp, interaction === null || interaction === void 0 ? void 0 : interaction.caller, interaction === null || interaction === void 0 ? void 0 : interaction.input.function, interaction === null || interaction === void 0 ? void 0 : interaction.input, interactionTx.dry, new Map()));
        this.interactions.set(interactionTx.id, interactionCall);
        return interactionCall;
    }
    getInteraction(txId) {
        return this.interactions.get(txId);
    }
    print() {
        return JSON.stringify(this, mapReplacer);
    }
}
export class InteractionCall {
    constructor(interactionInput) {
        this.interactionInput = interactionInput;
    }
    static create(interactionInput) {
        return new InteractionCall(interactionInput);
    }
    update(interactionOutput) {
        this.interactionOutput = interactionOutput;
    }
}
export class InteractionInput {
    constructor(txId, blockHeight, blockTimestamp, caller, functionName, functionArguments, dryWrite, foreignContractCalls = new Map()) {
        this.txId = txId;
        this.blockHeight = blockHeight;
        this.blockTimestamp = blockTimestamp;
        this.caller = caller;
        this.functionName = functionName;
        this.functionArguments = functionArguments;
        this.dryWrite = dryWrite;
        this.foreignContractCalls = foreignContractCalls;
    }
}
export class InteractionOutput {
    constructor(cacheHit, intermediaryCacheHit, outputState, executionTime, valid, errorMessage = '', gasUsed) {
        this.cacheHit = cacheHit;
        this.intermediaryCacheHit = intermediaryCacheHit;
        this.outputState = outputState;
        this.executionTime = executionTime;
        this.valid = valid;
        this.errorMessage = errorMessage;
        this.gasUsed = gasUsed;
    }
}
//# sourceMappingURL=ContractCallStack.js.map