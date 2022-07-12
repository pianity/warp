"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SmartWeave = void 0;
const core_1 = require("./index");
const contract_1 = require("../contract/index");
/**
 * The SmartWeave "motherboard" ;-).
 * This is the base class that supplies the implementation of the SmartWeave protocol
 * Allows to plug-in different implementation of all the modules defined in the constructor.
 *
 * After being fully configured, it allows to "connect" to
 * contract and perform operations on them (see {@link Contract})
 */
class SmartWeave {
    constructor(arweave, definitionLoader, interactionsLoader, interactionsSorter, executorFactory, stateEvaluator, useRedstoneGwInfo = false) {
        this.arweave = arweave;
        this.definitionLoader = definitionLoader;
        this.interactionsLoader = interactionsLoader;
        this.interactionsSorter = interactionsSorter;
        this.executorFactory = executorFactory;
        this.stateEvaluator = stateEvaluator;
        this.useRedstoneGwInfo = useRedstoneGwInfo;
        this.createContract = new core_1.DefaultCreateContract(arweave);
    }
    static builder(arweave) {
        return new core_1.SmartWeaveBuilder(arweave);
    }
    /**
     * Allows to connect to any contract using its transaction id.
     * @param contractTxId
     * @param callingContract
     */
    contract(contractTxId, callingContract, callingInteraction) {
        return new contract_1.HandlerBasedContract(contractTxId, this, callingContract, callingInteraction);
    }
    /**
     * Allows to connect to a contract that conforms to the Profit Sharing Token standard
     * @param contractTxId
     */
    pst(contractTxId) {
        return new contract_1.PstContractImpl(contractTxId, this);
    }
    async flushCache() {
        await this.stateEvaluator.flushCache();
    }
}
exports.SmartWeave = SmartWeave;
//# sourceMappingURL=SmartWeave.js.map