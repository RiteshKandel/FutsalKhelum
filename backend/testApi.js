import axios from 'axios';
import process from 'process';

const test = async () => {
    try {
        const res = await axios.get('http://localhost:5000/api/v1/bookings/slots?futsalId=69d51587a208bb61d5ff40cb&date=2026-04-08');
        console.log(JSON.stringify(res.data, null, 2));
    } catch (e) {
        console.error(e.response ? e.response.data : e.message);
    }
    process.exit(0);
};
test();
