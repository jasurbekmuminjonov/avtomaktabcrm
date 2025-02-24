import React, { useState } from 'react';
import { Table } from 'antd';
import './table.css'
const TableComponent = ({ data, columns }) => {
    const [pagination, setPagination] = useState({
        current: 1,
        pageSize: 10,
        total: data.length,
    });

    const onChange = (pagination) => {
        setPagination({
            ...pagination,
        });
    };
    return (
        <Table
            columns={columns}
            dataSource={data}
            pagination={pagination}
            onChange={onChange}
            size="middle"
            rowKey="id"
            locale={{
                emptyText: 'Ma\'lumot yo\'q',
            }}
        />
    );
};

export default TableComponent;
