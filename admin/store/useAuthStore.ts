import { defineStore } from "pinia";

export const useAuthStore = defineStore("auth", {
    state() {
        return {
            Root: "https://api-konghayao.cloud.okteto.net",
            access_token: "api_admin_66618273",
        };
    },
    getters: {
        authHeader: (state) => ({
            Authorization: "Bearer " + state.access_token,
        }),
    },

    // persist: true,
});
