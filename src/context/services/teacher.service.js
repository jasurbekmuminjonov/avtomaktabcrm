import { apiSlice } from "./api.service";

export const teacherApi = apiSlice.injectEndpoints({
    endpoints: (builder) => ({
        createTeacher: builder.mutation({
            query: (body) => ({
                url: "/teacher/create",
                method: "POST",
                body,
            }),
            invalidatesTags: ["Teacher"],
        }),
        getTeacher: builder.query({
            query: () => "/teacher/",
            providesTags: ["Teacher"],
        }),
        updateTeacher: builder.mutation({
            query: ({ body, id }) => ({
                url: `/teacher/${id}`,
                method: "PUT",
                body,
            }),
            invalidatesTags: ["Teacher"],
        }),
        deleteTeacher: builder.mutation({
            query: (id) => ({
                url: `/teacher/${id}`,
                method: "DELETE",
            }),
            invalidatesTags: ["Teacher"],
        }),
    }),
});

export const {
    useCreateTeacherMutation,
    useGetTeacherQuery,
    useUpdateTeacherMutation,
    useDeleteTeacherMutation,
} = teacherApi;