import { defineStore } from "pinia";
import { useNuxtApp } from "#app";

export const useUtangStore = defineStore("utangStore", {
  state: () => ({
    utangs: [],
    utangItems: [],
  }),
  actions: {
    async fetchUtangs() {
      const { $supabase } = useNuxtApp();
      const { data, error } = await $supabase
        .from("utangs")
        .select("*, utang_items(*)")
        .eq("status", "unpaid");

      if (error) {
        console.error("Error fetching paid utangs:", error.message);
      } else {
        this.utangs = data;
      }
    },

    async addUtang(newUtang, items) {
      const { $supabase } = useNuxtApp();


      const totalAmount = items.reduce((sum, item) => sum + item.amount, 0);

      const { data: utangData, error: utangError } = await $supabase
        .from("utangs")
        .insert({
          name: newUtang.name,
          status: "unpaid", 
          total_amount: totalAmount, 
        })
        .select()
        .single();

      if (utangError) {
        console.error("Error adding utang:", utangError.message);
        return;
      }

      const itemEntries = items.map((item) => ({
        ...item,
        utang_id: utangData.id,
      }));

      const { error: itemsError } = await $supabase
        .from("utang_items")
        .insert(itemEntries);

      if (itemsError) {
        console.error("Error adding utang items:", itemsError.message);
      } else {
        this.fetchUtangs();
      }
    },

    async markAsPaid(utangId) {
      const { $supabase } = useNuxtApp();
      try {
        const { error } = await $supabase
          .from("utangs")
          .update({ status: "paid" })
          .eq("id", utangId);

        if (error) {
          throw new Error(error.message);
        }

        this.fetchUtangs();
      } catch (error) {
        console.error("Error marking utang as paid:", error.message);
      }
    },
    async updateItems(utangItemId, updatedItem) {
      const { $supabase } = useNuxtApp();
      try {
        const { error } = await $supabase
          .from("utang_items")
          .update({
            item_name: updatedItem.item_name,
            amount: updatedItem.amount,
            quantity: updatedItem.quantity,
          })
          .eq("id", utangItemId);
    
        if (error) {
          throw new Error(error.message);
        }
      } catch (error) {
        console.error("Error updating utang item:", error.message);
        throw error; 
      }
    },
    
    async addItemToUtang(utangId, newItem) {
      const { $supabase } = useNuxtApp();
      try {
        const { error } = await $supabase.from("utang_items").insert({
          item_name: newItem.item_name,
          amount: newItem.amount,
          quantity: newItem.quantity,
          utang_id: utangId,
        });

        if (error) {
          throw new Error(error.message);
        }

        // Refresh utangs to include the new item
        this.fetchUtangs();
      } catch (error) {
        console.error("Error adding new utang item:", error.message);
        throw error;
      }
    },
  },
});
