export class ExecutionCache<TInputs extends Array<unknown>, TOutput> {
  private readonly cache = new Map<string, Promise<TOutput>>();

  constructor(private readonly handler: (...args: TInputs) => Promise<TOutput>) {}
  
  async fire(key: string, ...args: TInputs): Promise<TOutput> {
    const cachedExecution = this.cache.get(key);
    if (cachedExecution) {
      return cachedExecution;
    }

    const execution = this.handler(...args);
    this.cache.set(key, execution);

    return execution;
  }
}
