
<script setup>
import { useUtangStore } from "~/stores/utangStore";
import { onMounted } from "vue";
const utangStore = useUtangStore();

onMounted(() => {
  utangStore.fetchPaidUtangs();
});

definePageMeta({
  layout: "custom",
});
</script>

<template>
  <main class="p-10">
    <h1 class="text-2xl font-bold mb-4">Utanger List</h1>
    <div v-if="utangStore.paidUtangs.length === 0">
      <p>No utangs...</p>
    </div>
    <table
      v-else
      class="table-auto w-full border-collapse border border-gray-300"
    >
      <thead>
        <tr class="bg-gray-100">
          <th class="border border-gray-300 px-4 py-2 text-center">Name</th>
          <th class="border border-gray-300 px-4 py-2 text-center">Date Paid</th>
          <th class="border border-gray-300 px-4 py-2 text-center">
            Total Amount
          </th>
        </tr>
      </thead>

      <tbody>
        <tr v-for="utang in utangStore.paidUtangs" :key="utang.id">
          <td class="border border-gray-300 px-4 py-2 text-center">
            {{ utang.name }}
          </td>
          <td class="border border-gray-300 px-4 py-2 text-center">
            {{ utangStore.formatDate(utang.date_paid) }}
          </td>
          <td class="border border-gray-300 px-4 py-2 text-center">
            {{ utang.total_amount }}
          </td>
        </tr>
      </tbody>
    </table>
  </main>
</template>

<script>
</script>

