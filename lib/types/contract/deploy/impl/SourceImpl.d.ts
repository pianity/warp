/// <reference types="node" />
import { Source, SigningFunction } from '../../..';
import Arweave from 'arweave';
import { ArWallet } from '../CreateContract';
export interface SourceData {
    src: string | Buffer;
    wasmSrcCodeDir?: string;
    wasmGlueCode?: string;
}
export declare class SourceImpl implements Source {
    private readonly arweave;
    private readonly logger;
    constructor(arweave: Arweave);
    save(contractData: SourceData, signer: ArWallet | SigningFunction, useBundler?: boolean): Promise<any>;
    private isGoModule;
    private joinBuffers;
    private zipContents;
}
//# sourceMappingURL=SourceImpl.d.ts.map