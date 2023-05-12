import { Ref, computed } from "vue";

interface MessageData {
  fieldKey: string;
  value: unknown;
}

class BroadcastChannelManager {
  private static instance: BroadcastChannelManager;

  private readonly channel: BroadcastChannel;

  private readonly callbacks: Record<string, Function> = {};

  private constructor() {
    this.channel = new BroadcastChannel("cross_page_binding");
    this.channel.onmessage = (event: MessageEvent<MessageData>) => {
      this.callbacks[event.data.fieldKey]?.(event.data);
    };
  }

  public static getInstance(): BroadcastChannelManager {
    if (!BroadcastChannelManager.instance) {
      BroadcastChannelManager.instance = new BroadcastChannelManager();
    }
    return BroadcastChannelManager.instance;
  }

  public getMessage<MessageData>(
    callback: (data: MessageData) => void,
    fieldKey: string
  ): void {
    this.callbacks[fieldKey] = this.callbacks[fieldKey] || callback;
  }

  public postMessage<MessageData>(data: MessageData): void {
    this.channel.postMessage(data);
  }

  public close(): void {
    this.channel.close();
  }
}

export function binding<T>(val: Ref<T>, fieldKey: string): Ref<T> {
  const manager = BroadcastChannelManager.getInstance();

  manager.getMessage<MessageData>((data) => {
    if (data.fieldKey === fieldKey) {
      val.value = data.value as T;
    }
  }, fieldKey);

  return computed<T>({
    get: () => val.value,
    set: (value: T) => {
      val.value = value;
      manager.postMessage({ fieldKey, value });
    },
  });
}

export function closeBroadcastChannel(): void {
  const manager = BroadcastChannelManager.getInstance();
  manager.close();
}
