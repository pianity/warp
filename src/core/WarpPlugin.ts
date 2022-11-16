export const knownWarpPlugins = ['evm-signature-verification', 'smartweave-extension', 'subscription'] as const;
export type WarpPluginType = typeof knownWarpPlugins[number];

export interface WarpPlugin<T, R> {
  type(): WarpPluginType;

  process(input: T): R;
}