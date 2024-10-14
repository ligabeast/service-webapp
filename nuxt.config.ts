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

  css: ["~/assets/css/main.css"],

  modules: [
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
