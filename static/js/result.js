function hideLoadingOverlay() {
    const loadingOverlay = document.getElementById('loading-overlay');
    loadingOverlay.style.display = 'none';
}
document.addEventListener('DOMContentLoaded', function () {
    const scrapedData = JSON.parse(localStorage.getItem('scrapedData'));
    const table = document.getElementById('tableID');
    const body = document.querySelector('body');
    const tbody = table.querySelector('tbody');
    const thead = table.querySelector('thead');
    const phonescroll = document.getElementById('phonescroll');
    const info = document.getElementById('info');
    const nothing = document.getElementById('noth');
    if (scrapedData.length == 0) {
        tbody.style.display = 'none';
        body.style.overflow = 'hidden';
        thead.style.display = 'none';
        phonescroll.style.display = 'none';
        info.style.display = 'none';
        nothing.style.display = 'block';
    };
    const tableCaption = document.getElementById('tableCaption');
    const caption = localStorage.getItem('tableCaption');
    if (caption) {
        tableCaption.textContent = caption;
    }
    const perPage = 7;
    let currentPage = 1;
    const totalRows = Math.ceil(scrapedData.length);
    const pagination = document.querySelector('.pagination');
    if (totalRows <= 7) {
        pagination.style.display = 'none';
    }
    else {
        pagination.style.display = 'flex';
    }

    const pageNumbersContainer = document.getElementById('pageNumbers');


    function displayPage(page) {
        const startIndex = (page - 1) * perPage;
        const endIndex = startIndex + perPage;
        const pageData = scrapedData.slice(startIndex, endIndex);

        tbody.innerHTML = '';

        pageData.forEach((rowData) => {
            const row = document.createElement('tr');
            rowData.forEach((cellData) => {
                const cell = document.createElement('td');
                cell.textContent = cellData;
                row.appendChild(cell);
            });
            const cell = document.createElement('td');
            cell.innerHTML = `<button class='track'>track</button>`;
            row.appendChild(cell);
            tbody.appendChild(row);
        });
        updatePageNumbers();
        const buttons = document.querySelectorAll('.track');
        buttons.forEach(button => {
            button.addEventListener('click', function () {
                const row = this.closest('tr');

                const secondCellText = row.cells[1].textContent;
                const nameCell = row.cells[2].textContent;
                const cosparID = row.cells[0].textContent;
                localStorage.setItem('secondCellText', secondCellText);
                localStorage.setItem('nameCell', nameCell);
                localStorage.setItem('cosparID', cosparID);
                window.location.href = `tracking.html?tracking-Satellite=${nameCell}`;
            });
        });
    }

    function updatePageNumbers() {
        const totalPages = Math.ceil(totalRows / perPage);
        pageNumbersContainer.innerHTML = '';

        let maxDisplayedPages;

        if (window.innerWidth <= 768) {
            maxDisplayedPages = 3;
        } else {
            maxDisplayedPages = 10;
        }

        let startPage, endPage;
        window.addEventListener('resize', updatePageNumbers);

        if (window.innerWidth <= 768) {
            if (currentPage > 1 && currentPage < totalPages) {
                startPage = currentPage;
                endPage = currentPage;
            } else {
                startPage = 1
                endPage = 1
            }
        } else {
            if (totalPages <= maxDisplayedPages) {
                startPage = 1;
                endPage = totalPages;
            } else if (currentPage <= maxDisplayedPages - 1) {
                startPage = 1;
                endPage = maxDisplayedPages;
            } else if (currentPage == totalPages) {
                startPage = currentPage - 10
                endPage = currentPage
            } else if (currentPage >= totalPages - 10) {
                startPage = totalPages - 10
                endPage = totalPages
            }
            else if (currentPage % 10 == 0) {
                startPage = currentPage;
                endPage = currentPage + 10;
            }
            else {
                startPage = currentPage - currentPage % 10;
                endPage = currentPage - currentPage % 10 + 10;
            }
        }

        let activeButton;

        for (let i = startPage; i <= endPage; i++) {
            const pageNumberButton = document.createElement('button');
            pageNumberButton.textContent = i;

            if (i === currentPage) {
                pageNumberButton.classList.add('active-page');
                pageNumberButton.style.backgroundColor = '#82C3EC';
                pageNumberButton.style.color = '#1a272f';
                pageNumberButton.style.border = '1px solid #344e5e';
                pageNumberButton.style.fontWeight = 'bold';
                pageNumberButton.style.height = '30px';
                activeButton = pageNumberButton;
            }

            pageNumberButton.addEventListener('click', function () {
                currentPage = i;
                displayPage(currentPage);

                if (activeButton) {
                    activeButton.classList.remove('active-page');
                }

                pageNumberButton.classList.add('active-page');
                activeButton = pageNumberButton;
            });

            pageNumbersContainer.appendChild(pageNumberButton);
        }

        if (startPage > 1) {
            const ellipsisLeft = document.createElement('span');
            const firstPageNumberButton = document.createElement('button');
            firstPageNumberButton.textContent = 1;
            ellipsisLeft.textContent = '...';
            pageNumbersContainer.insertBefore(ellipsisLeft, pageNumbersContainer.firstChild);
            pageNumbersContainer.insertBefore(firstPageNumberButton, ellipsisLeft);
            firstPageNumberButton.addEventListener('click', function () {
                currentPage = 1;
                displayPage(currentPage);

                if (activeButton) {
                    activeButton.classList.remove('active-page');
                }

                firstPageNumberButton.classList.add('active-page');
                activeButton = firstPageNumberButton;
            });
        }

        if (endPage < totalPages) {
            const ellipsisRight = document.createElement('span');
            const lastPageNumberButton = document.createElement('button');
            lastPageNumberButton.textContent = totalPages;
            ellipsisRight.textContent = '...';
            pageNumbersContainer.appendChild(ellipsisRight);
            pageNumbersContainer.appendChild(lastPageNumberButton);
            lastPageNumberButton.addEventListener('click', function () {
                currentPage = totalPages;
                displayPage(currentPage);

                if (activeButton) {
                    activeButton.classList.remove('active-page');
                }

                lastPageNumberButton.classList.add('active-page');
                activeButton = lastPageNumberButton;
            });
        }
    }

    window.addEventListener('resize', updatePageNumbers);

    displayPage(currentPage);

    document.getElementById('prevPage').addEventListener('click', function () {
        if (currentPage > 1) {
            currentPage--;
            displayPage(currentPage);
        }
    });

    document.getElementById('nextPage').addEventListener('click', function () {
        const totalPages = Math.ceil(scrapedData.length / perPage);
        if (currentPage < totalPages) {
            currentPage++;
            displayPage(currentPage);
        }
    });
    hideLoadingOverlay();
    const expand = document.getElementById('expand');
    const expand2 = document.getElementById('expand2');
    const parag = document.getElementById('full-text');
    const parag2 = document.getElementById('full-text2');
    const cont = document.getElementById('continue');
    const cont2 = document.getElementById('continue2');
    const imgex = document.getElementById('expand-img');
    const imgex2 = document.getElementById('expand-img2')

    expand.addEventListener('click', function () {
        if (parag.style.display === 'none') {
            parag.style.display = 'block';
            cont.style.display = 'none';
            expand.title = 'collapse';
            imgex.src = 'static/logo/collapse.svg';
        } else {
            parag.style.display = 'none';
            cont.style.display = 'initial';
            expand.title = 'expand';
            imgex.src = 'static/logo/expand.svg';
        }
    });
    expand2.addEventListener('click', function () {
        if (parag2.style.display === 'none') {
            parag2.style.display = 'block';
            cont2.style.display = 'none';
            expand2.title = 'collapse';
            imgex2.src = 'static/logo/collapse.svg';
        } else {
            parag2.style.display = 'none';
            cont2.style.display = 'initial';
            expand2.title = 'expand';
            imgex2.src = 'static/logo/expand.svg';

        }
    });

});


