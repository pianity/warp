"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MemBlockHeightSwCache = void 0;
const utils_1 = require("../../utils/index");
const logging_1 = require("../../logging/index");
/**
 * A simple, in-memory cache implementation of the BlockHeightSwCache
 */
class MemBlockHeightSwCache {
    constructor(maxStoredBlockHeights = Number.MAX_SAFE_INTEGER) {
        this.maxStoredBlockHeights = maxStoredBlockHeights;
        this.logger = logging_1.LoggerFactory.INST.create('MemBlockHeightSwCache');
        this.storage = {};
    }
    async getLast(key) {
        if (!(await this.contains(key))) {
            return null;
        }
        const cached = this.storage[key];
        // sort keys (ie. block heights) in asc order and get
        // the last element (ie. highest cached block height).
        const highestBlockHeight = [...cached.keys()].sort(utils_1.asc).pop();
        return {
            cachedHeight: highestBlockHeight,
            cachedValue: (0, utils_1.deepCopy)(cached.get(highestBlockHeight))
        };
    }
    async getLessOrEqual(key, blockHeight) {
        if (!(await this.contains(key))) {
            return null;
        }
        const cached = this.storage[key];
        // find first element in and desc-sorted keys array that is not higher than requested block height
        const highestBlockHeight = [...cached.keys()].sort(utils_1.desc).find((cachedBlockHeight) => {
            return cachedBlockHeight <= blockHeight;
        });
        return highestBlockHeight === undefined
            ? null
            : {
                cachedHeight: highestBlockHeight,
                cachedValue: (0, utils_1.deepCopy)(cached.get(highestBlockHeight))
            };
    }
    async put({ cacheKey, blockHeight }, value) {
        this.putSync({ cacheKey, blockHeight }, value);
    }
    putSync({ cacheKey, blockHeight }, value) {
        if (!this.containsSync(cacheKey)) {
            this.storage[cacheKey] = new Map();
        }
        const cached = this.storage[cacheKey];
        if (cached.size >= this.maxStoredBlockHeights) {
            const toRemove = [...cached.keys()].sort(utils_1.asc).shift();
            cached.delete(toRemove);
        }
        cached.set(blockHeight, value);
    }
    async contains(key) {
        return this.containsSync(key);
    }
    containsSync(key) {
        return Object.prototype.hasOwnProperty.call(this.storage, key);
    }
    async get(key, blockHeight, returnDeepCopy = true) {
        if (!(await this.contains(key))) {
            return null;
        }
        if (!this.storage[key].has(blockHeight)) {
            return null;
        }
        return {
            cachedHeight: blockHeight,
            cachedValue: returnDeepCopy ? (0, utils_1.deepCopy)(this.storage[key].get(blockHeight)) : this.storage[key].get(blockHeight)
        };
    }
    flush() {
        return Promise.resolve(undefined);
    }
}
exports.MemBlockHeightSwCache = MemBlockHeightSwCache;
//# sourceMappingURL=MemBlockHeightCache.js.map