# vite-build-lack-code-demo

i use `@elastic/apm-rum-vue` , and use its export function `ApmVuePlugin`

```javascript
import { createApp } from 'vue'
import App from './App.vue'

import { ApmVuePlugin } from "@elastic/apm-rum-vue";

const app = createApp(App);
app.use(ApmVuePlugin);

app.mount('#app')
```

and then i build project

but the function `patchEventTarget` in file named `event-target-patch.js` is not build into the dist file.

source file in `@elastic/apm-rum-core/dist/es/common/patching/index.js`

```javascript
function patchAll() {
  if (!alreadyPatched) {
    alreadyPatched = true;
    patchXMLHttpRequest(function (event, task) {
      patchEventHandler.send(XMLHTTPREQUEST, [event, task]);
    });
    patchFetch(function (event, task) {
      patchEventHandler.send(FETCH, [event, task]);
    });
    patchHistory(function (event, task) {
      patchEventHandler.send(HISTORY, [event, task]);
    });
    patchEventTarget(function (event, task) {
      patchEventHandler.send(EVENT_TARGET, [event, task]);
    });
  }

  return patchEventHandler;
}
```

dist file `index.xxxxxx.js` (build.minify = `false`)

```javascript
function patchAll() {
  if (!alreadyPatched) {
    alreadyPatched = true;
    patchXMLHttpRequest(function(event, task) {
      patchEventHandler.send(XMLHTTPREQUEST, [event, task]);
    });
    patchFetch(function(event, task) {
      patchEventHandler.send(FETCH, [event, task]);
    });
    patchHistory(function(event, task) {
      patchEventHandler.send(HISTORY, [event, task]);
    });
    // patchEventTarget disappeared ...
  }
  return patchEventHandler;
}
```

but when i add a `console.log()` , build it again and function `patchEventTarget` is exist in dist file...

add `console.log` in `@elastic/apm-rum-core/dist/es/common/patching/index.js`

```javascript
function patchAll() {
  if (!alreadyPatched) {
    alreadyPatched = true;
    patchXMLHttpRequest(function (event, task) {
      patchEventHandler.send(XMLHTTPREQUEST, [event, task]);
    });
    patchFetch(function (event, task) {
      patchEventHandler.send(FETCH, [event, task]);
    });
    patchHistory(function (event, task) {
      patchEventHandler.send(HISTORY, [event, task]);
    });
    // add a console to read patchEventTarget
    console.log(patchEventTarget);
    patchEventTarget(function (event, task) {
      patchEventHandler.send(EVENT_TARGET, [event, task]);
    });
  }

  return patchEventHandler;
}
```

or add `console.log` in `@elastic/apm-rum-core/dist/es/common/patching/event-target-patch.js`

```javascript
export function patchEventTarget(callback) {
  if (!window.EventTarget) {
    return;
  }
  
  console.log('hello');

  var proto = window.EventTarget.prototype;
  var nativeAddEventListener = proto[ADD_EVENT_LISTENER_STR];
  var nativeRemoveEventListener = proto[REMOVE_EVENT_LISTENER_STR];

  // other code 
}
```

last i set the build.rollupOptions.treeshake = false to solve problem.

it seems that function `patchEventTarget` is regarded as something which can be treeshake...
