import { createApp } from "vue";
import { createPinia } from "pinia";
import App from "./App.vue";
import { URL_PORT_KEY, STORAGE_PORT_KEY } from "@/adapters/injectionKeys";
import { createBrowserUrlAdapter } from "@/adapters/browserUrlAdapter";
import { createBrowserStorageAdapter } from "@/adapters/browserStorageAdapter";

import "@/assets/scss/global.scss";

const app = createApp(App);

app.provide(URL_PORT_KEY, createBrowserUrlAdapter());
app.provide(STORAGE_PORT_KEY, createBrowserStorageAdapter());
app.use(createPinia());

app.mount("#app");
