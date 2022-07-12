import { GQLEdgeInterface, GQLTagInterface } from '../../..';
/**
 * A class that is responsible for retrieving "input" tag from the interaction transaction.
 * Two tags formats are allowed:
 * 1. "multiple interactions in one tx" format - where "Input" tag MUST be next to the "Contract" tag
 *    See more at https://github.com/ArweaveTeam/SmartWeave/pull/51
 * 2. "traditional" format - one interaction per one transaction - where tags order does not matter.
 *
 * More on Discord: https://discord.com/channels/357957786904166400/756557551234973696/885388585023463424
 */
export declare class TagsParser {
    private readonly logger;
    getInputTag(interactionTransaction: GQLEdgeInterface, contractTxId: string): GQLTagInterface;
    isInteractWrite(interactionTransaction: GQLEdgeInterface, contractTxId: string): boolean;
    getInteractWritesContracts(interactionTransaction: GQLEdgeInterface): string[];
    getContractTag(interactionTransaction: GQLEdgeInterface): string;
    getContractsWithInputs(interactionTransaction: GQLEdgeInterface): Map<string, GQLTagInterface>;
    static hasMultipleInteractions(interactionTransaction: any): boolean;
}
//# sourceMappingURL=TagsParser.d.ts.map