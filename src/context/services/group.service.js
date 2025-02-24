import { apiSlice } from "./api.service";

export const groupApi = apiSlice.injectEndpoints({
    endpoints: (builder) => ({
        createGroup: builder.mutation({
            query: (body) => ({
                url: "/group/create",
                method: "POST",
                body,
            }),
            invalidatesTags: ["Group"],
        }),
        getGroup: builder.query({
            query: () => "/group",
            providesTags: ["Group"],
        }),
        updateGroup: builder.mutation({
            query: ({ body, id }) => ({
                url: `/group/${id}`,
                method: "PUT",
                body,
            }),
            invalidatesTags: ["Group"],
        }),
        deleteGroup: builder.mutation({
            query: (id) => ({
                url: `/group/${id}`,
                method: "DELETE",
            }),
            invalidatesTags: ["Group"],
        }),
    }),
});

export const {
    useCreateGroupMutation,
    useGetGroupQuery,
    useUpdateGroupMutation,
    useDeleteGroupMutation,
} = groupApi;