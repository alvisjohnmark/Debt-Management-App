import { defineStore } from "pinia";
import { useNuxtApp } from "#app";
import moment from "moment";
import Swal from "sweetalert2";

export const useUtangStore = defineStore("utangStore", {
  state: () => ({
    utangs: [],
    utangItems: [],
    paidUtangs: [],
    confirmPaid: false,
  }),
  actions: {
    togglePaid() {
      this.confirmPaid != this.confirmPaid;
    },
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
    async fetchPaidUtangs() {
      const { $supabase } = useNuxtApp();
      const { data, error } = await $supabase
        .from("utangs")
        .select("*, utang_items(*)")
        .eq("status", "paid");

      if (error) {
        console.error("Error fetching paid utangs:", error.message);
      } else {
        this.paidUtangs = data;
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
        const result = await Swal.fire({
          title: "Are you sure?",
          text: "Once marked as paid, this action cannot be undone!",
          icon: "warning",
          showCancelButton: true,
          confirmButtonColor: "#3085d6",
          cancelButtonColor: "#d33",
          confirmButtonText: "Yes, mark as paid!",
        });

        if (result.isConfirmed) {
          const { error } = await $supabase
            .from("utangs")
            .update({
              status: "paid",
              date_paid: new Date().toLocaleString("en-US", {
                timeZone: "Asia/Manila",
              }),
            })
            .eq("id", utangId);

          if (error) {
            throw new Error(error.message);
          }

          await Swal.fire(
            "Success!",
            "The utang has been marked as paid.",
            "success"
          );
          this.fetchUtangs(); 
        }
      } catch (error) {
        console.error("Error marking utang as paid:", error.message);
        Swal.fire("Error", error.message, "error");
      }
    },

    async updateItems(utangItemId, updatedItem) {
      const { $supabase } = useNuxtApp();
      try {
        const { error: updateError } = await $supabase
          .from("utang_items")
          .update({
            item_name: updatedItem.item_name,
            amount: updatedItem.amount,
            quantity: updatedItem.quantity,
          })
          .eq("id", utangItemId);

        if (updateError) {
          throw new Error(updateError.message);
        }

        const { data: utangItem, error: fetchError } = await $supabase
          .from("utang_items")
          .select("utang_id")
          .eq("id", utangItemId)
          .single();

        if (fetchError) {
          throw new Error(fetchError.message);
        }

        const utangId = utangItem.utang_id;
        const { data: items, error: itemsError } = await $supabase
          .from("utang_items")
          .select("amount, quantity")
          .eq("utang_id", utangId);

        if (itemsError) {
          throw new Error(itemsError.message);
        }

        const totalAmount = items.reduce(
          (sum, item) => sum + item.amount * item.quantity,
          0
        );

        const { error: totalError } = await $supabase
          .from("utangs")
          .update({
            total_amount: totalAmount,
            last_time_utanged: new Date().toLocaleString("en-US", {
              timeZone: "Asia/Manila",
            }),
          })
          .eq("id", utangId);

        if (totalError) {
          throw new Error(totalError.message);
        }
      } catch (error) {
        console.error(
          "Error updating utang item and total amount:",
          error.message
        );
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

        this.fetchUtangs();
      } catch (error) {
        console.error("Error adding new utang item:", error.message);
        throw error;
      }
    },
    formatDate(date) {
      if (!date) {
        return "--------------------------";
      }
      return moment(date).format("YYYY-MM-DD hh:mm A");
    },
  },
});
