import * as React from 'react';
import { useState, useEffect } from 'react';
import { styled } from '@mui/material/styles';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell, { tableCellClasses } from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import '../styles/table.css'
import ButtonGroup from '@mui/material/ButtonGroup';



const StyledTableCell = styled(TableCell)(({ theme }) => ({
    [`&.${tableCellClasses.head}`]: {
        backgroundColor: "#e3104f",
        color: theme.palette.common.white,
    },
    [`&.${tableCellClasses.body}`]: {
        fontSize: 14,
    },
}));

const StyledTableRow = styled(TableRow)(({ theme }) => ({
    '&:nth-of-type(odd)': {
        backgroundColor: theme.palette.action.hover,
    },
    '&:last-child td, &:last-child th': {
        border: 0,
    },
}));
const Approval = () => {
    const [fetchedStudentData, setFetchedStudentData] = useState([]);
    const [fetchedCompanyData, setFetchedCompanyData] = useState([]);



    useEffect(() => {
        const showContentStudent = async () => {

            const response = await fetch('http://localhost:5001/admin/admin/students',
                {
                    method: 'GET',
                    headers: { 'Authorization': 'Bearer ' + sessionStorage.getItem('token') }
                });

            const data = await response.json();
            setFetchedStudentData(data);
            if (!response.ok) {
                console.log('Error');
            }
        }
        showContentStudent();
    }, []);

    useEffect(() => {
        const showContentCompany = async () => {
            const response = await fetch('http://localhost:5001/admin/admin/companies', {
                method: 'GET',
                headers: { 'Authorization': 'Bearer ' + sessionStorage.getItem('token') }
            });
            const data = await response.json();
            setFetchedCompanyData(data);
            if (!response.ok) {
                console.log("failed");
            }
        }
        showContentCompany();
    }, [])

    const handleApproval = async (email) => {
        const existingCompany = fetchedCompanyData.find(company => company.email === email);
        const existingStudent = fetchedStudentData.find(student => student.email === email);

        if (existingCompany) {
            // Handle approval logic for companies
            let approved = true;
            let block = existingCompany ? existingCompany.block : null;

            const response = await fetch('http://localhost:5001/admin/admin/approve', {
                method: 'PUT',
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": "Bearer " + sessionStorage.getItem("token")
                },
                body: JSON.stringify({ email, userType: 'company', approved, block })
            });
            if (response.status === 200) {
                const updatedCompanyData = fetchedCompanyData.filter(company => company.email !== email);
                setFetchedCompanyData(updatedCompanyData);
                console.log("Approved")
            }
        } else if (existingStudent) {
            // Handle approval logic for students
            let approved = true;
            let block = existingStudent ? existingStudent.block : null;

            const response = await fetch('http://localhost:5001/admin/admin/approve', {
                method: 'PUT',
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": "Bearer " + sessionStorage.getItem("token")
                },
                body: JSON.stringify({ email, userType: 'student', approved, block })
            });
            if (response.status === 200) {
                const updatedStudentData = fetchedStudentData.filter(student => student.email !== email);
                setFetchedStudentData(updatedStudentData);
                console.log("Approved")
            }
        } else {
            console.error('No record found for email:', email);
        }
    };


    return (
        <div>
            <TableContainer component={Paper}>
                <Typography variant='h4' sx={{ minWidth: 700 }} fontFamily="'Trebuchet MS', 'Lucida Sans Unicode', 'Lucida Grande', 'Lucida Sans', Arial, sans-serif" >Company Record</Typography>
                <Table sx={{ minWidth: 700 }} aria-label="customized table">
                    <TableHead>
                        <TableRow>
                            <StyledTableCell>Name</StyledTableCell>
                            <StyledTableCell align="right">Category</StyledTableCell>
                            <StyledTableCell align="right">Email</StyledTableCell>
                            <StyledTableCell align="right">Approved</StyledTableCell>
                            <StyledTableCell align="right">Blocked</StyledTableCell>
                            <StyledTableCell align="right">Action</StyledTableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {fetchedCompanyData.map((company) => (
                            company.approved !== 1 && (
                                <StyledTableRow key={company.email}>
                                    <StyledTableCell component="th" scope="row">
                                        {company.name}
                                    </StyledTableCell>
                                    <StyledTableCell align="right">{company.category}</StyledTableCell>
                                    <StyledTableCell align="right">{company.email}</StyledTableCell>
                                    <StyledTableCell align="right">{company.approved === 1 ? 'Yes' : 'No'}</StyledTableCell>
                                    <StyledTableCell align="right">{company.block === 1 ? 'Yes' : 'No'}</StyledTableCell>
                                    <StyledTableCell align="right"><Button onClick={() => handleApproval(company.email, company.category)} variant='outlined'>Approval</Button></StyledTableCell>
                                </StyledTableRow>)
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>
            <TableContainer component={Paper} >
                <Typography variant='h4' sx={{ minWidth: 700 }} fontFamily="'Trebuchet MS', 'Lucida Sans Unicode', 'Lucida Grande', 'Lucida Sans', Arial, sans-serif">Students Record</Typography>
                <Table sx={{ minWidth: 700 }} aria-label="customized table">
                    <TableHead>

                        <TableRow>
                            <StyledTableCell>Name</StyledTableCell>
                            <StyledTableCell align="right">Email</StyledTableCell>
                            <StyledTableCell align="right">Profession</StyledTableCell>
                            <StyledTableCell align="right">Category</StyledTableCell>
                            <StyledTableCell align="right">Blocked</StyledTableCell>
                            <StyledTableCell align="right">Action</StyledTableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {fetchedStudentData.map((students) => (
                            <StyledTableRow key={students.email}>

                                <StyledTableCell component="th" scope="row">
                                    {students.name}
                                </StyledTableCell>
                                <StyledTableCell align="right">{students.email}</StyledTableCell>
                                <StyledTableCell align="right">Student</StyledTableCell>
                                <StyledTableCell align="right">{students.category}</StyledTableCell>
                                <StyledTableCell align="right">{students.block === 1 ? 'Yes' : 'No'}</StyledTableCell>
                                <StyledTableCell align="right">
                                    <Button variant='outlined' onClick={() => handleApproval(students.email)}>Approval</Button>
                                </StyledTableCell>

                            </StyledTableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>
        </div>
    );
}

export default Approval;