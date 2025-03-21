<template>
  <div class="flex flex-col" v-if="!loading">
    <PositionInsertModal
      v-if="showNewPositionModal"
      @close="showNewPositionModal = false"
      @add="handlePushMaterial"
      :materials="possibleMaterials"
    />
    <div class="flex flex-col space-y-2 pb-4">
      <h1 class="font-semibold text-2xl p-4">Auftragsinformationen</h1>

      <!-- Auftrag Details -->
      <div class="flex p-4 justify-between space-x-2">
        <div class="w-1/2 font-medium">Anschrift</div>
        <div class="w-[1px] border border-black"></div>
        <div
          v-if="order?.adress"
          v-html="order?.adress"
          class="h-90 whitespace-pre-line w-1/2"
        ></div>
      </div>
      <div class="flex p-4 justify-between space-x-2">
        <div class="w-1/2 font-medium">KLS-ID</div>
        <div class="w-[1px] border border-black"></div>
        <NuxtLink
          class="h-90 whitespace-pre-line w-1/2 underline text-blue-600"
          :to="`/imagesLookup/${order?.kls_id}?currentPage=${currentPage}&orderid=${order?.id}&adress=${order?.adress}`"
          >{{ order?.kls_id }}</NuxtLink
        >
      </div>
      <div class="flex p-4 justify-between space-x-2">
        <div class="w-1/2 font-medium">Auftragsnummer</div>
        <div class="w-[1px] border border-black"></div>
        <div
          v-if="order?.ordernumber"
          v-html="order?.ordernumber"
          class="h-90 whitespace-pre-line w-1/2"
        ></div>
      </div>
      <div class="flex p-4 justify-between space-x-2">
        <div class="w-1/2 font-medium">Status</div>
        <div class="w-[1px] border border-black"></div>
        <div
          v-if="order?.status"
          v-html="
            order?.status === 'completed' && order.notCompletedReason
              ? `nicht erledigt - ${order.notCompletedReason}`
              : order?.status
          "
          :class="{
            'text-green-500': order?.status === 'completed',
            'text-red-500':
              order?.status === 'completed' && order.notCompletedReason,
          }"
          class="h-90 whitespace-pre-line w-1/2 font-semibold"
        ></div>
      </div>
      <div class="flex p-4 justify-between space-x-2">
        <div class="w-1/2 font-medium">Auftragsanfang</div>
        <div class="w-[1px] border border-black"></div>
        <div
          v-if="orderStarted"
          v-html="timeFormatter.format(new Date(orderStarted))"
          class="h-90 whitespace-pre-line w-1/2"
        ></div>
      </div>
      <div class="flex p-4 justify-between space-x-2">
        <div class="w-1/2 font-medium">Auftragsabmeldung</div>
        <div class="w-[1px] border border-black"></div>
        <div
          v-if="order?.dateCreated"
          v-html="timeFormatter.format(new Date(order?.dateCreated))"
          class="h-90 whitespace-pre-line w-1/2"
        ></div>
      </div>
      <div class="flex p-4 justify-between space-x-2">
        <div class="w-1/2 font-medium">Dauer</div>
        <div class="w-[1px] border border-black"></div>
        <div
          class="h-90 whitespace-pre-line w-1/2"
          v-if="formattedDuration"
          v-html="formattedDuration"
        ></div>
      </div>
      <div class="flex p-4 justify-between space-x-2">
        <div class="w-1/2 font-medium">Ne3 Fehler</div>
        <div class="w-[1px] border border-black"></div>
        <div class="w-1/2 flex justify-between items-start relative px-1">
          <span class="h-90 whitespace-pre-line" v-if="!editNe3Error">
            {{ ne3Status }}
          </span>
          <div v-else class="flex flex-col space-y-2 items-end text-xs w-full">
            <select
              v-model="selectedNe3Status"
              class="border border-gray-500 bg-white rounded-md p-2 w-full h-10"
            >
              <option value="Ne3-Fehler vorhanden und beseitigt">
                Ne3-Fehler vorhanden und beseitigt
              </option>
              <option value="Ne3-Fehler vorhanden">Ne3-Fehler vorhanden</option>
              <option value="Kein Ne3-Fehler vorhanden">
                Kein Ne3-Fehler vorhanden
              </option>
            </select>
            <button
              class="w-28 h-6 flex justify-center items-center text-xs px-2 font-bold text-white rounded-md transition min-h-10 bg-blue-500 hover:bg-blue-600"
              @click="handleChangeNe3Status"
            >
              {{ selectedNe3Status === ne3Status ? "Abbrechen" : "Speichern" }}
            </button>
          </div>
          <button
            class="rounded border border-gray-400 hover:bg-gray-200 transition p-1 h-8 w-8"
            v-if="!editNe3Error"
            @click="editNe3Error = true"
          >
            <svg
              class="w-5 h-5 text-black"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                fill-rule="evenodd"
                clip-rule="evenodd"
                d="M20.8477 1.87868C19.6761 0.707109 17.7766 0.707105 16.605 1.87868L2.44744 16.0363C2.02864 16.4551 1.74317 16.9885 1.62702 17.5692L1.03995 20.5046C0.760062 21.904 1.9939 23.1379 3.39334 22.858L6.32868 22.2709C6.90945 22.1548 7.44285 21.8693 7.86165 21.4505L22.0192 7.29289C23.1908 6.12132 23.1908 4.22183 22.0192 3.05025L20.8477 1.87868ZM18.0192 3.29289C18.4098 2.90237 19.0429 2.90237 19.4335 3.29289L20.605 4.46447C20.9956 4.85499 20.9956 5.48815 20.605 5.87868L17.9334 8.55027L15.3477 5.96448L18.0192 3.29289ZM13.9334 7.3787L3.86165 17.4505C3.72205 17.5901 3.6269 17.7679 3.58818 17.9615L3.00111 20.8968L5.93645 20.3097C6.13004 20.271 6.30784 20.1759 6.44744 20.0363L16.5192 9.96448L13.9334 7.3787Z"
                fill="currentColor"
              />
            </svg>
          </button>
        </div>
      </div>
      <div class="flex p-4 justify-between space-x-2">
        <div class="w-1/2 font-medium">Kommentar Intern</div>
        <div class="w-[1px] border border-black"></div>

        <div class="flex justify-between space-x-2 w-1/2 relative px-1">
          <span
            v-if="order?.dateCreated && !editCommentIntern"
            v-html="order?.commentInternal"
            class="h-90 whitespace-pre-line min-w-10"
          ></span>
          <div v-else class="flex flex-col space-y-2 items-end w-full">
            <textarea
              class="border border-gray-500 bg-white rounded-md p-1 w-full h-40 overflow-x-auto"
              v-model="inputCommentIntern"
            >
            </textarea>
            <button
              class="w-28 h-6 flex justify-center items-center text-xs px-2 font-bold text-white rounded-md transition min-h-10 bg-blue-500 hover:bg-blue-600"
              @click="handleChangeCommentIntern"
            >
              {{
                inputCommentIntern === order?.commentInternal
                  ? "Abbrechen"
                  : "Speichern"
              }}
            </button>
          </div>
          <button
            class="rounded border border-gray-400 hover:bg-gray-200 transition p-1 w-8 h-8 flex items-center jusitfy-center"
            v-if="!editCommentIntern"
            @click="editCommentIntern = true"
          >
            <svg
              class="w-5 h-5 text-black"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                fill-rule="evenodd"
                clip-rule="evenodd"
                d="M20.8477 1.87868C19.6761 0.707109 17.7766 0.707105 16.605 1.87868L2.44744 16.0363C2.02864 16.4551 1.74317 16.9885 1.62702 17.5692L1.03995 20.5046C0.760062 21.904 1.9939 23.1379 3.39334 22.858L6.32868 22.2709C6.90945 22.1548 7.44285 21.8693 7.86165 21.4505L22.0192 7.29289C23.1908 6.12132 23.1908 4.22183 22.0192 3.05025L20.8477 1.87868ZM18.0192 3.29289C18.4098 2.90237 19.0429 2.90237 19.4335 3.29289L20.605 4.46447C20.9956 4.85499 20.9956 5.48815 20.605 5.87868L17.9334 8.55027L15.3477 5.96448L18.0192 3.29289ZM13.9334 7.3787L3.86165 17.4505C3.72205 17.5901 3.6269 17.7679 3.58818 17.9615L3.00111 20.8968L5.93645 20.3097C6.13004 20.271 6.30784 20.1759 6.44744 20.0363L16.5192 9.96448L13.9334 7.3787Z"
                fill="currentColor"
              />
            </svg>
          </button>
        </div>
      </div>
      <div class="flex p-4 justify-between space-x-2">
        <div class="w-1/2 font-medium">Kommentar Copy</div>
        <div class="w-[1px] border border-black"></div>
        <div class="flex justify-between space-x-2 w-1/2 px-1">
          <span
            v-if="order?.dateCreated && !editCommentCopy"
            v-html="order?.commentCopy"
            class="h-90 whitespace-pre-line min-w-10"
          ></span>

          <div v-else class="flex flex-col space-y-2 items-end w-full">
            <textarea
              class="border border-gray-500 bg-white rounded-md p-1 w-full h-40 overflow-x-auto"
              v-model="inputCommentCopy"
            >
            </textarea>
            <button
              class="w-28 h-6 flex justify-center items-center text-xs px-2 font-bold text-white rounded-md transition min-h-10 bg-blue-500 hover:bg-blue-600"
              @click="handleChangeCommentCopy"
            >
              {{
                inputCommentCopy === order?.commentCopy
                  ? "Abbrechen"
                  : "Speichern"
              }}
            </button>
          </div>
          <button
            class="rounded border border-gray-400 hover:bg-gray-200 transition p-1 w-8 h-8 flex items-center jusitfy-center"
            v-if="!editCommentCopy"
            @click="editCommentCopy = true"
          >
            <svg
              class="w-5 h-5 text-black"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                fill-rule="evenodd"
                clip-rule="evenodd"
                d="M20.8477 1.87868C19.6761 0.707109 17.7766 0.707105 16.605 1.87868L2.44744 16.0363C2.02864 16.4551 1.74317 16.9885 1.62702 17.5692L1.03995 20.5046C0.760062 21.904 1.9939 23.1379 3.39334 22.858L6.32868 22.2709C6.90945 22.1548 7.44285 21.8693 7.86165 21.4505L22.0192 7.29289C23.1908 6.12132 23.1908 4.22183 22.0192 3.05025L20.8477 1.87868ZM18.0192 3.29289C18.4098 2.90237 19.0429 2.90237 19.4335 3.29289L20.605 4.46447C20.9956 4.85499 20.9956 5.48815 20.605 5.87868L17.9334 8.55027L15.3477 5.96448L18.0192 3.29289ZM13.9334 7.3787L3.86165 17.4505C3.72205 17.5901 3.6269 17.7679 3.58818 17.9615L3.00111 20.8968L5.93645 20.3097C6.13004 20.271 6.30784 20.1759 6.44744 20.0363L16.5192 9.96448L13.9334 7.3787Z"
                fill="currentColor"
              />
            </svg>
          </button>
        </div>
      </div>
      <div class="flex p-4 justify-between space-x-2">
        <div class="w-1/2 font-medium">Positions</div>
        <div class="w-[1px] border border-black"></div>
        <div class="w-1/2 flex flex-col space-y-2">
          <div v-for="position in positions" v-if="!editPositions">
            <span>•</span>
            {{ position.quantity ?? "" }} {{ position.position_name }}
            {{ position.description ? "(" + position.description + ")" : "" }}
          </div>
          <div v-else class="flex flex-col space-y-6 w-full">
            <div class="flex flex-col space-y-2 w-full">
              <div
                class="flex space-x-1 items-center relative"
                v-for="position in positions"
              >
                <input
                  type="number"
                  inputmode="numeric"
                  pattern="[0-9]*"
                  v-model="position.quantity"
                  v-if="position.quantity != null"
                  class="w-12 h-8 border border-gray-500 rounded-md p-1"
                />
                <span class="break-words truncate flex-1">{{
                  position.position_name +
                  (position.description
                    ? " (" + position.description + ")"
                    : "")
                }}</span>
                <button
                  class="!w-8 h-8 bg-blue-500 hover:bg-blue-600 text-white rounded-md transition flex items-center justify-center"
                  @click="handleDeletePosition(position)"
                >
                  <svg
                    class="text-white w-4 h-4"
                    viewBox="0 -0.5 21 21"
                    version="1.1"
                    xmlns="http://www.w3.org/2000/svg"
                    xmlns:xlink="http://www.w3.org/1999/xlink"
                  >
                    <title>delete [#1487]</title>
                    <desc>Created with Sketch.</desc>
                    <defs></defs>
                    <g
                      id="Page-1"
                      stroke="none"
                      stroke-width="1"
                      fill="none"
                      fill-rule="evenodd"
                    >
                      <g
                        id="Dribbble-Light-Preview"
                        transform="translate(-179.000000, -360.000000)"
                        fill="currentColor"
                      >
                        <g
                          id="icons"
                          transform="translate(56.000000, 160.000000)"
                        >
                          <path
                            d="M130.35,216 L132.45,216 L132.45,208 L130.35,208 L130.35,216 Z M134.55,216 L136.65,216 L136.65,208 L134.55,208 L134.55,216 Z M128.25,218 L138.75,218 L138.75,206 L128.25,206 L128.25,218 Z M130.35,204 L136.65,204 L136.65,202 L130.35,202 L130.35,204 Z M138.75,204 L138.75,200 L128.25,200 L128.25,204 L123,204 L123,206 L126.15,206 L126.15,220 L140.85,220 L140.85,206 L144,206 L144,204 L138.75,204 Z"
                            id="delete-[#1487]"
                          ></path>
                        </g>
                      </g>
                    </g>
                  </svg>
                </button>
              </div>
            </div>
            <button
              class="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 transition w-40 mx-auto"
              @click="showNewPositionModal = true"
            >
              +
            </button>
            <button
              class="w-40 h-6 flex justify-center items-center text-xs px-2 font-bold text-white rounded-md transition min-h-10 bg-blue-500 hover:bg-blue-600 mx-auto"
              @click="handleChangePositions"
            >
              {{
                JSON.stringify(copyPositions) === JSON.stringify(positions)
                  ? "Abbrechen"
                  : "Speichern"
              }}
            </button>
          </div>
          <button
            class="rounded border border-gray-400 hover:bg-gray-200 transition p-1 w-8 h-8 flex items-center jusitfy-center mr-0 ml-auto"
            v-if="!editPositions"
            @click="editPositions = true"
          >
            <svg
              class="w-5 h-5 text-black"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                fill-rule="evenodd"
                clip-rule="evenodd"
                d="M20.8477 1.87868C19.6761 0.707109 17.7766 0.707105 16.605 1.87868L2.44744 16.0363C2.02864 16.4551 1.74317 16.9885 1.62702 17.5692L1.03995 20.5046C0.760062 21.904 1.9939 23.1379 3.39334 22.858L6.32868 22.2709C6.90945 22.1548 7.44285 21.8693 7.86165 21.4505L22.0192 7.29289C23.1908 6.12132 23.1908 4.22183 22.0192 3.05025L20.8477 1.87868ZM18.0192 3.29289C18.4098 2.90237 19.0429 2.90237 19.4335 3.29289L20.605 4.46447C20.9956 4.85499 20.9956 5.48815 20.605 5.87868L17.9334 8.55027L15.3477 5.96448L18.0192 3.29289ZM13.9334 7.3787L3.86165 17.4505C3.72205 17.5901 3.6269 17.7679 3.58818 17.9615L3.00111 20.8968L5.93645 20.3097C6.13004 20.271 6.30784 20.1759 6.44744 20.0363L16.5192 9.96448L13.9334 7.3787Z"
                fill="currentColor"
              />
            </svg>
          </button>
        </div>
      </div>

      <!-- Bilder ansehen -->
      <div class="flex p-4 justify-between space-x-2">
        <div class="w-1/2 font-medium">Bilder</div>
        <div class="w-[1px] border border-black"></div>
        <a
          v-if="validPictures.length && validPictures.length > 0"
          @click="openPictureModal"
          class="w-1/2 cursor-pointer text-blue-600 font-semibold hover:text-blue-700 underline transition"
          >{{ validPictures.length }} Bilder hochgeladen</a
        >
        <span v-else class="w-1/2">Keine Bilder hochgeladen</span>
      </div>

      <!-- Buttons -->
      <div class="w-full flex items-center justify-center space-x-3 px-4">
        <button
          class="bg-gray-400 h-10 w-full rounded-md hover:bg-gray-500 hover:scale-105 transition text-white"
          @click="handleCopyWhatsapp"
        >
          Copy Whatsapp
        </button>
        <button
          class="bg-gray-400 h-10 w-full rounded-md hover:bg-gray-500 hover:scale-105 transition text-white"
          @click="handleCopyKasys"
        >
          Copy Kasys
        </button>
      </div>
      <div class="flex w-full justify-between items-center px-4 pt-5">
        <NuxtLink :to="`/orderDetails/${prevOrder}?currentPage=${currentPage}`">
          <button
            class="h-14 w-14 flex justify-center items-center px-2 rounded-md transition text-white"
            :class="{
              'bg-blue-500 hover:bg-blue-600 hover:scale-105': prevOrder,
              'bg-gray-400 cursor-not-allowed': !prevOrder,
            }"
            :disabled="!prevOrder"
          >
            <svg
              class="w-6 h-6 text-white"
              version="1.1"
              id="XMLID_54_"
              xmlns="http://www.w3.org/2000/svg"
              xmlns:xlink="http://www.w3.org/1999/xlink"
              viewBox="0 0 24 24"
              xml:space="preserve"
              fill="currentColor"
            >
              <g id="previous">
                <g>
                  <polygon
                    points="17.2,23.7 5.4,12 17.2,0.3 18.5,1.7 8.4,12 18.5,22.3 		"
                  />
                </g>
              </g>
            </svg>
          </button>
        </NuxtLink>
        <NuxtLink :to="`/home?currentPage=${currentPage}`">
          <button
            class="bg-blue-500 h-14 min-w-40 max-w-96 px-2 rounded-md hover:bg-blue-600 hover:scale-105 transition text-white"
          >
            Zurück zum Hauptmenü
          </button>
        </NuxtLink>
        <NuxtLink :to="`/orderDetails/${nextOrder}?currentPage=${currentPage}`">
          <button
            class="h-14 w-14 flex justify-center items-center px-2 rounded-md transition text-white"
            :class="{
              'bg-blue-500 hover:bg-blue-600 hover:scale-105': nextOrder,
              'bg-gray-400 cursor-not-allowed': !nextOrder,
            }"
            :disabled="!nextOrder"
          >
            <svg
              class="w-6 h-6 text-white rotate-180"
              version="1.1"
              id="XMLID_54_"
              xmlns="http://www.w3.org/2000/svg"
              xmlns:xlink="http://www.w3.org/1999/xlink"
              viewBox="0 0 24 24"
              xml:space="preserve"
              fill="currentColor"
            >
              <g id="previous">
                <g>
                  <polygon
                    points="17.2,23.7 5.4,12 17.2,0.3 18.5,1.7 8.4,12 18.5,22.3 		"
                  />
                </g>
              </g>
            </svg>
          </button>
        </NuxtLink>
      </div>

      <!-- Modal für Bilder -->
      <div
        v-if="showPictureModal"
        class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 m-0"
      >
        <div
          class="bg-white rounded-lg w-[90%] max-w-4xl p-4 space-y-4 relative"
        >
          <h2 class="text-xl font-bold">Bilder ansehen</h2>
          <!-- Swiper-Galerie -->
          <swiper
            :modules="[Navigation, Pagination]"
            navigation
            :pagination="{ clickable: true }"
            loop
            :initial-slide="currentPictureIndex"
            class="swiper-container"
          >
            <swiper-slide
              v-for="(picture, index) in pictures"
              :key="picture.id"
            >
              <div class="flex items-center justify-center">
                <img
                  v-if="picture?.path"
                  :src="`${IMAGE_URLPREFIX}${picture?.path}`"
                  @click="gallery.openGallery(pictures, index)"
                  :alt="picture?.original_name || 'Bildbeschreibung fehlt'"
                  class="max-h-[60vh] max-w-full object-contain w-full h-auto"
                />
                <p v-else class="text-center text-gray-500">
                  Kein Bild vorhanden
                </p>
              </div>
            </swiper-slide>
          </swiper>
          <button
            class="bg-red-500 text-white px-4 py-2 rounded-md w-full"
            @click="closePictureModal"
          >
            Schließen
          </button>
        </div>
      </div>
      <FullscreenGallery ref="gallery" />
      <div ref="fullscreenContainer" class="hidden"></div>
    </div>
  </div>
  <div class="flex flex-col space-y-2 pb-4" v-else>
    <h1 class="font-semibold text-2xl p-4">Auftragsinformationen</h1>

    <!-- Auftrag Details -->
    <div class="flex p-4 justify-between space-x-2">
      <div class="w-1/2 font-medium">Anschrift</div>
      <div class="w-[1px] border border-black"></div>
      <div
        class="h-90 whitespace-pre-line w-1/2 w-30 rounded bg-gray-500 animate-pulse"
      ></div>
    </div>
    <div class="flex p-4 justify-between space-x-2">
      <div class="w-1/2 font-medium">KLS-ID</div>
      <div class="w-[1px] border border-black"></div>
      <div
        class="h-90 whitespace-pre-line w-1/2 w-30 rounded bg-gray-500 animate-pulse"
      ></div>
    </div>
    <div class="flex p-4 justify-between space-x-2">
      <div class="w-1/2 font-medium">Auftragsnummer</div>
      <div class="w-[1px] border border-black"></div>
      <div
        class="h-90 whitespace-pre-line w-1/2 w-30 rounded bg-gray-500 animate-pulse"
      ></div>
    </div>
    <div class="flex p-4 justify-between space-x-2">
      <div class="w-1/2 font-medium">Status</div>
      <div class="w-[1px] border border-black"></div>
      <div
        class="h-90 whitespace-pre-line w-1/2 w-30 rounded bg-gray-500 animate-pulse"
      ></div>
    </div>
    <div class="flex p-4 justify-between space-x-2">
      <div class="w-1/2 font-medium">Auftragsanfang</div>
      <div class="w-[1px] border border-black"></div>
      <div
        class="h-90 whitespace-pre-line w-1/2 w-30 rounded bg-gray-500 animate-pulse"
      ></div>
    </div>
    <div class="flex p-4 justify-between space-x-2">
      <div class="w-1/2 font-medium">Auftragsabmeldung</div>
      <div class="w-[1px] border border-black"></div>
      <div
        class="h-90 whitespace-pre-line w-1/2 w-30 rounded bg-gray-500 animate-pulse"
      ></div>
    </div>
    <div class="flex p-4 justify-between space-x-2">
      <div class="w-1/2 font-medium">Dauer</div>
      <div class="w-[1px] border border-black"></div>
      <div
        class="h-90 whitespace-pre-line w-1/2 w-30 rounded bg-gray-500 animate-pulse"
      ></div>
    </div>
    <div class="flex p-4 justify-between space-x-2">
      <div class="w-1/2 font-medium">Ne3 Fehler</div>
      <div class="w-[1px] border border-black"></div>
      <div
        class="h-90 whitespace-pre-line w-1/2 w-30 rounded bg-gray-500 animate-pulse"
      ></div>
    </div>
    <div class="flex p-4 justify-between space-x-2">
      <div class="w-1/2 font-medium">Kommentar Intern</div>
      <div class="w-[1px] border border-black"></div>
      <div
        class="h-90 whitespace-pre-line w-1/2 w-30 rounded bg-gray-500 animate-pulse"
      ></div>
    </div>
    <div class="flex p-4 justify-between space-x-2">
      <div class="w-1/2 font-medium">Kommentar Copy</div>
      <div class="w-[1px] border border-black"></div>
      <div
        class="h-90 whitespace-pre-line w-1/2 w-30 rounded bg-gray-500 animate-pulse"
      ></div>
    </div>
    <div class="flex p-4 justify-between space-x-2">
      <div class="w-1/2 font-medium">Positions</div>
      <div class="w-[1px] border border-black"></div>
      <div
        class="h-90 whitespace-pre-line w-1/2 w-30 rounded bg-gray-500 animate-pulse"
      ></div>
    </div>

    <!-- Bilder ansehen -->
    <div class="flex p-4 justify-between space-x-2">
      <div class="w-1/2 font-medium">Bilder</div>
      <div class="w-[1px] border border-black"></div>
      <div
        class="h-90 whitespace-pre-line w-1/2 w-30 rounded bg-gray-500 animate-pulse"
      ></div>
    </div>

    <!-- Buttons -->
    <div class="w-full flex items-center justify-center space-x-3 px-4">
      <button
        class="bg-gray-400 h-10 w-full rounded-md hover:bg-gray-500 hover:scale-105 transition text-white"
      >
        Copy Whatsapp
      </button>
      <button
        class="bg-gray-400 h-10 w-full rounded-md hover:bg-gray-500 hover:scale-105 transition text-white"
      >
        Copy Kasys
      </button>
    </div>
    <NuxtLink
      :to="`/home?currentPage=${currentPage}`"
      class="flex w-full items-center justify-center"
    >
      <button
        class="bg-blue-500 h-14 w-1/3 rounded-md hover:bg-blue-600 hover:scale-105 transition text-white"
      >
        Zurück zum Hauptmenü
      </button>
    </NuxtLink>
  </div>
