// src/api/currencyApi.js
import axiosClient from "./axiosClient";

export const getCurrencies = () => axiosClient.get("/currency");

export const getAdminCurrencies = () => axiosClient.get("/admin/currencies");

export const updateCurrencyRate = (code, rate) =>
  axiosClient.put(`/admin/currencies/${code}/rate`, { rate });

export default {
  getCurrencies,
  getAdminCurrencies,
  updateCurrencyRate,
};
