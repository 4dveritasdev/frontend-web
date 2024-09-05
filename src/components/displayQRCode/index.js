import react, { useEffect, useState } from 'react';
import qrcode from 'qrcode';


const QRCode = ({data}) => {

    const [qrcodeImage, setQRcodeImage] = useState('');
    
    useEffect(() => {
        (async () => {
            console.log(data);
            const code = await qrcode.toDataURL('https://4dveritaspublic.com?qrcode=' + data);
            setQRcodeImage(code);
        })()
    }, [data]);

    return (
        <>
            <img
                // srcSet={`${item.img}?w=161&fit=crop&auto=format&dpr=2 2x`}
                src={`${qrcodeImage}`}
                // alt={item.title}
                loading="lazy"
            />
        </>
    );
}

export default QRCode;