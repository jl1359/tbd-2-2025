import { api } from "./api";
export async function getSaldo(idUsuario) {
    return api(`/wallet/me/${idUsuario}`);
}
