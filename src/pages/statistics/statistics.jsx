import React, { useEffect, useState, useMemo } from "react";
import { useGetPaymentQuery } from "../../context/services/payment.service";
import { useGetStudentQuery } from "../../context/services/students.service";
import { useGetGroupQuery } from "../../context/services/group.service";
import "./style.css";
import moment from "moment";
import { LineChart, Line, XAxis, Tooltip, ResponsiveContainer } from "recharts";
import { useGetSubjectQuery } from "../../context/services/subject.service";
import { useGetSpendingQuery } from "../../context/services/spending.service";
import { DatePicker, Button, Modal, Table } from "antd";
import Students from "../students/students";
const { RangePicker } = DatePicker;

const Statistics = () => {
  const { data: payments = [] } = useGetPaymentQuery();
  const { data: spendings = [] } = useGetSpendingQuery();
  const { data: students = [] } = useGetStudentQuery();
  const { data: groups = [] } = useGetGroupQuery();
  const { data: subjects = [] } = useGetSubjectQuery();
  const [modalVisible, setModalVisible] = useState(false);
  const [modalType, setModalType] = useState(null);
  const [modalData, setModalData] = useState([]);
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);

  const [data, setData] = useState([]);
  const [stats, setStats] = useState({
    totalDebt: 0,
    debtors: [],
    paymentDetails: [],
    spendingDetails: [],
    studentDetails: [],
  });

  const formatNumber = (num) => num.toLocaleString("ru-RU");

  const month = {
    "01": "yanvar",
    "02": "fevral",
    "03": "mart",
    "04": "aprel",
    "05": "may",
    "06": "iyun",
    "07": "iyul",
    "08": "avgust",
    "09": "sentabr",
    10: "oktabr",
    11: "noyabr",
    12: "dekabr",
  };

  const formatDate = (dateString) => {
    const day = moment(dateString).format("DD");
    const monthKey = moment(dateString).format("MM");
    return `${day}-${month[monthKey]}`;
  };

  useEffect(() => {
    let totalDebt = 0;
    const debtorsList = [];
    const paymentList = [];

    groups.forEach((group) => {
      const subject = subjects.find(
        (subject) => subject._id.toString() === group.subject_id.toString()
      );
      if (!subject) return;

      const totalFeeForGroup = subject.price * group.students.length;
      const totalPaidForGroup = payments
        .filter((payment) =>
          group.students.some(
            (studentId) =>
              studentId.toString() === payment.student_id.toString()
          )
        )
        .reduce((sum, payment) => sum + payment.amount, 0);

      const groupDebt = totalFeeForGroup - totalPaidForGroup;
      totalDebt += groupDebt;

      group.students.forEach((studentId) => {
        const student = students.find(
          (s) => s._id.toString() === studentId.toString()
        );
        if (!student) return;

        const studentPayments = payments
          .filter((p) => p.student_id.toString() === studentId.toString())
          .reduce((sum, p) => sum + p.amount, 0);
        const studentDebt = subject.price - studentPayments;

        if (studentDebt > 0) {
          debtorsList.push({
            name: student.name,
            group: group.name,
            debt: studentDebt,
            lastPaymentDate:
              payments.find(
                (p) => p.student_id.toString() === studentId.toString()
              )?.createdAt || null,
          });
        }
      });

      payments.forEach((payment) => {
        const student = students.find(
          (s) => s._id.toString() === payment.student_id.toString()
        );
        if (student) {
          paymentList.push({
            name: student.name,
            amount: payment.amount,
            date: payment.createdAt,
          });
        }
      });
    });

    const studentList = students.map((s) => ({
      name: s.name,
      group: groups.find((g) => g.students.includes(s._id))?.name || "Noma'lum",
    }));

    setStats({
      totalDebt,
      debtors: debtorsList,
      paymentDetails: paymentList,
      spendingDetails: spendings,
      studentDetails: studentList,
    });

    applyFilter(debtorsList, paymentList, spendings, studentList);
  }, [payments, groups, students, subjects, spendings, startDate, endDate]);

  useEffect(() => {
    const last30Days = Array.from({ length: 30 }, (_, i) => ({
      date: moment()
        .subtract(29 - i, "days")
        .format("YYYY-MM-DD"),
      amount: 0,
    }));

    payments.forEach((payment) => {
      const paymentDate = moment(payment.createdAt).format("YYYY-MM-DD");
      const index = last30Days.findIndex((day) => day.date === paymentDate);
      if (index !== -1) {
        last30Days[index].amount += payment.amount;
      }
    });

    setData(last30Days);
  }, [payments]);

  const applyFilter = (debtorsData, paymentData, spendingData, studentData) => {
    const start = startDate ? moment(startDate).startOf("day") : null;
    const end = endDate ? moment(endDate).endOf("day") : null;

    if (start && end) {
      setStats((prev) => ({
        ...prev,
        debtors: debtorsData.filter(
          (debtor) =>
            debtor.lastPaymentDate &&
            moment(debtor.lastPaymentDate).isBetween(start, end)
        ),
        paymentDetails: paymentData.filter(
          (payment) =>
            payment.date && moment(payment.date).isBetween(start, end)
        ),
        spendingDetails: spendingData.filter(
          (spending) =>
            spending.date && moment(spending.date).isBetween(start, end)
        ),
        studentDetails: studentData,
      }));
    } else {
      setStats((prev) => ({
        ...prev,
        debtors: debtorsData,
        paymentDetails: paymentData,
        spendingDetails: spendingData,
        studentDetails: studentData,
      }));
    }
  };

  const onDateChange = (dates) => {
    if (dates) {
      setStartDate(dates[0]);
      setEndDate(dates[1]);
    } else {
      setStartDate(null);
      setEndDate(null);
      applyFilter(
        stats.debtors,
        stats.paymentDetails,
        stats.spendingDetails,
        stats.studentDetails
      );
    }
  };

  const openModal = (type, data) => {
    setModalType(type);
    setModalData(data);
    setModalVisible(true);
  };

  const closeModal = () => {
    setModalVisible(false);
    setModalType(null);
    setModalData([]);
  };

  const modalColumns = useMemo(
    () => ({
      debt: [
        { title: "Ism", dataIndex: "name", key: "name" },
        { title: "Guruh", dataIndex: "group", key: "group" },
        {
          title: "Qarz (so‘m)",
          dataIndex: "debt",
          key: "debt",
          render: formatNumber,
        },
      ],
      spending: [
        { title: "Sana", dataIndex: "date", key: "date", render: formatDate },
        {
          title: "Miqdor (so‘m)",
          dataIndex: "amount",
          key: "amount",
          render: formatNumber,
        },
        {
          title: "Izoh",
          dataIndex: "description",
          key: "description",
          render: (text) => text || "Noma'lum",
        },
      ],
      student: [
        { title: "Ism", dataIndex: "name", key: "name" },
        { title: "Guruh", dataIndex: "group", key: "group" },
      ],
      payment: [
        { title: "Ism", dataIndex: "name", key: "name" },
        {
          title: "Miqdor (so‘m)",
          dataIndex: "amount",
          key: "amount",
          render: formatNumber,
        },
        { title: "Sana", dataIndex: "date", key: "date", render: formatDate },
      ],
      profit: [
        {
          title: "Jami to‘lovlar (so‘m)",
          dataIndex: "totalPayments",
          key: "totalPayments",
          render: () =>
            formatNumber(payments.reduce((a, b) => a + b.amount, 0)),
        },
        {
          title: "Jami xarajatlar (so‘m)",
          dataIndex: "totalSpendings",
          key: "totalSpendings",
          render: () =>
            formatNumber(spendings.reduce((a, b) => a + b.amount, 0)),
        },
        {
          title: "Sof daromad (so‘m)",
          dataIndex: "profit",
          key: "profit",
          render: () =>
            formatNumber(
              payments.reduce((a, b) => a + b.amount, 0) -
                spendings.reduce((a, b) => a + b.amount, 0)
            ),
        },
      ],
    }),
    [payments, spendings]
  );

  const modalTitles = {
    debt: "Qarzdor o‘quvchilar",
    spending: "Jami xarajatlar",
    student: "Jami o‘quvchilar",
    payment: "Jami to‘lovlar",
    profit: "Sof daromad",
  };

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const { date, amount } = payload[0].payload;
      return (
        <div className="tooltip_card">
          <p>📅 Sana: {formatDate(date)}</p>
          <p>💰 To‘lov: {formatNumber(amount)} so‘m</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div
      className="page"
      style={{ alignItems: "center", paddingInline: "none" }}
    >
      {/* Sana bo'yicha filter (Ant Design bilan) */}
      <div
        style={{
          marginBottom: "20px",
          display: "flex",
          alignItems: "center",
          gap: "10px",
        }}
      >
        <RangePicker
          value={
            startDate && endDate ? [moment(startDate), moment(endDate)] : null
          }
          onChange={onDateChange}
          format="YYYY-MM-DD"
          style={{ marginRight: "10px" }}
        />
        <Button
          type="primary"
          onClick={() =>
            applyFilter(
              stats.debtors,
              stats.paymentDetails,
              stats.spendingDetails,
              stats.studentDetails
            )
          }
        >
          Filtrlash
        </Button>
      </div>

      <div className="cards">
        <div
          className="card"
          onClick={() => openModal("debt", stats.debtors)}
          style={{ cursor: "pointer" }}
        >
          <b>{stats.totalDebt?.toLocaleString()}</b>
          <p>Jami qarzlar</p>
        </div>
        <div
          className="card"
          onClick={() => openModal("spending", stats.spendingDetails)}
          style={{ cursor: "pointer" }}
        >
          <b>{spendings?.reduce((a, b) => a + b.amount, 0).toLocaleString()}</b>
          <p>Jami harajatlar</p>
        </div>
        <div
          className="card"
          onClick={() => openModal("student", stats.studentDetails)}
          style={{ cursor: "pointer" }}
        >
          <b>{students?.length} ta</b>
          <p>Jami o'quvchilar</p>
        </div>
        <div
          className="card"
          onClick={() => openModal("payment", stats.paymentDetails)}
          style={{ cursor: "pointer" }}
        >
          <b>{payments?.reduce((a, b) => a + b.amount, 0).toLocaleString()}</b>
          <p>Jami to'lovlar</p>
        </div>
        <div
          className="card"
          onClick={() => openModal("profit", [{}])}
          style={{ cursor: "pointer" }}
        >
          <b>
            {(
              payments?.reduce((a, b) => a + b.amount, 0) -
              spendings.reduce((a, b) => a + b.amount, 0)
            ).toLocaleString()}
          </b>
          <p>Sof daromad</p>
        </div>
      </div>

      {/* Umumiy Modal */}
      <Modal
        title={modalTitles[modalType]}
        visible={modalVisible}
        onCancel={closeModal}
        footer={null}
        width={700}
      >
        <Table
          columns={modalColumns[modalType]}
          dataSource={modalData}
          rowKey={(record, index) => index}
          locale={{ emptyText: "Ma'lumot yo'q" }}
          pagination={false}
        />
      </Modal>

      {/* <p style={{ fontSize: "22px" }}>Oxirgi 30 kunlik to'lovlar</p>
      <ResponsiveContainer
        style={{ border: "1px solid #2da254" }}
        width={"95%"}
        height={500}
      >
        <LineChart data={data}>
          <XAxis
            style={{ fontSize: "10px" }}
            dataKey="date"
            tickFormatter={(tick) => formatDate(tick)}
          />
          <Tooltip content={<CustomTooltip />} />
          <Line
            type="monotone"
            dataKey="amount"
            stroke="#2da254"
            strokeWidth={3}
            dot={false}
          />
        </LineChart>
      </ResponsiveContainer> */}
      <Students />
    </div>
  );
};

export default Statistics;
