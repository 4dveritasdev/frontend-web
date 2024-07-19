import { Box, Button, ImageList, ImageListItem, Input, Table, TextField, Typography } from '@mui/material';
import react, { useEffect, useState } from 'react';
import { addProduct, getCompanyProducts, getProductQRcodes, getSelectedProductData, login, productMint, registerCompany, uploadFile, uploadFiles } from '../helper';
import { DataGrid } from '@mui/x-data-grid';
import QRCode from '../components/displayQRCode';
import io from 'socket.io-client';
import PrintModal from '../components/printModal';
import CircularProgressWithLabel from '../components/CircularProgressBar';

const Page = () => {
    const [name, setName] = useState('');
    const [password, setPassword] = useState('');
    const [company, setCompany] = useState(null);
    const [products, setProducts] = useState([]);
    const [productName, setProductName] = useState('');
    const [productModel, setProductModel] = useState('');
    const [productDetail, setProductDetail] = useState('');
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [mintAmount, setMintAmout] = useState(0);
    const [qrcodes, setQrCodes] = useState([]);
    const [productImages, setProductImages] = useState([]);
    const [productImageInputs, setProductImageInputs] = useState([]);
    const [productFiles, setProductFiles] = useState([]);
    const [productFileInputs, setProductFileInputs] = useState([]);
    const [productVideos, setProductVideos] = useState([]);
    const [updates, setUpdates] = useState(0);
    const [totalAmount, setTotalAmount] = useState(0);
    const [page, setPage] = useState(1);

    const [isMinting, setIsMinting] = useState(false);
    const [startAmount, setStartAmount] = useState(0);
    const [mintingProgress, setMintingProgress] = useState(0);

    useEffect(() => {
        console.log('socket');
        // const socket = io('http://18.185.202.201:5050/'); // Replace with your server address
        const socket = io('http://localhost:5050/'); // Replace with your server address
        
        socket.on('connect', () => {
          console.log('Connected to server');
        });
    
        // socket.on('message', (data) => {
        //   console.log('Received message:', data);
        // });

        socket.on('Refresh product data', async () => {
            console.log('refresh', selectedProduct);
            if (selectedProduct) {
                
                const comProducts = await getCompanyProducts({ company_id: company._id });
                const ptmp = comProducts.map((p, i) => ({
                    id: i + 1,
                    ...p
                }));
                setProducts(ptmp);

                const selectedProductData = await getSelectedProductData(selectedProduct._id);
                setTotalAmount(selectedProductData.total_minted_amount);
                const res = await getProductQRcodes(selectedProduct._id, 1);
                setQrCodes(res);
                setPage(1);
            }
        });
    
        return () => {
          socket.disconnect();
        };
    }, [selectedProduct]);

    useEffect(() => {
        if(isMinting) {
            setMintingProgress(Math.ceil((totalAmount - startAmount) * 100 / mintAmount));
        }
    }, [totalAmount]);

    const loginHanlder = async () => {
        const res = await login({name, password});
        setCompany(res);
    }

    const registerHandler = async () => {
        const res = await registerCompany({name, password});
        setCompany(res);
    }

    const addProductHandler = async () => {
        if (productName == '' || productDetail == '' || productImages.length == 0) {
            alert('please fill all fields and upload an image');
            return;
        }
        await addProduct({name: productName, model: productModel, detail: productDetail, company_id: company._id, images:productImages, files: productFiles, videos: productVideos});
        const res = await getCompanyProducts({ company_id: company._id });
        const ptmp = res.map((p, i) => ({
            id: i + 1,
            ...p
        }));
        setProducts(ptmp);

        setProductName('');
        setProductModel('');
        setProductDetail('');
        setProductImages([]);
        setProductFiles([]);
        setProductVideos([]);
        setProductImageInputs([]);
        setProductFileInputs([]);
        setUpdates(0);
    }

    useEffect(() => {
        if(company) {
            (async () => { 
                const res = await getCompanyProducts({ company_id: company._id });
                const ptmp = res.map((p, i) => ({
                    id: i + 1,
                    ...p
                }));
                setProducts(ptmp);
            })()
        }
    }, [company]);

    const productColumns = [
        { field: 'id', headerName: '#', width: 50 },
        { field: 'name', headerName: 'Brand Name', width: 150,
            renderCell: (data) => {
                return (<span style={{whiteSpace: "pre-line", padding: 10}}>{data.value}</span>);
            } 
        },
        { field: 'model', headerName: 'Model Designation', width: 150,
            renderCell: (data) => {
                return (<span style={{whiteSpace: "pre-line", padding: 10}}>{data.value}</span>);
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

    const productSelectHandler = (data) => {
        setSelectedProduct(data);
        setTotalAmount(data.total_minted_amount)
    }
    
    const batchMintHandler = async () => {
        setIsMinting(true);
        setStartAmount(totalAmount);
        setMintingProgress(0);

        const totalAmount1 = await productMint(selectedProduct._id,  parseInt(mintAmount, 10));
        setTotalAmount(totalAmount1);
        const res = await getProductQRcodes(selectedProduct._id, 1);
        setQrCodes(res);
        setPage(1);

        setIsMinting(false);
    }

    useEffect(() => {
        if(selectedProduct) {
            (async () => {
                const res = await getProductQRcodes(selectedProduct._id, 1);
                setQrCodes(res);
                setPage(1);
            })()
        }
    }, [selectedProduct]);

    useEffect(() => {
        (async () => {
            if(selectedProduct) {
                const res = await getProductQRcodes(selectedProduct._id, page);
                setQrCodes(res);
            }
        })()
    }, [page]);

    const handleProductImageChange = async (event, i) => {
        event.stopPropagation();
        if (event.target.files && event.target.files.length) {
        //   const file = event.target.files[0];
        //   const body = new FormData();
        //   body.append("file", file);
        //   const res = await uploadFile(body);
          
            const body = new FormData();
            for (const single_file of event.target.files) {
                body.append("files", single_file);
            }
            const res = await uploadFiles(body);

            let temp = productImageInputs;
            temp[i] = res;
            setProductImageInputs(temp);

            let images = [];
            for (let inputs of temp) {
                for (let image of inputs) {
                    images.push(image);
                }
            }
            setProductImages(images);

            // setProductImages(res);
        }
    };
    console.log(productImages);

    const handleProductFilesChange = async (event, i) => {
        event.stopPropagation();
        if (event.target.files && event.target.files.length) {
          
            const body = new FormData();
            for (const single_file of event.target.files) {
                body.append("files", single_file);
            }
            const res = await uploadFiles(body);
            
            let temp = productFileInputs;
            temp[i] = res;
            setProductFileInputs(temp);

            let files = [];
            for (let inputs of temp) {
                for (let file of inputs) {
                    files.push(file);
                }
            }
            setProductFiles(files);
        }
    };

    const handleProductVideoAddClick = () => {
        let temp = productVideos;
        temp.push({url: '', description: ''});
        setProductVideos(temp);
        setUpdates(updates + 1);
    }
    
    const handleProductImageAddClick = () => {
        let temp = productImageInputs;
        temp.push([]);
        setProductImageInputs(temp);
        setUpdates(updates + 1);
    }
    
    const handleProductFileAddClick = () => {
        let temp = productFileInputs;
        temp.push([]);
        setProductFileInputs(temp);
        setUpdates(updates + 1);
    }

    const handleProductVideoUrlChange = (e, i) => {
        let temp = productVideos;
        temp[i].url = e.target.value;
        setProductVideos(temp);
        setUpdates(updates + 1);
    }
    const handleProductVideoDescriptionChange = (e, i) => {
        let temp = productVideos;
        temp[i].description = e.target.value;
        setProductVideos(temp);
        setUpdates(updates + 1);
    }

    const [openPrintModal, setOpenPrintModal] = useState(false);

    return (
        <Box sx={{ p: 5 }}>
            {!company
                ? <Box sx={{ p: 2 }}>
                        <br/><br/>
                        <TextField id="outlined-basic" label="name" variant="outlined" size='small' value={name} onChange={(e) => setName(e.target.value)}/>
                        <br/><br/>
                        <TextField id="outlined-basic" type='password' label="password" variant="outlined" size='small' value={password} onChange={(e) => setPassword(e.target.value)}/>
                        <br/><br/>
                        <Button variant='outlined' onClick={loginHanlder}>Login</Button> &nbsp;
                        <Button variant='outlined' onClick={registerHandler}>Register</Button>
                </Box>
                : <>
                    <Box sx={{ pb: 2 }}>
                        <Typography> Company Name: {company.name} </Typography>
                        <Typography> Company Wallet: {company.wallet} </Typography>
                        {/* <QRCode data={company.qrcode} /> */}
                        <img
                            src={`${company.qrcode}`}
                            loading="lazy"
                        />
                    </Box>
                    <Box sx={{ pb: 2, pt: 5 }}>
                        Products
                        <br/><br/>
                        <TextField id="outlined-basic" label="Brand Name" variant="outlined" size='small' value={productName} onChange={(e) => setProductName(e.target.value)} multiline/> &nbsp;
                        <br/><br/>
                        <TextField id="outlined-basic" label="Model Designation" variant="outlined" size='small' value={productModel} onChange={(e) => setProductModel(e.target.value)} multiline/> &nbsp;
                        <br/><br/>
                        <TextField id="outlined-basic" label="Details" variant="outlined" size='small' value={productDetail} onChange={(e) => setProductDetail(e.target.value)} multiline/> &nbsp;
                        <br/><br/>
                        Images: <Button variant='outlined' onClick={handleProductImageAddClick}>+</Button>
                        <br/><br/>
                        {productImageInputs.map((images, i) => (
                            <>
                                &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Select images: <input key={i} type='file' onChange={(e) => {handleProductImageChange(e, i)}} multiple/>
                                <br/><br/>
                            </>
                        ))}

                        {/* <input type='file' onChange={handleProductImageChange} multiple/> */}
                        Files: <Button variant='outlined' onClick={handleProductFileAddClick}>+</Button>
                        <br/><br/>
                        {/* <input type='file' onChange={handleProductFilesChange} multiple/> */}
                        {productFileInputs.map((files, i) => (
                            <>
                                &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Select files: <input key={i} type='file' onChange={(e) => {handleProductFilesChange(e, i)}} multiple/>
                                <br/><br/>
                            </>
                        ))}
                        Youtube Videos: <Button variant='outlined' onClick={handleProductVideoAddClick}>+</Button>
                        <br/><br/>
                        {productVideos.map((video, i) => (
                            <>
                                &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<TextField key={i * 2} id="outlined-basic" label="Url..." variant="outlined" size='small' value={video.url} onChange={(e) => handleProductVideoUrlChange(e, i)} /> &nbsp;
                                <TextField key={i * 2 + 1} id="outlined-basic" label="Description" variant="outlined" size='small' value={video.description} onChange={(e) => handleProductVideoDescriptionChange(e, i)} /> &nbsp;
                                <br/><br/>
                            </>
                        ))}
                        <Button variant='outlined' onClick={addProductHandler} disabled={!(productName != '' && productDetail != '' && productImages.length > 0)}>Add Product</Button>
                        <br/><br/>
                        <DataGrid
                            rows={products}
                            columns={productColumns}
                            initialState={{
                                pagination: {
                                    paginationModel: { page: 0, pageSize: 5 },
                                },
                            }}
                            pageSizeOptions={[5, 10]}
                            sx={{ }}
                            onCellClick={(e)=> productSelectHandler(e.row)}
                            getRowHeight={() => 'auto'}
                        />
                    </Box>
                    
                    {selectedProduct && <Box>
                        <Box>
                            Mint
                            <br/><br/>
                            <Box sx={{ display: 'flex', alignItems: 'center'}}>
                                <TextField type='number' label="amount" variant="outlined" size='small' value={mintAmount} onChange={(e) => setMintAmout(e.target.value)}/> &nbsp;
                                &nbsp;
                                <Button variant='outlined' onClick={batchMintHandler}>Mint</Button>
                                &nbsp;
                                {isMinting && <CircularProgressWithLabel value={mintingProgress}/>}
                            </Box>
                        </Box>
                        <Box sx={{ pt: 2 }}>
                            Qr Codes for Selected Product <br/>
                            Count: {totalAmount} <br/>
                            {totalAmount > 0 && <>
                                Page: &nbsp;
                                <a style={{ cursor: 'pointer', color: 'blue', fontSize: 16}} onClick={() => {if(page > 1) setPage(page - 1)}}>  {'<- Prev '} </a> 
                                &nbsp;&nbsp;{page}&nbsp;&nbsp;
                                <a style={{ cursor: 'pointer', color: 'blue', fontSize: 16}} onClick={() => {if(page < Math.ceil(totalAmount / 100)) setPage(page + 1)}}>  {'Next ->'} </a>
                                <br/>
                                Items: {(page - 1) * 100 + 1} - {page === Math.ceil(totalAmount / 100) && totalAmount % 100 ? totalAmount % 100 + (page - 1) * 100 : page * 100}
                                <br/>
                            </>}
                            <br/>

                            <Button variant="outlined" onClick={() => setOpenPrintModal(true)}>
                                Print
                            </Button>
                            <br/>
                            
                            {qrcodes.map((item, index) => (
                                <QRCode key={index} data={item} />
                            ))}
                        </Box>
                    </Box>}
                </>
            }
            {selectedProduct && <PrintModal open={openPrintModal} setOpen={setOpenPrintModal} totalAmount={totalAmount} product={selectedProduct} setProduct={setSelectedProduct}/>}
        </Box>
    );
}

export default Page;