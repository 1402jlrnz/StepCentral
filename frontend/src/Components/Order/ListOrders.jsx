import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Box, Typography } from '@mui/material'
import MetaData from '../Layout/MetaData'
import Loader from '../Layout/Loader'
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useDispatch, useSelector } from 'react-redux'
import { myOrders } from '../../actions/orderActions'
import { formatPrice } from '../Utils/helpers'

import {

    Button
} from '@mui/material'


import { DataGrid, } from '@mui/x-data-grid'

const ListOrders = () => {
    const dispatch = useDispatch();
    const { loading, error, orders } = useSelector(state => state.myOrders);

    const columns = [
        {
            field: 'id',
            headerName: 'Order ID',
            flex: 1,
            renderCell: (params) => <span style={{ wordBreak: 'break-all' }}>{params.value}</span>
        },
        {
            field: 'numOfItems',
            headerName: 'Num of Items',
            type: 'number',
            width: 130,
            align: 'right',
            headerAlign: 'right'
        },
        {
            field: 'amount',
            headerName: 'Amount',
            width: 120,
            align: 'right',
            headerAlign: 'right'
        },
        {
            field: 'status',
            headerName: 'Status',
            width: 160,
            renderCell: (params) =>
                (params.value && String(params.value).includes('Delivered'))
                    ? <span style={{ color: 'green' }}>{params.value}</span>
                    : <span style={{ color: 'red' }}>{params.value}</span>
        },
        {
            field: 'actions',
            headerName: 'Actions',
            width: 120,
            sortable: false,
            filterable: false,
            renderCell: (params) => (
                <Button
                    component={Link}
                    to={`/order/${params.id}`}
                    variant="contained"
                    size="small"
                >
                    <i className="fa fa-eye" />
                </Button>
            )
        }
    ];

    const rows = orders.map(order => ({
        id: order._id,
        numOfItems: order.orderItems.length,
        amount: `₱${formatPrice(order.totalPrice)}`,
        status: order.orderStatus || ''
    }));
    useEffect(() => {
        dispatch(myOrders());
        if (error) {
            toast.error(error, {
                position: 'bottom-right'
            });
        }
    }, [error, dispatch])



    return (
        <>
            <MetaData title={'My Orders'} />
            <Box sx={{ maxWidth: 1100, mx: 'auto', px: { xs: 1, md: 3 }, py: 4 }}>
                <Typography variant="h4" fontWeight={800} sx={{ mb: 3 }}>My Orders</Typography>

                {loading ? <Loader /> : (
                    <div style={{ width: '100%' }}>
                        <DataGrid
                            rows={rows}
                            columns={columns}

                            pageSize={5}
                            rowsPerPageOptions={[5, 10, 25]}
                            disableSelectionOnClick
                            getRowId={(row) => row.id}
                            showToolbar
                            sx={{
                                color: '#fafafa',
                                border: '1px solid #262626',
                                '& .MuiDataGrid-columnHeaders': { backgroundColor: '#141414', color: '#a1a1aa' },
                                '& .MuiDataGrid-cell': { borderColor: '#262626' },
                                '& .MuiDataGrid-row:hover': { backgroundColor: '#1c1c1c' },
                                '& .MuiDataGrid-footerContainer': { borderColor: '#262626', color: '#a1a1aa' }
                            }}
                        />
                    </div>
                )}
            </Box>
        </>
    )
}

export default ListOrders