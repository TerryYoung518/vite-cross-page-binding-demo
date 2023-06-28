# Vite Cross Page Binding Demo
# 跨页面数据双向绑定

这个项目使用了原生JS的`BroadcastChannel`类，实现了同源页面的跨页面数据双向绑定。

这个项目还新增了基于原生JS的`localStorage`的实现，相比于`BroadcastChannel`的优点在于数据的本地存储与自动加载。

## 使用方法

### BroadcastChannel方式

实现参见[BindCast.ts](./src/components/BindCast.ts)

使用参见[HelloWorld.vue](./src/components/HelloWorld.vue)

引入`BindCast.ts`：

```typescript
import { bind, closeBroadcastChannel } from './BindCast'
```

创建`ref`或`reactive`后传入，并传入一个唯一的键名作为绑定依据，使用返回的代理对象。

```typescript
const countBind = bind(ref(0), 'count')
```

在`onBeforeUnmount`中使用`closeBroadcastChannel()`回收资源。

```typescript
onBeforeUnmount(() => {
  closeBroadcastChannel()
})
```

### localStorage方式

实现参见[BindStorage.ts](./src/components/BindStorage.ts)

使用参见[HelloWorld.vue](./src/components/HelloWorld.vue)

引入`BindStorage.ts`：

```typescript
import { bind, removeStorageListener } from './BindStorage'
```

创建`ref`或`reactive`后传入，并传入一个唯一的键名作为绑定依据，使用返回的代理对象。浏览器的`localStorage`中会以传入的键名存储有效数据。

```typescript
const countBind = bind(ref(0), 'count')
```

在`onBeforeUnmount`中使用`removeStorageListener()`回收资源。

```typescript
onBeforeUnmount(() => {
  removeStorageListener()
})
```

## 运行样例

```npm
npm install
npm run dev
```

打开两个页面（如：`http://localhost:5173/`），点击`count is `按钮，两个页面数据同步变换。
