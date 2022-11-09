import { WriteInteractionOptions, WriteInteractionResponse } from './Contract';
import { HandlerBasedContract } from './HandlerBasedContract';
import { PstState, PstContract, BalanceResult, TransferInput } from './PstContract';

interface BalanceInput {
  function: string;
  target: string;
}

export class PstContractImpl extends HandlerBasedContract<PstState> implements PstContract {
  async currentBalance(target: string): Promise<BalanceResult> {
    const interactionResult = await this.viewState<BalanceInput, BalanceResult>({ function: 'balance', target });
    if (interactionResult.type !== 'ok') {
      throw Error(interactionResult.errorMessage);
    }
    return interactionResult.result;
  }

  async currentState(): Promise<PstState> {
    return (await super.readState()).cachedValue.state;
  }

  async transfer(
    transfer: TransferInput,
    options?: WriteInteractionOptions
  ): Promise<WriteInteractionResponse<unknown> | null> {
    return await this.writeInteraction<any>({ function: 'transfer', ...transfer }, options);
  }
}
