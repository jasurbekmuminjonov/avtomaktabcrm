import { apiSlice } from "./api.service";

export const authApi = apiSlice.injectEndpoints({
    endpoints: (builder) => ({
        loginAdmin: builder.mutation({
            query: (body) => ({
                url: "/aschool/login",
                method: "POST",
                body
            }),
            invalidatesTags: ["Admin"]
        }),
        loginCashier: builder.mutation({
            query: (body) => ({
                url: "/cashier/login",
                method: "POST",
                body
            }),
            invalidatesTags: ["Cashier"]
        }),
        loginTeacher: builder.mutation({
            query: (body) => ({
                url: "/teacher/login",
                method: "POST",
                body
            }),
            invalidatesTags: ["Teacher"]
        })
    })
})


export const { useLoginAdminMutation, useLoginCashierMutation, useLoginTeacherMutation } = authApi;