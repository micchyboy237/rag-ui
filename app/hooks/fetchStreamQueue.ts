type RequestData = { [key: string]: any };

class FetchStreamQueue {
  private queue: RequestData[] = [];
  private running: RequestData | null = null;

  private isEqual(a: RequestData, b: RequestData): boolean {
    return JSON.stringify(a) === JSON.stringify(b);
  }

  add(requestData: RequestData, process: (req: RequestData) => Promise<void>) {
    if (
      (this.running && this.isEqual(this.running, requestData)) ||
      this.queue.some((item) => this.isEqual(item, requestData))
    ) {
      return;
    }

    this.queue.push(requestData);
    this.processNext(process);
  }

  private async processNext(process: (req: RequestData) => Promise<void>) {
    if (this.running || this.queue.length === 0) return;

    this.running = this.queue.shift()!;
    await process(this.running);
    this.running = null;
    this.processNext(process); // Process next item
  }

  clear() {
    this.queue = [];
    this.running = null;
  }
}

export const fetchStreamQueue = new FetchStreamQueue();
