import React, { useEffect, useState } from 'react'
import MetaData from '../Layout/MetaData'
import Loader from '../Layout/Loader'
import Sidebar from './SideBar'
import { useDispatch, useSelector } from 'react-redux'
import { allUsers, updateUser, deleteUser, clearErrors } from '../../actions/userActions'
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { DataGrid } from '@mui/x-data-grid'
import Swal from 'sweetalert2'

const AdminUsers = () => {
    const dispatch = useDispatch()
    const { loading, error, users } = useSelector(state => state.allUsers)
    const { isUpdated, error: updateError } = useSelector(state => state.user)
    const { isDeleted } = useSelector(state => state.user)

    const [busyId, setBusyId] = useState(null)

    useEffect(() => {
        dispatch(allUsers())

        if (error) {
            toast.error(error, { position: 'bottom-right' })
            dispatch(clearErrors())
        }
        if (updateError) {
            toast.error(updateError, { position: 'bottom-right' })
            setBusyId(null)
            dispatch(clearErrors())
        }
    }, [dispatch, error, updateError])

    const toggleActiveHandler = (id, currentlyActive, name) => {
        setBusyId(id)
        const newActive = !currentlyActive
        Swal.fire({
            title: newActive ? 'Activate Account?' : 'Deactivate Account?',
            text: newActive
                ? `${name} will be able to log in again.`
                : `${name} will no longer be able to log in.`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#ff3b3b',
            cancelButtonColor: '#3f3f46',
            confirmButtonText: newActive ? 'Yes, activate' : 'Yes, deactivate',
            background: '#141414',
            color: '#fafafa'
        }).then((result) => {
            if (result.isConfirmed) {
                dispatch(updateUser(id, { active: newActive }))
            } else {
                setBusyId(null)
            }
        })
    }

    const deleteUserHandler = (id, name) => {
        Swal.fire({
            title: 'Delete User?',
            text: `This will permanently remove ${name} and their data.`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#ff3b3b',
            cancelButtonColor: '#3f3f46',
            confirmButtonText: 'Yes, delete it',
            background: '#141414',
            color: '#fafafa'
        }).then((result) => {
            if (result.isConfirmed) {
                setBusyId(id)
                dispatch(deleteUser(id))
            }
        })
    }

    // Refresh after successful update/delete
    useEffect(() => {
        if (isUpdated) {
            toast.success('User updated', { position: 'bottom-right' })
            setBusyId(null)
            dispatch(clearErrors())
            dispatch(allUsers())
        }
    }, [isUpdated, dispatch])

    useEffect(() => {
        if (isDeleted) {
            toast.success('User deleted', { position: 'bottom-right' })
            setBusyId(null)
            dispatch(clearErrors())
            dispatch(allUsers())
        }
    }, [isDeleted, dispatch])

    const columns = [
        {
            field: 'name',
            headerName: 'Name',
            flex: 1,
            minWidth: 120
        },
        {
            field: 'email',
            headerName: 'Email',
            flex: 1,
            minWidth: 160
        },
        {
            field: 'role',
            headerName: 'Role',
            width: 100,
            renderCell: (params) => (
                <span style={{
                    fontWeight: 700,
                    color: params.value === 'admin' ? '#ff3b3b' : '#a1a1aa',
                    fontSize: '0.85rem'
                }}>
                    {params.value}
                </span>
            )
        },
        {
            field: 'status',
            headerName: 'Status',
            width: 120,
            sortable: false,
            renderCell: (params) => (
                <span style={{
                    fontWeight: 700,
                    fontSize: '0.85rem',
                    color: params.row.active ? '#22c55e' : '#ef4444'
                }}>
                    {params.row.active ? 'Active' : 'Deactivated'}
                </span>
            )
        },
        {
            field: 'actions',
            headerName: 'Actions',
            width: 150,
            sortable: false,
            filterable: false,
            renderCell: (params) => (
                <div className="d-flex">
                    <button
                        className={`btn py-1 px-2 ${params.row.active ? 'btn-warning' : 'btn-success'}`}
                        onClick={() => toggleActiveHandler(params.id, params.row.active, params.row.name)}
                        disabled={busyId === params.id || params.row.role === 'admin'}
                        title={params.row.role === 'admin' ? 'Admin accounts cannot be deactivated' : ''}
                    >
                        {busyId === params.id ? '...' : (params.row.active ? 'Deactivate' : 'Activate')}
                    </button>
                    <button
                        className="btn btn-danger py-1 px-2 ml-2"
                        onClick={() => deleteUserHandler(params.id, params.row.name)}
                        disabled={params.row.role === 'admin'}
                        title={params.row.role === 'admin' ? 'Admin accounts cannot be deleted' : ''}
                    >
                        <i className="fa fa-trash"></i>
                    </button>
                </div>
            )
        }
    ];

    const rows = users ? users.map(u => ({
        id: u._id,
        name: u.name,
        email: u.email,
        role: u.role,
        active: u.active === false ? false : true
    })) : []

    return (
        <>
            <MetaData title={'All Users'} />
            <div className="row">
                <div className="col-12 col-md-2">
                    <Sidebar />
                </div>
                <div className="col-12 col-md-10">
                    <div className="wrapper my-5">
                        <h1 className="mb-4">All Users</h1>
                        {loading ? <Loader /> : (
                            <DataGrid
                                rows={rows}
                                columns={columns}
                                pageSize={10}
                                rowsPerPageOptions={[10]}
                                disableSelectionOnClick
                                autoHeight
                                className="admin-datagrid"
                                sx={{
                                    color: '#fafafa',
                                    border: '1px solid #262626',
                                    '& .MuiDataGrid-columnHeaders': { backgroundColor: '#141414', color: '#a1a1aa' },
                                    '& .MuiDataGrid-columnSeparator': { color: '#262626' },
                                    '& .MuiDataGrid-cell': { borderColor: '#262626' },
                                    '& .MuiDataGrid-row:hover': { backgroundColor: '#1c1c1c' },
                                    '& .MuiTablePagination-root, & .MuiTablePagination-selectIcon': { color: '#a1a1aa' },
                                    '& .MuiDataGrid-footerContainer': { borderColor: '#262626' }
                                }}
                            />
                        )}
                    </div>
                </div>
            </div>
        </>
    )
}

export default AdminUsers
