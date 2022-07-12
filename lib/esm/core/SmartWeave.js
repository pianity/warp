import { DefaultCreateContract, SmartWeaveBuilder } from './index';
import { HandlerBasedContract, PstContractImpl } from '../contract/index';
/**
 * The SmartWeave "motherboard" ;-).
 * This is the base class that supplies the implementation of the SmartWeave protocol
 * Allows to plug-in different implementation of all the modules defined in the constructor.
 *
 * After being fully configured, it allows to "connect" to
 * contract and perform operations on them (see {@link Contract})
 */
export class SmartWeave {
    constructor(arweave, definitionLoader, interactionsLoader, interactionsSorter, executorFactory, stateEvaluator, useRedstoneGwInfo = false) {
        this.arweave = arweave;
        this.definitionLoader = definitionLoader;
        this.interactionsLoader = interactionsLoader;
        this.interactionsSorter = interactionsSorter;
        this.executorFactory = executorFactory;
        this.stateEvaluator = stateEvaluator;
        this.useRedstoneGwInfo = useRedstoneGwInfo;
        this.createContract = new DefaultCreateContract(arweave);
    }
    static builder(arweave) {
        return new SmartWeaveBuilder(arweave);
    }
    /**
     * Allows to connect to any contract using its transaction id.
     * @param contractTxId
     * @param callingContract
     */
    contract(contractTxId, callingContract, callingInteraction) {
        return new HandlerBasedContract(contractTxId, this, callingContract, callingInteraction);
    }
    /**
     * Allows to connect to a contract that conforms to the Profit Sharing Token standard
     * @param contractTxId
     */
    pst(contractTxId) {
        return new PstContractImpl(contractTxId, this);
    }
    async flushCache() {
        await this.stateEvaluator.flushCache();
    }
}
//# sourceMappingURL=SmartWeave.js.map