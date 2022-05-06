"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.canBeCached = void 0;
function canBeCached(tx) {
    // in case of using non-redstone gateway
    if (tx.confirmationStatus === undefined) {
        return true;
    }
    else {
        return tx.confirmationStatus === 'confirmed';
    }
}
exports.canBeCached = canBeCached;
//# sourceMappingURL=StateCache.js.map