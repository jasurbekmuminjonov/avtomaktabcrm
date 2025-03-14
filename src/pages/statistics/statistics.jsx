import React, { useEffect, useState } from 'react';
import { useGetPaymentQuery } from '../../context/services/payment.service';
import { useGetStudentQuery } from '../../context/services/students.service';
import { useGetGroupQuery } from '../../context/services/group.service';
import './style.css';
import moment from "moment";
import { LineChart, Line, XAxis, Tooltip, ResponsiveContainer } from "recharts";
import { useGetSubjectQuery } from '../../context/services/subject.service';
import { useGetSpendingQuery } from '../../context/services/spending.service';

const Statistics = () => {
    const { data: payments = [] } = useGetPaymentQuery();
    const { data: spendings = [] } = useGetSpendingQuery();
    const { data: students = [] } = useGetStudentQuery();
    const { data: groups = [] } = useGetGroupQuery();
    const { data: subjects = [] } = useGetSubjectQuery();
    const [totalDebt, setTotalDebt] = useState(0)
    const [data, setData] = useState([]);
    useEffect(() => {
        let totalDebt = 0;

        groups.forEach(group => {
            const subject = subjects.find(subject => subject._id.toString() === group.subject_id.toString());
            if (!subject) return;

            const totalFeeForGroup = subject.price * group.students.length;

            const totalPaidForGroup = payments
                .filter(payment => group.students.some(studentId => studentId.toString() === payment.student_id.toString()))
                .reduce((sum, payment) => sum + payment.amount, 0);

            const groupDebt = totalFeeForGroup - totalPaidForGroup;
            totalDebt += groupDebt;
        });

        setTotalDebt(totalDebt);

    }, [payments, groups])
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
        "10": "oktabr",
        "11": "noyabr",
        "12": "dekabr",
    };

    const formatDate = (dateString) => {
        const day = moment(dateString).format("DD");
        const monthKey = moment(dateString).format("MM");
        return `${day}-${month[monthKey]}`;
    };

    const formatNumber = (num) => num.toLocaleString("ru-RU");

    useEffect(() => {
        const last30Days = Array.from({ length: 30 }, (_, i) => ({
            date: moment().subtract(29 - i, "days").format("YYYY-MM-DD"),
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
        <div className='page' style={{ alignItems: "center", paddingInline: "none" }}>
            <div className="cards">
                <div className="card">
                    <b>{totalDebt?.toLocaleString()}</b>
                    <p>Jami qarzlar</p>
                </div>
                <div className="card">
                    <b>{spendings?.reduce((a, b) => a + b.amount, 0).toLocaleString()}</b>
                    <p>Jami harajatlar</p>
                </div>
                <div className="card">
                    <b>{students?.length} ta</b>
                    <p>Jami o'quvchilar</p>
                </div>
                <div className="card">
                    <b>{payments?.reduce((a, b) => a + b.amount, 0).toLocaleString()}</b>
                    <p>Jami to'lovlar</p>
                </div>
                <div className="card">
                    <b>{(payments?.reduce((a, b) => a + b.amount, 0) - spendings.reduce((a, b) => a + b.amount, 0)).toLocaleString()}</b>
                    <p>Sof daromad</p>
                </div>
            </div>
            <p style={{ fontSize: "22px" }}>Oxirgi 30 kunlik to'lovlar</p>
            <ResponsiveContainer style={{ border: "1px solid #2da254" }} width={"95%"} height={500}>
                <LineChart data={data}>
                    <XAxis style={{ fontSize: "10px" }} dataKey="date" tickFormatter={(tick) => formatDate(tick)} />
                    <Tooltip content={<CustomTooltip />} />
                    <Line type="monotone" dataKey="amount" stroke="#2da254" strokeWidth={3} dot={false} />
                </LineChart>
            </ResponsiveContainer>
        </div>
    );
};

export default Statistics;
