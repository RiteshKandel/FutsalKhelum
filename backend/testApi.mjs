const test = async () => {
    try {
        const res = await fetch('http://localhost:5000/api/v1/bookings/slots?futsalId=69d51587a208bb61d5ff40cb&date=2026-04-08');
        const data = await res.json();
        console.log(JSON.stringify(data, null, 2));
    } catch (e) {
        console.error(e);
    }
};
test();
