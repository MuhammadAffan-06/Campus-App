import * as React from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Modal from '@mui/material/Modal';
import Icon from '@mui/material/Icon';
import CloseIcon from '@mui/icons-material/Close';

const style = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: '90%', // Adjusted width for mobile devices
    maxWidth: 400, // Maximum width for larger screens
    bgcolor: 'background.paper',
    border: 'none',
    boxShadow: 24,
    p: 4,
};

export default function BasicModal({ setOpen, open }) {

    return (
        <div>
            <Modal
                open={open}
                aria-labelledby="modal-modal-title"
                aria-describedby="modal-modal-description"
            >
                <Box sx={style}>
                    <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 1 }}>
                        <Button onClick={() => setOpen(false)}><CloseIcon /></Button>
                    </Box>
                    <Typography id="modal-modal-title" variant="h6" component="h2">
                        Success
                    </Typography>
                    <Typography id="modal-modal-description" sx={{ mt: 2 }}>
                        Your account has been successfully created and waiting for the approval
                    </Typography>
                </Box>
            </Modal>
        </div>
    );
}
