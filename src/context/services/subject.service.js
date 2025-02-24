import { apiSlice } from "./api.service";

export const subjectApi = apiSlice.injectEndpoints({
    endpoints: (builder) => ({
        createSubject: builder.mutation({
            query: (body) => ({
                url: "/subject/create",
                method: "POST",
                body,
            }),
            invalidatesTags: ["Subject"],
        }),
        getSubject: builder.query({
            query: () => "/subject",
            providesTags: ["Subject"],
        }),
        updateSubject: builder.mutation({
            query: ({ body, id }) => ({
                url: `/subject/${id}`,
                method: "PUT",
                body,
            }),
            invalidatesTags: ["Subject"],
        }),
        deleteSubject: builder.mutation({
            query: (id) => ({
                url: `/subject/${id}`,
                method: "DELETE",
            }),
            invalidatesTags: ["Subject"],
        }),
    }),
});

export const {
    useCreateSubjectMutation,
    useGetSubjectQuery,
    useUpdateSubjectMutation,
    useDeleteSubjectMutation,
} = subjectApi;