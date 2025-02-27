import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

const baseQuery = fetchBaseQuery({
    baseUrl: "http://localhost:8080/",
    // baseUrl: "https://avtomaktab-crm-server.vercel.app/",

    prepareHeaders: (headers, { getState }) => {
        const token = localStorage.getItem("access_token");
        if (token) headers.set("Authorization", `Bearer ${token}`);
        return headers;
    },
});

export const baseQueryWithReauth = async (args, api, extraOptions) => {
    let result = await baseQuery(args, api, extraOptions);
    if (result?.error && result?.error?.status === 401) {
        localStorage.clear();
    }
    return result;
};

export const apiSlice = createApi({
    reducerPath: "api",
    tagTypes: ["Group", "Student", "Payment"],
    baseQuery: baseQueryWithReauth,
    endpoints: (builder) => ({}),
});
