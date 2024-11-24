import React, { useState, useEffect } from 'react';
import { Container, Table, Button } from 'react-bootstrap';
import crud from '@/util/crud';
import { saveAs } from 'file-saver';
import Papa from 'papaparse';

const CheckinPage = () => {
    const [checkins, setCheckins] = useState([]);
    const [filteredCheckins, setFilteredCheckins] = useState([]);
    const [sortField, setSortField] = useState('');
    const [sortOrder, setSortOrder] = useState('asc');

    useEffect(() => {
        const fetchData = async () => {
            try {
                const data = await crud({
                    action: 'R',
                    collection: 'checkin',
                    filter: {} // You might need to adjust the filter if necessary
                });
                setCheckins(data);
                setFilteredCheckins(data);
            } catch (error) {
                console.error('Error fetching check-ins:', error);
            }
        };

        fetchData();
    }, []);

    const handleFilter = (searchTerm) => {
        const filteredData = checkins.filter(checkin =>
            checkin.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            checkin.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
            checkin.event_code.toLowerCase().includes(searchTerm.toLowerCase())
        );
        setFilteredCheckins(filteredData);
    };

    const handleSort = (field) => {
        const order = sortField === field && sortOrder === 'asc' ? 'desc' : 'asc';
        const sortedData = [...filteredCheckins].sort((a, b) => {
            if (a[field] < b[field]) {
                return order === 'asc' ? -1 : 1;
            }
            if (a[field] > b[field]) {
                return order === 'asc' ? 1 : -1;
            }
            return 0;
        });
        setFilteredCheckins(sortedData);
        setSortField(field);
        setSortOrder(order);
    };

    const downloadCSV = () => {
        const csv = Papa.unparse(filteredCheckins);
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
        saveAs(blob, 'checkin_data.csv');
    };

    return (
        <Container style={{ maxWidth: '800px', margin: '0 auto', fontFamily: 'Arial, sans-serif' }}>
            <div style={{ backgroundColor: '#f0f2f5', padding: '20px', borderRadius: '10px', marginBottom: '20px', boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)' }}>
                <input
                    type="text"
                    placeholder="Search..."
                    onChange={(e) => handleFilter(e.target.value)}
                    style={{ padding: '8px', width: '100%', maxWidth: '300px', borderRadius: '5px', border: '1px solid #ccc', marginBottom: '10px' }}
                />
                <Button variant="primary" style={{ backgroundColor: '#4267B2', border: 'none', fontSize: '0.9rem', padding: '6px 12px' }} onClick={downloadCSV}>
                    Download CSV
                </Button>
            </div>
            <Table striped bordered hover style={{ backgroundColor: '#fff', borderRadius: '10px', boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)' }}>
                <thead style={{ backgroundColor: '#4267B2', color: '#fff' }}>
                    <tr>
                        <th style={{ cursor: 'pointer' }} onClick={() => handleSort('name')}>Name</th>
                        <th style={{ cursor: 'pointer' }} onClick={() => handleSort('email')}>Email</th>
                        <th style={{ cursor: 'pointer' }} onClick={() => handleSort('checkin_datetime')}>Check-in Datetime</th>
                        <th style={{ cursor: 'pointer' }} onClick={() => handleSort('event_code')}>Event Code</th>
                        <th style={{ cursor: 'pointer' }} onClick={() => handleSort('qrcode_id')}>QR Code ID</th>
                    </tr>
                </thead>
                <tbody>
                    {filteredCheckins.map((checkin, index) => (
                        <tr key={index}>
                            <td>{checkin.name}</td>
                            <td>{checkin.email}</td>
                            <td>{checkin.checkin_datetime}</td>
                            <td>{checkin.event_code}</td>
                            <td>{checkin.qrcode_id}</td>
                        </tr>
                    ))}
                </tbody>
            </Table>
        </Container>
    );
};

export default CheckinPage;