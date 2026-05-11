async function check() {
    try {
        const res = await fetch('http://localhost:5001/api/mutations/stats/75056');
        const data = await res.json();
        console.log('Stats pour Paris (75056) :', data);
    } catch (e) {
        console.error('Erreur :', e.message);
    }
}

check();