</template>

<style scoped>
/* Animationen für das Modal */
.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.3s;
}
.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}
.fixed.inset-0 {
  margin: 0;
  padding: 0;
}
</style>

<script setup lang="ts">
import { useRoute } from "vue-router";
import { ref, computed } from "vue";
import { Swiper, SwiperSlide } from "swiper/vue";
import { Navigation, Pagination } from "swiper/modules";
import "swiper/swiper-bundle.css";
import { addNotification } from "~/notification";
import type { Material, MaterialResponse } from "~/types";

const config = useRuntimeConfig();
const IMAGE_URLPREFIX = config.public.IMAGE_URLPREFIX || "localhost";

const editNe3Error = ref(false);
const editCommentIntern = ref(false);
const editCommentCopy = ref(false);
const editPositions = ref(false);
const showNewPositionModal = ref(false);
const possibleMaterials = ref<Material[]>([]);

const { data: allPositions, error } = await useFetch<MaterialResponse>(
  "/api/getAllPositions",
  {
    headers: {
      Authorization: `Bearer ${useCookie("jwt").value}`,
    },
  }
);

const selectedNe3Status = ref(null);
const inputCommentIntern = ref(null);
const inputCommentCopy = ref(null);
const copyPositions = ref(null);

async function handleChangeNe3Status() {
  if (selectedNe3Status.value === ne3Status.value) {
    editNe3Error.value = false;
    return;
  } else {
    const res = await $fetch(`/api/changeOrder`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${useCookie("jwt").value}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        orderid: orderid,
        target: "ne3Status",
        value: selectedNe3Status.value,
      }),
    });

    order.value.ne3error =
      selectedNe3Status.value === "Ne3-Fehler vorhanden und beseitigt" ||
      selectedNe3Status.value === "Ne3-Fehler vorhanden"
        ? "Ja"
        : "Nein";
    order.value.ne3errorRemoved =
      selectedNe3Status.value === "Ne3-Fehler vorhanden und beseitigt"
        ? "Ja"
        : "Nein";
    editNe3Error.value = false;
    addNotification("Ne3-Status erfolgreich geändert", "success", 1000);
  }
}

