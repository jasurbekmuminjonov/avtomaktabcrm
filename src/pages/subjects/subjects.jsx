import React, { useState } from 'react';
import { FaPlus } from 'react-icons/fa';
import { useCreateSubjectMutation, useDeleteSubjectMutation, useGetSubjectQuery, useUpdateSubjectMutation } from '../../context/services/subject.service';
import { useForm } from 'react-hook-form';
import TableComponent from '../../components/table/table';
import { MdDeleteForever, MdEdit } from 'react-icons/md';
import { Modal, Popconfirm } from 'antd';

const Subjects = () => {
    const { data: subjects = [] } = useGetSubjectQuery();
    const [createSubject] = useCreateSubjectMutation()
    const [updateSubject] = useUpdateSubjectMutation()
    const [deleteSubject] = useDeleteSubjectMutation()
    const [open, setOpen] = useState(false)
    const [editingSubject, setEditingSubject] = useState("")
    const { reset, handleSubmit, register, formState: { errors } } = useForm()

    function handleCreateSubject(data) {
        data.price = Number(data.price)
        data.duration_months = Number(data.duration_months)
        if (editingSubject) {
            updateSubject({ id: editingSubject, body: data })
            setEditingSubject("")
            setOpen(false)
        } else {
            createSubject({ ...data })
            setOpen(false)
        }
    }
    const columns = [
        { title: "Bosqich nomi", dataIndex: "name", key: "name" },
        { title: "O'qish davomiyligi(oy)", dataIndex: "duration_months", key: "duration_months" },
        { title: "Bosqich narxi", render: (_, record) => record.price.toLocaleString() + " so'm", key: "name" },
        {
            title: "Amallar",
            render: (_, record) => (
                <div className='table_actions'>
                    <button
                        onClick={() => {
                            setEditingSubject(record._id);
                            reset({ name: record.name, duration_months: record.duration_months, price: record.price });
                            setOpen(true);
                        }}
                        className='edit_btn'
                    >
                        <MdEdit />
                    </button>

                    <Popconfirm
                        title="Bosqichni o'chirmoqchimisiz?"
                        description="Ushbu holatda unga ulangan barcha guruhlarni tahrirlash kerak bo'ladi"
                        onConfirm={() => deleteSubject(record._id)}
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
            <Modal open={open} onCancel={() => { setOpen(false) }} footer={[]} title={editingSubject ? "Bosqichni tahrirlash" : "Bosqich qo'shish"}>
                <form autoComplete='off' onSubmit={handleSubmit(handleCreateSubject)} className="modal_form">
                    <input {...register("name", { required: "Bosqich nomini kiriting" })} type="text" placeholder="Bosqich nomi" />
                    {errors.name && <p style={{ color: 'red', textDecoration: "none" }}>{errors.name.message}</p>}
                    <input {...register("duration_months", { required: "O'qish davomiyligi(oy) kiriting", min: 1 })} type="number" placeholder="O'qish davomiyligi(oy)" />
                    {errors.duration_months && <p style={{ color: 'red', textDecoration: "none" }}>{errors.duration_months.message}</p>}
                    <input {...register("price", { required: "Bosqich narxi kiriting", min: 1 })} type="number" placeholder="Bosqich narxi" />
                    {errors.price && <p style={{ color: 'red', textdecoration: "none" }}>{errors.price.message}</p>}
                    <button type="submit">{editingSubject ? "Tahrirlash" : "Qo'shish"}</button>
                </form>
            </Modal>
            <div className="page_header">
                <b>Bosqichlar</b>
                <div className="header_actions">
                    <button onClick={() => { reset({ name: "", duration_months: null, price: null }); setOpen(true) }}>
                        <FaPlus />
                        Bosqich qo'shish
                    </button>
                </div>
            </div>
            <TableComponent
                columns={columns}
                data={subjects.filter(subject => subject.status === "active")}
            />
        </div>
    );
};


export default Subjects;