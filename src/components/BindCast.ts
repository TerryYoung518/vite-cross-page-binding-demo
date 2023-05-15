interface MessageData {
  fieldKey: string;
  value: unknown;
  key: string | symbol;
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

export function bind<T>(target: T, fieldKey: string): T {
  if (typeof target !== "object" || target == null) {
    return target;
  }

  const manager = BroadcastChannelManager.getInstance();

  const observed = new Proxy(target, {
    get(target, key, receiver) {
      if (key === '__v_raw') { // 触发vue proxy中setter的trigger使dom更新
        return target
      }
      const result = Reflect.get(target, key, receiver);

      return bind(result, fieldKey + '.' + key.toString());
    },
    set(target, key, value, receiver) {
      let oldValue = target[key as keyof T];
      
      const result = Reflect.set(target, key, value, receiver);
      // oldValue !== value 防止回声
      // key.toString()[0] !== '_' 不广播私有变量，否则RefImpl的_raw_value与_value被提前改变，导致dom不更新
      if (oldValue !== value && key.toString()[0] !== '_') manager.postMessage({ fieldKey, value, key });
      return result;
    },
  });

  manager.getMessage<MessageData>((data) => {
    console.log(data)
    if (data.fieldKey === fieldKey) {
      observed[data.key as keyof T] = data.value as any;
    }
  }, fieldKey);

  return observed;
}

export function closeBroadcastChannel(): void {
  const manager = BroadcastChannelManager.getInstance();
  manager.close();
}
