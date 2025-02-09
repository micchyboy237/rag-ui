import { v4 as uuidv4 } from "uuid";

type RequestData = { [key: string]: any };

interface QueueItem {
  id: string;
  requestData: RequestData;
  controller: AbortController;
}

export class FetchStreamQueue {
  private queue: QueueItem[] = [];
  private running: QueueItem | null = null;

  private isEqual(a: RequestData, b: RequestData): boolean {
    return JSON.stringify(a) === JSON.stringify(b);
  }

  add(
    requestData: RequestData,
    process: (item: QueueItem) => Promise<void>
  ): string {
    // Prevent duplicates
    if (
      (this.running && this.isEqual(this.running.requestData, requestData)) ||
      this.queue.some((item) => this.isEqual(item.requestData, requestData))
    ) {
      return "";
    }

    const newItem: QueueItem = {
      id: uuidv4(), // Generate a unique ID
      requestData,
      controller: new AbortController(),
    };

    this.queue.push(newItem);
    this.processNext(process);

    return newItem.id;
  }

  private async processNext(process: (item: QueueItem) => Promise<void>) {
    if (this.running || this.queue.length === 0) return;

    this.running = this.queue.shift()!;
    await process(this.running);
    this.running = null;
    this.processNext(process); // Process next item
  }

  cancelById(id: string) {
    if (this.running?.id === id) {
      this.running.controller.abort();
      this.running = null;
    } else {
      this.queue = this.queue.filter((item) => item.id !== id);
    }
  }

  cancelCurrent() {
    if (this.running) {
      this.running.controller.abort();
      this.running = null;
    }
  }

  cancelAll() {
    if (this.running) {
      this.running.controller.abort();
      this.running = null;
    }
    this.queue.forEach((item) => item.controller.abort());
    this.queue = [];
  }

  clear() {
    this.cancelAll();
  }
}

export type FetchStreamQueueType = InstanceType<typeof FetchStreamQueue>;

export const fetchStreamQueue = new FetchStreamQueue();
