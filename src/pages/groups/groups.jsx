import React, { useEffect, useState } from 'react';
import { FaList, FaPlus } from 'react-icons/fa';
import { useCreateGroupMutation, useDeleteGroupMutation, useGetGroupQuery, useUpdateGroupMutation } from '../../context/services/group.service';
import { useForm } from 'react-hook-form';
import TableComponent from '../../components/table/table';
import { MdDeleteForever, MdEdit } from 'react-icons/md';
import { Modal, Popconfirm } from 'antd';
import { useGetTeacherQuery } from '../../context/services/teacher.service';
import { useGetSubjectQuery } from '../../context/services/subject.service';
import { useGetPaymentQuery } from '../../context/services/payment.service';
import { useGetStudentQuery } from '../../context/services/students.service';
import { FiMinus } from 'react-icons/fi';

const Groups = () => {
    const { data: groups = [] } = useGetGroupQuery();
    const { data: teachers = [] } = useGetTeacherQuery();
    const { data: subjects = [] } = useGetSubjectQuery();
    const { data: students = [] } = useGetStudentQuery();
    const { data: payments = [] } = useGetPaymentQuery();
    const user = JSON.parse(localStorage.getItem('user'));
    const [createGroup] = useCreateGroupMutation()
    const [updateGroup] = useUpdateGroupMutation()
    const [deleteGroup] = useDeleteGroupMutation()
    const [open, setOpen] = useState(false)
    const [listOpen, setListOpen] = useState(false)
    const [editingGroup, setEditingGroup] = useState("")
    const [listGroup, setListGroup] = useState([])
    const { reset, handleSubmit, register, formState: { errors } } = useForm()
    const [filteredGroups, setFilteredGroups] = useState([])
    const [searchText, setSearchText] = useState("")
    const [selectedSubject, setSelectedSubject] = useState("")

    useEffect(() => {
        setFilteredGroups(groups.filter(g => g.status === "active" && g?.subject_id === selectedSubject || g.group_number.toString().toLowerCase().includes(searchText.toLowerCase()) || g.group_name.toString().toLowerCase().includes(searchText.toLowerCase())))
    }, [groups, searchText, selectedSubject])
    function handleCreateGroup(data) {
        data.group_number = data.group_number.toString();

        if (editingGroup) {
            updateGroup({ id: editingGroup, body: data })
            setEditingGroup("")
            setOpen(false)
        } else {
            createGroup({ ...data })
            setOpen(false)
        }
    }

    const statusIcons = {
        "active": "",
        "inactive": "‼️"
    }
    const columns = [
        {
            title: "№",
            dataIndex: "key",
            render: (_text, _record, index) => index + 1
        },
        {
            title: "Guruh nomi", render: (_, record) => record.group_number + record.group_name, key: "name"
        },
        {
            title: "O'qituvchi",
            render: (_, record) => {
                const teacher = teachers?.find(t => t._id === record.teacher_id);
                return teacher ? (
                    <>
                        {teacher.name} {statusIcons[teacher.status]}
                    </>
                ) : (<FiMinus />);
            },
            key: "teacher_id"
        },


        {
            title: "Bosqich",
            render: (_, record) => subjects?.find(t => t._id === record?.subject_id)?.name,
            key: "teacher_id"
        },
        {
            title: "O'quvchi soni",
            render: (_, record) => record.students.length + " ta"
        },
        {
            title: "Qilingan to'lov", render: (_, record) => {
                const groupPayments = payments.filter(payment => record.students.includes(payment.student_id))
                const totalPayment = groupPayments.reduce((acc, curr) => acc + curr.amount, 0)
                return totalPayment.toLocaleString() + " so'm"
            }
        },
        {
            title: "Qolgan to'lov", render: (_, record) => {
                const groupPayments = payments.filter(payment => record.students.includes(payment.student_id))
                const paidPayment = groupPayments.reduce((acc, curr) => acc + curr.amount, 0)
                const totalPayment = subjects?.find(subject => subject._id === record.subject_id)?.price * record.students.length
                return (totalPayment - paidPayment).toLocaleString() + " so'm"
            }
        },
        {
            title: "Qilingan to'lov(%)",
            render: (_, record) => {
                const groupPayments = payments.filter(payment => record.students.includes(payment.student_id))
                const paidPayment = groupPayments.reduce((acc, curr) => acc + curr.amount, 0);
                const subject = subjects?.find(subject => subject._id === record.subject_id);
                const totalPayment = subject ? subject?.price * record.students.length : 0;
                const percentage = totalPayment > 0 ? (paidPayment / totalPayment) * 100 : 0;
                return <p style={{ background: `${percentage < 50 ? "#ff4979" : percentage < 80 ? "#ffb704" : "#2da254"}`, paddingInline: "2px", paddingBlock: "2px", width: "50px", color: "#fff", alignItems: "center", display: "flex", justifyContent: "center" }}>{percentage.parseInt(2).toLocaleString() + "%"}</p>;
            }
        },
        {
            title: "Amallar",
            render: (_, record) => (
                <div className='table_actions'>
                    <button className="get_btn" onClick={() => {
                        setListGroup(record.students);
                        setListOpen(true);
                    }}>
                        <FaList />
                    </button>
                    {
                        user.role !== "teacher" && (
                            <>
                                <button
                                    onClick={() => {
                                        setEditingGroup(record._id);
                                        reset({ group_name: record.group_name, group_number: record.group_number, subject_id: record.subject_id, teacher_id: record.teacher_id });
                                        setOpen(true);
                                    }}
                                    className='edit_btn'
                                >
                                    <MdEdit />
                                </button>
                                <Popconfirm
                                    title="Guruhni o'chirmoqchimisiz?"
                                    description="Ushbu holatda unga ulangan barcha o'quvchilarni tahrirlash kerak bo'ladi"
                                    onConfirm={() => deleteGroup(record._id)}
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
                            </>
                        )
                    }

                </div>
            ),
            key: "actions"
        }

    ]

    function getStudent(id) {
        return students?.find(student => student._id === id) || {};
    }
    return (
        <div className='page'>
            <Modal footer={[]} open={listOpen} title="Guruh ma'lumotlari" onCancel={() => { setListGroup([]); setListOpen(false) }}>
                <table className="table">
                    <thead>
                        <tr>
                            <td>O'quvchi ismi</td>
                            <td>Qilingan to'lov</td>
                            <td>Qolgan to'lov</td>
                        </tr>
                    </thead>
                    <tbody>
                        {
                            listGroup.map((student) => (
                                <tr key={student}>
                                    <td>{getStudent(student).name}</td>
                                    <td>
                                        {(() => {
                                            const paidPayments = payments?.filter(payment => payment.student_id === student);
                                            const totalPayment = paidPayments?.reduce((acc, curr) => acc + curr.amount, 0);
                                            return totalPayment.toLocaleString() + " so'm";
                                        })()}
                                    </td>
                                    <td>
                                        {(() => {
                                            const paidPayments = payments?.filter(payment => payment.student_id === student);
                                            const totalPayment = paidPayments?.reduce((acc, curr) => acc + curr.amount, 0);
                                            const subject = subjects?.find(subject => subject._id === groups?.find(gr => gr._id === getStudent(student).group_id)?.subject_id);
                                            return (subject?.price - totalPayment).toLocaleString() + " so'm"
                                        })()}
                                    </td>
                                </tr>
                            ))
                        }
                    </tbody>
                </table>
            </Modal>
            <Modal open={open} onCancel={() => { setOpen(false) }} footer={[]} title={editingGroup ? "Guruhni tahrirlash" : "Guruh qo'shish"}>
                <form autoComplete='off' onSubmit={handleSubmit(handleCreateGroup)} className="modal_form">
                    <input
                        {...register("group_name", { required: "Guruh harfini kiriting" })}
                        type="text"
                        placeholder="Guruh harfi(A, B va h.k)" />
                    {errors.group_name && <p style={{ color: 'red', textDecoration: "none" }}>{errors.group_name.message}</p>}
                    <input
                        {...register("group_number", { required: "Guruh raqamini kiriting" })}
                        type="number"
                        placeholder="Guruh raqami(1, 2 va h.k)" />
                    {errors.group_number && <p style={{ color: 'red', textDecoration: "none" }}>{errors.group_number.message}</p>}

                    <select {...register("teacher_id")}>
                        <option value="">{editingGroup ? "O'qituvchini guruhdan chiqarish" : "Guruh o'qituvchisi"}</option>
                        {teachers.filter(teacher => teacher.status === "active").map(teacher => (
                            <option value={teacher._id} disabled={editingGroup && teacher._id === groups?.find(gr => gr._id === editingGroup)?.teacher_id}>{teacher.name}</option>
                        ))}
                    </select>
                    {errors.teacher_id && <p style={{ color: 'red', textDecoration: "none" }}>{errors.teacher_id.message}</p>}
                    <select {...register("subject_id", { required: "Guruh bosqichini tanlang" })}>
                        <option value="">Guruh bosqichi</option>
                        {subjects.filter(subject => subject.status === "active").map(subject => (
                            <option value={subject._id} disabled={editingGroup && subject._id === groups?.find(gr => gr._id === editingGroup)?.subject_id}>{subject.name}</option>
                        ))}
                    </select>
                    {errors.subject_id && <p style={{ color: 'red', textDecoration: "none" }}>{errors.subject_id.message}</p>}

                    <button
                        type="submit"
                    >
                        {editingGroup ? "Tahrirlash" : "Qo'shish"}
                    </button>
                </form>
            </Modal>
            <div className="page_header">
                <b>Guruhlar</b>
                <div className="header_actions">
                    <input type="search" placeholder="Guruhni qidirish" onChange={(e) => setSearchText(e.target.value)} />
                    <select onChange={(e) => setSelectedSubject(e.target.value)}>
                        <option value="">Barcha bosqichlar</option>
                        {
                            subjects.map((subject) => (
                                <option value={subject._id}>
                                    {subject.name}
                                </option>
                            ))
                        }
                    </select>
                    {
                        user.role !== "teacher" && (
                            <button onClick={() => {
                                reset({
                                    group_name: "",
                                    group_number: "",
                                    teacher_id: "",
                                    subject_id: ""

                                }); setOpen(true); setEditingGroup("")
                            }}>
                                <FaPlus />
                                Guruh qo'shish
                            </button>
                        )
                    }
                </div>
            </div>
            <TableComponent
                columns={columns}
                data={filteredGroups}
            />
        </div>
    );
};


export default Groups;