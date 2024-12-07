export default defineNuxtRouteMiddleware(async (to, from) => {
  const { $supabase } = useNuxtApp();

  const user = $supabase.auth.user();

  if (!user) {
    return navigateTo("/login");
  }
});
