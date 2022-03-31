import { createApp } from 'vue'
import App from './App.vue'

import { ApmVuePlugin } from "@elastic/apm-rum-vue";

const app = createApp(App);
app.use(ApmVuePlugin);

app.mount('#app')
