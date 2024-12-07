import { defineStore } from "pinia";

export const useAuthStore = defineStore("authStore", {
  state: () => ({
    email: "",
    password: "",
    first_name: "",
    last_name: "",
    user: null,
  }),

  actions: {
    async register() {
      const { $supabase } = useNuxtApp();
      const router = useRouter();

      try {
        const { data: authData, error: authError } =
          await $supabase.auth.signUp({
            email: this.email,
            password: this.password,
            options: {
              data: {
                first_name: this.first_name,
                last_name: this.last_name,
              },
            },
          });

        if (authError) {
          console.error("Sign-up error:", authError.message);
          throw new Error("Failed to sign up.");
        }

        const { user } = authData;
        if (user) {
          const { error: dbError } = await $supabase.from("users").insert({
            id: user.id, 
            email: user.email,
            first_name: this.first_name,
            last_name: this.last_name,
            password: this.password
          });

          if (dbError) {
            console.error("Database insert error:", dbError.message);
            throw new Error("Failed to save user data.");
          }

          console.log("User data saved successfully.");
        }

        this.message = "Registration successful! Please verify your email.";
      } catch (err) {
        console.error("Registration failed:", err.message);
        this.message =
          "An error occurred during registration. Please try again.";
      }
    },

    async login() {
      const { $supabase } = useNuxtApp();
      const router = useRouter();
      const { data, error } = await $supabase.auth.signInWithPassword({
        email: this.email,
        password: this.password,
      });

      if (error) {
        console.error(error.message);
        this.message = "Error: Login failed.";
      } else {
        console.log("Login successful:", data);
        this.user = data.user;
        this.email = ""
        this.password= ""
        router.push("/home");
      }
    },

    async logout() {
      const router = useRouter();
      const { $supabase } = useNuxtApp();
      const { error } = await $supabase.auth.signOut();
      if (error) {
        console.error(error.message);
        this.message = "Error: Logout failed.";
      } else {
        console.log("Logout successful");
        this.user = null;
        this.message = "Logout successful!";
        router.push("/");
      }
    },
  },
});
