document.addEventListener('DOMContentLoaded', () => {
    const searchInput = document.getElementById('searchInput');
    const searchButton = document.getElementById('searchButton');
    const resultsTableBody = document.getElementById('resultsTableBody');
    const errorMessageDiv = document.getElementById('errorMessage');
    let productData = [];

    async function loadProductData() {
        errorMessageDiv.style.display = 'none';
        try {
            const response = await fetch('csvjson (9).json');
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            productData = await response.json();
            console.log('제품 데이터 로드 완료.', productData.length, '개 항목');
            resultsTableBody.innerHTML = `<tr><td colspan="8" class="text-center">검색어를 입력하고 검색 버튼을 누르세요.</td></tr>`;
        } catch (error) {
            console.error('제품 데이터를 불러오는 중 오류 발생:', error);
            errorMessageDiv.textContent = '데이터를 불러오는 데 실패했습니다. (Failed to fetch)';
            errorMessageDiv.style.display = 'block';
        }
    }

    function searchProducts() {
        const searchTerm = searchInput.value.trim().toLowerCase();
        resultsTableBody.innerHTML = '';
        errorMessageDiv.style.display = 'none';

        if (!searchTerm) {
            errorMessageDiv.textContent = '검색어를 입력해주세요.';
            errorMessageDiv.style.display = 'block';
            return;
        }

        const filteredResults = productData.filter(item => {
            const itemCode = item['품목코드'] ? String(item['품목코드']).toLowerCase() : '';
            const itemName = item['품목명'] ? String(item['품목명']).toLowerCase() : '';
            return itemCode.includes(searchTerm) || itemName.includes(searchTerm);
        });

        if (filteredResults.length > 0) {
            filteredResults.forEach(item => {
                const row = resultsTableBody.insertRow();
                row.innerHTML = `
                    <td data-label="품목코드">${item['품목코드'] || 'N/A'}</td>
                    <td data-label="품목명">${item['품목명'] || 'N/A'}</td>
                    <td data-label="가격">${item['가격'] || 'N/A'}</td>
                    <td data-label="5%">${item['5%'] || 'N/A'}</td>
                    <td data-label="7%">${item['7%'] || 'N/A'}</td>
                    <td data-label="10%">${item['10%'] || 'N/A'}</td>
                    <td data-label="13%">${item['13%'] || 'N/A'}</td>
                    <td data-label="15%">${item['15%'] || 'N/A'}</td>
                `;
            });
        } else {
            errorMessageDiv.textContent = '해당 검색어와 일치하는 제품을 찾을 수 없습니다.';
            errorMessageDiv.style.display = 'block';
        }
    }

    searchButton.addEventListener('click', searchProducts);
    searchInput.addEventListener('keyup', (event) => {
        if (event.key === 'Enter') {
            searchProducts();
        }
    });

    loadProductData();
});