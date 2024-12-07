<script setup>
import { useAuthStore } from "~/stores/authStore";
const auth = useAuthStore();
</script>

<template>
  <div class="min-h-screen bg-gray-100 flex items-center justify-center">
    <div class="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
      <h1 class="text-2xl font-bold text-center text-gray-800 mb-6">Register</h1>
      <form @submit.prevent="auth.register" class="space-y-4">
        <div>
          <label
            for="first_name"
            class="block text-sm font-medium text-gray-700 mb-1"
            >First Name</label
          >
          <input
            id="first_name"
            v-model="auth.first_name"
            type="first_name"
            placeholder="First Name"
            required
            class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring focus:ring-blue-200 focus:outline-none"
          />
        </div>
        <div>
          <label
            for="last_name"
            class="block text-sm font-medium text-gray-700 mb-1"
            >Last Name</label
          >
          <input
            id="last_name"
            v-model="auth.last_name"
            type="last_name"
            placeholder="Last Name"
            required
            class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring focus:ring-blue-200 focus:outline-none"
          />
        </div>
        <div>
          <label
            for="email"
            class="block text-sm font-medium text-gray-700 mb-1"
            >Email</label
          >
          <input
            id="email"
            v-model="auth.email"
            type="email"
            placeholder="Email"
            required
            class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring focus:ring-blue-200 focus:outline-none"
          />
        </div>
        <div>
          <label
            for="password"
            class="block text-sm font-medium text-gray-700 mb-1"
            >Password</label
          >
          <input
            id="password"
            v-model="auth.password"
            type="password"
            placeholder="Password"
            required
            class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring focus:ring-blue-200 focus:outline-none"
          />
        </div>
        <button
          type="submit"
          class="w-full bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600 transition"
        >
          Register
        </button>
      </form>
      <p class="text-center text-sm text-gray-500 mt-4">{{ auth.message }}</p>
    </div>
  </div>
</template>

<style>
body {
  font-family: "Inter", sans-serif;
}
</style>
