<script setup lang="ts">
import { ref, onBeforeUnmount, reactive } from 'vue'
import { bind, closeBroadcastChannel } from './BindCast'

defineProps<{ msg: string }>()

const count = ref(0)
const countBind = bind(count, "count")
const anotherCount = ref(99)
const anotherCountBind = bind(anotherCount, "anotherCount")

// 此处使用 ref 同样有效
const complexRef = reactive({
  count: 0,
  deep: {
    count: 0
  }
})
const complexRefBind = bind(complexRef, "complexRef")

const array = ref([1])
const arrayBind = bind(array, "array")

console.log(array)
console.log(arrayBind)

onBeforeUnmount(() => {
  closeBroadcastChannel()
})

</script>

<template>
  <h1>{{ msg }}</h1>

  <div class="card">
    <button type="button" @click="countBind++">count is {{ countBind }}</button>
    <button type="button" @click="anotherCountBind++">anotherCount is {{ anotherCountBind }}</button>
    <button type="button" @click="complexRefBind.count++">complexRef.count is {{ complexRefBind.count }}</button>
    <button type="button" @click="complexRefBind.deep.count++">complexRef.deep.count is {{ complexRefBind.deep.count }}</button>
    <button type="button" @click="arrayBind.push(1)">array is {{ arrayBind }}</button>
    <p>
      Edit
      <code>components/HelloWorld.vue</code> to test HMR
    </p>
  </div>

  <p>
    Check out
    <a href="https://vuejs.org/guide/quick-start.html#local" target="_blank"
      >create-vue</a
    >, the official Vue + Vite starter
  </p>
  <p>
    Install
    <a href="https://github.com/vuejs/language-tools" target="_blank">Volar</a>
    in your IDE for a better DX
  </p>
  <p class="read-the-docs">Click on the Vite and Vue logos to learn more</p>
</template>

<style scoped>
.read-the-docs {
  color: #888;
}
</style>
