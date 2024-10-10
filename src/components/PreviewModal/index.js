import * as React from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Modal from '@mui/material/Modal';
import { Divider, Grid, TextField } from '@mui/material';
import { CalculateRemainPeriod } from '../../helper';
import { useState } from 'react';
import { Slide } from 'react-slideshow-image';
import 'react-slideshow-image/dist/styles.css'
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import YouTube from 'react-youtube';
import CameraIcon from '../../assets/camera_icon.png';
import YoutubeIcon from '../../assets/youtube-icon.png';
import PDFIcon from '../../assets/pdf.png';
import { Worker, Viewer } from '@react-pdf-viewer/core';
import '@react-pdf-viewer/core/lib/styles/index.css';
import '@react-pdf-viewer/default-layout/lib/styles/index.css';

const style = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    // maxWidth: '70%',
    width: '400px',
    bgcolor: 'background.paper',
    border: '2px solid #000',
    boxShadow: 24,
    textAlign: 'center'
};

const modalStyle = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    bgcolor: 'background.paper',
    border: '2px solid #000',
    boxShadow: 24,
    width: '400px',
    height: '60vh'
  };

function CustomTabPanel(props) {
    const { children, value, index, ...other } = props;
  
    return (
      <div
        role="tabpanel"
        hidden={value !== index}
        id={`simple-tabpanel-${index}`}
        aria-labelledby={`simple-tab-${index}`}
        {...other}
      >
        {value === index && <Box sx={{ p: 2 }}>{children}</Box>}
      </div>
    );
}

