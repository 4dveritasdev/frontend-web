import axios from 'axios';

const Backend_URL = 'https://shearnode.com/api/v1/';
// const Backend_URL = 'http://localhost:5050/';

export const getCompanyInfo = async (wallet) => {
    const res = await axios.get(`${Backend_URL}company/info/${wallet}`);
    // console.log(res);
    return res.data.data.doc;
}

export const login = async (data) => {
    try {
        const res = await axios.post(`${Backend_URL}company/auth`, data);
        // console.log(res);
        // updateCompanyStatus(res.data.data.doc);
        return res.data.data.doc;
    } catch (err) {
        console.log(err);
        alert(err.response.data.message);
        return null;
    }
}

export const registerCompany = async (data) => {
    try {
        const res = await axios.post(`${Backend_URL}company`, data);
        alert('successfully registered');
        // updateCompanyStatus(res.data.data.doc);
        return res.data.data.data;
    } catch (err) {
        console.log(err.response);
        alert("Failed: " + err.response.data.message);
        return null;
    }
}

export const addProduct = async (data) => {
    try {
        await axios.post(`${Backend_URL}product`, data);
        alert('product successfully added');
    } catch(err) {
        console.log(err);
        alert('Failed: ' + err.response.data.message);
    }
}

export const updateProduct = async (data) => {
    try {
        await axios.put(`${Backend_URL}product/${data._id}`, data);
        alert('product successfully updated');
    } catch(err) {
        console.log(err);
        alert('Failed: ' + err.response.data.message);
    }
}

export const removeProduct = async (id) => {
    try {
        await axios.delete(`${Backend_URL}product/${id}`);
        alert('product successfully removed');
    } catch(err) {
        console.log(err);
        alert('Failed: ' + err.response.data.message);
    }
}

export const printProductQRCodes = async (id, count) => {
    try {
        const res = await axios.post(`${Backend_URL}product/${id}/print`, { count });
        return res.data.data;
    } catch(err) {
        console.log(err);
    }
}

export const getCompanyProducts = async (data) => {
    try {
        const res = await axios.post(`${Backend_URL}product/filter`, data);
        // console.log(res);
        return res.data.data.data;
    } catch (err) {
        console.log(err);
        return [];
    }
}

export const productMint =async (product_id, amount) => {
    try {
        const res = await axios.post(`${Backend_URL}product/${product_id}/mint`, { amount });
        // console.log(pres);
        // const res = await axios.post(`${Backend_URL}qrcode/product`, { product_id, amount, offset: pres.data.offset });
        // console.log(res);
        // return res.data.data.data;
        // console.log(res);
        return res.data.offset;
        return res;
    } catch (err) {
        console.log(err);
    }
}

export const getQRcodes = async () => {
    try {
        const res = await axios.get(`${Backend_URL}qrcode`);
        // console.log(res);
        return res.data.data.data;
    } catch (err) {
        console.log(err);
    }
}

export const getSelectedProductData = async (id) => {
    try {
        const res = await axios.get(`${Backend_URL}product/${id}`);
        // console.log(res);
        return res.data.data.doc;
    } catch (err) {
        console.log(err);
    }
}

export const getProductQRcodes = async (product_id, page = 0, from = 0, to = 0) => {
    try {
        const res = await axios.post(`${Backend_URL}qrcode/product`, { product_id, page, from, to });
        return res.data.data;
    } catch (err) {
        console.log(err);
        return [];
    }
}

export const uploadFile = async (body) => {
    try {
        const res = await axios.post(`${Backend_URL}upload/single`, body);
        return res.data.url;
    } catch (error) {
        console.log(error);
        return '';
    }
}

export const uploadFiles = async (body) => {
    try {
        const res = await axios.post(`${Backend_URL}upload/multiple`, body);
        
        return res.data.files;
    } catch (error) {
        console.log(error);
        return '';
    }
}


export const CalculateRemainPeriod = (start, data) => {
    const {period, unit} = data;
    // console.log(start, period, unit);

    let startDate = start ? new Date(start.replaceAll('.', '-')) : new Date();
    // console.log(startDate);

    let newDate = new Date(startDate);

    if (unit == 0) {
        newDate.setDate(startDate.getDate() + period * 7);
    } else if (unit == 1) {
        newDate.setMonth(startDate.getMonth() + period);
    }

    let cDate = new Date();

    // console.log(newDate, cDate);
    let duaration = Math.floor((newDate.getTime() - cDate.getTime()) / (24 * 60 * 60 * 1000));
    // console.log(duaration);

    let res = '';
    if (duaration >= 7) {
        res += Math.floor(duaration / 7) + ' Weeks';
    }
    if (duaration >= 7 && duaration % 7 > 0) {
        res += ', ';
    }
    if (duaration % 7 > 0){
        res += (duaration % 7) + ' Days';
    }

    if (duaration < 0) {
        res = 'Expired';
    }

    return {duaration, string: res};

}