import React, { useState } from 'react';
import { FaPlus } from 'react-icons/fa';
import { useCreateTeacherMutation, useDeleteTeacherMutation, useGetTeacherQuery, useUpdateTeacherMutation } from '../../context/services/teacher.service';
import { useForm } from 'react-hook-form';
import TableComponent from '../../components/table/table';
import { MdDeleteForever, MdEdit } from 'react-icons/md';
import { message, Modal, Popconfirm } from 'antd';

const Teachers = () => {
    const { data: teachers = [] } = useGetTeacherQuery();
    const [createTeacher] = useCreateTeacherMutation()
    const [updateTeacher] = useUpdateTeacherMutation()
    const [deleteTeacher] = useDeleteTeacherMutation()
    const [open, setOpen] = useState(false)
    const [editingTeacher, setEditingTeacher] = useState("")
    const { reset, handleSubmit, register, formState: { errors } } = useForm()

    async function handleCreateTeacher(data) {
        try {
            data.phone = data.phone.toString();

            let response;
            if (editingTeacher) {
                response = await updateTeacher({ id: editingTeacher, body: data }).unwrap();
                setEditingTeacher("");
            } else {
                response = await createTeacher({ ...data }).unwrap();
            }
            setOpen(false);
            message.success(editingTeacher ? "O'qituvchi tahrirlandi" : "O'qituvchi qo'shildi");
        } catch (err) {
            console.error(err);
            message.error(err?.data?.message || "Serverda xatolik yuz berdi");
        }
    }

    const columns = [
        { title: "O'qituvchi ismi", dataIndex: "name", key: "name" },
        { title: "Telefon raqami", dataIndex: "phone", key: "phone" },
        {
            title: "Amallar",
            render: (_, record) => (
                <div className='table_actions'>
                    <button
                        onClick={() => {
                            setEditingTeacher(record._id);
                            reset({ name: record.name, phone: record.phone });
                            setOpen(true);
                        }}
                        className='edit_btn'
                    >
                        <MdEdit />
                    </button>

                    <Popconfirm
                        title="O'qituvchini o'chirmoqchimisiz?"
                        description="Ushbu holatda unga ulangan barcha guruhlarni tahrirlash kerak bo'ladi"
                        onConfirm={() => deleteTeacher(record._id)}
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
            <Modal open={open} onCancel={() => { setOpen(false) }} footer={[]} title={editingTeacher ? "O'qituvchini tahrirlash" : "O'qituvchi qo'shish"}>
                <form autoComplete='off' onSubmit={handleSubmit(handleCreateTeacher)} className="modal_form">
                    <input {...register("name", { required: "O'qituvchi ismini kiriting" })} type="text" placeholder="O'qituvchi ismi" />
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

                    <button type="submit">{editingTeacher ? "Tahrirlash" : "Qo'shish"}</button>
                </form>
            </Modal>
            <div className="page_header">
                <b>O'qituvchilar</b>
                <div className="header_actions">
                    <button onClick={() => { reset({ name: "", phone: null, password: "" }); setOpen(true) }}>
                        <FaPlus />
                        O'qituvchi qo'shish
                    </button>
                </div>
            </div>
            <TableComponent
                columns={columns}
                data={teachers.filter(teacher => teacher.status === "active")}
            />
        </div>
    );
};


export default Teachers;