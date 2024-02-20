"use strict";
/* tslint:disable */
/* eslint-disable */
/* a kind of magic */
Object.defineProperty(exports, "__esModule", { value: true });
exports.rustWasmImports = void 0;
const LoggerFactory_1 = require("../../../../logging/LoggerFactory");
// note: this is (somewhat heavily) modified code
// of the js that is normally generated by the wasm-bindgen
const rustWasmImports = (swGlobal, wbindgenImports, wasmInstance, dtorValue, warpContractsCrateVersion) => {
    const wasmLogger = LoggerFactory_1.LoggerFactory.INST.create('WASM:Rust');
    // the raw functions, that we want to make available from the
    // wasm module
    const rawImports = {
        metering: {
            usegas: swGlobal.useGas
        },
        console: {
            log: function (value) {
                wasmLogger.debug(`${swGlobal.contract.id}: ${value}`);
            }
        },
        Block: {
            height: function () {
                return swGlobal.block.height;
            },
            indep_hash: function () {
                return swGlobal.block.indep_hash;
            },
            timestamp: function () {
                return swGlobal.block.timestamp;
            }
        },
        Transaction: {
            id: function () {
                return swGlobal.transaction.id;
            },
            owner: function () {
                return swGlobal.transaction.owner;
            },
            target: function () {
                return swGlobal.transaction.target;
            }
        },
        Contract: {
            id: function () {
                return swGlobal.contract.id;
            },
            owner: function () {
                return swGlobal.contract.owner;
            }
        },
        KV: {
            get: async function (key) {
                return await swGlobal.kv.get(key);
            },
            put: async function (key, value) {
                await swGlobal.kv.put(key, value);
            },
            del: async function (key) {
                await swGlobal.kv.del(key);
            },
            map: async function (gte, lt, reverse, limit) {
                return await swGlobal.kv.kvMap({
                    gte,
                    lt,
                    reverse,
                    limit
                });
            },
            keys: async function (gte, lt, reverse, limit) {
                return await swGlobal.kv.keys({
                    gte,
                    lt,
                    reverse,
                    limit
                });
            }
        },
        SmartWeave: {
            caller: function () {
                return swGlobal.caller;
            },
            readContractState: async function (contractTxId) {
                return await swGlobal.contracts.readContractState(contractTxId);
            },
            viewContractState: async function (contractTxId, input) {
                return await swGlobal.contracts.viewContractState(contractTxId, input);
            },
            write: async function (contractId, input) {
                return await swGlobal.contracts.write(contractId, input, false);
            }
        },
        Vrf: {
            value: function () {
                return swGlobal.vrf.value;
            },
            randomInt: function (maxValue) {
                return swGlobal.vrf.randomInt(maxValue);
            }
        }
    };
    let cachedTextDecoder = new TextDecoder('utf-8', { ignoreBOM: true, fatal: true });
    cachedTextDecoder.decode();
    let cachedUint8Memory0 = null;
    function getUint8Memory0() {
        if (cachedUint8Memory0 === null || cachedUint8Memory0.byteLength === 0) {
            cachedUint8Memory0 = new Uint8Array(wasmInstance.exports.memory.buffer);
        }
        return cachedUint8Memory0;
    }
    function getStringFromWasm0(ptr, len) {
        return cachedTextDecoder.decode(getUint8Memory0().subarray(ptr, ptr + len));
    }
    const heap = new Array(128).fill(undefined);
    heap.push(undefined, null, true, false);
    let heap_next = heap.length;
    function addHeapObject(obj) {
        if (heap_next === heap.length)
            heap.push(heap.length + 1);
        const idx = heap_next;
        heap_next = heap[idx];
        if (typeof heap_next !== 'number')
            throw new Error('corrupt heap');
        heap[idx] = obj;
        return idx;
    }
    function getObject(idx) {
        return heap[idx];
    }
    function _assertBoolean(n) {
        if (typeof n !== 'boolean') {
            throw new Error('expected a boolean argument');
        }
    }
    function isLikeNone(x) {
        return x === undefined || x === null;
    }
    function _assertNum(n) {
        if (typeof n !== 'number')
            throw new Error('expected a number argument');
    }
    let cachedFloat64Memory0 = null;
    function getFloat64Memory0() {
        if (cachedFloat64Memory0 === null || cachedFloat64Memory0.byteLength === 0) {
            cachedFloat64Memory0 = new Float64Array(wasmInstance.exports.memory.buffer);
        }
        return cachedFloat64Memory0;
    }
    let cachedInt32Memory0 = null;
    function getInt32Memory0() {
        if (cachedInt32Memory0 === null || cachedInt32Memory0.byteLength === 0) {
            cachedInt32Memory0 = new Int32Array(wasmInstance.exports.memory.buffer);
        }
        return cachedInt32Memory0;
    }
    let WASM_VECTOR_LEN = 0;
    // @ts-ignore
    let cachedTextEncoder = new TextEncoder('utf-8');
    const encodeString = typeof cachedTextEncoder.encodeInto === 'function'
        ? function (arg, view) {
            return cachedTextEncoder.encodeInto(arg, view);
        }
        : function (arg, view) {
            const buf = cachedTextEncoder.encode(arg);
            view.set(buf);
            return {
                read: arg.length,
                written: buf.length
            };
        };
    function passStringToWasm0(arg, malloc, realloc) {
        if (realloc === undefined) {
            const buf = cachedTextEncoder.encode(arg);
            const ptr = malloc(buf.length);
            getUint8Memory0()
                .subarray(ptr, ptr + buf.length)
                .set(buf);
            WASM_VECTOR_LEN = buf.length;
            return ptr;
        }
        let len = arg.length;
        let ptr = malloc(len);
        const mem = getUint8Memory0();
        let offset = 0;
        for (; offset < len; offset++) {
            const code = arg.charCodeAt(offset);
            if (code > 0x7f)
                break;
            mem[ptr + offset] = code;
        }
        if (offset !== len) {
            if (offset !== 0) {
                arg = arg.slice(offset);
            }
            ptr = realloc(ptr, len, (len = offset + arg.length * 3));
            const view = getUint8Memory0().subarray(ptr + offset, ptr + len);
            const ret = encodeString(arg, view);
            offset += ret.written;
        }
        WASM_VECTOR_LEN = offset;
        return ptr;
    }
    function dropObject(idx) {
        if (idx < 132)
            return;
        heap[idx] = heap_next;
        heap_next = idx;
    }
    function takeObject(idx) {
        const ret = getObject(idx);
        dropObject(idx);
        return ret;
    }
    function debugString(val) {
        // primitive types
        const type = typeof val;
        if (type == 'number' || type == 'boolean' || val == null) {
            return `${val}`;
        }
        if (type == 'string') {
            return `"${val}"`;
        }
        if (type == 'symbol') {
            const description = val.description;
            if (description == null) {
                return 'Symbol';
            }
            else {
                return `Symbol(${description})`;
            }
        }
        if (type == 'function') {
            const name = val.name;
            if (typeof name == 'string' && name.length > 0) {
                return `Function(${name})`;
            }
            else {
                return 'Function';
            }
        }
        // objects
        if (Array.isArray(val)) {
            const length = val.length;
            let debug = '[';
            if (length > 0) {
                debug += debugString(val[0]);
            }
            for (let i = 1; i < length; i++) {
                debug += ', ' + debugString(val[i]);
            }
            debug += ']';
            return debug;
        }
        // Test for built-in
        const builtInMatches = /\[object ([^\]]+)\]/.exec(toString.call(val));
        let className;
        if (builtInMatches.length > 1) {
            className = builtInMatches[1];
        }
        else {
            // Failed to match the standard '[object ClassName]'
            return toString.call(val);
        }
        if (className == 'Object') {
            // we're a user defined class or Object
            // JSON.stringify avoids problems with cycles, and is generally much
            // easier than looping through ownProperties of `val`.
            try {
                return 'Object(' + JSON.stringify(val) + ')';
            }
            catch (_) {
                return 'Object';
            }
        }
        // errors
        if (val instanceof Error) {
            return `${val.name}: ${val.message}\n${val.stack}`;
        }
        // TODO we could test for more things here, like `Set`s and `Map`s.
        return className;
    }
    function _assertBigInt(n) {
        if (typeof n !== 'bigint')
            throw new Error('expected a bigint argument');
    }
    let cachedBigInt64Memory0 = null;
    function getBigInt64Memory0() {
        if (cachedBigInt64Memory0 === null || cachedBigInt64Memory0.byteLength === 0) {
            cachedBigInt64Memory0 = new BigInt64Array(wasmInstance.exports.memory.buffer);
        }
        return cachedBigInt64Memory0;
    }
    function makeMutClosure(arg0, arg1, dtor, f) {
        const state = { a: arg0, b: arg1, cnt: 1, dtor };
        const real = (...args) => {
            // First up with a closure we increment the internal reference
            // count. This ensures that the Rust closure environment won't
            // be deallocated while we're invoking it.
            state.cnt++;
            const a = state.a;
            state.a = 0;
            try {
                return f(a, state.b, ...args);
            }
            finally {
                if (--state.cnt === 0) {
                    wasmInstance.exports.__wbindgen_export_2.get(state.dtor)(a, state.b);
                }
                else {
                    state.a = a;
                }
            }
        };
        real.original = state;
        return real;
    }
    function logError(f, args) {
        try {
            return f.apply(this, args);
        }
        catch (e) {
            let error = (function () {
                try {
                    return e instanceof Error ? `${e.message}\n\nStack:\n${e.stack}` : e.toString();
                }
                catch (_) {
                    return '<failed to stringify thrown value>';
                }
            })();
            console.error('wasm-bindgen: imported JS function that was not marked as `catch` threw an error:', error);
            throw e;
        }
    }
    function __wbg_adapter_50(arg0, arg1, arg2) {
        wasmInstance.modifiedExports._dyn_core__ops__function__FnMut__A____Output___R_as_wasm_bindgen__closure__WasmClosure___describe__invoke__(arg0, arg1, addHeapObject(arg2));
    }
    /**
     * @param {any} interaction
     * @returns {Promise<any>}
     */
    function warpContractWrite(interaction) {
        const ret = wasmInstance.exports.warpContractWrite(addHeapObject(interaction));
        return takeObject(ret);
    }
    /**
     * @param {any} interaction
     * @returns {Promise<any | undefined>}
     */
    function handle(interaction) {
        var ret = wasmInstance.exports.handle(addHeapObject(interaction));
        return takeObject(ret);
    }
    let stack_pointer = 128;
    function addBorrowedObject(obj) {
        if (stack_pointer == 1)
            throw new Error('out of js stack');
        heap[--stack_pointer] = obj;
        return stack_pointer;
    }
    /**
     * @param {any} state
     * @returns {boolean}
     */
    function initState(state) {
        try {
            wasmInstance.exports.initState(addBorrowedObject(state));
        }
        finally {
            heap[stack_pointer++] = undefined;
        }
    }
    function initStateLegacy(state) {
        try {
            wasmInstance.exports.initState(addBorrowedObject(state));
        }
        finally {
            heap[stack_pointer++] = undefined;
        }
    }
    /**
     * @returns {any}
     */
    function currentState() {
        const ret = wasmInstance.exports.currentState();
        return takeObject(ret);
    }
    /**
     * @returns {number}
     */
    function version() {
        const ret = wasmInstance.exports.version();
        return ret;
    }
    /**
     * @returns {number}
     */
    function lang() {
        const ret = wasmInstance.exports.lang();
        return ret;
    }
    /**
     * @param {any} interaction
     * @returns {Promise<any>}
     */
    function warpContractView(interaction) {
        const ret = wasmInstance.exports.warpContractView(addHeapObject(interaction));
        return takeObject(ret);
    }
    function handleError(f, args) {
        try {
            return f.apply(this, args);
        }
        catch (e) {
            wasmInstance.exports.__wbindgen_exn_store(addHeapObject(e));
        }
    }
    function __wbg_adapter_114(arg0, arg1, arg2, arg3) {
        wasmInstance.modifiedExports.wasm_bindgen__convert__closures__invoke2_mut__(arg0, arg1, addHeapObject(arg2), addHeapObject(arg3));
    }
    function notDefined(what) {
        return () => {
            throw new Error(`${what} is not defined`);
        };
    }
    // mapping from base function names (without mangled suffixes)
    // to functions normally generated by the wasm-bindgen
    // - the "glue" code between js and wasm.
    const baseImports = {
        __wbindgen_json_parse: function (arg0, arg1) {
            const ret = JSON.parse(getStringFromWasm0(arg0, arg1));
            return addHeapObject(ret);
        },
        __wbindgen_json_serialize: function (arg0, arg1) {
            const obj = getObject(arg1);
            const ret = JSON.stringify(obj === undefined ? null : obj);
            const ptr0 = passStringToWasm0(ret, wasmInstance.exports.__wbindgen_malloc, wasmInstance.exports.__wbindgen_realloc);
            const len0 = WASM_VECTOR_LEN;
            getInt32Memory0()[arg0 / 4 + 1] = len0;
            getInt32Memory0()[arg0 / 4 + 0] = ptr0;
        },
        __wbindgen_error_new: function (arg0, arg1) {
            const ret = new Error(getStringFromWasm0(arg0, arg1));
            return addHeapObject(ret);
        },
        __wbindgen_is_undefined: function (arg0) {
            const ret = getObject(arg0) === undefined;
            return ret;
        },
        __wbindgen_in: function (arg0, arg1) {
            const ret = getObject(arg0) in getObject(arg1);
            return ret;
        },
        __wbindgen_number_get: function (arg0, arg1) {
            const obj = getObject(arg1);
            const ret = typeof obj === 'number' ? obj : undefined;
            getFloat64Memory0()[arg0 / 8 + 1] = isLikeNone(ret) ? 0 : ret;
            getInt32Memory0()[arg0 / 4 + 0] = !isLikeNone(ret);
        },
        __wbindgen_boolean_get: function (arg0) {
            const v = getObject(arg0);
            const ret = typeof v === 'boolean' ? (v ? 1 : 0) : 2;
            _assertNum(ret);
            return ret;
        },
        __wbindgen_is_null: function (arg0) {
            const ret = getObject(arg0) === null;
            _assertBoolean(ret);
            return ret;
        },
        __wbindgen_string_new: function (arg0, arg1) {
            const ret = getStringFromWasm0(arg0, arg1);
            return addHeapObject(ret);
        },
        __wbindgen_string_get: function (arg0, arg1) {
            const obj = getObject(arg1);
            const ret = typeof obj === 'string' ? obj : undefined;
            var ptr0 = isLikeNone(ret)
                ? 0
                : passStringToWasm0(ret, wasmInstance.exports.__wbindgen_malloc, wasmInstance.exports.__wbindgen_realloc);
            var len0 = WASM_VECTOR_LEN;
            getInt32Memory0()[arg0 / 4 + 1] = len0;
            getInt32Memory0()[arg0 / 4 + 0] = ptr0;
        },
        __wbindgen_is_bigint: function (arg0) {
            const ret = typeof getObject(arg0) === 'bigint';
            return ret;
        },
        __wbindgen_is_object: function (arg0) {
            const val = getObject(arg0);
            const ret = typeof val === 'object' && val !== null;
            return ret;
        },
        __wbindgen_object_clone_ref: function (arg0) {
            const ret = getObject(arg0);
            return addHeapObject(ret);
        },
        __wbindgen_jsval_eq: function (arg0, arg1) {
            const ret = getObject(arg0) === getObject(arg1);
            return ret;
        },
        __wbindgen_bigint_from_i64: function (arg0) {
            const ret = arg0;
            return addHeapObject(ret);
        },
        __wbindgen_bigint_from_u64: function (arg0) {
            const ret = BigInt.asUintN(64, arg0);
            return addHeapObject(ret);
        },
        __wbg_readContractState: function () {
            return handleError(function (arg0, arg1) {
                const ret = rawImports.SmartWeave.readContractState(getStringFromWasm0(arg0, arg1));
                return addHeapObject(ret);
            }, arguments);
        },
        __wbg_viewContractState: function () {
            return handleError(function (arg0, arg1, arg2) {
                const ret = rawImports.SmartWeave.viewContractState(getStringFromWasm0(arg0, arg1), takeObject(arg2));
                return addHeapObject(ret);
            }, arguments);
        },
        __wbg_write: function () {
            return handleError(function (arg0, arg1, arg2) {
                const ret = rawImports.SmartWeave.write(getStringFromWasm0(arg0, arg1), takeObject(arg2));
                return addHeapObject(ret);
            }, arguments);
        },
        __wbg_refreshState: function (arg0, arg1) {
            // TODO
        },
        __wbg_kvGet: function () {
            return handleError(function (arg0, arg1) {
                const ret = rawImports.KV.get(getStringFromWasm0(arg0, arg1));
                return addHeapObject(ret);
            }, arguments);
        },
        __wbg_kvPut: function () {
            return handleError(function (arg0, arg1, arg2) {
                const ret = rawImports.KV.put(getStringFromWasm0(arg0, arg1), takeObject(arg2));
                return addHeapObject(ret);
            }, arguments);
        },
        __wbg_kvDel: function () {
            return handleError(function (arg0, arg1) {
                const ret = rawImports.KV.del(getStringFromWasm0(arg0, arg1));
                return addHeapObject(ret);
            }, arguments);
        },
        __wbg_kvMap: function () {
            return handleError(function (arg0, arg1, arg2, arg3, arg4, arg5, arg6) {
                const ret = rawImports.KV.map(arg0 === 0 ? undefined : getStringFromWasm0(arg0, arg1), arg2 === 0 ? undefined : getStringFromWasm0(arg2, arg3), arg4 === 0xffffff ? undefined : arg4 !== 0, arg5 === 0 ? undefined : arg6 >>> 0);
                return addHeapObject(ret);
            }, arguments);
        },
        __wbg_kvKeys: function () {
            return handleError(function (arg0, arg1, arg2, arg3, arg4, arg5, arg6) {
                const ret = rawImports.KV.keys(arg0 === 0 ? undefined : getStringFromWasm0(arg0, arg1), arg2 === 0 ? undefined : getStringFromWasm0(arg2, arg3), arg4 === 0xffffff ? undefined : arg4 !== 0, arg5 === 0 ? undefined : arg6 >>> 0);
                return addHeapObject(ret);
            }, arguments);
        },
        __wbindgen_object_drop_ref: function (arg0) {
            takeObject(arg0);
        },
        __wbg_error: function () {
            return logError(function (arg0, arg1) {
                try {
                    rawImports.console.log(getStringFromWasm0(arg0, arg1));
                }
                finally {
                    wasmInstance.exports.__wbindgen_free(arg0, arg1);
                }
            }, arguments);
        },
        __wbg_new_abda76e883ba8a5f: function () {
            return logError(function () {
                const ret = new Error();
                return addHeapObject(ret);
            }, arguments);
        },
        __wbg_stack: function () {
            return logError(function (arg0, arg1) {
                let limit = Error.stackTraceLimit;
                Error.stackTraceLimit = 25;
                const ret = getObject(arg1).stack;
                const ptr0 = passStringToWasm0(ret, wasmInstance.exports.__wbindgen_malloc, wasmInstance.exports.__wbindgen_realloc);
                const len0 = WASM_VECTOR_LEN;
                getInt32Memory0()[arg0 / 4 + 1] = len0;
                getInt32Memory0()[arg0 / 4 + 0] = ptr0;
                Error.stackTraceLimit = limit;
            }, arguments);
        },
        __wbg_indephash: function () {
            return logError(function (arg0) {
                const ret = rawImports.Block.indep_hash();
                const ptr0 = passStringToWasm0(ret, wasmInstance.exports.__wbindgen_malloc, wasmInstance.exports.__wbindgen_realloc);
                const len0 = WASM_VECTOR_LEN;
                getInt32Memory0()[arg0 / 4 + 1] = len0;
                getInt32Memory0()[arg0 / 4 + 0] = ptr0;
            }, arguments);
        },
        __wbg_height: function () {
            return logError(function () {
                const ret = rawImports.Block.height();
                _assertNum(ret);
                return ret;
            }, arguments);
        },
        __wbg_timestamp: function () {
            return logError(function () {
                const ret = rawImports.Block.timestamp();
                _assertNum(ret);
                return ret;
            }, arguments);
        },
        __wbg_contractId: function () {
            return logError(function (arg0) {
                const ret = rawImports.Contract.id();
                const ptr0 = passStringToWasm0(ret, wasmInstance.exports.__wbindgen_malloc, wasmInstance.exports.__wbindgen_realloc);
                const len0 = WASM_VECTOR_LEN;
                getInt32Memory0()[arg0 / 4 + 1] = len0;
                getInt32Memory0()[arg0 / 4 + 0] = ptr0;
            }, arguments);
        },
        __wbg_contractOwner: function () {
            return logError(function (arg0) {
                const ret = rawImports.Contract.owner();
                const ptr0 = passStringToWasm0(ret, wasmInstance.exports.__wbindgen_malloc, wasmInstance.exports.__wbindgen_realloc);
                const len0 = WASM_VECTOR_LEN;
                getInt32Memory0()[arg0 / 4 + 1] = len0;
                getInt32Memory0()[arg0 / 4 + 0] = ptr0;
            }, arguments);
        },
        __wbg_id: function (arg0) {
            const ret = rawImports.Transaction.id();
            const ptr0 = passStringToWasm0(ret, wasmInstance.exports.__wbindgen_malloc, wasmInstance.exports.__wbindgen_realloc);
            const len0 = WASM_VECTOR_LEN;
            getInt32Memory0()[arg0 / 4 + 1] = len0;
            getInt32Memory0()[arg0 / 4 + 0] = ptr0;
        },
        __wbg_owner: function (arg0) {
            const ret = rawImports.Transaction.owner();
            const ptr0 = passStringToWasm0(ret, wasmInstance.exports.__wbindgen_malloc, wasmInstance.exports.__wbindgen_realloc);
            const len0 = WASM_VECTOR_LEN;
            getInt32Memory0()[arg0 / 4 + 1] = len0;
            getInt32Memory0()[arg0 / 4 + 0] = ptr0;
        },
        __wbg_target: function () {
            return logError(function (arg0) {
                const ret = rawImports.Transaction.target();
                const ptr0 = passStringToWasm0(ret, wasmInstance.exports.__wbindgen_malloc, wasmInstance.exports.__wbindgen_realloc);
                const len0 = WASM_VECTOR_LEN;
                getInt32Memory0()[arg0 / 4 + 1] = len0;
                getInt32Memory0()[arg0 / 4 + 0] = ptr0;
            }, arguments);
        },
        __wbg_caller: function (arg0) {
            const ret = rawImports.SmartWeave.caller();
            const ptr0 = passStringToWasm0(ret, wasmInstance.exports.__wbindgen_malloc, wasmInstance.exports.__wbindgen_realloc);
            const len0 = WASM_VECTOR_LEN;
            getInt32Memory0()[arg0 / 4 + 1] = len0;
            getInt32Memory0()[arg0 / 4 + 0] = ptr0;
        },
        __wbg_value_b245bf3240b21a48: function () {
            return logError(function (arg0) {
                const ret = rawImports.Vrf.value();
                const ptr0 = passStringToWasm0(ret, wasmInstance.exports.__wbindgen_malloc, wasmInstance.exports.__wbindgen_realloc);
                const len0 = WASM_VECTOR_LEN;
                getInt32Memory0()[arg0 / 4 + 1] = len0;
                getInt32Memory0()[arg0 / 4 + 0] = ptr0;
            }, arguments);
        },
        __wbg_value_7d69ddc3f1ad7876: function () {
            return logError(function (arg0) {
                const ret = rawImports.Vrf.value();
                const ptr0 = passStringToWasm0(ret, wasmInstance.exports.__wbindgen_malloc, wasmInstance.exports.__wbindgen_realloc);
                const len0 = WASM_VECTOR_LEN;
                getInt32Memory0()[arg0 / 4 + 1] = len0;
                getInt32Memory0()[arg0 / 4 + 0] = ptr0;
            }, arguments);
        },
        __wbg_vrfValue: function () {
            return logError(function (arg0) {
                const ret = rawImports.Vrf.value();
                const ptr0 = passStringToWasm0(ret, wasmInstance.exports.__wbindgen_malloc, wasmInstance.exports.__wbindgen_realloc);
                const len0 = WASM_VECTOR_LEN;
                getInt32Memory0()[arg0 / 4 + 1] = len0;
                getInt32Memory0()[arg0 / 4 + 0] = ptr0;
            }, arguments);
        },
        __wbg_randomInt: function () {
            return logError(function (arg0) {
                const ret = rawImports.Vrf.randomInt(arg0);
                _assertNum(ret);
                return ret;
            }, arguments);
        },
        __wbg_log: function (arg0, arg1) {
            console.log(getStringFromWasm0(arg0, arg1));
        },
        __wbindgen_cb_drop: function (arg0) {
            const obj = takeObject(arg0).original;
            if (obj.cnt-- == 1) {
                obj.a = 0;
                return true;
            }
            const ret = false;
            return ret;
        },
        __wbg_debug: function () {
            return logError(function (arg0) {
                console.log(getObject(arg0));
            }, arguments);
        },
        __wbg_String: function () {
            return logError(function (arg0, arg1) {
                const ret = String(getObject(arg1));
                const ptr0 = passStringToWasm0(ret, wasmInstance.exports.__wbindgen_malloc, wasmInstance.exports.__wbindgen_realloc);
                const len0 = WASM_VECTOR_LEN;
                getInt32Memory0()[arg0 / 4 + 1] = len0;
                getInt32Memory0()[arg0 / 4 + 0] = ptr0;
            }, arguments);
        },
        __wbg_getwithrefkey: function (arg0, arg1) {
            const ret = getObject(arg0)[getObject(arg1)];
            return addHeapObject(ret);
        },
        __wbg_set_841ac57cff3d672b: function (arg0, arg1, arg2) {
            getObject(arg0)[takeObject(arg1)] = takeObject(arg2);
        },
        __wbindgen_number_new: function (arg0) {
            const ret = arg0;
            return addHeapObject(ret);
        },
        __wbindgen_jsval_loose_eq: function (arg0, arg1) {
            const ret = getObject(arg0) == getObject(arg1);
            return ret;
        },
        __wbg_get_27fe3dac1c4d0224: function (arg0, arg1) {
            const ret = getObject(arg0)[arg1 >>> 0];
            return addHeapObject(ret);
        },
        __wbg_set_17224bc548dd1d7b: function (arg0, arg1, arg2) {
            getObject(arg0)[arg1 >>> 0] = takeObject(arg2);
        },
        __wbg_isArray: function (arg0) {
            const ret = Array.isArray(getObject(arg0));
            return ret;
        },
        __wbg_length_e498fbc24f9c1d4f: function (arg0) {
            const ret = getObject(arg0).length;
            return ret;
        },
        __wbg_new_b525de17f44a8943: function () {
            const ret = new Array();
            return addHeapObject(ret);
        },
        __wbg_instanceof_ArrayBuffer: function (arg0) {
            let result;
            try {
                result = getObject(arg0) instanceof ArrayBuffer;
            }
            catch {
                result = false;
            }
            const ret = result;
            return ret;
        },
        __wbg_call_95d1ea488d03e4e8: function () {
            return handleError(function (arg0, arg1) {
                const ret = getObject(arg0).call(getObject(arg1));
                return addHeapObject(ret);
            }, arguments);
        },
        __wbg_call_9495de66fdbe016b: function () {
            return handleError(function (arg0, arg1, arg2) {
                const ret = getObject(arg0).call(getObject(arg1), getObject(arg2));
                return addHeapObject(ret);
            }, arguments);
        },
        __wbg_call_94697a95cb7e239c: function () {
            return handleError(function (arg0, arg1, arg2) {
                const ret = getObject(arg0).call(getObject(arg1), getObject(arg2));
                return addHeapObject(ret);
            }, arguments);
        },
        __wbg_new_f841cc6f2098f4b5: function () {
            const ret = new Map();
            return addHeapObject(ret);
        },
        __wbg_set_388c4c6422704173: function (arg0, arg1, arg2) {
            const ret = getObject(arg0).set(getObject(arg1), getObject(arg2));
            return addHeapObject(ret);
        },
        __wbg_next_88560ec06a094dea: function () {
            return handleError(function (arg0) {
                const ret = getObject(arg0).next();
                return addHeapObject(ret);
            }, arguments);
        },
        __wbg_next_b7d530c04fd8b217: function (arg0) {
            const ret = getObject(arg0).next;
            return addHeapObject(ret);
        },
        __wbg_done: function (arg0) {
            const ret = getObject(arg0).done;
            return ret;
        },
        __wbg_value_6ac8da5cc5b3efda: function (arg0) {
            const ret = getObject(arg0).value;
            return addHeapObject(ret);
        },
        __wbg_isSafeInteger: function (arg0) {
            const ret = Number.isSafeInteger(getObject(arg0));
            return ret;
        },
        __wbg_entries: function (arg0) {
            const ret = Object.entries(getObject(arg0));
            return addHeapObject(ret);
        },
        __wbg_new_f9876326328f45ed: function () {
            const ret = new Object();
            return addHeapObject(ret);
        },
        __wbg_iterator: function () {
            const ret = Symbol.iterator;
            return addHeapObject(ret);
        },
        __wbg_new_9d3a9ce4282a18a8: function (arg0, arg1) {
            try {
                var state0 = { a: arg0, b: arg1 };
                var cb0 = (arg0, arg1) => {
                    const a = state0.a;
                    state0.a = 0;
                    try {
                        return __wbg_adapter_114(a, state0.b, arg0, arg1);
                    }
                    finally {
                        state0.a = a;
                    }
                };
                const ret = new Promise(cb0);
                return addHeapObject(ret);
            }
            finally {
                state0.a = state0.b = 0;
            }
        },
        __wbg_resolve: function (arg0) {
            const ret = Promise.resolve(getObject(arg0));
            return addHeapObject(ret);
        },
        __wbg_then_ec5db6d509eb475f: function (arg0, arg1) {
            const ret = getObject(arg0).then(getObject(arg1));
            return addHeapObject(ret);
        },
        __wbg_then_a6860c82b90816ca: function () {
            return logError(function (arg0, arg1) {
                const ret = getObject(arg0).then(getObject(arg1));
                return addHeapObject(ret);
            }, arguments);
        },
        __wbg_then_f753623316e2873a: function (arg0, arg1, arg2) {
            const ret = getObject(arg0).then(getObject(arg1), getObject(arg2));
            return addHeapObject(ret);
        },
        __wbg_then_58a04e42527f52c6: function () {
            return logError(function (arg0, arg1, arg2) {
                const ret = getObject(arg0).then(getObject(arg1), getObject(arg2));
                return addHeapObject(ret);
            }, arguments);
        },
        __wbg_instanceof_Uint8Array: function (arg0) {
            let result;
            try {
                result = getObject(arg0) instanceof Uint8Array;
            }
            catch {
                result = false;
            }
            const ret = result;
            return ret;
        },
        __wbg_new_537b7341ce90bb31: function (arg0) {
            const ret = new Uint8Array(getObject(arg0));
            return addHeapObject(ret);
        },
        __wbg_length_27a2afe8ab42b09f: function (arg0) {
            const ret = getObject(arg0).length;
            return ret;
        },
        __wbg_set_17499e8aa4003ebd: function (arg0, arg1, arg2) {
            getObject(arg0).set(getObject(arg1), arg2 >>> 0);
        },
        __wbindgen_is_function: function (arg0) {
            const ret = typeof getObject(arg0) === 'function';
            return ret;
        },
        __wbindgen_is_string: function (arg0) {
            const ret = typeof getObject(arg0) === 'string';
            return ret;
        },
        __wbg_buffer: function (arg0) {
            const ret = getObject(arg0).buffer;
            return addHeapObject(ret);
        },
        __wbg_get_baf4855f9a986186: function () {
            return handleError(function (arg0, arg1) {
                const ret = Reflect.get(getObject(arg0), getObject(arg1));
                return addHeapObject(ret);
            }, arguments);
        },
        __wbindgen_debug_string: function (arg0, arg1) {
            const ret = debugString(getObject(arg1));
            const ptr0 = passStringToWasm0(ret, wasmInstance.exports.__wbindgen_malloc, wasmInstance.exports.__wbindgen_realloc);
            const len0 = WASM_VECTOR_LEN;
            getInt32Memory0()[arg0 / 4 + 1] = len0;
            getInt32Memory0()[arg0 / 4 + 0] = ptr0;
        },
        __wbindgen_bigint_get_as_i64: function (arg0, arg1) {
            const v = getObject(arg1);
            const ret = typeof v === 'bigint' ? v : undefined;
            getBigInt64Memory0()[arg0 / 8 + 1] = isLikeNone(ret) ? BigInt(0) : ret;
            getInt32Memory0()[arg0 / 4 + 0] = !isLikeNone(ret);
        },
        __wbindgen_throw: function (arg0, arg1) {
            throw new Error(getStringFromWasm0(arg0, arg1));
        },
        __wbindgen_memory: function () {
            const ret = wasmInstance.exports.memory;
            return addHeapObject(ret);
        },
        __wbindgen_closure_wrapper: function (arg0, arg1, arg2) {
            const ret = makeMutClosure(arg0, arg1, dtorValue, __wbg_adapter_50);
            return addHeapObject(ret);
        }
    };
    const helpers = {
        _assertBoolean,
        _assertNum,
        addBorrowedObject,
        addHeapObject,
        getInt32Memory0,
        getObject,
        getStringFromWasm0,
        handleError,
        heap: () => heap,
        logError,
        notDefined,
        passStringToWasm0,
        takeObject,
        wasm: () => wasmInstance.exports,
        WASM_VECTOR_LEN: () => WASM_VECTOR_LEN,
        __wbg_adapter_1: __wbg_adapter_114,
        __wbg_adapter_5: __wbg_adapter_50
    };
    function wrapPluginMethod(f) {
        return function () {
            return logError(function (arg0) {
                const ret = f(takeObject(arg0));
                return addHeapObject(ret);
            }, arguments);
        };
    }
    function extensionsDefinedImports(swGlobal, helpers) {
        var _a, _b;
        let res = {};
        for (const [_, extension] of Object.entries(swGlobal.extensions)) {
            let imports = (_b = (_a = extension.rustImports) === null || _a === void 0 ? void 0 : _a.call(extension, helpers)) !== null && _b !== void 0 ? _b : {};
            for (const [fName, f] of Object.entries(imports)) {
                if (fName.startsWith('__wbg_')) {
                    res[fName] = f;
                }
                else {
                    res['__wbg_' + fName] = wrapPluginMethod(f);
                }
            }
        }
        return res;
    }
    const allBaseImports = { ...baseImports, ...extensionsDefinedImports(swGlobal, helpers) };
    const baseImportsKeys = Object.keys(allBaseImports);
    // assigning functions to "real" import names from the currently
    // compiled wasm module
    let module = wbindgenImports.reduce((acc, wbindgenKey) => {
        const baseImportsKey = baseImportsKeys.find((key) => wbindgenKey.startsWith(key));
        if (baseImportsKey === undefined) {
            throw new Error(`Cannot find import mapping for ${wbindgenKey}. Please file a bug.`);
        }
        if (baseImportsKeys.filter((key) => wbindgenKey.startsWith(key)).length != 1) {
            throw new Error(`Multiple import mappings for ${wbindgenKey}. Please file a bug.`);
        }
        if (acc.usedKeys.has(baseImportsKey)) {
            throw new Error(`Multiple methods maps to ${baseImportsKey}. Please file a bug.`);
        }
        acc.res[wbindgenKey] = allBaseImports[baseImportsKey];
        acc.usedKeys.add(baseImportsKey);
        return acc;
    }, { res: {}, usedKeys: new Set() }).res;
    if (warpContractsCrateVersion === '__WARP_CONTRACTS_VERSION_LEGACY') {
        module.initStateLegacy = initStateLegacy;
        module.handle = handle;
    }
    else {
        module.initState = initState;
        module.warpContractWrite = warpContractWrite;
        module.warpContractView = warpContractView;
    }
    module.currentState = currentState;
    module.version = version;
    module.lang = lang;
    // the rest of the code is basically left untouched from what
    // wasm-bindgen generates
    let imports = {};
    imports['__wbindgen_placeholder__'] = module;
    /**
     */
    class StateWrapper {
        __destroy_into_raw() {
            // @ts-ignore
            const ptr = this.ptr;
            // @ts-ignore
            this.ptr = 0;
            return ptr;
        }
        free() {
            const ptr = this.__destroy_into_raw();
            wasmInstance.exports.__wbg_statewrapper_free(ptr);
        }
    }
    module.StateWrapper = StateWrapper;
    imports.metering = rawImports.metering;
    return { imports, exports: module };
};
exports.rustWasmImports = rustWasmImports;
//# sourceMappingURL=rust-wasm-imports.js.map