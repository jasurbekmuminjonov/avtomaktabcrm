import React, { useState } from 'react';
import { FaPlus } from 'react-icons/fa';
import { useCreateCashierMutation, useDeleteCashierMutation, useGetCashierQuery, useUpdateCashierMutation } from '../../context/services/cashier.service';
import { useForm } from 'react-hook-form';
import TableComponent from '../../components/table/table';
import { MdDeleteForever, MdEdit } from 'react-icons/md';
import { message, Modal, Popconfirm } from 'antd';

const Cashiers = () => {
    const { data: cashiers = [] } = useGetCashierQuery();
    const [createCashier] = useCreateCashierMutation()
    const [updateCashier] = useUpdateCashierMutation()
    const [deleteCashier] = useDeleteCashierMutation()
    const [open, setOpen] = useState(false)
    const [editingCashier, setEditingCashier] = useState("")
    const { reset, handleSubmit, register, formState: { errors } } = useForm()

    async function handleCreateCashier(data) {
        try {
            data.phone = data.phone.toString();

            let response;
            if (editingCashier) {
                response = await updateCashier({ id: editingCashier, body: data }).unwrap();
                setEditingCashier("");
            } else {
                response = await createCashier({ ...data }).unwrap();
            }
            setOpen(false);
            message.success(editingCashier ? "Kassir tahrirlandi" : "Kassir qo'shildi");
        } catch (err) {
            console.error(err);
            message.error(err?.data?.message || "Serverda xatolik yuz berdi");
        }
    }

    const columns = [
        { title: "Kassir ismi", dataIndex: "name", key: "name" },
        { title: "Telefon raqami", dataIndex: "phone", key: "phone" },
        {
            title: "Amallar",
            render: (_, record) => (
                <div className='table_actions'>
                    <button
                        onClick={() => {
                            setEditingCashier(record._id);
                            reset({ name: record.name, phone: record.phone });
                            setOpen(true);
                        }}
                        className='edit_btn'
                    >
                        <MdEdit />
                    </button>

                    <Popconfirm
                        title="Kassirni o'chirmoqchimisiz?"
                        description="Ushbu holatda kassir hisobidan chiqishi xatolarni kamaytiradi"
                        onConfirm={() => deleteCashier(record._id)}
                        onCancel={() => { }}
                        okText="O'chirish"
                        cancelText="Orqaga"
                        overlayStyle={{
                            width: "300px"
                        }}
                    >
                        <button className='delete_btn'>
                            <MdDeleteForever />
                        </button>
                    </Popconfirm>
                </div>
            ),
            key: "actions"
        }

    ]
    return (
        <div className='page'>
            <Modal open={open} onCancel={() => { setOpen(false) }} footer={[]} title={editingCashier ? "Kassirni tahrirlash" : "Kassir qo'shish"}>
                <form autoComplete='off' onSubmit={handleSubmit(handleCreateCashier)} className="modal_form">
                    <input {...register("name", { required: "Kassir ismini kiriting" })} type="text" placeholder="Kassir ismi" />
                    {errors.name && <p style={{ color: 'red', textDecoration: "none" }}>{errors.name.message}</p>}
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

                    <button type="submit">{editingCashier ? "Tahrirlash" : "Qo'shish"}</button>
                </form>
            </Modal>
            <div className="page_header">
                <b>Kassirlar</b>
                <div className="header_actions">
                    <button onClick={() => { reset({ name: "", phone: null, password: "" }); setOpen(true) }}>
                        <FaPlus />
                        Kassir qo'shish
                    </button>
                </div>
            </div>
            <TableComponent
                columns={columns}
                data={cashiers}
            />
        </div>
    );
};


export default Cashiers;