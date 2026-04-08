const test = async () => {
    try {
        const loginRes = await fetch('http://localhost:5000/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: 'player@example.com', password: 'password123' })
        });
        const loginData = await loginRes.json();
        
        const res = await fetch('http://localhost:5000/api/bookings', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${loginData.token}`
            },
            body: JSON.stringify({
                futsalId: '69d51587a208bb61d5ff40cb',
                date: '2026-04-08',
                startTime: '16:00',
                endTime: '17:00'
            })
        });
        const data = await res.json();
        console.log(JSON.stringify(data, null, 2));
    } catch (e) {
        console.error(e);
    }
};
test();
