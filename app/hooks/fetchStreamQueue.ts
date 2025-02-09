import { v4 as uuidv4 } from "uuid";

type RequestData = { [key: string]: any };

interface QueueItem {
  id: string;
  requestData: RequestData;
  eventSource: EventSource | null;
}

export class FetchStreamQueue {
  private queue: QueueItem[] = [];
  private running: QueueItem | null = null;

  private isEqual(a: RequestData, b: RequestData): boolean {
    return JSON.stringify(a) === JSON.stringify(b);
  }

  private filterRequestData(requestData: RequestData): RequestData {
    return Object.fromEntries(
      Object.entries(requestData).filter(
        ([_, value]) => value !== null && value !== undefined && value !== ""
      )
    );
  }

  add(requestData: RequestData, process: (item: QueueItem) => void): string {
    const filteredData = this.filterRequestData(requestData);

    if (
      (this.running && this.isEqual(this.running.requestData, filteredData)) ||
      this.queue.some((item) => this.isEqual(item.requestData, filteredData))
    ) {
      return "";
    }

    const newItem: QueueItem = {
      id: uuidv4(),
      requestData: filteredData,
      eventSource: null,
    };

    this.queue.push(newItem);
    this.processNext(process);
    return newItem.id;
  }

  private processNext(process: (item: QueueItem) => void) {
    if (this.running || this.queue.length === 0) return;
    this.running = this.queue.shift()!;
    process(this.running);
  }

  cancelById(id: string) {
    if (this.running?.id === id) {
      this.running.eventSource?.close();
      this.running = null;
    } else {
      this.queue = this.queue.filter((item) => item.id !== id);
    }
  }

  cancelAll() {
    if (this.running) {
      this.running.eventSource?.close();
      this.running = null;
    }
    this.queue.forEach((item) => item.eventSource?.close());
    this.queue = [];
  }
}

export type FetchStreamQueueType = InstanceType<typeof FetchStreamQueue>;
export const fetchStreamQueue = new FetchStreamQueue();
