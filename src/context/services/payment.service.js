import { apiSlice } from "./api.service";

export const paymentApi = apiSlice.injectEndpoints({
    endpoints: (builder) => ({
        createPayment: builder.mutation({
            query: (body) => ({
                url: "/payment/create",
                method: "POST",
                body,
            }),
            invalidatesTags: ["Payment", "Group", "Student"],
        }),
        updatePayment: builder.mutation({
            query: ({ body, id }) => ({
                url: `/payment/${id}`,
                method: "PUT",
                body,
            }),
            invalidatesTags: ["Payment", "Group", "Student"],

        }),
        deletePayment: builder.mutation({
            query: (id) => ({
                url: `/payment/${id}`,
                method: "DELETE",
            }),
            invalidatesTags: ["Payment", "Group", "Student"],

        }),
        getPayment: builder.query({
            query: () => "/payment",
            providesTags: ["Payment"],
        }),
    }),
});

export const {
    useCreatePaymentMutation,
    useGetPaymentQuery,
    useUpdatePaymentMutation,
    useDeletePaymentMutation,

} = paymentApi;