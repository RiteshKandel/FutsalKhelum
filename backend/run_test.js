import { execSync } from 'child_process';
try {
    const out = execSync('node --test tests/booking.test.js', { encoding: 'utf-8' });
    console.log("SUCCESS:", out);
} catch (e) {
    console.log("ERROR OUTPUT:", e.stdout);
    console.log("ERROR STDERR:", e.stderr);
}
