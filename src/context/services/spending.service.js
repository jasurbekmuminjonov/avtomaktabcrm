import { apiSlice } from "./api.service";

export const spendingApi = apiSlice.injectEndpoints({
    endpoints: (builder) => ({
        createSpending: builder.mutation({
            query: (body) => ({
                url: "/spending/create",
                method: "POST",
                body,
            }),
            invalidatesTags: ["Spending"],
        }),
        getSpending: builder.query({
            query: () => "/spending/",
            providesTags: ["Spending"],
        })
    }),
});

export const {
    useCreateSpendingMutation,
    useGetSpendingQuery,
} = spendingApi;