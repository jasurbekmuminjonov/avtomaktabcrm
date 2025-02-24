import { apiSlice } from "./api.service";

export const studentApi = apiSlice.injectEndpoints({
    endpoints: (builder) => ({
        createStudent: builder.mutation({
            query: (body) => ({
                url: "/student/create",
                method: "POST",
                body,
            }),
            invalidatesTags: ["Student", "Group"],
        }),
        getStudent: builder.query({
            query: () => "/student",
            providesTags: ["Student"],
        }),
        updateStudent: builder.mutation({
            query: ({ body, id }) => ({
                url: `/student/${id}`,
                method: "PUT",
                body,
            }),
            invalidatesTags: ["Student", "Group"],
        }),
        deleteStudent: builder.mutation({
            query: (id) => ({
                url: `/student/${id}`,
                method: "DELETE",
            }),
            invalidatesTags: ["Student", "Group"],
        }),
    }),
});

export const {
    useCreateStudentMutation,
    useGetStudentQuery,
    useUpdateStudentMutation,
    useDeleteStudentMutation,
} = studentApi;