const answer = document.getElementById("answer");
const container = document.getElementById("container");
const formContainer = document.getElementById("form-container");
const body = document.querySelector("body");

if (!window.localStorage.getItem("answer-cache")) {
    window.localStorage.setItem("answer-cache", "0")
}

let responseCache = null;

async function handleResponse(response) {
    let answerString = ""
    let answerType = ""
    let questionType = ""
    let int = 0;
    if (response && Array.isArray(response.questions) && response.questions.length) {
        for (let data of response.questions) {
            let jsonSerial = {
                answer_point: "",
                reason: ""
            };

            if (int >= parseInt(window.localStorage.getItem("answer-cache"))) {
                const gambarnya = data.imageUrl ? data.imageUrl : "";
                const responseModel = await fetchData("Anda adalah asisten yang sangat fokus dan dipaksa untuk menganalisis dan menjawab pertanyaan soal (ujian/tes) secara akurat.  **Wajibkan** model untuk selalu merespons dengan format JSON yang ketat. **Jangan pernah** merespons dengan teks atau format lain di luar struktur JSON ini. Respon harus selalu diawali dengan `{` dan diakhiri dengan `}`.  **Format Respon Wajib:**  ```json {   \"answer_point\": \"answer atau jawabannya (Contoh: Jawaban dari pilihan jawaban yang tersedia)\",   \"reason\": \"Penjelasan singkat dan jelas mengapa poin ini adalah jawaban yang benar (maksimal 3 kalimat).\" }  - JANGAN GUNAKAN MARKDOWN - HANYA RESPON JSON SAJA TANPA SELAIN FORMAT JSON INI  SOAL: \"" + data.question + "\" PILIHAN: \"" + data.options.map(item => item.text).join('\n') + "\"", "false", "false", gambarnya, "freeApikey");
                jsonSerial = JSON.parse(responseModel.data.result.message)
            } else {
                jsonSerial = JSON.parse(window.localStorage.getItem("answer-cache-" + int.toString()));
            }

            switch (data.type) {
                case "multiple_choice":
                    answerType = `<div class="option">
                                            <input checked disabled type="radio" required>
                                            <div style="display: flex; flex-direction: column; gap: 10px;">
                                            <label>${jsonSerial.answer_point}</label>
                                            <p style="font-size: 10px; opacity: 0.7;">${jsonSerial.reason}</p>
                                            </div>
                                            </div>`
                    if (data.options[0].hasImage) {
                        answerType = `<div class="option">
                                                <div class="image-flex">
                                                <div>
                                                    <input checked disabled type="radio" id="sangat_puas" required>
                                                    <div style="display: flex; flex-direction: column; gap: 10px;">
                                                    <label>${jsonSerial.answer_point}</label>
                                                    <p style="font-size: 10px; opacity: 0.7;">${jsonSerial.reason}</p>
                                                    </div>
                                                    </div>
                                                    <img class="image-question" src="${data.options[0].imageUrl}" alt="${crypto.randomUUID().toString()}">
                                                </div>
                                            </div>`
                    }
                    break;
                case "checkbox":
                    answerType = `<div class="option">
                            <input type="checkbox" checked disabled required>
                            <div style="display: flex; flex-direction: column; gap: 10px;">
                            <label>${jsonSerial.answer_point}</label>
                            <p style="font-size: 10px; opacity: 0.7;">${jsonSerial.reason}</p>
                            </div>
                        </div>`
                    break;
                default:
                    answerType = `<div class="option">
                                            <input checked disabled type="radio" id="sangat_puas" required>
                                            <label for="sangat_puas">Sangat Puas</label>
                                        </div>`
                    break;
            }
            if (data.hasImage) {
                questionType = `
                        <div class="image-flex">
                            <img class="image-question" src="${data.imageUrl}" alt="${crypto.randomUUID().toString()}">
                            <span>${data.question}</span>
                        </div>
                        `
            } else {
                questionType = data.question
            }

            answerString += `<div class="question-group">
                <div class="question">
                    <div class="question-title">
                        <span class="question-number">${data.number}</span>
                        ${questionType}
                    </div>
                    <p class="question-description">Type: ${data.type}</p>
                    <div class="answer-options">
                        ${answerType}
                    </div>
                </div>
            </div>`
            let delayTime = 1;
            console.log((int + 1) != response.questions.length)
            console.log(int + 1, response.questions.length)
            if (int >= parseInt(window.localStorage.getItem("answer-cache")) && (int + 1) != response.questions.length) {
                for (let i = 0; i < 5; i++) {
                    answer.innerHTML = answerString + `<span>Delay ${6 - delayTime}s</span>`
                    
                    await new Promise((resolve) => setTimeout(resolve, 1_000));
                    delayTime += 1;
                }
                
                window.localStorage.setItem("answer-cache", (int + 1).toString())
            }
            
            window.localStorage.setItem("answer-cache-" + int.toString(), JSON.stringify(jsonSerial))
            // {
            // "success": true,
            // "data": {
            //     "result": {
            //     "message": "{\n  \"answer_point\": \"C\",\n  \"reason\": \"Candi Borobudur adalah candi peninggalan Dinasti Syailendra yang terkenal dan berlokasi di Magelang, Jawa Tengah. Pilihan lain seperti Candi Prambanan berasal dari dinasti berbeda, sedangkan Candi Mendut dan Penataran letaknya bukan di Magelang.\"\n}",
            //     "thoughts": "",
            //     "search_queries": [],
            //     "search_results": [],
            //     "search_indexes": [],
            //     "message_id": 2,
            //     "parent_id": 1
            //     }
            // }
            // }

            answer.scrollTop = answer.scrollHeight;

            int += 1
        }
    } else {
        answer.innerHTML = `<h4 style="width: 100%; text-align: center; opacity: 0.7;">Mana google formsnya woi</h4>`
    }
}

