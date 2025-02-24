import { apiSlice } from "./api.service";

export const cashierApi = apiSlice.injectEndpoints({
    endpoints: (builder) => ({
        createCashier: builder.mutation({
            query: (body) => ({
                url: "/cashier/create",
                method: "POST",
                body,
            }),
            invalidatesTags: ["Cashier"],
        }),
        getCashier: builder.query({
            query: () => "/cashier/",
            providesTags: ["Cashier"],
        }),
        updateCashier: builder.mutation({
            query: ({ body, id }) => ({
                url: `/cashier/${id}`,
                method: "PUT",
                body,
            }),
            invalidatesTags: ["Cashier"],
        }),
        deleteCashier: builder.mutation({
            query: (id) => ({
                url: `/cashier/${id}`,
                method: "DELETE",
            }),
            invalidatesTags: ["Cashier"],
        }),
    }),
});

export const {
    useCreateCashierMutation,
    useGetCashierQuery,
    useUpdateCashierMutation,
    useDeleteCashierMutation,
} = cashierApi;