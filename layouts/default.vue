<template>
  <div class="flex flex-col items-center font-[mulish] h-dvh w-dvw">
    <div class="w-full h-full overflow-y-auto overflow-x-hidden">
      <slot></slot>
      <ClientOnly>
        <NotificationContainer />
      </ClientOnly>
    </div>
    <div
      class="h-20 w-full flex justify-between items-center bg-[#555D50] px-8"
    >
      <NuxtLink to="/newOrder">
        <button class="hover:scale-125 transition">
          <svg
            class="w-6 h-6 text-white fill-white"
            viewBox="0 0 96 96"
            xmlns="http://www.w3.org/2000/svg"
            stroke="#ffffff"
          >
            <g id="SVGRepo_bgCarrier" stroke-width="0" />

            <g
              id="SVGRepo_tracerCarrier"
              stroke-linecap="round"
              stroke-linejoin="round"
            />

            <g id="SVGRepo_iconCarrier">
              <title />
              <g>
                <path
                  d="M66,42H54V30a6,6,0,0,0-12,0V42H30a6,6,0,0,0,0,12H42V66a6,6,0,0,0,12,0V54H66a6,6,0,0,0,0-12Z"
                />
                <path
                  d="M48,0A48,48,0,1,0,96,48,48.0512,48.0512,0,0,0,48,0Zm0,84A36,36,0,1,1,84,48,36.0393,36.0393,0,0,1,48,84Z"
                />
              </g>
            </g>
          </svg>
        </button>
      </NuxtLink>
      <NuxtLink to="/home">
        <button class="hover:scale-125 transition">
          <svg
            class="w-8 h-8 text-white fill-white"
            viewBox="0 0 16 16"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              fill-rule="evenodd"
              clip-rule="evenodd"
              d="M8 0L0 6V8H1V15H4V10H7V15H15V8H16V6L14 4.5V1H11V2.25L8 0ZM9 10H12V13H9V10Z"
            />
          </svg>
        </button>
      </NuxtLink>

      <div class="flex justify-between space-x-10">
        <!-- <div class="w-6">
          <NuxtLink to="/statistics">
            <button class="hover:scale-125 transition">
              <svg
                class="w-6 h-6 text-white fill-white"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <line class="a" x1="2" x2="22" y1="20" y2="20" />
                <path
                  class="a"
                  d="M5,20V8.2A.2.2,0,0,1,5.2,8H7.8a.2.2,0,0,1,.2.2V20"
                />
                <path
                  class="a"
                  d="M11,20V4.26667C11,4.11939,11.08954,4,11.2,4h2.6c.11046,0,.2.11939.2.26667V20"
                />
                <path
                  class="a"
                  d="M17,20V11.15c0-.08284.08954-.15.2-.15h2.6c.11046,0,.2.06716.2.15V20"
                />
              </svg>
            </button>
          </NuxtLink>
        </div> -->

        <div class="w-6">
          <NuxtLink to="/ongoingOrders">
            <button class="hover:scale-125 transition">
              <svg
                fill="#000000"
                class="w-6 h-6 text-white fill-white"
                version="1.1"
                xmlns:sketch="http://www.bohemiancoding.com/sketch/ns"
                xmlns="http://www.w3.org/2000/svg"
                xmlns:xlink="http://www.w3.org/1999/xlink"
                viewBox="0 0 24 24"
                xml:space="preserve"
              >
                <g id="active">
                  <path
                    d="M8.6,20.1l-7.8-8l1.4-1.4l6.4,6.5L21.8,3.9l1.4,1.4L8.6,20.1z"
                  />
                </g>
              </svg>
            </button>
          </NuxtLink>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
html,
body,
#__nuxt {
  height: 100%;
  margin: 0;
  padding: 0;
}

#__nuxt {
  display: flex;
  flex-direction: column;
}
</style>