async function handleChangeCommentIntern() {
  if (inputCommentIntern.value === order.value.commentInternal) {
    editCommentIntern.value = false;
    return;
  } else {
    const res = await $fetch(`/api/changeOrder`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${useCookie("jwt").value}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        orderid: orderid,
        target: "commentInternal",
        value: inputCommentIntern.value,
      }),
    });
    order.value.commentInternal = inputCommentIntern.value;
    editCommentIntern.value = false;
    addNotification("Kommentar erfolgreich geändert", "success", 1000);
  }
}

async function handleChangeCommentCopy() {
  if (inputCommentCopy.value === order.value.commentCopy) {
    editCommentCopy.value = false;
    return;
  } else {
    const res = await $fetch(`/api/changeOrder`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${useCookie("jwt").value}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        orderid: orderid,
        target: "commentCopy",
        value: inputCommentCopy.value,
      }),
    });
    order.value.commentCopy = inputCommentCopy.value;
    editCommentCopy.value = false;
    addNotification("Kommentar erfolgreich geändert", "success", 1000);
  }
}

async function handleChangePositions() {
  if (JSON.stringify(copyPositions.value) === JSON.stringify(positions.value)) {
    editPositions.value = false;
    return;
  }
  if (positions.value.length === 0) {
    addNotification(
      "Es müssen mindestens eine Position hinzugefügt werden",
      "error",
      1000
    );
    return;
  }
  //check if all positions have a quantity
  if (positions.value.some((p) => p.quantity != null && p.quantity <= 0)) {
    addNotification(
      "Es müssen alle Positionen eine Menge haben",
      "error",
      1000
    );
    return;
  } else {
    const res = await $fetch(`/api/changeOrder`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${useCookie("jwt").value}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        orderid: orderid,
        target: "positions",
        value: positions.value,
      }),
    });
    copyPositions.value = JSON.parse(JSON.stringify(positions.value));
    editPositions.value = false;
    addNotification("Positionen erfolgreich geändert", "success", 1000);
  }
}

