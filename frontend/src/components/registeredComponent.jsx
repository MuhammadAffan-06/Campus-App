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




const StyledTableCell = styled(TableCell)(({ theme }) => ({
    [`&.${tableCellClasses.head}`]: {
        backgroundColor: theme.palette.common.black,
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
    // hide last border
    '&:last-child td, &:last-child th': {
        border: 0,
    },
}));
const Registrations = () => {
    const [fetchedData, setFetchedData] = useState([]);

    const showContent = async () => {

        const response = await fetch('http://localhost:5001/admin/admin/students',
            {
                method: 'GET',
                headers: { 'Authorization': 'Bearer ' + sessionStorage.getItem('token') }
            });

        const data = await response.json();
        setFetchedData(data);
        if (!response.ok) {
            console.log('Error');
        }
        else {
            console.table(fetchedData);
        }

    }
    return (
        <TableContainer component={Paper} data={fetchedData}>
            <Table sx={{ minWidth: 700 }} aria-label="customized table">
                <TableHead>
                    <TableRow>
                        <StyledTableCell>Name</StyledTableCell>
                        <StyledTableCell align="right">Email</StyledTableCell>
                        <StyledTableCell align="right">Approved</StyledTableCell>
                        <StyledTableCell align="right">Block</StyledTableCell>
                        <StyledTableCell align="right">Category</StyledTableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {fetchedData.map((students) => (
                        <StyledTableRow key={students.name}>
                            <StyledTableCell component="th" scope="row">
                                {students.name}
                            </StyledTableCell>
                            <StyledTableCell align="right">{students.email}</StyledTableCell>
                            <StyledTableCell align="right">{students.approved}</StyledTableCell>
                            <StyledTableCell align="right">{students.block}</StyledTableCell>
                            <StyledTableCell align="right">{students.category}</StyledTableCell>
                        </StyledTableRow>
                    ))}
                </TableBody>
            </Table>
        </TableContainer>
    );
}

export default Registrations;