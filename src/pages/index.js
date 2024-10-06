import { Box, Button, Checkbox, IconButton, ImageList, ImageListItem, Input, MenuItem, Select, Table, TextField, Typography } from '@mui/material';
import React, { useEffect, useState } from 'react';
import { addProduct, getAddressFromCoordinates, getCompanyProducts, getProductIdentifiers, getProductQRcodes, getSelectedProductData, login, productMint, registerCompany, removeProduct, updateProduct, uploadFile, uploadFiles } from '../helper';
import { DataGrid } from '@mui/x-data-grid';
import QRCode from '../components/displayQRCode';
import io from 'socket.io-client';
import PrintModal from '../components/printModal';
import CircularProgressWithLabel from '../components/CircularProgressBar';
import Tabs from '@mui/joy/Tabs';
import TabList from '@mui/joy/TabList';
import Tab from '@mui/joy/Tab';
import TabPanel from '@mui/joy/TabPanel';
import PreviewModal from '../components/PreviewModal';
import { useRef } from 'react';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import Webcam from 'react-webcam';
import { Remove } from '@mui/icons-material';

const serialTypes = [{label:'Serial Number',value:'serial'}]

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
    const [wgImages, setWGImages] = useState([]);
    const [mcImages, setMCImages] = useState([]);
    const [serials,setSerials] = useState([])
    const [productImageInputs, setProductImageInputs] = useState([]);
    const [productCaptureImages, setProductCaptureImages] = useState([]);
    const [wgCaptureImages, setWGCaptureImages] = useState([]);
    const [mcCaptureImages, setMCCaptureImages] = useState([]);
    const [wgImageInputs, setWGImageInputs] = useState([]);
    const [mcImageInputs, setMCImageInputs] = useState([]);
    const [productFiles, setProductFiles] = useState([]);
    const [productFileInputs, setProductFileInputs] = useState([]);
    const [wgFiles, setWGFiles] = useState([]);
    const [wgFileInputs, setWGFileInputs] = useState([]);
    const [mcFiles, setMCFiles] = useState([]);
    const [mcFileInputs, setMCFileInputs] = useState([]);
    const [warrantyPeriod, setWarrantyPeriod] = useState(0);
    const [identifiers,setIdentifiers] = useState([])
    const [warrantyUnit, setWarrantyUnit] = useState(0);
    const [guaranteePeriod, setGuaranteePeriod] = useState(0);
    const [guaranteeUnit, setGuaranteeUnit] = useState(0);
    const [manualsAndCerts, setManualsAndCerts] = useState({
        public: '',
        private: ''
    });
    const [productVideos, setProductVideos] = useState([]);
    const [wgVideos, setWGVideos] = useState([]);
    const [mcVideos, setMCVideos] = useState([]);
    const [noWarranty, setNoWarranty] = useState(false);
    const [lifetimeWarranty, setLifetimeWarranty] = useState(false);
    const [noGuarantee, setNoGuarantee] = useState(false);
    const [lifetimeGuarantee, setLifetimeGuarantee] = useState(false);
    const [updates, setUpdates] = useState(0);
    const [totalAmount, setTotalAmount] = useState(0);
    const [page, setPage] = useState(1);

    const [isMinting, setIsMinting] = useState(false);
    const [startAmount, setStartAmount] = useState(0);
    const [mintingProgress, setMintingProgress] = useState(0);
    const productImageInputRefs = useRef([]);
    const productFileInputRefs = useRef([]); 
    productImageInputRefs.current = productImageInputs.map((_, i) => productImageInputRefs.current[i] ?? React.createRef());
    productFileInputRefs.current = productFileInputs.map((_, i) => productFileInputRefs.current[i] ?? React.createRef());
    const wgImageInputRefs = useRef([]);
    const wgFileInputRefs = useRef([]); 
    wgImageInputRefs.current = wgImageInputs.map((_, i) => wgImageInputRefs.current[i] ?? React.createRef());
    wgFileInputRefs.current = wgFileInputs.map((_, i) => wgFileInputRefs.current[i] ?? React.createRef());
    const mcImageInputRefs = useRef([]);
    const mcFileInputRefs = useRef([]); 
    mcImageInputRefs.current = mcImageInputs.map((_, i) => mcImageInputRefs.current[i] ?? React.createRef());
    mcFileInputRefs.current = mcFileInputs.map((_, i) => mcFileInputRefs.current[i] ?? React.createRef());
    const productWebcamRef = useRef(null);
    const wgWebcamRef = useRef(null);
    const mcWebcamRef = useRef(null);
    const productPhotoRef = useRef([]);

    const [captureStart,setCaptureStart] = useState([false,false,false])
    productPhotoRef.current = productImageInputs.map((_, i) => productPhotoRef.current[i] ?? React.createRef());

    const [isEditing, setIsEditing] = useState(0);

    const canAddSerialNumber = () => {
        return serialTypes.map(item=>item.value).filter(item=>!serials.map(serial=>serial.type).includes(item))
    }

    useEffect(() => {
        console.log('socket');
        const socket = io('http://52.44.234.165:5050/'); // Replace with your server address
        // const socket = io('http://localhost:5050/'); // Replace with your server address
        
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
                const identiferRes = await getProductIdentifiers(selectedProduct._id,1);
                setIdentifiers(identiferRes)
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
        let location = '';
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                async (position) => {
                    const { latitude, longitude } = position.coords;
                    location = await getAddressFromCoordinates(latitude, longitude);
                    console.log(latitude, longitude, location);

                    const res = await registerCompany({name, password, location});
                    setCompany(res);
                },
                (error) => {
                    console.error('Error getting location:', error);
                }
            );
        } else {
            console.log("Geolocation is not supported by this browser");
        }
    }
    
    const resetFields = () => {
        setProductName('');
        setProductModel('');
        setProductDetail('');
        setProductImages([]);
        setWGImages([]);
        setMCImages([]);
        setProductFiles([]);
        setWGFiles([]);
        setMCFiles([]);
        setProductVideos([]);
        setWGVideos([]);
        setMCVideos([]);
        setProductImageInputs([]);
        setWGImageInputs([]);
        setMCImageInputs([]);
        setNoWarranty(false);
        setLifetimeWarranty(false);
        setNoGuarantee(false);
        setLifetimeGuarantee(false);
        setProductFileInputs([]);
        setWGFileInputs([]);
        setMCFileInputs([]);
        setWarrantyPeriod(0);
        setWarrantyUnit(0);
        setGuaranteePeriod(0);
        setGuaranteeUnit(0);
        setProductCaptureImages([]);
        setWGCaptureImages([]);
        setMCCaptureImages([]);
        setManualsAndCerts({
            public: '',
            private: ''
        });
        setIsEditing(0);
        setUpdates(0);
    }

    const addProductHandler = async () => {
        if (productName == '' || productDetail == '' || productImages.length == 0) {
            alert('please fill all fields and upload an image');
            return;
        }
        await addProduct({
            name: productName,
            model: productModel, 
            detail: productDetail, 
            company_id: company._id, 
            images:productImages, 
            files: productFiles, 
            videos: productVideos, 
            serials,
            warrantyAndGuarantee: {
                images: wgImages,
                files: wgFiles,
                videos: wgVideos,
                warranty: {
                    period: warrantyPeriod, 
                    unit: warrantyUnit,
                    notime: noWarranty,
                    lifetime: lifetimeWarranty
                }, 
                guarantee: {
                    period: guaranteePeriod, 
                    unit: guaranteeUnit,
                    notime: noGuarantee,
                    lifetime: lifetimeGuarantee
                }
            }, 
            manualsAndCerts: {
                images: mcImages,
                files: mcFiles,
                videos: mcVideos,
                ...manualsAndCerts
            }
        });
        const res = await getCompanyProducts({ company_id: company._id });
        const ptmp = res.map((p, i) => ({
            id: i + 1,
            ...p
        }));
        setProducts(ptmp);
        resetFields();
    }

    const updateProductHandler = async () => {
        if (productName == '' || productDetail == '' || productImages.length == 0) {
            alert('please fill all fields and upload an image');
            return;
        }
        await updateProduct({
            _id: isEditing,
            name: productName,
            model: productModel, 
            detail: productDetail, 
            company_id: company._id, 
            images:productImages, 
            files: productFiles, 
            videos: productVideos, 
            warrantyAndGuarantee: {
                images: wgImages,
                files: wgFiles,
                videos: wgVideos,
                warranty: {
                    period: warrantyPeriod, 
                    unit: warrantyUnit,
                    notime: noWarranty,
                    lifetime: lifetimeWarranty
                }, 
                guarantee: {
                    period: guaranteePeriod, 
                    unit: guaranteeUnit,
                    notime: noGuarantee,
                    lifetime: lifetimeGuarantee
                }
            }, 
            manualsAndCerts: {
                images: mcImages,
                files: mcFiles,
                videos: mcVideos,
                ...manualsAndCerts
            }
        });
        const res = await getCompanyProducts({ company_id: company._id });
        const ptmp = res.map((p, i) => ({
            id: i + 1,
            ...p
        }));
        setProducts(ptmp);
        resetFields();
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
        { field: 'total_minted_amount', headerName: 'Actions', width: 200,
            renderCell: (data) => {
                return (
                    <>
                        {data.value === 0 && <Box sx={{ display: 'flex', }}>
                            <IconButton onClick={() => {editProductHandler(data.id - 1)}} sx={{ p: 0 }}><EditIcon/></IconButton>
                            &nbsp;
                            <IconButton onClick={() => {deleteProductHandler(data.id - 1)}} sx={{ p: 0 }}><DeleteIcon/></IconButton>
                        </Box>}
                    </>);
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

    const editProductHandler = async (id) => {
        setIsEditing(products[id]._id);
        
        setProductName(products[id].name);
        setProductModel(products[id].model);
        setProductDetail(products[id].detail);
        setProductImages(products[id].images);
        setWGImages(products[id].warrantyAndGuarantee.images);
        setMCImages(products[id].manualsAndCerts.images);;
        setProductFiles(products[id].files);
        setWGFiles(products[id].warrantyAndGuarantee.files);
        setMCFiles(products[id].manualsAndCerts.files);
        setProductVideos(products[id].videos);
        setWGVideos(products[id].warrantyAndGuarantee.videos);
        setMCVideos(products[id].manualsAndCerts.videos);
        setProductImageInputs([products[id].images]);
        setWGImageInputs([products[id].warrantyAndGuarantee.images]);
        setMCImageInputs([products[id].manualsAndCerts.images]);
        setNoWarranty(products[id].warrantyAndGuarantee.warranty.notime);
        setLifetimeWarranty(products[id].warrantyAndGuarantee.warranty.lifetime);
        setNoGuarantee(products[id].warrantyAndGuarantee.guarantee.notime);
        setLifetimeGuarantee(products[id].warrantyAndGuarantee.guarantee.lifetime);
        setProductFileInputs([products[id].files]);
        setWGFileInputs([products[id].warrantyAndGuarantee.files]);
        setMCFileInputs([products[id].manualsAndCerts.files]);
        setWarrantyPeriod(products[id].warrantyAndGuarantee.warranty.period);
        setWarrantyUnit(products[id].warrantyAndGuarantee.warranty.unit);
        setGuaranteePeriod(products[id].warrantyAndGuarantee.guarantee.period);
        setGuaranteeUnit(products[id].warrantyAndGuarantee.guarantee.unit);
        setManualsAndCerts({
            public: products[id].manualsAndCerts.public,
            private: products[id].manualsAndCerts.private
        });
    }
    
    const deleteProductHandler = async (id) => {

        await removeProduct(products[id]._id);

        const res = await getCompanyProducts({ company_id: company._id });
        const ptmp = res.map((p, i) => ({
            id: i + 1,
            ...p
        }));
        setProducts(ptmp);
        resetFields();

    }

    const productSelectHandler = (data) => {
        setSelectedProduct(data);
        console.log(data);
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
        const identiferRes = await getProductIdentifiers(selectedProduct._id,1)
        setIdentifiers(identiferRes)
        setPage(1);

        setIsMinting(false);
    }

    useEffect(() => {
        if(selectedProduct) {
            (async () => {
                const res = await getProductQRcodes(selectedProduct._id, 1);
                setQrCodes(res);
                const identiferRes = await getProductIdentifiers(selectedProduct._id,1)
                setIdentifiers(identiferRes)
                setPage(1);
            })()
        }
    }, [selectedProduct]);

    useEffect(() => {
        (async () => {
            if(selectedProduct) {
                const res = await getProductQRcodes(selectedProduct._id, page);
                setQrCodes(res);
                const identiferRes = await getProductIdentifiers(selectedProduct._id,1)
                setIdentifiers(identiferRes)
            }
        })()
    }, [page]);

    const handleProductSerial = (event,i,type) => {
        let result = [...serials]
        result[i][type] = event.target.value 

        setSerials(result)
    }

    const handleProductImageChange = async (event, i) => {
        event.stopPropagation();
        console.log(event.target.value);
        if (event.target.files && event.target.files.length) {
        //   const file = event.target.files[0];
            console.log(event.target.files[0]);
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
    
            for (let image of productCaptureImages) {
                images.push(image);
            }

            setProductImages(images);

            // setProductImages(res);
        }
    };
    
    const handleWGImageChange = async (event, i) => {
        event.stopPropagation();
        if (event.target.files && event.target.files.length) {
          
            const body = new FormData();
            for (const single_file of event.target.files) {
                body.append("files", single_file);
            }
            const res = await uploadFiles(body);

            let temp = wgImageInputs;
            temp[i] = res;
            setWGImageInputs(temp);

            let images = [];
            for (let inputs of temp) {
                for (let image of inputs) {
                    images.push(image);
                }
            }
    
            for (let image of wgCaptureImages) {
                images.push(image);
            }
            setWGImages(images);

            // setProductImages(res);
        }
    };
    
    const handleMCImageChange = async (event, i) => {
        event.stopPropagation();
        if (event.target.files && event.target.files.length) {
          
            const body = new FormData();
            for (const single_file of event.target.files) {
                body.append("files", single_file);
            }
            const res = await uploadFiles(body);

            let temp = mcImageInputs;
            temp[i] = res;
            setMCImageInputs(temp);

            let images = [];
            for (let inputs of temp) {
                for (let image of inputs) {
                    images.push(image);
                }
            }
    
            for (let image of mcCaptureImages) {
                images.push(image);
            }
            setMCImages(images);

            // setProductImages(res);
        }
    };

    const handleProductFilesChange = async (event, i) => {
        event.stopPropagation();
        if (event.target.files && event.target.files.length) {
            console.log('uploading files');
          
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
            console.log(files);
            setProductFiles(files);
        }
    };

    const handleWGFilesChange = async (event, i) => {
        event.stopPropagation();
        if (event.target.files && event.target.files.length) {
            console.log('uploading files');
          
            const body = new FormData();
            for (const single_file of event.target.files) {
                body.append("files", single_file);
            }
            const res = await uploadFiles(body);
            
            let temp = wgFileInputs;
            temp[i] = res;
            setWGFileInputs(temp);

            let files = [];
            for (let inputs of temp) {
                for (let file of inputs) {
                    files.push(file);
                }
            }
            console.log(files);
            setWGFiles(files);
        }
    };

    const handleMCFilesChange = async (event, i) => {
        event.stopPropagation();
        if (event.target.files && event.target.files.length) {
            console.log('uploading files');
          
            const body = new FormData();
            for (const single_file of event.target.files) {
                body.append("files", single_file);
            }
            const res = await uploadFiles(body);
            
            let temp = mcFileInputs;
            temp[i] = res;
            setMCFileInputs(temp);

            let files = [];
            for (let inputs of temp) {
                for (let file of inputs) {
                    files.push(file);
                }
            }
            console.log(files);
            setMCFiles(files);
        }
    };

    const handleProductVideoAddClick = () => {
        let temp = productVideos;
        temp.push({url: '', description: ''});
        setProductVideos(temp);
        setUpdates(updates + 1);
    }
    
    const handleWGVideoAddClick = () => {
        let temp = wgVideos;
        temp.push({url: '', description: ''});
        setWGVideos(temp);
        setUpdates(updates + 1);
    }
    
    const handleMCVideoAddClick = () => {
        let temp = mcVideos;
        temp.push({url: '', description: ''});
        setMCVideos(temp);
        setUpdates(updates + 1);
    }
    
    const handleProductImageAddClick = () => {
        let temp = productImageInputs;
        temp.push([]);
        setProductImageInputs(temp);
        setUpdates(updates + 1);
    }

    const handleWGImageAddClick = () => {
        let temp = wgImageInputs;
        temp.push([]);
        setWGImageInputs(temp);
        setUpdates(updates + 1);
    }

    const handleMCImageAddClick = () => {
        let temp = mcImageInputs;
        temp.push([]);
        setMCImageInputs(temp);
        setUpdates(updates + 1);
    }
    
    const handleProductFileAddClick = () => {
        let temp = productFileInputs;
        temp.push([]);
        setProductFileInputs(temp);
        setUpdates(updates + 1);
    }
    
    const handleWGFileAddClick = () => {
        let temp = wgFileInputs;
        temp.push([]);
        setWGFileInputs(temp);
        setUpdates(updates + 1);
    }
    
    const handleMCFileAddClick = () => {
        let temp = mcFileInputs;
        temp.push([]);
        setMCFileInputs(temp);
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

    const handleWGVideoUrlChange = (e, i) => {
        let temp = wgVideos;
        temp[i].url = e.target.value;
        setWGVideos(temp);
        setUpdates(updates + 1);
    }
    const handleWGVideoDescriptionChange = (e, i) => {
        let temp = wgVideos;
        temp[i].description = e.target.value;
        setWGVideos(temp);
        setUpdates(updates + 1);
    }

    const handleMCVideoUrlChange = (e, i) => {
        let temp = mcVideos;
        temp[i].url = e.target.value;
        setMCVideos(temp);
        setUpdates(updates + 1);
    }
    const handleMCVideoDescriptionChange = (e, i) => {
        let temp = mcVideos;
        temp[i].description = e.target.value;
        setMCVideos(temp);
        setUpdates(updates + 1);
    }

    const [openPrintModal, setOpenPrintModal] = useState(false);
    const [openPreviewModal, setOpenPreviewModal] = useState(false);

    // Convert base64 string to File object
    const base64ToFile = (base64String, filename) => {
      const arr = base64String.split(',');
      const mime = arr[0].match(/:(.*?);/)[1];
      const bstr = atob(arr[1]);
      let n = bstr.length;
      const u8arr = new Uint8Array(n);
      while (n--) {
        u8arr[n] = bstr.charCodeAt(n);
      }
      return new File([u8arr], filename, { type: mime });
    };

    const productCapturePhoto = async () => {
        if(!captureStart[0]) {
            captureStart[0] = true;
            setCaptureStart([...captureStart])
        }
        else {
            const imageSrc = productWebcamRef.current.getScreenshot();
            // const response = await fetch(imageSrc);

            // const blob = await response.blob();
            // console.log(blob);
            const file = base64ToFile(imageSrc, 'webcam-photo.jpg');
            
            const body = new FormData();
            body.append("file", file);
            const res = await uploadFile(body);
            console.log(res);

            let temp = productCaptureImages;
            temp.push(res);
            setProductCaptureImages(temp);

            let images = [];
            for (let inputs of productImageInputs) {
                for (let image of inputs) {
                    images.push(image);
                }
            }

            for (let image of productCaptureImages) {
                images.push(image);
            }
            setProductImages(images);
        }
        
    }
    const wgCapturePhoto = async () => {
        if(!captureStart[1]) {
            captureStart[1] = true;
            setCaptureStart([...captureStart])
        }
        else {
            const imageSrc = wgWebcamRef.current.getScreenshot();
            // const response = await fetch(imageSrc);
            // const blob = await response.blob();
            
            const file = base64ToFile(imageSrc, 'webcam-photo.jpg');
            
            const body = new FormData();
            body.append("file", file);
            const res = await uploadFile(body);
            console.log(res);
    
            let temp = wgCaptureImages;
            temp.push(res);
            setWGImages(temp);
    
            let images = [];
            for (let inputs of wgImageInputs) {
                for (let image of inputs) {
                    images.push(image);
                }
            }
    
            for (let image of wgCaptureImages) {
                images.push(image);
            }
            setWGImages(images);
        }
       
    }
    const mcCapturePhoto = async () => {
        if(!captureStart[2]) {
            captureStart[2] = true;
            setCaptureStart([...captureStart])
        }
        else {
            const imageSrc = mcWebcamRef.current.getScreenshot();
            const file = base64ToFile(imageSrc, 'webcam-photo.jpg');
            
            const body = new FormData();
            body.append("file", file);
            const res = await uploadFile(body);
            console.log(res);
    
            let temp = mcCaptureImages;
            temp.push(res);
            setMCCaptureImages(temp);
    
            let images = [];
            for (let inputs of mcImageInputs) {
                for (let image of inputs) {
                    images.push(image);
                }
            }
    
            for (let image of mcCaptureImages) {
                images.push(image);
            }
            setMCImages(images);
        }
       
    }

    const enabled = canAddSerialNumber()

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

                        <Tabs aria-label="Basic tabs" defaultValue={0}>
                            <TabList>
                                <Tab>DPP</Tab>
                                <Tab>Warranty & Guaranty</Tab>
                                <Tab>Trade History</Tab>
                            </TabList>
                            <TabPanel value={0}>
                                Images: 
                                <br/>
                                &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Select images: <Button variant='outlined' onClick={handleProductImageAddClick}>+</Button>
                                <br/><br/>
                                {productImageInputs.map((images, i) => (
                                    <>
                                        <input ref={productImageInputRefs.current[i]} key={i} type='file' accept="image/*" onChange={(e) => {handleProductImageChange(e, i)}} multiple style={{ display: 'none' }}/>
                                        <Button
                                            variant="outlined"
                                            onClick={() => productImageInputRefs.current[i]?.current.click()}
                                            size='small'
                                            sx={{ ml: 8}}
                                        >
                                            Choose Files
                                        </Button>

                                        <span>
                                            {productImageInputs[i]?.length > 0 ? (
                                                <> {productImageInputs[i].length} files</>
                                            ) : (
                                                <> No file chosen</>
                                            )}
                                        </span>
                                        <br/><br/>
                                    </>
                                ))}
                                &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Capture images: <Button
                                    variant="outlined"
                                    onClick={productCapturePhoto}
                                    size='small'
                                >
                                    {
                                        !captureStart[0]?'Start Capture':'Capture'
                                    }
                                </Button>
                                <span> {productCaptureImages.length} Images captured</span>
                                <br /><br />
                                {
                                    captureStart[0] && (
                                        <Webcam
                                            audio={false}
                                            ref={productWebcamRef}
                                            screenshotFormat="image/jpeg"
                                            width='100%'
                                            height={360}
                                        />
                                    )
                                }

                                <br/><br/>

                                <span>Additional Identifiers: <Button variant='outlined' onClick={()=>setSerials([{type:enabled[0]},...serials])} disabled={enabled.length == 0}>+</Button></span>
                                <br/>
                                {
                                    serials.map((item,i)=>(
                                        <div style={{display:'flex',alignItems:'center',marginTop:20}}>
                                            <Select key={i * 2} value={item.type} id="outlined-basic" label="Type">
                                            
                                                {
                                                    serialTypes.filter(type=>enabled.includes(type.value) || type.value == item.type).map(type=>(
                                                        <MenuItem value={type.value}>{type.label}</MenuItem>
                                                    ))
                                                }
                                            </Select>

                                            <IconButton style={{marginLeft:50}} onClick={()=>setSerials(serials.filter((item,index)=>index !== i))}><DeleteIcon /></IconButton>
                                    </div>
                                    ))
                                }
                               
                                <br/><br/>

                                Files: <Button variant='outlined' onClick={handleProductFileAddClick}>+</Button>
                                <br/><br/>
                                {productFileInputs.map((files, i) => (
                                    <>
                                        &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Select files: <input ref={productFileInputRefs.current[i]} key={i} type='file' accept='.pdf' onChange={(e) => {handleProductFilesChange(e, i)}} multiple style={{ display: 'none' }}/>
                                        <Button
                                            variant="outlined"
                                            onClick={() => productFileInputRefs.current[i]?.current.click()}
                                            size='small'
                                        >
                                            Choose Files
                                        </Button>

                                        <span>
                                            {productFileInputs[i]?.length > 0 ? (
                                                <> {productFileInputs[i].length} files</>
                                            ) : (
                                                <> No file chosen</>
                                            )}
                                        </span>
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
                            </TabPanel>
                            <TabPanel value={1}>
                                <>
                                    <h4>Warranty & Guaranty</h4>
                                    Images: 
                                    <br/>
                                    &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Select images: <Button variant='outlined' onClick={handleWGImageAddClick}>+</Button>
                                    <br/><br/>
                                    {wgImageInputs.map((images, i) => (
                                        <>
                                            <input ref={wgImageInputRefs.current[i]} key={i} type='file' accept="image/*" onChange={(e) => {handleWGImageChange(e, i)}} multiple style={{ display: 'none' }}/>
                                            <Button
                                                variant="outlined"
                                                onClick={() => wgImageInputRefs.current[i]?.current.click()}
                                                size='small'
                                                sx={{ ml: 8}}
                                            >
                                                Choose Files
                                            </Button>

                                            <span>
                                                {wgImageInputs[i]?.length > 0 ? (
                                                    <> {wgImageInputs[i].length} files</>
                                                ) : (
                                                    <> No file chosen</>
                                                )}
                                            </span>
                                            <br/><br/>
                                        </>
                                    ))}
                                    &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Capture images: <Button
                                        variant="outlined"
                                        onClick={wgCapturePhoto}
                                        size='small'
                                    >
                                        {!captureStart[1]?'Start Capture':'Capture'}
                                    </Button>
                                    <span> {wgCaptureImages.length} Images captured</span>
                                    <br />
                                    {
                                        captureStart[1] && (
                                            <Webcam
                                                audio={false}
                                                ref={wgWebcamRef}
                                                screenshotFormat="image/jpeg"
                                                width={640}
                                                height={360}
                                            />
                                        )
                                    }
                                    
                                    <br/><br/>

                                    Files: <Button variant='outlined' onClick={handleWGFileAddClick}>+</Button>
                                    <br/><br/>
                                    {wgFileInputs.map((files, i) => (
                                        <>
                                            &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Select files: <input ref={wgFileInputRefs.current[i]} key={i} type='file' accept='.pdf' onChange={(e) => {handleWGFilesChange(e, i)}} multiple style={{ display: 'none' }}/>
                                            <Button
                                                variant="outlined"
                                                onClick={() => wgFileInputRefs.current[i]?.current.click()}
                                                size='small'
                                            >
                                                Choose Files
                                            </Button>

                                            <span>
                                                {wgFileInputs[i]?.length > 0 ? (
                                                    <> {wgFileInputs[i].length} files</>
                                                ) : (
                                                    <> No file chosen</>
                                                )}
                                            </span>
                                            <br/><br/>
                                        </>
                                    ))}

                                    Youtube Videos: <Button variant='outlined' onClick={handleWGVideoAddClick}>+</Button>
                                    <br/><br/>
                                    {wgVideos.map((video, i) => (
                                        <>
                                            &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<TextField key={i * 2} id="outlined-basic" label="Url..." variant="outlined" size='small' value={video.url} onChange={(e) => handleWGVideoUrlChange(e, i)} /> &nbsp;
                                            <TextField key={i * 2 + 1} id="outlined-basic" label="Description" variant="outlined" size='small' value={video.description} onChange={(e) => handleWGVideoDescriptionChange(e, i)} /> &nbsp;
                                            <br/><br/>
                                        </>
                                    ))}

                                    Warranty: &nbsp;&nbsp;
                                    <TextField 
                                        type='number' 
                                        variant="outlined" 
                                        label="Period" 
                                        size='small' 
                                        sx={{ width: 80}}
                                        value={warrantyPeriod} 
                                        onChange={(e) => {setWarrantyPeriod(e.target.value)}} 
                                        disabled={noWarranty | lifetimeWarranty}
                                    /> &nbsp;
                                    <Select
                                        value={warrantyUnit} 
                                        onChange={(e) => {setWarrantyUnit(e.target.value)}} 
                                        size='small'
                                        disabled={noWarranty | lifetimeWarranty}
                                    >
                                        <MenuItem value={0}>Week</MenuItem>
                                        <MenuItem value={1}>Month</MenuItem>
                                    </Select>
                                    <br/> <br/>
                                    <Checkbox sx={{ p:0, pl: 4}} checked={noWarranty} 
                                        onChange={(e) => {
                                            if(!noWarranty) {
                                                setLifetimeWarranty(false);
                                            }
                                            setNoWarranty(!noWarranty)
                                        }} /> No Warranty
                                    <Checkbox sx={{ p:0, pl: 2}} checked={lifetimeWarranty} 
                                        onChange={(e) => {
                                            if(!lifetimeWarranty) {
                                                setNoWarranty(false);
                                            }
                                            setLifetimeWarranty(!lifetimeWarranty)
                                        }}/> Lifetime Warranty
                                    <br /><br />
                                    Guarantee: &nbsp;&nbsp;
                                    <TextField 
                                        type='number' 
                                        variant="outlined" 
                                        label="Period" 
                                        size='small' 
                                        sx={{ width: 80}}
                                        value={guaranteePeriod} 
                                        onChange={(e) => {setGuaranteePeriod(e.target.value)}} 
                                        disabled={noGuarantee | lifetimeGuarantee}
                                    /> &nbsp;
                                    <Select
                                        value={guaranteeUnit} 
                                        onChange={(e) => {setGuaranteeUnit(e.target.value)}} 
                                        size='small'
                                        disabled={noGuarantee | lifetimeGuarantee}
                                    >
                                        <MenuItem value={0}>Week</MenuItem>
                                        <MenuItem value={1}>Month</MenuItem>
                                    </Select>
                                    <br/> <br/>
                                    <Checkbox sx={{ p:0, pl: 4}} checked={noGuarantee} 
                                        onChange={(e) => {
                                            if(!noGuarantee) {
                                                setLifetimeGuarantee(false);
                                            }
                                            setNoGuarantee(!noGuarantee)
                                        }} /> No Guarantee
                                    <Checkbox sx={{ p:0, pl: 2}} checked={lifetimeGuarantee} 
                                        onChange={(e) => {
                                            if(!lifetimeGuarantee) {
                                                setNoGuarantee(false);
                                            }
                                            setLifetimeGuarantee(!lifetimeGuarantee)
                                        }}/> Lifetime Guarantee
                                    <br/><br/>
                                    Images: 
                                    <br/>
                                    &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Select images: <Button variant='outlined' onClick={handleMCImageAddClick}>+</Button>
                                    <br/><br/>
                                    {mcImageInputs.map((images, i) => (
                                        <>
                                            <input ref={mcImageInputRefs.current[i]} key={i} type='file' accept="image/*" onChange={(e) => {handleMCImageChange(e, i)}} multiple style={{ display: 'none' }}/>
                                            <Button
                                                variant="outlined"
                                                onClick={() => mcImageInputRefs.current[i]?.current.click()}
                                                size='small'
                                                sx={{ ml: 8}}
                                            >
                                                Choose Files
                                            </Button>

                                            <span>
                                                {mcImageInputs[i]?.length > 0 ? (
                                                    <> {mcImageInputs[i].length} files</>
                                                ) : (
                                                    <> No file chosen</>
                                                )}
                                            </span>
                                            <br/><br/>
                                        </>
                                    ))}
                                    &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Capture images: <Button
                                        variant="outlined"
                                        onClick={mcCapturePhoto}
                                        size='small'
                                    >
                                        {captureStart[2]?'Capture':'Start Capture'}
                                    </Button>
                                    <span> {mcCaptureImages.length} Images captured</span>
                                    <br />
                                    {
                                        captureStart[2] && (
                                            <Webcam
                                                audio={false}
                                                ref={mcWebcamRef}
                                                screenshotFormat="image/jpeg"
                                                width={640}
                                                height={360}
                                            />
                                        )
                                    }
                                    
                                    <br/><br/>

                                    Files: <Button variant='outlined' onClick={handleMCFileAddClick}>+</Button>
                                    <br/><br/>
                                    {mcFileInputs.map((files, i) => (
                                        <>
                                            &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Select files: <input ref={mcFileInputRefs.current[i]} key={i} type='file' accept='.pdf' onChange={(e) => {handleMCFilesChange(e, i)}} multiple style={{ display: 'none' }}/>
                                            <Button
                                                variant="outlined"
                                                onClick={() => mcFileInputRefs.current[i]?.current.click()}
                                                size='small'
                                            >
                                                Choose Files
                                            </Button>

                                            <span>
                                                {mcFileInputs[i]?.length > 0 ? (
                                                    <> {mcFileInputs[i].length} files</>
                                                ) : (
                                                    <> No file chosen</>
                                                )}
                                            </span>
                                            <br/><br/>
                                        </>
                                    ))}

                                    Youtube Videos: <Button variant='outlined' onClick={handleMCVideoAddClick}>+</Button>
                                    <br/><br/>
                                    {mcVideos.map((video, i) => (
                                        <>
                                            &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<TextField key={i * 2} id="outlined-basic" label="Url..." variant="outlined" size='small' value={video.url} onChange={(e) => handleMCVideoUrlChange(e, i)} /> &nbsp;
                                            <TextField key={i * 2 + 1} id="outlined-basic" label="Description" variant="outlined" size='small' value={video.description} onChange={(e) => handleMCVideoDescriptionChange(e, i)} /> &nbsp;
                                            <br/><br/>
                                        </>
                                    ))}

                                    Public: <TextField 
                                        placeholder=' - User manuals
                                            - Assembly manuals
                                            - Product certifications
                                            - Health warnings
                                            - Etc.'
                                        sx={{ width: '80%' }} 
                                        variant="outlined" 
                                        multiline 
                                        rows={5}  
                                        value={manualsAndCerts.public} 
                                        onChange={(e) => {setManualsAndCerts({public: e.target.value, private: manualsAndCerts.private})}} 
                                    />
                                    <br /><br />
                                    Private: <TextField 
                                        placeholder=' - Receipts for the supply chain (could we incorporate a scanner in future, for now, it is only for upload, for MVP
                                            - Taxation documents
                                            - Basically anything related to the product, which the customer does not need to see or could impact the strategic advantage of the brand, hence private, so it is available for audit, but not for general consumption. These documents are only visible to people with a higher login authority, which will also be split into multiple roles'
                                        sx={{ width: '80%' }} 
                                        variant="outlined" 
                                        multiline 
                                        rows={5}  
                                        value={manualsAndCerts.private} 
                                        onChange={(e) => {setManualsAndCerts({private: e.target.value, public: manualsAndCerts.public})}} 
                                    />
                                </>
                            </TabPanel>
                            <TabPanel value={2}>
                                
                            </TabPanel>
                        </Tabs>

                        <Button variant='outlined' onClick={() => {setOpenPreviewModal(true)}} disabled={!(productName != '' && productDetail != '' && productImages.length > 0)}>Preview</Button>
                        <br/><br/>
                        {!isEditing > 0
                            ? <Button variant='outlined' onClick={addProductHandler} disabled={!(productName != '' && productDetail != '' && productImages.length > 0)}>Add Product</Button>
                            : <Button variant='outlined' onClick={updateProductHandler} disabled={!(productName != '' && productDetail != '' && productImages. length > 0)}>Update Product</Button>}
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
                            <div style={{display:'flex',flexWrap:'wrap'}}>
                            {qrcodes.map((item, index) => (
                                <QRCode key={index} data={item} identifer={identifiers[index]?identifiers[index]:[]} />
                            ))}
                            </div>
                            
                        </Box>
                    </Box>}
                </>
            }
            {selectedProduct && <PrintModal open={openPrintModal} setOpen={setOpenPrintModal} totalAmount={totalAmount} product={selectedProduct} setProduct={setSelectedProduct}/>}
            {company && <PreviewModal open={openPreviewModal} setOpen={setOpenPreviewModal} productInfo={{
                name: productName,
                model: productModel, 
                detail: productDetail, 
                company_id: company._id, 
                images:productImages, 
                files: productFiles, 
                videos: productVideos, 
                warrantyAndGuarantee: {
                    images: wgImages,
                    files: wgFiles,
                    videos: wgVideos,
                    warranty: {
                        period: warrantyPeriod, 
                        unit: warrantyUnit,
                        notime: noWarranty,
                        lifetime: lifetimeWarranty
                    }, 
                    guarantee: {
                        period: guaranteePeriod, 
                        unit: guaranteeUnit,
                        notime: noGuarantee,
                        lifetime: lifetimeGuarantee
                    }
                }, 
                manualsAndCerts: {
                    images: mcImages,
                    files: mcFiles,
                    videos: mcVideos,
                    ...manualsAndCerts
                }
            }}/>}
        </Box>
    );
}

export default Page;