import * as React from 'react';
import { useState } from 'react';
import { styled } from '@mui/material/styles';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell, { tableCellClasses } from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import '../styles/table.css'

const Jobsposted = () => {
    const [fetchedData, setFetchedData] = useState([]);


    const handleJobPosted = async () => {
        const response = await fetch('http://localhost:5001/admin/admin/jobsposted',
            {
                method: "GET",
                headers: { "Authorization": "Bearer " + sessionStorage.getItem("token") }
            }
        )
        const data = await response.json();
        setFetchedData(data);
    }
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
    return (<div>
        <TableContainer component={Paper} data={handleJobPosted()}>
            <Typography variant='h4' sx={{ minWidth: 700 }} fontFamily="'Trebuchet MS', 'Lucida Sans Unicode', 'Lucida Grande', 'Lucida Sans', Arial, sans-serif" >Jobs Posted</Typography>
            <Table sx={{ minWidth: 700 }} aria-label="customized table">
                <TableHead>

                    <TableRow>
                        <StyledTableCell>Job Title</StyledTableCell>
                        <StyledTableCell align="right">Email</StyledTableCell>
                        <StyledTableCell align="right">Address</StyledTableCell>
                        <StyledTableCell align="right">Education</StyledTableCell>
                        <StyledTableCell align="right">Experience</StyledTableCell>
                        <StyledTableCell align="right">Applications</StyledTableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {fetchedData.map((jobs) => (
                        <StyledTableRow key={`${jobs.email} - ${jobs.experience} `}>
                            <StyledTableCell component="th" scope="row">
                                {jobs.JobTitle}
                            </StyledTableCell>
                            <StyledTableCell align="right">{jobs.email}</StyledTableCell>
                            <StyledTableCell align="right">{jobs.address}</StyledTableCell>
                            <StyledTableCell align="right">{jobs.education}</StyledTableCell>
                            <StyledTableCell align="right">{jobs.experience}</StyledTableCell>
                            <StyledTableCell align="right">{jobs.applications}</StyledTableCell>
                        </StyledTableRow>
                    ))}
                </TableBody>
            </Table>
        </TableContainer>

    </div>

    );
}

export default Jobsposted;