"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RedstoneGatewayInteractionsLoader = exports.SourceType = void 0;
const _smartweave_1 = require("../../..");
require("redstone-isomorphic");
const InteractionsLoader_1 = require("../InteractionsLoader");
var SourceType;
(function (SourceType) {
    SourceType["ARWEAVE"] = "arweave";
    SourceType["REDSTONE_SEQUENCER"] = "redstone-sequencer";
})(SourceType = exports.SourceType || (exports.SourceType = {}));
/**
 * The aim of this implementation of the {@link InteractionsLoader} is to make use of
 * Redstone Gateway ({@link https://github.com/redstone-finance/redstone-sw-gateway})
 * endpoint and retrieve contracts' interactions.
 *
 * Optionally - it is possible to pass:
 * 1. {@link ConfirmationStatus.confirmed} flag - to receive only confirmed interactions - ie. interactions with
 * enough confirmations, whose existence is confirmed by at least 3 Arweave peers.
 * 2. {@link ConfirmationStatus.notCorrupted} flag - to receive both already confirmed and not yet confirmed (ie. latest)
 * interactions.
 * 3. {@link SourceType} - to receive interactions based on their origin ({@link SourceType.ARWEAVE} or {@link SourceType.REDSTONE_SEQUENCER}).
 * If not set, interactions from all sources will be loaded.
 *
 * Passing no flag is the "backwards compatible" mode (ie. it will behave like the original Arweave GQL gateway endpoint).
 * Note that this may result in returning corrupted and/or forked interactions
 * - read more {@link https://github.com/redstone-finance/redstone-sw-gateway#corrupted-transactions}.
 *
 * Please note that currently caching (ie. {@link CacheableContractInteractionsLoader} is switched off
 * for RedstoneGatewayInteractionsLoader due to the issue mentioned in the
 * following comment {@link https://github.com/redstone-finance/redstone-smartcontracts/pull/62#issuecomment-995249264}
 */
class RedstoneGatewayInteractionsLoader {
    constructor(baseUrl, confirmationStatus = null, source = null) {
        this.baseUrl = baseUrl;
        this.confirmationStatus = confirmationStatus;
        this.source = source;
        this.logger = _smartweave_1.LoggerFactory.INST.create('RedstoneGatewayInteractionsLoader');
        this.baseUrl = (0, _smartweave_1.stripTrailingSlash)(baseUrl);
        Object.assign(this, confirmationStatus);
        this.source = source;
    }
    async load(contractId, fromBlockHeight, toBlockHeight, evaluationOptions, upToTransactionId) {
        this.logger.debug('Loading interactions: for ', { contractId, fromBlockHeight, toBlockHeight });
        const interactions = [];
        let page = 0;
        let totalPages = 0;
        const benchmarkTotalTime = _smartweave_1.Benchmark.measure();
        do {
            const benchmarkRequestTime = _smartweave_1.Benchmark.measure();
            // to make caching in cloudfront possible
            const url = upToTransactionId
                ? `${this.baseUrl}/gateway/interactions/transactionId`
                : `${this.baseUrl}/gateway/interactions`;
            const response = await fetch(`${url}?${new URLSearchParams({
                contractId: contractId,
                from: fromBlockHeight.toString(),
                to: toBlockHeight.toString(),
                page: (++page).toString(),
                minimize: 'true',
                ...(upToTransactionId ? { upToTransactionId } : ''),
                ...(this.confirmationStatus && this.confirmationStatus.confirmed ? { confirmationStatus: 'confirmed' } : ''),
                ...(this.confirmationStatus && this.confirmationStatus.notCorrupted
                    ? { confirmationStatus: 'not_corrupted' }
                    : ''),
                ...(this.source ? { source: this.source } : '')
            })}`)
                .then((res) => {
                return res.ok ? res.json() : Promise.reject(res);
            })
                .catch((error) => {
                var _a;
                if ((_a = error.body) === null || _a === void 0 ? void 0 : _a.message) {
                    this.logger.error(error.body.message);
                }
                const errorMessage = `Unable to retrieve transactions. Redstone gateway responded with status ${error.status}.`;
                switch (error.status) {
                    case 504:
                        throw new InteractionsLoader_1.InteractionLoaderError('BadGatewayResponse500', errorMessage);
                    case 500:
                        throw new InteractionsLoader_1.InteractionLoaderError('BadGatewayResponse504', errorMessage);
                    default:
                        throw new InteractionsLoader_1.InteractionLoaderError('BadGatewayResponse', errorMessage);
                }
            });
            totalPages = response.paging.pages;
            this.logger.debug(`Loading interactions: page ${page} of ${totalPages} loaded in ${benchmarkRequestTime.elapsed()}`);
            response.interactions.forEach((interaction) => interactions.push({
                cursor: '',
                node: {
                    ...interaction.interaction,
                    confirmationStatus: interaction.status
                }
            }));
            this.logger.debug(`Loaded interactions length: ${interactions.length}, from: ${fromBlockHeight}, to: ${toBlockHeight}`);
        } while (page < totalPages);
        this.logger.debug('All loaded interactions:', {
            from: fromBlockHeight,
            to: toBlockHeight,
            loaded: interactions.length,
            time: benchmarkTotalTime.elapsed()
        });
        return interactions;
    }
}
exports.RedstoneGatewayInteractionsLoader = RedstoneGatewayInteractionsLoader;
//# sourceMappingURL=RedstoneGatewayInteractionsLoader.js.map