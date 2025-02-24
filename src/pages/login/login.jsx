import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import './login.css'
import { useLoginAdminMutation, useLoginCashierMutation, useLoginTeacherMutation } from '../../context/services/auth.service';
import { message } from 'antd';
const Login = () => {
    const [loginAdmin] = useLoginAdminMutation()
    const [loginCashier] = useLoginCashierMutation()
    const [loginTeacher] = useLoginTeacherMutation()

    const { register, handleSubmit, reset, formState: { errors } } = useForm()
    const [userRole, setUserRole] = useState("admin")

    async function loginUser(data) {
        let response;

        if (userRole === "admin") {
            response = await loginAdmin(data);
        } else if (userRole === "cashier") {
            response = await loginCashier(data);
        } else {
            response = await loginTeacher(data);
        }

        if (response.error) {
            console.log(response.error.data);
            message.error(response.error.data?.message || "Avtorizatsiyadan o'tishda xatolik");
            return;
        }
        localStorage.setItem("access_token", response.data.token);
        localStorage.setItem("user", JSON.stringify(response.data.user));
        await message.success("Avtorizatsiyadan o'tdingiz");
        window.location.href = "/";
    }



    return (
        <div className='login'>
            <form autoComplete='off' onSubmit={handleSubmit(loginUser)} className="login_form">
                <b>Hisobga kirish</b>
                <div style={{ display: "flex", alignItems: "center", width: "100%" }} className="phone_input">
                    <span style={{ width: "50px" }}>+998</span>
                    <input
                        style={{ flexGrow: 1 }}
                        {...register("phone", { required: "Telefon raqamni kiriting", minLength: { value: 9, message: "Talab etiladigan format: 991112233" }, maxLength: { value: 9, message: "Talab etiladigan format: 991112233" } })}
                        type="number"
                        placeholder="Telefon raqam"
                    />
                </div>
                {errors.phone && <p style={{ color: 'red', textDecoration: "none" }}>{errors.phone.message}</p>}
                <input
                    {...register("password", {
                        required: "Parolni kiriting"
                    })}
                    type="password"
                    placeholder="Parol"
                />
                {errors.password && <p style={{ color: 'red', textDecoration: "none" }}>{errors.password.message}</p>}
                <button>{userRole === "admin" ? "Admin" : userRole === "cashier" ? "Kassir" : userRole === "teacher" ? "O'qituvchi" : "Admin"} sifatida kirish</button>
                {
                    userRole !== "admin" && (
                        <p onClick={() => setUserRole("admin")}>Admin sifatida kirish</p>
                    )
                }
                {
                    userRole !== "cashier" && (
                        <p onClick={() => setUserRole("cashier")}>Kassir sifatida kirish</p>
                    )
                }
                {
                    userRole !== "teacher" && (
                        <p onClick={() => setUserRole("teacher")}>O'qituvchi sifatida kirish</p>
                    )
                }
            </form>
        </div>
    );
};


export default Login;