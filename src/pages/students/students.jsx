import React, { useState } from "react";
import { FaPlus } from "react-icons/fa";
import {
  useCreateStudentMutation,
  useDeleteStudentMutation,
  useGetStudentQuery,
  useUpdateStudentMutation,
} from "../../context/services/students.service";
import { useForm } from "react-hook-form";
import TableComponent from "../../components/table/table";
import { MdDeleteForever, MdEdit } from "react-icons/md";
import { message, Modal, Popconfirm } from "antd";
import { useGetGroupQuery } from "../../context/services/group.service";
import {
  useCreatePaymentMutation,
  useGetPaymentQuery,
} from "../../context/services/payment.service";
import { useGetSubjectQuery } from "../../context/services/subject.service";

const Students = () => {
  const { data: students = [] } = useGetStudentQuery();
  const { data: groups = [] } = useGetGroupQuery();
  const { data: payments = [] } = useGetPaymentQuery();
  const { data: subjects = [] } = useGetSubjectQuery();
  const [createPayment] = useCreatePaymentMutation();
  const [createStudent] = useCreateStudentMutation();
  const [updateStudent] = useUpdateStudentMutation();
  const [deleteStudent] = useDeleteStudentMutation();
  const [open, setOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState("");
  const {
    reset,
    handleSubmit,
    register,
    formState: { errors },
  } = useForm();

  async function handleCreateStudent(data) {
    try {
      data.phone = data.phone.toString();
      let response;
      if (editingStudent) {
        response = await updateStudent({
          id: editingStudent,
          body: data,
        }).unwrap();
        setEditingStudent("");
        message.success("O'quvchi tahrirlandi");
      } else {
        response = await createStudent({ ...data }).unwrap();
        console.log(response);
        console.log(data);

        if (data.amount) {
          await createPayment({
            student_id: response._id,
            payment_method: data.payment_method,
            amount: Number(data.amount),
          }).unwrap();
        }
        message.success("O'quvchi qo'shildi");
      }
      setOpen(false);
    } catch (err) {
      console.error(err);
      message.error(err?.data?.message || "Xatolik yuz berdi");
    }
  }

  const columns = [
    {
      title: "№",
      dataIndex: "key",
      render: (_text, _record, index) => index + 1,
    },
    { title: "O'quvchi ismi", dataIndex: "name", key: "name" },
    { title: "Telefon raqami", dataIndex: "phone", key: "phone" },
    {
      title: "Guruh",
      render: (_, record) => {
        const group = groups.find((g) => g._id === record.group_id);
        return group?.group_number + "-" + group?.group_name;
      },
    },
    {
      title: "Bosqich",
      render: (_, record) => {
        const group = groups.find((g) => g._id === record.group_id);
        const subject = subjects.find((s) => s._id === group.subject_id);
        return subject?.name;
      },
    },
    {
      title: "Amallar",
      render: (_, record) => (
        <div className="table_actions">
          <button
            onClick={() => {
              setEditingStudent(record._id);
              reset({
                name: record?.name,
                phone: record?.phone,
                group_id: record.group_id,
              });
              setOpen(true);
            }}
            className="edit_btn"
          >
            <MdEdit />
          </button>

          <Popconfirm
            title="O'quvchini o'chirmoqchimisiz?"
            description="Ushbu holatda unga ulangan barcha guruhlarni tahrirlash kerak bo'ladi"
            onConfirm={() => deleteStudent(record._id)}
            onCancel={() => {}}
            okText="O'chirish"
            cancelText="Orqaga"
            overlayStyle={{
              width: "300px",
            }}
          >
            <button className="delete_btn">
              <MdDeleteForever />
            </button>
          </Popconfirm>
        </div>
      ),
      key: "actions",
    },
  ];
  return (
    <div className="page">
      <Modal
        open={open}
        onCancel={() => {
          setOpen(false);
          setEditingStudent("");
        }}
        footer={[]}
        title={editingStudent ? "O'quvchini tahrirlash" : "O'quvchi qo'shish"}
      >
        <form
          autoComplete="off"
          onSubmit={handleSubmit(handleCreateStudent)}
          className="modal_form"
        >
          <input
            {...register("name", { required: "O'quvchi ismini kiriting" })}
            type="text"
            placeholder="O'quvchi ismi"
          />
          {errors.name && (
            <p style={{ color: "red", textDecoration: "none" }}>
              {errors.name.message}
            </p>
          )}
          <div
            style={{ display: "flex", alignItems: "center", width: "100%" }}
            className="phone_input"
          >
            <span style={{ width: "50px" }}>+998</span>
            <input
              style={{ flexGrow: 1 }}
              {...register("phone", {
                required: "Telefon raqamni kiriting",
                minLength: {
                  value: 9,
                  message: "Talab etiladigan format: 991112233",
                },
                maxLength: {
                  value: 9,
                  message: "Talab etiladigan format: 991112233",
                },
              })}
              type="number"
              placeholder="Telefon raqam"
            />
          </div>
          {errors.phone && (
            <p style={{ color: "red", textDecoration: "none" }}>
              {errors.phone.message}
            </p>
          )}
          <select {...register("group_id", { required: "Guruhni tanlang" })}>
            <option value="">Guruhi</option>
            {groups
              .filter((group) => group.status === "active")
              .map((group) => (
                <option
                  value={group._id}
                  disabled={
                    editingStudent &&
                    group._id ===
                      students?.find((gr) => gr._id === editingStudent)
                        ?.group_id
                  }
                >
                  {group.group_number +
                    "-" +
                    group.group_name +
                    " " +
                    subjects.find((subject) => subject._id === group.subject_id)
                      ?.name}
                </option>
              ))}
          </select>
          {errors.group_id && (
            <p style={{ color: "red", textDecoration: "none" }}>
              {errors.group_id.message}
            </p>
          )}
          <input
            {...register("amount")}
            type="number"
            placeholder="To'lov summasi"
          />
          <select {...register("payment_method")}>
            <option value="cash">Naqd</option>
            <option value="card">Karta</option>
            <option value="transfer">Bank</option>
          </select>
          <button type="submit">
            {editingStudent ? "Tahrirlash" : "Qo'shish"}
          </button>
        </form>
      </Modal>
      <div className="page_header">
        <b>O'quvchilar</b>
        <div className="header_actions">
          <button
            onClick={() => {
              reset({ name: "", phone: "", group_id: "" });
              setOpen(true);
            }}
          >
            <FaPlus />
            O'quvchi qo'shish
          </button>
        </div>
      </div>
      <TableComponent
        columns={columns}
        data={students.filter(
          (student) => student.status === "active" && student.group_id
        )}
      />
    </div>
  );
};

export default Students;