const tableLinks = document.querySelectorAll("th a");
tableLinks.forEach((link) => {
    link.addEventListener("click", function (e) {
        e.preventDefault();


        const targetId = this.getAttribute("href").substring(1);
        const targetElement = document.getElementById(targetId);

        if (targetElement) {
            window.scrollTo({
                top: targetElement.offsetTop,
                behavior: "smooth"
            });
        }
    });
});

const paragLinks = document.querySelectorAll("h2 a");
paragLinks.forEach((link) => {
    link.addEventListener("click", function (e) {
        e.preventDefault();


        const targetId = this.getAttribute("href").substring(1);
        const targetElement = document.getElementById(targetId);

        if (targetElement) {
            window.scrollTo({
                top: targetElement.offsetTop,
                behavior: "smooth"
            });
        }
    });
});


const url = 'https://celestrak.org/satcat/sources.php';
let descriptions = {};

fetch(url)
    .then((response) => response.text())
    .then((html) => {
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, 'text/html');

        const table = doc.querySelector('table');

        if (table) {
            const rows = table.querySelectorAll('tbody tr');
            rows.forEach((row) => {
                const columns = row.querySelectorAll('td');

                if (columns.length === 2) {
                    const text1 = columns[0].textContent.trim();
                    const text2 = columns[1].textContent.trim();
                    if (text1) {
                        const select = document.getElementById('sourceCodeSelect');
                        const option = document.createElement('option');
                        option.value = text1;
                        option.text = text1;
                        select.appendChild(option);
                    }
                    descriptions[text1] = text2;
                }
            });
        } else {
            console.log('Table not found on the page.');
        }
    })
    .catch((error) => console.error('Error:', error));


