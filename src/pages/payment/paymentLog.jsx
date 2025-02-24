import React, { useState } from 'react';
import TableComponent from '../../components/table/table';
import { useDeletePaymentMutation, useGetPaymentQuery, useUpdatePaymentMutation } from '../../context/services/payment.service';
import { useGetStudentQuery } from '../../context/services/students.service';
import moment from 'moment';
import { MdDeleteForever, MdEdit } from 'react-icons/md';
import { Popconfirm, Modal, Input } from 'antd';
import { useForm } from 'react-hook-form';
import { FaChevronLeft } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';

const PaymentLog = () => {
    const { data: payments = [] } = useGetPaymentQuery();
    const { data: students = [] } = useGetStudentQuery();
    const [updatePayment] = useUpdatePaymentMutation();
    const [deletePayment] = useDeletePaymentMutation();
    const navigate = useNavigate();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedPayment, setSelectedPayment] = useState(null);
    const { register, handleSubmit, setValue } = useForm();
    const [searchTerm, setSearchTerm] = useState("");

    const handleEdit = (payment) => {
        setSelectedPayment(payment);
        setValue("amount", payment.amount);
        setIsModalOpen(true);
    };

    const handleUpdate = (data) => {
        if (selectedPayment) {
            updatePayment({ id: selectedPayment._id, body: { amount: Number(data.amount) } });
            setIsModalOpen(false);
        }
    };

    const filteredPayments = payments.filter(payment => {
        const student = students.find(s => String(s._id) === String(payment.student_id));
        return student && student.name.toLowerCase().includes(searchTerm.toLowerCase());
    });

    const columns = [
        {
            title: "O'quvchi ismi",
            render: (_, record) => {
                const student = students.find(s => String(s._id) === String(record.student_id));
                if (!student) return "Noma'lum";
                return `${student.name} ${student.status !== "active" ? "‼️" : ""}`;
            }
        },
        { title: "To'lov summasi", dataIndex: "amount", render: (text) => text.toLocaleString() },
        { title: "To'lov sanasi", dataIndex: "createdAt", render: (text) => moment(text).format("DD.MM.YYYY HH:mm") },
        {
            title: "Amallar", render: (_, record) => (
                <div className="table_actions">
                    <button className="edit_btn" onClick={() => handleEdit(record)}>
                        <MdEdit />
                    </button>
                    <Popconfirm
                        title="To'lovni o'chirmoqchimisiz?"
                        description="Agarda adashib to'lov qayd qilib yuborgan bo'lsangizgina o'chiring"
                        onConfirm={() => deletePayment(record._id)}
                        okText="O'chirish"
                        cancelText="Orqaga"
                        overlayStyle={{ width: "300px" }}
                    >
                        <button className='delete_btn'>
                            <MdDeleteForever />
                        </button>
                    </Popconfirm>
                </div>
            )
        }
    ];

    return (
        <div className='page'>
            <div className="page_header">
                <b>Barcha to'lovlar</b>
                <div className="header_actions">
                    <input
                        type='search'
                        placeholder="O'quvchi ismi bo'yicha qidiring"
                        onChange={(e) => setSearchTerm(e.target.value)}
                        style={{ width: "250px" }}
                    />
                    <button onClick={() => navigate(-1)}>
                        <FaChevronLeft /> Orqaga
                    </button>
                </div>
            </div>
            <TableComponent columns={columns} data={filteredPayments} />

            <Modal
                title="To'lovni tahrirlash"
                open={isModalOpen}
                onCancel={() => setIsModalOpen(false)}
                footer={null}
            >
                <form className="modal_form" onSubmit={handleSubmit(handleUpdate)}>
                    <label>To'lov summasi</label>
                    <input type="number" {...register("amount", { required: true, min: 0 })} />
                    <button type="submit">Tahrirlash</button>
                </form>
            </Modal>
        </div>
    );
};

export default PaymentLog;