async function fetchData(prompt, search_enabled, thinking_enabled, imageUrl, apikey) {
    const api = `https://anabot.my.id/api/ai/deepseek?prompt=${encodeURIComponent(prompt)}&search_enabled=${encodeURIComponent(search_enabled)}&thinking_enabled=${encodeURIComponent(thinking_enabled)}&imageUrl=${encodeURIComponent(imageUrl)}&apikey=${encodeURIComponent(apikey)}`;

    const options = {
        method: 'GET',
        headers: { 'Accept': 'application/json' }
    };

    try {
        const res = await fetch(api, options);
        const json = await res.json();
        return json;
    } catch (err) {
        console.error('error:' + err);
    }
}

document.getElementById("btn-ex").addEventListener("click", async () => {
    const [tab] = await chrome.tabs.query({
        active: true,
        currentWindow: true
    });

    chrome.tabs.sendMessage(tab.id, { action: "extract" }, async (response) => {
        if (chrome.runtime.lastError) {
            console.error("Error:", chrome.runtime.lastError.message);
            alert("Gagal mengambil data, coba reload ulang halaman")
        } else {
            responseCache = response;
            await handleResponse(response);
        }
    });
});

document.getElementById("btn-ex-cache").addEventListener("click", async () => {
    window.localStorage.setItem("answer-cache", "0")
    if (responseCache) handleResponse(responseCache);
});

const style = document.createElement('style');
style.textContent += `
                  @keyframes pulse {
                        0% { box-shadow: 0 0 0 0 rgba(255, 87, 34, 0.7); }
                        70% { box-shadow: 0 0 0 10px rgba(255, 87, 34, 0); }
                        100% { box-shadow: 0 0 0 0 rgba(255, 87, 34, 0); }
                  }
                  .image-option-wrapper input[type="radio"]:checked + .image-option {
                        transform: scale(1.0); /* Diubah agar transisi lebih mulus */
                  }
            `;
document.head.appendChild(style);