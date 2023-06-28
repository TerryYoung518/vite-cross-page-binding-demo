import { isRef } from 'vue';

class LocalstorageManager {
  private static instance: LocalstorageManager;

  private readonly saves: Record<string, Function> = {};
  private readonly loads: Record<string, Function> = {};

  private constructor() {
    window.addEventListener('storage', this.handleStorageEvent);
  }

  public static getInstance(): LocalstorageManager {
    if (!LocalstorageManager.instance) {
      LocalstorageManager.instance = new LocalstorageManager();
    }
    return LocalstorageManager.instance;
  }

  private handleStorageEvent = (e: Event) => {
    const fieldKey = (e as StorageEvent).key ?? "";
    this.loads[fieldKey]?.();
  }

  public save(fieldKey: string) {
    this.saves[fieldKey]?.();
  }

  public load(fieldKey: string) {
    this.loads[fieldKey]?.();
  }

  public bindSave(
    callback: () => void,
    fieldKey: string
  ): void {
    this.saves[fieldKey] = this.saves[fieldKey] || callback;
  }

  public bindLoad(
    callback: () => void,
    fieldKey: string
  ): void {
    this.loads[fieldKey] = this.loads[fieldKey] || callback;
  }

  public close(): void {
    document.removeEventListener('storage', this.handleStorageEvent);
  }
}

export function bind<T>(target: T, fieldKey: string, parent: boolean = true): T {
  if (typeof target !== "object" || target == null) {
    return target;
  }

  const manager = LocalstorageManager.getInstance();

  const observed = new Proxy(target, {
    get(target, key, receiver) {
      if (key === '__v_raw') { // 触发vue proxy中setter的trigger使dom更新
        return target
      }
      const result = Reflect.get(target, key, receiver);

      return bind(result, fieldKey, false);
    },
    set(target, key, value, receiver) {
      let oldValue = target[key as keyof T];
      
      const result = Reflect.set(target, key, value, receiver);

      // oldValue !== value 防止回声
      // key.toString()[0] !== '_' 不广播私有变量，否则RefImpl的_rawValue与_value被提前改变，导致dom不更新
      if (oldValue !== value && key.toString()[0] !== '_') manager.save(fieldKey);
      return result;
    },
  });

  if (parent) {
    if (isRef(target)) {
      manager.bindSave(() => {
        localStorage.setItem(fieldKey, JSON.stringify(target.value));
      }, fieldKey)
  
      manager.bindLoad(() => {
        let newValue = JSON.parse(localStorage.getItem(fieldKey) ?? '{}');
        target.value = newValue;
      }, fieldKey)
    } else {
      manager.bindSave(() => {
        localStorage.setItem(fieldKey, JSON.stringify(target));
      }, fieldKey)
  
      manager.bindLoad(() => {
        let newTarget = JSON.parse(localStorage.getItem(fieldKey) ?? '{}');
        for (const key in newTarget) {
          (target as any)[key] = (newTarget as any)[key];
        }
      }, fieldKey)
    }
    manager.load(fieldKey);
  }

  return observed;
}

export function removeStorageListener(): void {
  const manager = LocalstorageManager.getInstance();
  manager.close();
}