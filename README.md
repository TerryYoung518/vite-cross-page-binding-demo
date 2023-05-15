# Vite Cross Page Binding Demo
# 跨页面数据双向绑定

这个项目使用了原生JS的`BroadcastChannel`类，实现了同源页面的跨页面数据双向绑定。

## 使用方法

参见[HelloWorld.vue](./src/components/HelloWorld.vue)

引入`BindCast.ts`：

```typescript
import { bind } from './BindCast'
```

创建`ref`或`reactive`后传入，使用返回的代理对象。

```typescript
const countBind = bind(ref(0), 'count')
```

## 运行样例

```npm
npm install
npm run dev
```

打开两个页面（如：`http://localhost:5173/`），点击`count is `按钮，两个页面数据同步变换。
