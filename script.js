    const searchInput = document.getElementById('searchInput');
    const searchButton = document.getElementById('searchButton');
    const voiceSearchButton = document.getElementById('voiceSearchButton');
    const resultsTableBody = document.getElementById('resultsTableBody');
    const errorMessageDiv = document.getElementById('errorMessage');
    let productData = [];

    // Check for Web Speech API compatibility
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const SpeechGrammarList = window.SpeechGrammarList || window.webkitSpeechGrammarList;
    const SpeechRecognitionEvent = window.SpeechRecognitionEvent || window.webkitSpeechRecognitionEvent;

    if (!SpeechRecognition) {
        voiceSearchButton.style.display = 'none'; // Hide button if not supported
        console.warn('Web Speech API is not supported in this browser.');
    }

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

    // Voice search functionality
    if (SpeechRecognition) {
        const recognition = new SpeechRecognition();
        recognition.continuous = false; // Only capture a single phrase
        recognition.lang = 'ko-KR'; // Set language to Korean
        recognition.interimResults = false; // Only return final results
        recognition.maxAlternatives = 1; // Only return the most likely result

        voiceSearchButton.addEventListener('click', () => {
            errorMessageDiv.style.display = 'none';
            searchInput.value = ''; // Clear previous input
            voiceSearchButton.disabled = true;
            // Ensure recognition is stopped before starting a new one
            recognition.stop();
            recognition.start();
        });

        recognition.onresult = (event) => {
            const speechResult = event.results[0][0].transcript;
            // Remove spaces and hyphens from alphanumeric sequences for product codes/names
            const processedSpeechResult = speechResult.replace(/[-\s]/g, '');
            searchInput.value = processedSpeechResult;
            console.log('음성 인식 결과:', speechResult, '-> 처리된 결과:', processedSpeechResult);
            searchProducts(); // Trigger search after voice input
        };

        recognition.onspeechend = () => {
            voiceSearchButton.disabled = false;
            voiceSearchButton.innerHTML = '<i class="fas fa-microphone"></i>'; // Restore icon
            recognition.stop();
        };

        recognition.onerror = (event) => {
            voiceSearchButton.disabled = false;
            voiceSearchButton.innerHTML = '<i class="fas fa-microphone"></i>'; // Restore icon
            errorMessageDiv.textContent = `음성 인식 오류: ${event.error}`;
            errorMessageDiv.style.display = 'block';
            console.error('Speech recognition error:', event.error);
            recognition.stop(); // Explicitly stop on error
        };
    }

    searchButton.addEventListener('click', searchProducts);
    searchInput.addEventListener('keyup', (event) => {
        if (event.key === 'Enter') {
            searchProducts();
        }
    });

    loadProductData();