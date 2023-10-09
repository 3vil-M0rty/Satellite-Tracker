const noradForm = document.querySelector('.search-bar:nth-child(1)');
const cosparForm = document.querySelector('.search-bar:nth-child(2)');
const nameForm = document.querySelector('.search-bar:nth-child(3)');

var url = "";

async function scrapeTable(url) {
    try {
        const response = await fetch(url);
        const html = await response.text();
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, 'text/html');
        const table = doc.getElementById("tableID");

        if (table) {
            const tbody = table.querySelector('tbody');

            if (tbody) {
                const rows = Array.from(tbody.querySelectorAll('tr'));
                const data = rows.map((row) => {
                    const columns = Array.from(row.querySelectorAll('td:not(:last-child)'));
                    return columns.map((column) => column.textContent.trim());
                });
                if (data.length > 0 && rows[0].querySelector('th')) {
                    data.shift();
                }
                return data;
            }
        }
    } catch (error) {
        console.error('An error occurred:', error);
    }
    return [];
}

function showLoadingOverlay() {
    const loadingOverlay = document.getElementById('loading-overlay');
    loadingOverlay.style.display = 'block';
};

function saveCaptionToLocalStorage(queryType, query) {
    const caption = `Results for ${queryType}: ${query}`;
    localStorage.setItem('tableCaption', caption);
}

noradForm.addEventListener('submit', async function (event) {
    event.preventDefault();
    const noradId = noradForm.querySelector('input').value;
    url = `https://celestrak.org/satcat/table-satcat.php?CATNR=${noradId}&MAX=10000`;
    const query = document.getElementById('satNorad').value;
    showLoadingOverlay();
    const data = await scrapeTable(url);
    saveCaptionToLocalStorage('Norad ID', query);
    localStorage.setItem('scrapedData', JSON.stringify(data));
    window.location.href = `results.html?NORADID=${encodeURIComponent(query)}`;
});

cosparForm.addEventListener('submit', async function (event) {
    event.preventDefault();
    const cosparId = cosparForm.querySelector('input').value;
    url = `https://celestrak.org/satcat/table-satcat.php?INTDES=${cosparId}&MAX=10000`;
    const query = document.getElementById('satCospar').value;
    showLoadingOverlay();
    const data = await scrapeTable(url);
    saveCaptionToLocalStorage('Cospar ID', query);
    localStorage.setItem('scrapedData', JSON.stringify(data));
    window.location.href = `results.html?COSPARID=${encodeURIComponent(query)}`;
});

nameForm.addEventListener('submit', async function (event) {
    event.preventDefault();
    const name = nameForm.querySelector('input').value;
    url = `https://celestrak.org/satcat/table-satcat.php?NAME=${encodeURIComponent(name)}&MAX=10000`;
    const query = document.getElementById('satName').value;
    showLoadingOverlay();
    const data = await scrapeTable(url);
    saveCaptionToLocalStorage('Name', query);
    localStorage.setItem('scrapedData', JSON.stringify(data));
    window.location.href = `results.html?NAME=${encodeURIComponent(query)}`;
});


