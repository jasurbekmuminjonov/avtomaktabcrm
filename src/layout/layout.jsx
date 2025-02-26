import React from 'react';
import { FaBook, FaCashRegister, FaChalkboardTeacher, FaChartPie } from 'react-icons/fa';
import { MdExitToApp, MdGroups, MdOutlinePayment } from 'react-icons/md';
import { PiStudentBold } from 'react-icons/pi';
import { Link, Navigate, Route, Routes, useLocation } from 'react-router-dom';
import './layout.css'
import Subjects from '../pages/subjects/subjects';
import Groups from '../pages/groups/groups';
import Teachers from '../pages/teachers/teachers';
import Students from '../pages/students/students';
import Payments from '../pages/payment/payment';
import Statistics from '../pages/statistics/statistics';
import Cashiers from '../pages/cashiers/cashiers';
import PaymentLog from '../pages/payment/paymentLog';
import Spending from '../pages/spendings/Spendings';
import { GiExpense } from 'react-icons/gi';
const Layout = () => {
    const location = useLocation()
    const user = JSON.parse(localStorage.getItem("user")) || {}

    return (
        <div className='layout'>
            <aside>
                <div className="aside_top">
                    <p>{user.name || "AVTOMAKTAB"}</p>
                </div>
                <div className="aside_body">
                    {
                        user.role !== "teacher" && (
                            <>
                                {user.role !== "cashier" && (
                                    <Link className={location.pathname === "/" && "active"} to="/">
                                        <FaChartPie />
                                        <p>Statistika</p>
                                    </Link>
                                )}
                                <Link className={location.pathname === "/students" && "active"} to="/students">
                                    <PiStudentBold />
                                    <p>O'quvchilar</p>
                                </Link>
                            </>
                        )
                    }
                    {
                        user.role === "teacher" ? (
                            <Link className={location.pathname === "/" && "active"} to="/">
                                <MdGroups />
                                <p>Guruhlar</p>
                            </Link>
                        ) : (
                            <Link className={location.pathname === "/groups" && "active"} to="/groups">
                                <MdGroups />
                                <p>Guruhlar</p>
                            </Link>
                        )
                    }
                    {
                        user.role !== "teacher" && (
                            <>

                                {user.role !== "cashier" && (

                                    <>
                                        <Link className={location.pathname === "/payment" && "active"} to="/payment">
                                            <MdOutlinePayment />
                                            <p>To'lovlar</p>
                                        </Link>
                                        <Link className={location.pathname === "/expenses" && "active"} to="/expenses">
                                            <GiExpense />
                                            <p>Harajatlar</p>
                                        </Link>
                                        <Link className={location.pathname === "/subjects" && "active"} to="/subjects">
                                            <FaBook />
                                            <p>Bosqichlar</p>
                                        </Link>
                                        <Link className={location.pathname === "/teachers" && "active"} to="/teachers">
                                            <FaChalkboardTeacher />
                                            <p>O'qituvchilar</p>
                                        </Link>
                                        <Link className={location.pathname === "/cashiers" && "active"} to="/cashiers">
                                            <FaCashRegister />
                                            <p>Kassirlar</p>
                                        </Link>
                                    </>
                                )}

                            </>
                        )
                    }

                </div>
                <div className="signature">
                    <span>
                        Developer:
                    </span>
                    <a target='_blank' href="https://t.me/jasurbek_fullstack">@jasurbek_fullstack</a>
                </div>
            </aside>
            <main>
                <header>
                    <div className="head_names">
                        <p>Rol: {user.role === "admin" ? "Admin" : user.role === "cashier" ? "Kassir" : user.role === "teacher" ? "O'qituvchi" : ""}</p>

                    </div>
                    <button onClick={() => {
                        localStorage.clear();
                        window.location.href = "/"
                    }}>
                        <MdExitToApp /> Chiqish
                    </button>
                </header>
                <div className="body">
                    <Routes>
                        {
                            user.role !== "teacher" && (
                                <>
                                    {
                                        user.role !== "cashier" && (
                                            <>
                                                <Route path='/' element={<Statistics />} />
                                                <Route path='/subjects' element={<Subjects />} />
                                                <Route path='/teachers' element={<Teachers />} />
                                                <Route path='/cashiers' element={<Cashiers />} />
                                                <Route path='/expenses' element={<Spending />} />
                                                <Route path='/payment' element={<PaymentLog />} />
                                            </>
                                        )
                                    }
                                    <Route path='/students' element={<Students />} />
                                </>
                            )
                        }
                        <Route path={user.role !== "teacher" ? "/groups" : "/"} element={<Groups />} />
                        <Route path='*' element={<Navigate to={user.role === "cashier" ? "/payment" : "/"} replace />} />
                    </Routes>
                </div>
            </main>
        </div>
    );
};

export default Layout;