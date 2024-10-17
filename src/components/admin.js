import {useEffect, useState} from 'react'
import { getAllCompanies, verifyCompany } from '../helper';
import { Button, IconButton,Box } from '@mui/material';
import {DataGrid} from '@mui/x-data-grid'
import { CheckCircle,Clear,Delete, RemoveRedEye } from '@mui/icons-material';
import CompanyPreview from './PreviewModal/companyPreview';

export default function Admin() {
    const [companies,setCompanies] = useState([])
    const [companyInfo,setCompany] = useState(undefined)
    

    const editCompanyHandler = (id) => {
        setCompany(companies.find(item=>item._id === id))
    }

    const approveCompanyHandler = (id) => {
        verifyCompany(id).then(result=>{
            getAllCompanies().then(res=>{
                setCompanies(res)
            })
        })
    }
    

    const companyColumns =  [
        { field: 'name', headerName: 'Company Name', width: 150,
            renderCell: (data) => {
                return (<span style={{whiteSpace: "pre-line", padding: 10}}>{data.value}</span>);
            } 
        },
        { field: 'isVerified', headerName: 'Status', width: 100,
            renderCell: (data) => {
                return (<span style={{whiteSpace: "pre-line", padding: 10}}>{data.value?'Approved':'Waiting'}</span>);
            }
        },
        { field: 'email', headerName: 'Actions', width: 200,
            renderCell: (data,row) => {
                console.log(data.id)
                return (
                    <Box sx={{display:'flex'}}>
                        {
                            !data.row.isVerified && <IconButton onClick={()=>approveCompanyHandler(data.id)}><CheckCircle /></IconButton>
                        }
                        <IconButton onClick={() => {editCompanyHandler(data.id)}} sx={{ p: 0 }}><RemoveRedEye/></IconButton>
                    </Box>);
            }
        },

        // { field: 'detail', headerName: 'Details', width: 200,
        //     renderCell: (data) => {
        //         return (<span style={{whiteSpace: "pre-line", padding: 10}}>{data.value}</span>);
        //     }
        // },
        // { field: 'image_url', headerName: 'Files', width: 200 },
        // { field: 'contract_address', headerName: 'Contract Address', width: 360 }
    ];

    useEffect(()=>{
        getAllCompanies().then(res=>{
            setCompanies(res)
        })
    },[])
    console.log('companies',companies)
    return (
        <>
            <DataGrid
                columns={companyColumns}
                rows={companies}
                initialState={{
                    pagination: {
                        paginationModel: { page: 0, pageSize: 5 },
                    },
                }}
                pageSizeOptions={[5, 10]}
                sx={{ }}
                getRowId={data=>data._id}
            />
            <CompanyPreview companyInfo={companyInfo} setCompanyInfo={setCompany} />
        </>
    );
}