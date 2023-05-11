import { Ref, computed } from "vue"

export function binding<T>(val: Ref<T>, id: string) {
  const channel = new BroadcastChannel('cross_page_binding_' + id);
  channel.onmessage = (messageEvent: MessageEvent<T>) => {
    val.value = messageEvent.data
  }
  channel.postMessage(val.value)
  return computed<T>({
    get: () => {
      return val.value
    },
    set: (newVal: T) => {
      val.value = newVal
      channel.postMessage(newVal)
    }
  })
}