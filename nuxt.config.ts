// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: "2024-04-03",
  devtools: { enabled: false },
  app: {
    pageTransition: { name: "page", mode: "out-in" },
  },

  runtimeConfig: {
    public: {
      IMAGE_URLPREFIX: process.env.IMAGE_URLPREFIX,
    },
  },

  postcss: {
    plugins: {
      tailwindcss: {},
      autoprefixer: {},
    },
  },

  css: ["~/assets/css/main.css"],

  modules: [
    "nuxt-highcharts",
    [
      "@nuxtjs/google-fonts",
      {
        families: {
          Mulish: [400, 500, 600, 700],
        },
      },
    ],
  ],
});