// Route und Daten laden
const route = useRoute();
const orderid = route.params.orderid;
const currentPage = route.query.currentPage || 1;
const nextOrder = ref(null);
const prevOrder = ref(null);

const gallery = ref(null);

const timeFormatter = new Intl.DateTimeFormat("de-DE", {
  day: "2-digit",
  year: "numeric",
  month: "2-digit",
  minute: "2-digit",
  hour: "2-digit",
});

const order = ref<any | null>(null);
const pictures = ref<any[]>([]);
const loading = ref(false);
const positions = computed(() => order.value?.positions);
const orderStarted = ref<any | null>(null);

function handleDeletePosition(position) {
  possibleMaterials.value = possibleMaterials.value.concat(
    allPositions.value.data.filter((e) => e.id === position.position_id)
  );
  order.value.positions = positions.value.filter((p) => p !== position);
}

const validPictures = computed(() =>
  pictures.value.filter(
    (picture: any) => picture && picture.id !== null && picture.path !== null
  )
);

const ne3Status = computed(() => {
  if (!order.value) return "";
  if (order.value.ne3error === "Ja" && order.value.ne3errorRemoved === "Ja") {
    return "Ne3-Fehler vorhanden und beseitigt";
  } else if (
    order.value.ne3error === "Ja" &&
    order.value.ne3errorRemoved === "Nein"
  ) {
    return "Ne3-Fehler vorhanden";
  } else if (order.value.ne3error === "Nein") {
    return "Kein Ne3-Fehler vorhanden";
  }
  return "";
});

