import React, { useEffect, useState } from 'react';
import { useGetStudentQuery } from '../../context/services/students.service';
import { useGetGroupQuery } from '../../context/services/group.service';
import { useForm } from 'react-hook-form';
import TableComponent from '../../components/table/table';
import { useCreatePaymentMutation, useGetPaymentQuery } from '../../context/services/payment.service';
import { useGetSubjectQuery } from '../../context/services/subject.service';
import { FaDollarSign, FaList } from 'react-icons/fa6';
import { message, Modal } from 'antd';
import moment from 'moment';
import { useNavigate } from 'react-router-dom';

const Payment = () => {
    const { data: students = [] } = useGetStudentQuery()
    const { data: groups = [] } = useGetGroupQuery()
    const { data: payments = [] } = useGetPaymentQuery()
    const { data: subjects = [] } = useGetSubjectQuery()
    const role = JSON.parse(localStorage.getItem('user')).role
    const [createPayment] = useCreatePaymentMutation()
    const [searchText, setSearchText] = useState("")
    const [selectedGroup, setSelectedGroup] = useState("")
    const [selectedStudent, setSelectedStudent] = useState("")
    const { register, handleSubmit, reset, formState: { errors } } = useForm()
    const [filteredStudents, setFilteredStudents] = useState([])
    const [open, setOpen] = useState(false)
    const [listOpen, setListOpen] = useState(false)
    const navigate = useNavigate()

    useEffect(() => {
        setFilteredStudents(students.filter(g => g.status === "active" && g?.group_id === selectedGroup || g.name.toString().toLowerCase().includes(searchText.toLowerCase())))
    }, [groups, searchText, selectedGroup])

    const columns = [
        { title: "O'quvchi ismi", dataIndex: "name", key: "name" },
        { title: "Guruhi", render: (_, record) => groups?.find(t => t._id === record?.group_id)?.group_number + groups?.find(t => t._id === record?.group_id)?.group_name },
        {
            title: "To'lagan summa", render: (_, record) => {
                const groupPayments = payments.filter(payment => payment.student_id === record._id)
                const totalPayment = groupPayments.reduce((acc, curr) => acc + curr.amount, 0)
                return totalPayment.toLocaleString() + " so'm"
            }
        },
        {
            title: "Qolgan summa",
            render: (_, record) => {
                const groupPayments = payments.filter(payment => payment.student_id === record._id)
                const paidPayment = groupPayments.reduce((acc, curr) => acc + curr.amount, 0)
                const subject = subjects?.find(subject => subject._id === groups?.find(g => g._id === record.group_id)?.subject_id)
                return (subject?.price - paidPayment).toLocaleString() + " so'm"
            }
        },
        {
            title: "Amallar", render: (_, record) => (
                <div className='table_actions'>
                    <button
                        onClick={() => {
                            setSelectedStudent(record._id);
                            setListOpen(true);
                        }}
                        className="get_btn">
                        <FaList />
                    </button>
                    <button
                        onClick={() => {
                            setSelectedStudent(record._id);
                            reset({ amount: null });
                            setOpen(true);
                        }}
                        className='edit_btn'
                    >
                        <FaDollarSign />
                    </button>
                </div>
            )
        }
    ]

    async function recordPayment(data) {
        let response;

        data.amount = Number(data.amount)
        data.student_id = selectedStudent;
        data.group_id = groups?.find(g => g.students.includes(selectedStudent))._id;
        response = await createPayment(data)
        if (response.error) {
            console.log(response.error.data);
            message.error(response.error.data?.message || "To'lovni qayd qilishda xatolik");
            return;
        }
        message.success("To'lov qayd etildi");
        setOpen(false);
        setSelectedStudent("")
        reset({ amount: null })
    }

    return (
        <div className='page'>
            <Modal footer={[]} open={listOpen} title="To'lovlar" onCancel={() => { setListOpen(false); setSelectedStudent("") }}>
                <table className="table">
                    <thead>
                        <tr>
                            <td>№</td>
                            <td>To'lov summasi</td>
                            <td>To'lov usuli</td>
                            <td>To'lov qilingan sanasi</td>
                        </tr>
                    </thead>
                    <tbody>
                        {
                            payments?.filter(payment => payment.student_id === selectedStudent).map((payment, index) => (
                                <tr key={index}>
                                    <td>{index + 1}</td>
                                    <td>{payment.amount.toLocaleString()} so'm</td>
                                    <td>{payment.payment_method === "cash" ? "Naqd" : payment.payment_method === "card" ? 'Karta' : "Bank"}</td>
                                    <td>{moment(payment.createdAt).format("DD.MM.YYYY HH:mm")}</td>
                                </tr>
                            ))
                        }
                    </tbody>
                </table>
            </Modal>
            <Modal open={open} footer={[]} title="To'lovni qayd qilish" onCancel={() => {
                setOpen(false);
                reset({ amount: null });
                setSelectedStudent("");
            }}>
                <form onSubmit={handleSubmit(recordPayment)} className="modal_form">
                    <input {...register("amount", { required: "To'lov summasini kiriting" })} type="number" placeholder="To'lov summasi" />
                    {errors.amount && <p style={{ color: 'red', textDecoration: "none" }}>{errors.amount.message}</p>}
                    <button type="submit">Qayd qilish</button>
                </form>
            </Modal>
            <div className="page_header">
                <b>To'lovni qayd etish</b>
                <div className="header_actions">
                    <input style={{ width: "300px" }} type="search" placeholder="O'quvchini qidirish" />
                    <select onChange={(e) => setSelectedGroup(e.target.value)}>
                        <option value="">Barcha guruhlar</option>
                        {
                            groups?.map((group) => (
                                <option value={group._id}>
                                    {group?.group_number + group?.group_name}
                                </option>
                            ))
                        }
                    </select>
                    {
                        role === "admin" && (
                            <button onClick={() => navigate("log")}>
                                To'lovlar jurnali
                            </button>
                        )
                    }
                </div>
            </div>
            <TableComponent columns={columns} data={filteredStudents} />
        </div>
    );
};


export default Payment;