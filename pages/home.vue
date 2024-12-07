<script setup>
import { ref, computed, onMounted } from "vue";
import { useUtangStore } from "~/stores/utangStore";

definePageMeta({
  layout: "custom",
});

const showModal = ref(false);
const showItemModal = ref(false);
const selectedUtang = ref(null);
const utangName = ref("");
const utangItems = ref([]);
const currentItem = ref({
  item_name: "",
  amount: "",
  quantity: "",
});

const utangStore = useUtangStore();

onMounted(() => {
  utangStore.fetchUtangs();
});

const addItem = () => {
  if (
    currentItem.value.item_name &&
    currentItem.value.amount > 0 &&
    currentItem.value.quantity > 0
  ) {
    utangItems.value.push({ ...currentItem.value });
    currentItem.value = {
      item_name: "",
      amount: "",
      quantity: "",
    };
  }
};

const saveUtang = () => {
  if (utangName.value && utangItems.value.length > 0) {
    utangStore.addUtang({ name: utangName.value }, utangItems.value);
    resetForm();
  }
};

const resetForm = () => {
  utangName.value = "";
  utangItems.value = [];
  currentItem.value = { item_name: "", amount: "", quantity: "" };
  showModal.value = false;
};

const openItemModal = (utang) => {
  selectedUtang.value = utang;
  showItemModal.value = true;
};

const saveItemEdits = async () => {
  try {
    const promises = selectedUtang.value.utang_items.map((item) =>
      utangStore.updateItems(item.id, item)
    );
    await Promise.all(promises);
    await utangStore.fetchUtangs();
    showItemModal.value = false;
  } catch (error) {
    console.error("Error saving item edits:", error.message);
  }
};

const markAsPaid = async (utangId) => {
  try {
    await utangStore.markAsPaid(utangId);
  } catch (error) {
    console.error("Error marking as paid:", error.message);
  }
};

const computeTotalAmount = (utangItems) => {
  return utangItems.reduce(
    (total, item) => total + item.amount * item.quantity,
    0
  );
};

const addNewItemToUtang = async () => {
  if (
    currentItem.value.item_name &&
    currentItem.value.amount > 0 &&
    currentItem.value.quantity > 0
  ) {
    try {
      await utangStore.addItemToUtang(selectedUtang.value.id, currentItem.value);
      currentItem.value = { item_name: "", amount: "", quantity: "" };
    } catch (error) {
      console.error("Error adding new utang item:", error.message);
    }
  }
};

</script>