function handlePushMaterial(material: Material) {
  console.log(material);
  positions.value.push({
    position_name: material.name,
    quantity: material.quantity ?? null,
    position_id: material.id,
    description: material.description ?? null,
  });
  showNewPositionModal.value = false;
  possibleMaterials.value = possibleMaterials.value.filter(
    (m) => m.id !== material.id
  );
}

async function fetchOrder() {
  loading.value = true;
  // Auftrag und Bilder abrufen
  const data: any = await $fetch(`/api/getOrder?orderid=${orderid}`, {
    headers: {
      Authorization: `Bearer ${useCookie("jwt").value}`,
    },
  });
  order.value = data.data[0];
  nextOrder.value = order.value.nextOrder;
  prevOrder.value = order.value.prevOrder;
  if (order.value.positions) {
    possibleMaterials.value = allPositions.value.data
      .filter((e) => e.type == order.value.orderType || e.type == "both")
      .filter(
        (e) => !order.value.positions.map((p) => p.position_id).includes(e.id)
      )
      .map((e) => e as Material);
  }

  copyPositions.value = JSON.parse(JSON.stringify(order.value.positions));
  selectedNe3Status.value = ne3Status.value;
  inputCommentIntern.value = order.value.commentInternal;
  inputCommentCopy.value = order.value.commentCopy;
  console.log(order.value);
  pictures.value = data.data[0]?.pictures ?? [];
  console.log(pictures.value);
  orderStarted.value = data.data[0]?.orderCreated;
  loading.value = false;
}

