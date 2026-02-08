import { api } from "../lib/api";

export const boyahaneApi = {
  list(params?: any) {
    return api.get("/boyahane/renk", { params });
  },

  create(data: {
    pantone: string;
    versiyon?: string;
    boyaTuru: string;
    hexRenk?: string | null;
    isNumune?: boolean;
    isImalat?: boolean;
    aktif?: boolean;
    not?: string;
  }) {
    return api.post("/boyahane/renk", data);
  },

  search(q: string) {
    return api.get("/boyahane/renk/search", { params: { q } });
  },
};
