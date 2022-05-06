import axios from 'axios';
/**
 * A {@link BlockHeightSwCache} implementation that delegates all its methods
 * to remote endpoints.
 *
 * TODO: this could be further optimised - i.e. with the help of "level 1" memory cache
 * that would store max X elements - and would be backed up by the "level 2" remote cache.
 */
export class RemoteBlockHeightCache {
    /**
     * @param type - id/type of the cache, that will allow to identify
     * it server side (e.g. "STATE" or "INTERACTIONS")
     * @param baseURL - the base url of the remote endpoint that serves
     * cache data (e.g. "http://localhost:3000")
     */
    constructor(type, baseURL) {
        this.type = type;
        this.baseURL = baseURL;
        this.axios = axios.create({
            baseURL: baseURL
        });
    }
    /**
     * GET '/last/:type/:key
     */
    async getLast(key) {
        const response = await this.axios.get(`/last/${this.type}/${key}`);
        return response.data || null;
    }
    /**
     * GET '/less-or-equal/:type/:key/:blockHeight
     */
    async getLessOrEqual(key, blockHeight) {
        const response = await this.axios.get(`/less-or-equal/${this.type}/${key}/${blockHeight}`);
        return response.data || null;
    }
    /**
     * TODO: data should "flushed" in batches...
     * PUT '/:type/:key/:blockHeight' {data: value}
     */
    async put({ cacheKey, blockHeight }, value) {
        if (!value) {
            return;
        }
        await this.axios.put(`/${this.type}/${cacheKey}/${blockHeight}`, value);
    }
    /**
     * GET '/contains/:type/:key'
     */
    async contains(key) {
        const response = await this.axios.get(`/contains/${this.type}/${key}`);
        return response.data;
    }
    /**
     * GET '/:type/:key/:blockHeight'
     */
    async get(key, blockHeight) {
        const response = await this.axios.get(`/${this.type}/${key}/${blockHeight}`);
        return response.data || null;
    }
    flush() {
        return Promise.resolve(undefined);
    }
}
//# sourceMappingURL=RemoteBlockHeightCache.js.map