import { LoggerFactory, SmartWeaveTags } from '../../..';
/**
 * A class that is responsible for retrieving "input" tag from the interaction transaction.
 * Two tags formats are allowed:
 * 1. "multiple interactions in one tx" format - where "Input" tag MUST be next to the "Contract" tag
 *    See more at https://github.com/ArweaveTeam/SmartWeave/pull/51
 * 2. "traditional" format - one interaction per one transaction - where tags order does not matter.
 *
 * More on Discord: https://discord.com/channels/357957786904166400/756557551234973696/885388585023463424
 */
export class TagsParser {
    constructor() {
        this.logger = LoggerFactory.INST.create('TagsParser');
    }
    getInputTag(interactionTransaction, contractTxId) {
        // this is the part to retain compatibility with https://github.com/ArweaveTeam/SmartWeave/pull/51
        if (TagsParser.hasMultipleInteractions(interactionTransaction)) {
            this.logger.debug('Interaction transaction is using multiple input tx tag format.');
            const contractTagIndex = interactionTransaction.node.tags.findIndex((tag) => tag.name === SmartWeaveTags.CONTRACT_TX_ID && tag.value === contractTxId);
            // if "Contract" is the last tag
            if (interactionTransaction.node.tags.length - 1 === contractTagIndex) {
                this.logger.warn("Wrong tags format: 'Contract' is the last tag");
                return undefined;
            }
            // in this case the "Input" tag MUST be right after the "Contract" tag
            const inputTag = interactionTransaction.node.tags[contractTagIndex + 1];
            // if the tag after "Contract" tag has wrong name
            if (inputTag.name !== SmartWeaveTags.INPUT) {
                this.logger.warn(`No 'Input' tag found after 'Contract' tag. Instead ${inputTag.name} was found`);
                return undefined;
            }
            return inputTag;
        }
        else {
            // the "old way" - i.e. tags ordering does not matter,
            // if there is at most one "Contract" tag
            // - so returning the first occurrence of "Input" tag.
            return interactionTransaction.node.tags.find((tag) => tag.name === SmartWeaveTags.INPUT);
        }
    }
    isInteractWrite(interactionTransaction, contractTxId) {
        return interactionTransaction.node.tags.some((tag) => tag.name === SmartWeaveTags.INTERACT_WRITE && tag.value === contractTxId);
    }
    getInteractWritesContracts(interactionTransaction) {
        return interactionTransaction.node.tags
            .filter((tag) => tag.name === SmartWeaveTags.INTERACT_WRITE)
            .map((t) => t.value);
    }
    getContractTag(interactionTransaction) {
        var _a;
        return (_a = interactionTransaction.node.tags.find((tag) => tag.name === SmartWeaveTags.CONTRACT_TX_ID)) === null || _a === void 0 ? void 0 : _a.value;
    }
    getContractsWithInputs(interactionTransaction) {
        const result = new Map();
        const contractTags = interactionTransaction.node.tags.filter((tag) => tag.name === SmartWeaveTags.CONTRACT_TX_ID);
        contractTags.forEach((contractTag) => {
            result.set(contractTag.value, this.getInputTag(interactionTransaction, contractTag.value));
        });
        return result;
    }
    static hasMultipleInteractions(interactionTransaction) {
        return interactionTransaction.node.tags.filter((tag) => tag.name === SmartWeaveTags.CONTRACT_TX_ID).length > 1;
    }
}
//# sourceMappingURL=TagsParser.js.map