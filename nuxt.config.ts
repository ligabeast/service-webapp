// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: "2024-04-03",
  devtools: { enabled: false },

  postcss: {
    plugins: {
      tailwindcss: {},
      autoprefixer: {},
    },
  },

  css: [
    "~/assets/css/main.css",
    "notivue/animations.css",
    "notivue/notification.css",
  ],

  modules: [
    "notivue/nuxt",
    [
      "@nuxtjs/google-fonts",
      {
        families: {
          Mulish: [400, 500, 600, 700],
        },
      },
    ],
  ],
  notivue: {
    position: "top-right",
    limit: 4,
    enqueue: true,
    avoidDuplicates: true,
    notifications: {
      global: {
        duration: 10000,
      },
    },
  },
});