fetchOrder();

const currentPictureIndex = ref(0);
const showPictureModal = ref(false);

// Bilder-Steuerung
function openPictureModal() {
  showPictureModal.value = true;
}

function closePictureModal() {
  showPictureModal.value = false;
}

// Andere Logik (bereits vorhanden, z. B. für Positionen und Dauer)

const formattedDuration = computed(() => {
  if (!orderStarted.value || !order.value) return null;

  const start = new Date(orderStarted.value).getTime();
  const end = new Date(order.value.dateCreated).getTime();
  const durationMs = end - start;

  const totalMinutes = Math.floor(durationMs / 1000 / 60);
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(
    2,
    "0"
  )}`;
});

const whatsappResult = computed(() => {
  const result = [];
  if (
    order.value.positions.filter(
      (position) =>
        position.position_name === "Gf-TA Connect Only" ||
        position.position_name === "Connect mit Herstellen Ne4"
    ).length > 0
  ) {
    if (
      order.value.ne3error == "Ja" &&
      order.value.ne3errorRemoved === "Nein"
    ) {
      result.push("Ne4 erledigt und inventarisiert mit Ne3-Fehler");
    } else if (order.value.ne3errorRemoved === "Ja") {
      result.push("Erledigt und inventarisiert mit Ne3-Fehler beseitigt");
    } else {
      result.push("Erledigt und inventarisiert");
    }
  } else if (
    order.value.positions.filter(
      (position) =>
        position.position_name === "nicht erledigt - Connect Auftrag"
    ).length > 0
  ) {
    result.push("Connect Nicht Erledigt");
  } else if (
    order.value.positions.filter(
      (position) => position.position_name === "GWV Basic"
    ).length > 0
  ) {
    result.push("GWV Erledigt");
    if (
      order.value.ne3error == "Ja" &&
      order.value.ne3errorRemoved === "Nein"
    ) {
      result.push("mit Ne3-Fehler");
    } else if (order.value.ne3errorRemoved === "Ja") {
      result.push("mit Ne3-Fehler beseitigt");
    }
  } else if (
    order.value.positions.filter(
      (position) => position.position_name === "nicht erledigt - GWV Auftrag"
    ).length > 0
  ) {
    result.push("GWV Nicht Erledigt");
  } else if (
    order.value.positions.filter(
      (position) => position.position_name === "Doppelauftrag erledigt"
    ).length > 0
  ) {
    result.push("Doppelauftrag erledigt");
    if (
      order.value.ne3error == "Ja" &&
      order.value.ne3errorRemoved === "Nein"
    ) {
      result.push("mit Ne3-Fehler");
    } else if (order.value.ne3errorRemoved === "Ja") {
      result.push("mit Ne3-Fehler beseitigt");
    }
  }

  return result.join("\n");
});

function handleCopyWhatsapp() {
  let text =
    `${order.value.adress}\nAuftragsnummer\n${order.value.ordernumber}\nKLS-ID: ${order.value.kls_id}\n${whatsappResult.value}` +
    "\n";

  if (
    !(
      order.value.positions.filter(
        (position) =>
          position.position_name === "nicht erledigt - Connect Auftrag"
      ).length > 0 ||
      order.value.positions.filter(
        (position) => position.position_name === "nicht erledigt - GWV Auftrag"
      ).length > 0
    )
  ) {
    if (order.value.notCompletedReason) {
      text += "\n" + "Auftrag konnte nicht abgeschlossen werden";
    }
  }

  if (order.value.notCompletedReason) {
    if (order.value.notCompletedReason != "Sonstiges") {
      text += "\n" + "Grund: " + order.value.notCompletedReason + "\n";
    } else {
      text += "\n" + "Grund: ";
    }
  }

  if (order.value.commentCopy) {
    text += order.value.commentCopy;
  }

  // https://api.whatsapp.com/send?text=?
  // open new tab with whatsapp

  const encodedText = encodeURIComponent(text);
  copyToClipboard(text);

  window.open(`https://api.whatsapp.com/send?text=${encodedText}`);
}

