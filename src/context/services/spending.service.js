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
    }),
    deleteSpending: builder.mutation({
      query: (id) => ({
        url: `/spending/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Spending"],
    }),
  }),
});

export const {
  useCreateSpendingMutation,
  useGetSpendingQuery,
  useDeleteSpendingMutation,
} = spendingApi;
