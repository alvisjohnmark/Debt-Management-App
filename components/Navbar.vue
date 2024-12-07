<script setup>
import { ref, onMounted } from "vue";
import { useAuthStore } from "~/stores/authStore";
const auth = useAuthStore();
const { $supabase } = useNuxtApp();
const user = ref(null);
const isMenuOpen = ref(false);

onMounted(async () => {
  const { data, error } = await $supabase.auth.getUser();
  if (error) {
    console.error("Error fetching user:", error.message);
  } else {
    user.value = data.user;
  }
});

const toggleMenu = () => {
  isMenuOpen.value = !isMenuOpen.value;
};
</script>

<template>
  <nav class="bg-gray-800 text-white px-4 py-3 shadow-md">
    <div class="container mx-auto flex items-center justify-between">
      <div class="text-xl font-bold">Julius Store: Utang Manager</div>
      <button
        class="lg:hidden block text-white focus:outline-none"
        @click="toggleMenu"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          class="h-6 w-6"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M4 6h16M4 12h16m-7 6h7"
          />
        </svg>
      </button>
      <ul
        :class="{
          'block': isMenuOpen,
          'hidden': !isMenuOpen
        }"
        class="absolute top-16 left-0 w-full bg-gray-800 lg:static lg:flex lg:items-center lg:space-x-6 lg:w-auto lg:top-auto lg:bg-transparent"
      >
        <li class="py-2 lg:py-0">
          <NuxtLink
            to="/home"
            class="block px-4 py-2 text-white hover:text-gray-300 lg:inline-block transition"
          >
            Home
          </NuxtLink>
        </li>
        <li class="py-2 lg:py-0">
          <NuxtLink
            to="/past_utang"
            class="block px-4 py-2 text-white hover:text-gray-300 lg:inline-block transition"
          >
            Past Utangs
          </NuxtLink>
        </li>
      </ul>

      <div class="hidden lg:flex items-center space-x-4">
        <span v-if="user" class="text-sm">
          Welcome, {{ user.user_metadata.first_name }} {{ user.user_metadata.last_name }}
        </span>
        <span v-else class="text-sm">Loading...</span>
        <button
          @click="auth.logout"
          class="bg-red-500 px-3 py-1 rounded-md hover:bg-red-600 transition"
        >
          Logout
        </button>
      </div>
    </div>

    <div
      :class="{
        'block': isMenuOpen,
        'hidden': !isMenuOpen
      }"
      class="lg:hidden bg-gray-800 mt-10 px-4 py-2"
    >
      <div class="text-sm mb-2">
        <span v-if="user">
          Welcome, {{ user.user_metadata.first_name }} {{ user.user_metadata.last_name }}
        </span>
        <span v-else>Loading...</span>
      </div>
      <button
        @click="auth.logout"
        class="bg-red-500 w-full py-1 rounded-md hover:bg-red-600 transition"
      >
        Logout
      </button>
    </div>
  </nav>
</template>