// Kopierlogik für Kasys
function handleCopyKasys() {
  let text = order.value.positions
    .map((position: any) => {
      if (position.position_id == 21) {
        return `${position.quantity} ${position.position_name} ${position.description}`;
      }
      return position.quantity
        ? `${position.quantity} ${position.position_name}`
        : position.position_name;
    })
    .join("; ");
  if (order.value.commentCopy) {
    text += `\n${order.value.commentCopy}`;
  }
  copyToClipboard(text);
}

// Universelle Kopierfunktion
function copyToClipboard(text: string) {
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(text).catch((err) => {
      console.error("Fehler beim Kopieren:", err);
    });
  } else {
    // Fallback für ältere Browser
    const textArea = document.createElement("textarea");
    textArea.value = text;
    textArea.style.position = "fixed";
    textArea.style.top = "-9999px";
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    try {
      document.execCommand("copy");
    } catch (err) {
      console.error("Fallback: Kopieren fehlgeschlagen", err);
    } finally {
      document.body.removeChild(textArea);
    }
  }
}

const fullscreenContainer = ref<HTMLElement | null>(null);

function closeFullscreen() {
  // Schließen des Vollbildmodus
  if (document.exitFullscreen) {
    document.exitFullscreen();
  } else if ((document as any).webkitExitFullscreen) {
    // Safari
    (document as any).webkitExitFullscreen();
  } else if ((document as any).msExitFullscreen) {
    // IE11
    (document as any).msExitFullscreen();
  }

  // Entferne das Bild nach dem Beenden des Fullscreen-Modus
  if (fullscreenContainer.value) {
    fullscreenContainer.value.style.display = "none";
  }
}
</script>
