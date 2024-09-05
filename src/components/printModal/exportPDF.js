import React, { useState, useEffect } from 'react';
import { Document, Page, Text, View, StyleSheet, Image } from '@react-pdf/renderer';
import { getProductQRcodes } from '../../helper';
import qrcode from 'qrcode';

// Create styles
const styles = StyleSheet.create({
  page: {
    // flexDirection: 'row',
    backgroundColor: '#fff',
    padding: '80px 40px 50px 40px',
    fontSize: '10px',
    fontWeight: 'thin',
    display: 'flex',
  },
});

const QRCode = ({data}) => {

    const [qrcodeImage, setQRcodeImage] = useState('');
    
    useEffect(() => {
        (async () => {
            const code = await qrcode.toDataURL('https://parisbrewerytours.com?qrcode=' + data);
            setQRcodeImage(code);
        })()
    }, [data]);

    return (
        <Image
            src={`${qrcodeImage}`}
            style={{ width: "100px", height: "100px"}}
        />
    );
}

// Create Document Component
const MyDocument = ({ product, apply, printMode, count, from, to }) => {
    const [qrcodes, setQrCodes] = useState([]);

    useEffect(() => {
        // console.log(apply);
        if(apply) {
            (async () => {
                const res = await getProductQRcodes(product._id, 0, printMode === 'print' ? product.printed_amount + 1 : from, printMode === 'print' ? product.printed_amount + Number(count) : to);
                setQrCodes(res);
            })()
        }
    }, [apply]);
    // console.log(qrcodes);

    return (
        <Document>
            <Page size="A4" style={styles.page}>
                <View style={{display: 'flex', flexDirection: 'row', flexWrap: 'wrap'}}>
                    {qrcodes.map((item, index) => (
                        <QRCode key={index} data={item} />
                    ))}
                </View>
            </Page>
        </Document>
    );
};

export default MyDocument;