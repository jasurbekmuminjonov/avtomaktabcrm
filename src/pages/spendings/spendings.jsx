import React, { useState } from 'react';
import { FaPlus } from 'react-icons/fa';
import { useForm } from 'react-hook-form';
import TableComponent from '../../components/table/table';
import { message, Modal } from 'antd';
import { useCreateSpendingMutation, useGetSpendingQuery } from '../../context/services/spending.service';
import moment from 'moment';

const Spendings = () => {
    const { data: spendings = [] } = useGetSpendingQuery();
    const [createSpending] = useCreateSpendingMutation()
    const { reset, handleSubmit, register, formState: { errors } } = useForm()
    const [open, setOpen] = useState(false)
    async function handleCreateCashier(data) {
        try {
            data.amount = Number(data.amount);

            let response;
            response = await createSpending({ ...data }).unwrap();
            setOpen(false);
            message.success("Harajat qo'shildi");
        } catch (err) {
            console.error(err);
            message.error(err?.data?.message || "Serverda xatolik yuz berdi");
        }
    }

    const columns = [
        { title: "Sarlavha", dataIndex: "title", key: "title" },
        { title: "Tavsif", dataIndex: "description", key: "description" },
        { title: "Summa", dataIndex: "amount", key: "amount", render: (text) => text.toLocaleString() },
        {
            title: "Sana",
            render: (_, record) => moment(record.createdAt).format("DD.MM.YYYY HH:mm")
        }

    ]
    return (
        <div className='page'>
            <Modal open={open} onCancel={() => { setOpen(false) }} footer={[]} title={"Harajat qo'shish"}>
                <form autoComplete='off' onSubmit={handleSubmit(handleCreateCashier)} className="modal_form">
                    <input {...register("title", { required: "Harajat sarlavhasini kiriting" })} type="text" placeholder="Harajat sarlavhasi" />
                    {errors.title && <p style={{ color: 'red', textDecoration: "none" }}>{errors.title.message}</p>}
                    <textarea {...register("description", { required: "Harajat tavsifini kiriting" })} type="text" placeholder="Harajat tavsifi" />
                    {errors.description && <p style={{ color: 'red', textDecoration: "none" }}>{errors.description.message}</p>}
                    <input
                        {...register("amount", {
                            required: "Summani kiriting"
                        })}
                        type="number"
                        placeholder="Summa"
                    />
                    {errors.amount && <p style={{ color: 'red', textDecoration: "none" }}>{errors.amount.message}</p>}

                    <button type="submit">{"Qo'shish"}</button>
                </form>
            </Modal>
            <div className="page_header">
                <b>Harajatlar</b>
                <div className="header_actions">
                    <p>Jami harajat: {spendings.reduce((a, b) => a + b.amount, 0).toLocaleString()}</p>
                    <button onClick={() => { reset({ title: "", amount: null, description: "" }); setOpen(true) }}>
                        <FaPlus />
                        Harajat qo'shish
                    </button>
                </div>
            </div>
            <TableComponent
                columns={columns}
                data={spendings}
            />
        </div>
    );
};


export default Spendings;