document.addEventListener("DOMContentLoaded", function () {
    const sourceCodeSelect = document.getElementById("sourceCodeSelect");
    const descriptionDisplay = document.querySelector("#descriptionDisplay p");

    sourceCodeSelect.addEventListener("change", function () {
        const selectedCode = sourceCodeSelect.value;

        if (descriptions[selectedCode]) {
            descriptionDisplay.textContent = descriptions[selectedCode];
        } else {
            descriptionDisplay.textContent = "No description available.";
        }
    });
});

const url2 = 'https://celestrak.org/satcat/launchsites.php';
let descriptions2 = {};

fetch(url2)
    .then((response) => response.text())
    .then((html) => {
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, 'text/html');

        const table = doc.querySelector('table');

        if (table) {
            const rows = table.querySelectorAll('tbody tr');
            rows.forEach((row) => {
                const columns = row.querySelectorAll('td');

                if (columns.length === 2) {
                    const text1 = columns[0].textContent.trim();
                    const text2 = columns[1].textContent.trim();
                    if (text1) {
                        const select = document.getElementById('ls-sourceCodeSelect');
                        const option = document.createElement('option');
                        option.value = text1;
                        option.text = text1;
                        select.appendChild(option);
                    }
                    descriptions2[text1] = text2;
                }
            });
        } else {
            console.log('Table not found on the page.');
        }
    })
    .catch((error) => console.error('Error:', error));


document.addEventListener("DOMContentLoaded", function () {
    const sourceCodeSelect = document.getElementById("ls-sourceCodeSelect");
    const descriptionDisplay = document.querySelector("#ls-descriptionDisplay p");

    sourceCodeSelect.addEventListener("change", function () {
        const selectedCode = sourceCodeSelect.value;

        if (descriptions2[selectedCode]) {
            descriptionDisplay.textContent = descriptions2[selectedCode];
        } else {
            descriptionDisplay.textContent = "No description available.";
        }
    });
});

const url3 = 'https://celestrak.org/satcat/status.php';
let descriptions3 = {};

fetch(url3)
    .then((response) => response.text())
    .then((html) => {
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, 'text/html');

        const table = doc.querySelector('table');

        if (table) {
            const rows = table.querySelectorAll('tbody tr');
            rows.forEach((row) => {
                const columns = row.querySelectorAll('td');

                if (columns.length === 2) {
                    const text1 = columns[0].textContent.trim();
                    const td2 = columns[1];
                    const text2 = td2.innerHTML
                    if (text1) {
                        const select = document.getElementById('ops-sourceCodeSelect');
                        const option = document.createElement('option');
                        option.value = text1;
                        option.text = text1;
                        select.appendChild(option);
                    }
                    descriptions3[text1] = text2;
                }
            });
        } else {
            console.log('Table not found on the page.');
        }
    })
    .catch((error) => console.error('Error:', error));


document.addEventListener("DOMContentLoaded", function () {
    const sourceCodeSelect = document.getElementById("ops-sourceCodeSelect");
    const descriptionDisplay = document.querySelector("#ops-descriptionDisplay p");

    sourceCodeSelect.addEventListener("change", function () {
        const selectedCode = sourceCodeSelect.value;

        if (descriptions3[selectedCode]) {
            descriptionDisplay.innerHTML = descriptions3[selectedCode];
        } else {
            descriptionDisplay.textContent = "No description available.";
        }
    });
});