export default function PreviewModal({open, setOpen, productInfo }) {

    const [tabValue, setTabValue] = useState(0);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [viewPDF, setViewPDF] = useState(false);
    const [currentPDF, setCurrentPDF] = useState(null);

    const handleChange = (event, newValue) => {
        console.log(event);
        setTabValue(newValue);
        setCurrentIndex(0);
    };
    
  function a11yProps(index) {
    return {
      id: `simple-tab-${index}`,
      'aria-controls': `simple-tabpanel-${index}`,
    };
  }

  const getYoutubeVideoIDFromUrl = (url) => {
    var videoid = url.match(/(?:https?:\/{2})?(?:w{3}\.)?youtu(?:be)?\.(?:com|be)(?:\/watch\?v=|\/)([^\s&]+)/);
    if(videoid != null) {
      console.log("video id = ",videoid[1]);
      return videoid[1];
    } else {
        console.log("The youtube url is not valid.");
        return null;
    }
  }

  const opts = {
    width: '100%',
    height: 280,
    playerVars: {
      autoplay: 0,
    },
  };
    
    return (
        <Modal
        open={open}
        onClose={() => setOpen(false)}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
        >
        <Box sx={style}>
            <Box sx={{ position: 'relative', backgroundColor: 'black', color: 'white', height: 750, overflow: 'auto'}}>
            
                <Modal
                    open={viewPDF}
                    onClose={() => setViewPDF(false)}
                    aria-labelledby="modal-modal-title"
                    aria-describedby="modal-modal-description"
                >
                    <Box sx={modalStyle}>
                        <Worker workerUrl={`https://unpkg.com/pdfjs-dist@3.11.174/build/pdf.worker.min.js`}>
                        <Viewer fileUrl={'https://shearnode.com/api/v1/files/' + currentPDF} />
                        </Worker>
                    </Box>
                </Modal>

                <Typography sx={{ p: 5, pt: 2, fontSize: 24}} >{productInfo.name}</Typography>

                {tabValue === 0 && <Box sx={{ position: 'relative' }}>
                    <Slide transitionDuration={100} autoplay={false} onChange={(previous, next) => { console.log(previous); setCurrentIndex(next) }}>
                        {productInfo.images.map((slideImage, index) => (
                            <div key={index}>
                                <img src={'https://shearnode.com/api/v1/files/' + slideImage} height={280} />
                            </div>
                        ))} 
                        {productInfo.videos.map((video) => (
                            <YouTube videoId={getYoutubeVideoIDFromUrl(video.url)} opts={opts} />
                        ))}
                    </Slide>

                    <Box sx={{ 
                        position: 'absolute',
                        bottom: 15,
                        paddingTop: 1,
                        paddingBottom: 1,
                        paddingLeft: 2,
                        paddingRight: 2,
                        right: 10,
                        borderRadius: 20,
                        backgroundColor: '#444',
                        display: 'flex',
                        flexDirection: 'row',
                        justifyContent: 'center',
                        alignItems: 'center',
                        }}>
                        <img src={currentIndex < productInfo.images.length ?  CameraIcon : YoutubeIcon} style={{height: 20, width: 20}} />
                        <Typography sx={{color: 'white', fontSize: 13, marginLeft: 1}}>
                            {currentIndex + 1}/{productInfo.images.length + productInfo.videos.length} Medias
                        </Typography>
                    </Box>
                </Box>}
                
                {tabValue === 1 && <Box sx={{ position: 'relative' }}>
                    {
                       productInfo.warrantyAndGuarantee.images.length +  productInfo.warrantyAndGuarantee.videos.length + productInfo.manualsAndCerts.images.length + productInfo.manualsAndCerts.videos.length > 0 && (
                        <>
                            <Slide transitionDuration={100} autoplay={false} onChange={(previous, next) => { console.log(previous); setCurrentIndex(next) }}>
                                {productInfo.warrantyAndGuarantee.images.map((slideImage, index) => (
                                    <div key={index}>
                                        <img src={'https://shearnode.com/api/v1/files/' + slideImage} height={280} />
                                    </div>
                                ))} 
                                 {productInfo.manualsAndCerts.images.map((slideImage, index) => (
                                    <div key={index}>
                                        <img src={'https://shearnode.com/api/v1/files/' + slideImage} height={280} />
                                    </div>
                                ))} 
                                {productInfo.warrantyAndGuarantee.videos.map((video) => (
                                    <YouTube videoId={getYoutubeVideoIDFromUrl(video.url)} opts={opts} />
                                ))}
                               
                                {productInfo.manualsAndCerts.videos.map((video) => (
                                    <YouTube videoId={getYoutubeVideoIDFromUrl(video.url)} opts={opts} />
                                ))}
                                
                            </Slide>

                            <Box sx={{ 
                                position: 'absolute',
                                bottom: 15,
                                paddingTop: 1,
                                paddingBottom: 1,
                                paddingLeft: 2,
                                paddingRight: 2,
                                right: 10,
                                borderRadius: 20,
                                backgroundColor: '#444',
                                display: 'flex',
                                flexDirection: 'row',
                                justifyContent: 'center',
                                alignItems: 'center',
                                }}>
                                <img src={currentIndex < productInfo.warrantyAndGuarantee.images.length + productInfo.manualsAndCerts.images.length ?  CameraIcon : YoutubeIcon} style={{height: 20, width: 20}} />
                                <Typography sx={{color: 'white', fontSize: 13, marginLeft: 1}}>
                                    {currentIndex + 1}/{productInfo.warrantyAndGuarantee.images.length + productInfo.warrantyAndGuarantee.videos.length + productInfo.manualsAndCerts.images.length + productInfo.manualsAndCerts.videos.length} Medias
                                </Typography>
                            </Box>

                        </>
                       )
                    }
                    
                </Box>}
                
                {tabValue === 2 && <Box sx={{ position: 'relative' }}>
                
                </Box>}

                <Box sx={{ width: '100%', pt: 3 }}>
                    <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                        <Tabs
                            value={tabValue}
                            onChange={handleChange}
                            aria-label="basic tabs example"
                        >
                            <Tab sx={{ fontSize: 13, fontWeight: 'bold', minWidth: 48, color: '#CCC' }} label="DPP" {...a11yProps(0)} />
                            <Tab sx={{ fontSize: 13, fontWeight: 'bold', minWidth: 48, color: '#CCC'}} label="Time Capsule" {...a11yProps(1)} />
                            {/* <Tab sx={{ fontSize: 13, fontWeight: 'bold', minWidth: 48, color: '#CCC'}} label="Trade History" {...a11yProps(2)} /> */}
                        </Tabs>
                    </Box>
                    <CustomTabPanel value={tabValue} index={0}>
                        <Box sx={{
                        backgroundColor: 'white',
                        color: 'black',
                        p: 2,
                        m: 1,
                        mt: 0,
                        borderRadius: 5
                        }}>
                        <Box sx={{display: 'flex', flexDirection: 'row'}}>
                            <Box style={{flex: 1}}>
                                <Typography style={{ fontSize: 15, fontWeight: 'bold', textAlign: 'left' }}>
                                    {productInfo.model}
                                </Typography>
                            </Box>
                            <Box style={{flex: 1}}>
                                {/* <Typography style={{fontSize: 13, textAlign: 'right'}}>Status : {productInfo.status}</Typography>
                                <Typography style={{fontSize: 13, textAlign: 'right'}}>MPG Date : {productInfo.mpg_time}</Typography> */}
                            </Box>
                        </Box>
                        <Box style={{paddingTop: 20, display: 'flex', flexDirection: 'row'}}>
                            <Box style={{flex: 2}}>
                                <Typography style={{fontSize: 13, textAlign: 'left', whiteSpace: 'pre-line'}}>{productInfo.detail}</Typography>
                            </Box>
                            <Box style={{flex: 1, textAlign: 'right'}}>
                                {/* <img src={productInfo.qrcode_img} style={{width: 100, height: 100}} /> */}
                            </Box>
                        </Box>
                                
                        <Box style={{ display: 'flex', flexDirection: 'row'}}>
                            {productInfo.files.map((file, i) => (
                            <Button key={i} onClick={() => {console.log(file); setViewPDF(true); setCurrentPDF(file)}} style={{ padding: 2 }}>
                                <img src={PDFIcon} style={{height: 28, width: 28}} />
                            </Button>
                            ))}
                        </Box>
                        </Box>
                    </CustomTabPanel>
                    <CustomTabPanel value={tabValue} index={1}>
                        <Box sx={{
                            backgroundColor: 'white',
                            color: 'black',
                            p: 2,
                            m: 1,
                            mt: 0,
                            borderRadius: 5,
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center'
                        }}>
                            {!productInfo.warrantyAndGuarantee.warranty.notime && !productInfo.warrantyAndGuarantee.warranty.lifetime && <Typography style={{ fontSize: 15, textAlign: 'center', width: 200 }}>
                                The warranty for this product will expire in:
                            </Typography>}
                            <Typography style={{ fontSize: 15, textAlign: 'center', width: 200, paddingTop: 10, color: (!productInfo.warrantyAndGuarantee.warranty.notime && !productInfo.warrantyAndGuarantee.warranty.lifetime && CalculateRemainPeriod(productInfo.mpg_time, productInfo.warrantyAndGuarantee.warranty).duaration < 7 ? 'red' : 'black') }}>
                                {!productInfo.warrantyAndGuarantee.warranty.notime && !productInfo.warrantyAndGuarantee.warranty.lifetime && CalculateRemainPeriod(productInfo.mpg_time, productInfo.warrantyAndGuarantee.warranty).string}
                                {productInfo.warrantyAndGuarantee.warranty.notime && 'No Warranty'}
                                {productInfo.warrantyAndGuarantee.warranty.lifetime && 'Lifetime Warranty'}
                            </Typography>
                        
                            {!productInfo.warrantyAndGuarantee.guarantee.notime && !productInfo.warrantyAndGuarantee.guarantee.lifetime && <Typography style={{ fontSize: 15, textAlign: 'center', width: 220, paddingTop: 20 }}>
                                The guarantee for this product will expire in:
                            </Typography>}
                            <Typography style={{ fontSize: 15, textAlign: 'center', width: 200, paddingTop: 10, color: (!productInfo.warrantyAndGuarantee.guarantee.notime && !productInfo.warrantyAndGuarantee.guarantee.lifetime && CalculateRemainPeriod(productInfo.mpg_time, productInfo.warrantyAndGuarantee.guarantee).duaration < 7 ? 'red' : 'black') }}>
                                {!productInfo.warrantyAndGuarantee.guarantee.notime && !productInfo.warrantyAndGuarantee.guarantee.lifetime && CalculateRemainPeriod(productInfo.mpg_time, productInfo.warrantyAndGuarantee.guarantee).string}
                                {productInfo.warrantyAndGuarantee.guarantee.notime && 'No Guarantee'}
                                {productInfo.warrantyAndGuarantee.guarantee.lifetime && 'Lifetime Guarantee'}
                            </Typography>
                            
                            <Typography style={{ fontSize: 15, textAlign: 'center', width: 220, paddingTop: 20 }}>
                                Be sure to inspect for and report damage or fault before expiration
                            </Typography>
                                
                            <Box style={{ display: 'flex', flexDirection: 'row'}}>
                            {productInfo.warrantyAndGuarantee.files.map((file, i) => (
                                <Button key={i} onClick={() => {console.log(file); setViewPDF(true); setCurrentPDF(file)}} style={{ padding: 2 }}>
                                <img src={PDFIcon} style={{height: 28, width: 28}} />
                                </Button>
                            ))}
                            </Box>

                            <h4>Manual & Certs</h4>
                            <Typography style={{ fontSize: 15, fontWeight: 'bold' }}>
                                Public
                            </Typography>
                            
                            <Typography style={{ fontSize: 13, padding: 2, whiteSpace: 'pre-line'  }}>
                                {productInfo.manualsAndCerts.public}
                            </Typography>
                            
                            <Typography style={{ fontSize: 15, fontWeight: 'bold' }}>
                                Private
                            </Typography>
                            
                            <Typography style={{ fontSize: 13, padding: 2, whiteSpace: 'pre-line' }}>
                                {productInfo.manualsAndCerts.private}
                            </Typography>
                                    
                            <Box style={{ display: 'flex', flexDirection: 'row'}}>
                                {productInfo.manualsAndCerts.files.map((file, i) => (
                                <Button key={i} onClick={() => {console.log(file); setViewPDF(true); setCurrentPDF(file)}} style={{ padding: 2 }}>
                                    <img src={PDFIcon} style={{height: 28, width: 28}} />
                                </Button>
                                ))}
                            </Box>
                        </Box>
                    </CustomTabPanel>
                    <CustomTabPanel value={tabValue} index={2}>
                        <Box sx={{
                            backgroundColor: 'white',
                            color: 'black',
                            p: 2,
                            m: 1,
                            mt: 0,
                            borderRadius: 5,
                            textAlign: 'left'
                        }}>
                        
                            
                        </Box>
                    </CustomTabPanel>
                </Box>
            </Box>
        </Box>
        </Modal>
    );
}