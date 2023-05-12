import { Ref, computed } from "vue";

interface MessageData {
  fieldKey: string;
  value: unknown;
}

class BroadcastChannelManager {
  private static instance: BroadcastChannelManager;

  private readonly channel: BroadcastChannel;

  private constructor() {
    this.channel = new BroadcastChannel("cross_page_binding");
  }

  public static getInstance(): BroadcastChannelManager {
    if (!BroadcastChannelManager.instance) {
      BroadcastChannelManager.instance = new BroadcastChannelManager();
    }
    return BroadcastChannelManager.instance;
  }

  public getMessage<MessageData>(callback: (data: MessageData) => void): void {
    this.channel.onmessage = (event: MessageEvent<MessageData>) => {
      callback(event.data);
    };
  }

  public postMessage<MessageData>(data: MessageData): void {
    this.channel.postMessage(data);
  }

  public close(): void {
    this.channel.close();
  }
}

export function binding<T>(val: Ref<T>): (fieldKey: string) => Ref<T> {
  return function useBinding(fieldKey: string): Ref<T> {
    const manager = BroadcastChannelManager.getInstance();

    manager.getMessage((data: MessageData) => {
      console.debug("getMessage", data, fieldKey);
      if (data.fieldKey === fieldKey) {
        val.value = data.value as T;
      }
    });

    return computed<T>({
      get: () => val.value,
      set: (value: T) => {
        val.value = value;
        console.debug("fieldKey", fieldKey);
        manager.postMessage({ fieldKey, value });
      },
    });
  };
}

export function closeBroadcastChannel(): void {
  const manager = BroadcastChannelManager.getInstance();
  manager.close();
}