<template>
  <main class="p-6">
    <div class="flex justify-end p-4">
      <button
        @click="showModal = true"
        class="bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600"
      >
        Add New Utang
      </button>
    </div>

    <h1 class="text-2xl font-bold mb-4">Utanger List</h1>
    <table class="table-auto w-full border-collapse border border-gray-300">
      <thead>
        <tr class="bg-gray-100">
          <th class="border border-gray-300 px-4 py-2 text-left">Name</th>
          <th class="border border-gray-300 px-4 py-2 text-left">
            Date Last Utanged
          </th>
          <th class="border border-gray-300 px-4 py-2 text-right">
            Total Amount
          </th>
          <th class="border border-gray-300 px-4 py-2 text-center">Actions</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="utang in utangStore.utangs" :key="utang.id">
          <td class="border border-gray-300 px-4 py-2">{{ utang.name }}</td>
          <td class="border border-gray-300 px-4 py-2">
            {{ new Date(utang.created_at).toLocaleDateString() }}
          </td>
          <td class="border border-gray-300 px-4 py-2 text-right">
            {{ computeTotalAmount(utang.utang_items) }}
          </td>
          <td class="border border-gray-300 px-4 py-2 text-center">
            <button
              @click="openItemModal(utang)"
              class="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600 mr-2"
            >
              View Utangs
            </button>
            <button
              @click="markAsPaid(utang.id)"
              class="bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600"
            >
              Paid
            </button>
          </td>
        </tr>
      </tbody>
    </table>

    <div
      v-if="showModal"
      class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
    >
      <div class="bg-white rounded-lg p-6 w-11/12 md:w-1/2">
        <h2 class="text-lg font-bold mb-4">Add New Utang</h2>
        <div class="mb-4">
          <label for="utang-name" class="block font-medium mb-2"
            >Name of Utanger</label
          >
          <input
            id="utang-name"
            type="text"
            v-model="utangName"
            class="w-full border border-gray-300 rounded-lg px-3 py-2"
          />
        </div>

        <div class="mb-4">
          <h3 class="font-bold mb-2">Add Utang Items</h3>
          <div class="flex items-center gap-2">
            <input
              type="text"
              placeholder="Item Name"
              v-model="currentItem.item_name"
              class="flex-1 border border-gray-300 rounded-lg px-3 py-2"
            />
            <input
              type="number"
              placeholder="Amount"
              v-model="currentItem.amount"
              class="w-24 border border-gray-300 rounded-lg px-3 py-2"
            />
            <input
              type="number"
              placeholder="Quantity"
              v-model="currentItem.quantity"
              class="w-24 border border-gray-300 rounded-lg px-3 py-2"
            />
            <button
              @click="addItem"
              class="bg-green-500 text-white px-3 py-2 rounded-md hover:bg-green-600"
            >
              Add
            </button>
          </div>
        </div>

        <!-- Item List -->
        <ul class="mb-4">
          <li
            v-for="(item, index) in utangItems"
            :key="index"
            class="flex justify-between items-center border-b py-2"
          >
            <span
              >{{ item.item_name }} ({{ item.quantity }}x
              {{ item.amount }})</span
            >
          </li>
        </ul>

        <!-- Actions -->
        <div class="flex justify-end gap-2">
          <button
            @click="resetForm"
            class="bg-gray-300 px-4 py-2 rounded-md hover:bg-gray-400"
          >
            Cancel
          </button>
          <button
            @click="saveUtang"
            class="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600"
          >
            Save
          </button>
        </div>
      </div>
    </div>

    <!-- Edit Utang Items Modal -->
    <div
      v-if="showItemModal"
      class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
    >
      <div class="bg-white rounded-lg p-6 w-11/12 md:w-1/2">
        <h2 class="text-lg font-bold mb-4">
          Edit Utang Items for {{ selectedUtang?.name }}
        </h2>

        <!-- Table for Editing Existing Items -->
        <table
          class="table-auto w-full border-collapse border border-gray-300 mb-4"
        >
          <thead>
            <tr class="bg-gray-100">
              <th class="border border-gray-300 px-4 py-2">Item Name</th>
              <th class="border border-gray-300 px-4 py-2">Amount</th>
              <th class="border border-gray-300 px-4 py-2">Quantity</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(item, index) in selectedUtang.utang_items" :key="index">
              <td class="border border-gray-300 px-4 py-2">
                <input
                  v-model="item.item_name"
                  type="text"
                  class="w-full border border-gray-300 rounded px-2 py-1"
                />
              </td>
              <td class="border border-gray-300 px-4 py-2">
                <input
                  v-model="item.amount"
                  type="number"
                  class="w-full border border-gray-300 rounded px-2 py-1"
                />
              </td>
              <td class="border border-gray-300 px-4 py-2">
                <input
                  v-model="item.quantity"
                  type="number"
                  class="w-full border border-gray-300 rounded px-2 py-1"
                />
              </td>
            </tr>
          </tbody>
        </table>

        <!-- Section for Adding New Items -->
        <div class="mb-4">
          <h3 class="font-bold mb-2">Add New Item</h3>
          <div class="flex items-center gap-2">
            <input
              type="text"
              placeholder="Item Name"
              v-model="currentItem.item_name"
              class="flex-1 border border-gray-300 rounded-lg px-3 py-2"
            />
            <input
              type="number"
              placeholder="Amount"
              v-model="currentItem.amount"
              class="w-24 border border-gray-300 rounded-lg px-3 py-2"
            />
            <input
              type="number"
              placeholder="Quantity"
              v-model="currentItem.quantity"
              class="w-24 border border-gray-300 rounded-lg px-3 py-2"
            />
            <button
              @click="addNewItemToUtang"
              class="bg-green-500 text-white px-3 py-2 rounded-md hover:bg-green-600"
            >
              Add Item
            </button>
          </div>
        </div>

        <!-- Action Buttons -->
        <div class="flex justify-end gap-2">
          <button
            @click="showItemModal = false"
            class="bg-gray-300 px-4 py-2 rounded-md hover:bg-gray-400"
          >
            Cancel
          </button>
          <button
            @click="saveItemEdits"
            class="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600"
          >
            Save Changes
          </button>
        </div>
      </div>
    </div>
  </main>
</template>
