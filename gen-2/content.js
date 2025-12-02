const HEADER_TEMPLATE = `
            <div class="gfs-header">
                <div class="gfs-title">Alya itu my istri woi 🤬</div>
                <div class="gfs-close">×</div>
            </div>

            <div class="gfs-body">
                <div class="gfs-question">Awas aja kalo di ambil jing</div>
            </div>`

// ========= Drag to move =========
let isDown = false, offsetX = 0, offsetY = 0;
let cacheX = 0, cacheY = 0;

chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
    switch (msg.action) {
        case "open-menu":
            openMenu()
            sendResponse({ action: "close-popup" })
            break;
        default:
            showIOSAlert("Invalid", "Gak valid woi, masukan data yang bener!")
            break;
    }
});

function disableScroll() {
    document.body.style.overflow = "hidden";
    // document.documentElement.style.overflow = "hidden";
}

function enableScroll() {
    document.body.style.overflow = "";
    // document.documentElement.style.overflow = "";
}

function moveOverlay(ui, isReset = false) {
    if (cacheX || cacheY) {
        ui.style.left = cacheX + "px";
        ui.style.top = cacheY + "px";
        ui.style.right = "auto";
        ui.style.bottom = "auto";
    }

    function closeOverlay() {
        ui.remove();
        document.documentElement.classList.remove("cupertino-no-select");
    }

    // Helper untuk ambil posisi (mouse / touch)
    function getClientPos(e) {
        if (e.touches && e.touches.length > 0) {
            return { x: e.touches[0].clientX, y: e.touches[0].clientY };
        }
        return { x: e.clientX, y: e.clientY };
    }

    // Start drag (mouse + touch)
    function startDrag(e) {
        const pos = getClientPos(e);

        if (e.target.classList.contains("gfs-btn")) return;

        isDown = true;
        disableScroll();

        offsetX = pos.x - ui.offsetLeft;
        offsetY = pos.y - ui.offsetTop;
        ui.querySelector(".gfs-header").style.cursor = "grabbing";
    }

    // Move drag (mouse + touch)
    function moveDrag(e) {
        if (!isDown) return;

        e.preventDefault();

        const pos = getClientPos(e);

        ui.style.left = (pos.x - offsetX) + "px";
        ui.style.top = (pos.y - offsetY) + "px";
        ui.style.right = "auto";
        ui.style.bottom = "auto";

        cacheX = (pos.x - offsetX);
        cacheY = (pos.y - offsetY);
    }

    // End drag
    function endDrag() {
        isDown = false;
        enableScroll();
        ui.querySelector(".gfs-header").style.cursor = "grab";
    }

    if (isReset) {
        // Mouse events
        ui.querySelector(".gfs-header").removeEventListener("mousedown", startDrag);
        document.removeEventListener("mousemove", moveDrag);
        document.removeEventListener("mouseup", endDrag);

        // Touch events
        ui.querySelector(".gfs-header").removeEventListener("touchstart", startDrag, { passive: false });
        document.removeEventListener("touchmove", moveDrag, { passive: false });
        document.removeEventListener("touchend", endDrag);

        ui.querySelector(".gfs-close").removeEventListener("click", closeOverlay);
    }

    // Mouse events
    ui.querySelector(".gfs-header").addEventListener("mousedown", startDrag);
    document.addEventListener("mousemove", moveDrag);
    document.addEventListener("mouseup", endDrag);

    // Touch events
    ui.querySelector(".gfs-header").addEventListener("touchstart", startDrag, { passive: false });
    document.addEventListener("touchmove", moveDrag, { passive: false });
    document.addEventListener("touchend", endDrag);

    // ========= Close Button =========
    ui.querySelector(".gfs-close").addEventListener("click", closeOverlay);
}

function showIOSAlert(title, message) {
    // Hapus modal lama jika masih ada
    const old = document.getElementById("ios-alert-modal");
    if (old) old.remove();

    document.documentElement.classList.add("cupertino-no-select");

    // Wrapper overlay
    const overlay = document.createElement("div");
    overlay.id = "ios-alert-modal";
    overlay.innerHTML = `
        <div class="ios-alert-overlay"></div>
        <div class="ios-alert-box">
            <div class="ios-alert-title">${title}</div>
            <div class="ios-alert-message">${message}</div>
            <div class="ios-alert-actions">
                <button class="ios-alert-ok">OK</button>
            </div>
        </div>
    `;
    document.body.appendChild(overlay);

    // Add animation class
    requestAnimationFrame(() => {
        overlay.classList.add("visible");
    });

    // Close on OK click
    overlay.querySelector(".ios-alert-ok").addEventListener("click", () => {
        overlay.classList.remove("visible");
        setTimeout(() => overlay.remove(), 200);
        document.documentElement.classList.remove("cupertino-no-select");
    });

    // Optional: close if click outside box
    overlay.querySelector(".ios-alert-overlay").addEventListener("click", () => {
        overlay.classList.remove("visible");
        setTimeout(() => overlay.remove(), 200);
        document.documentElement.classList.remove("cupertino-no-select");
    });
}

// ================= STYLES =================
const styleAlert = document.createElement("style");
styleAlert.textContent = `
#ios-alert-modal {
    position: fixed;
    inset: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 999999999;
    opacity: 0;
    transition: opacity .2s ease;
    pointer-events: none;
}

#ios-alert-modal.visible {
    opacity: 1;
    pointer-events: auto;
}

.ios-alert-overlay {
    position: absolute;
    inset: 0;
    backdrop-filter: blur(10px);
    background: rgba(0,0,0,0.25);
}

.ios-alert-box {
    width: 280px;
    background: rgba(255,255,255, 0.9);
    border-radius: 20px;
    padding: 18px;
    text-align: center;
    font-family: -apple-system, BlinkMacSystemFont, "SF Pro Text", sans-serif;
    box-shadow: 0 10px 25px rgba(0,0,0,0.15);
    position: relative;
    z-index: 2;
    transform: scale(.8);
    transition: transform .2s ease;
}

#ios-alert-modal.visible .ios-alert-box {
    transform: scale(1);
}

.ios-alert-title {
    font-size: 17px;
    font-weight: 600;
    margin-bottom: 6px;
    color: #000;
}

.ios-alert-message {
    font-size: 14px;
    opacity: 0.8;
    margin-bottom: 18px;
    color: #333;
}

.ios-alert-actions {
    display: flex;
    justify-content: center;
}

.ios-alert-ok {
    background: #FFFFFF;
    border: none;
    padding: 8px 20px;
    font-size: 16px;
    color: #007AFF; /* iOS Blue */
    font-weight: 600;
    border-radius: 12px;
    cursor: pointer;
    transition: background 0.2s;
}

.ios-alert-ok:hover {
    background: rgba(0,0,0,0.05);
}
`;

const style = document.createElement("style");
style.textContent = `
    .cupertino-no-select {
        user-select: none !important;
    }

    #gfs-floating-ui {
        position: fixed;
        bottom: 20px;
        right: 20px;
        width: 260px;
        padding: 14px;
        border-radius: 18px;
        backdrop-filter: blur(14px);
        background: rgba(255, 255, 255, 0.45);
        border: 1px solid rgba(255, 255, 255, 0.3);
        box-shadow: 0 8px 22px rgba(0,0,0,0.15);
        font-family: -apple-system, BlinkMacSystemFont, "SF Pro Text", sans-serif;
        color: #111;
        z-index: 999999;
    }
        
    .gfs-header {
        display: flex;
        justify-content: space-between;
        cursor: grab;
        align-items: center;
        margin-bottom: 1px;
    }

    .gfs-title {
        font-size: 15px;
        font-weight: 600;
    }

    .gfs-close {
        font-size: 20px;
        cursor: pointer;
        padding: 2px 8px;
        border-radius: 8px;
        transition: 0.2s;
    }

    .gfs-close:hover {
        background: rgba(255, 255, 255, 0.3);
    }

    .gfs-body {
        margin-bottom: 10px;
    }

    .gfs-question {
        font-size: 14px;
        margin-bottom: 8px;
        font-weight: 500;
        opacity: 0.7;
    }

    .gfs-answer {
        font-size: 13px;
        color: #0A7AFF; /* iOS blue */
        font-weight: 600;
    }

    .gfs-actions {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 6px;
    }

    .gfs-btn {
        padding: 7px 0;
        border-radius: 12px;
        border: none;
        font-size: 14px;
        background: rgba(255, 255, 255, 0.6);
        border: 1px solid rgba(200, 200, 200, 0.5);
        transition: 0.2s;
        cursor: pointer;
    }

    .gfs-btn:hover {
        background: rgba(255, 255, 255, 0.8);
    }

    .animate-spin {
        animation: spin-animate infinite linear 5s;
    }

    @keyframes spin-animate {
        from {
            transform: rotate(0deg);
        }
        to {
            transform: rotate(360deg);
        }
    }
`;
const styleFont = document.createElement("link")
styleFont.rel = "stylesheet"
styleFont.href = "https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css"

document.head.appendChild(styleAlert);
document.head.appendChild(style);
document.head.appendChild(styleFont);

function openMenu() {
    if (document.getElementById("gfs-floating-ui")) {
        const ui = document.getElementById("gfs-floating-ui");
        ui.remove();
        document.documentElement.classList.remove("cupertino-no-select");
    }

    // Cek agar tidak duplikat jika extension reload
    if (!document.getElementById("gfs-floating-ui")) {

        const ui = document.createElement("div");
        ui.id = "gfs-floating-ui";

        const formData = extractFormData()
        if (formData.questions.length == 0) {
            showIOSAlert("Gagal wok", "Mana inimah bukan halaman google forms jir")
            return
        }

        let buttonQuestion = "";
        for (let soalData of formData.questions) {
            buttonQuestion += `<button class="gfs-btn btn-answer" data-btn-id="${soalData.number}">${soalData.number}</button>`
        }

        ui.innerHTML = `
            ${HEADER_TEMPLATE}

            <div class="gfs-answer" style="color: black; margin-bottom: 10px;">Pilih, soal mana yang mau gw jawab</div>

            <div class="gfs-actions">
                ${buttonQuestion}
            </div>
        `;

        document.body.appendChild(ui);
        document.documentElement.classList.add("cupertino-no-select");

        const allBtnAnswer = document.querySelectorAll(".btn-answer")
        for (let btnAnswer of allBtnAnswer) {
            btnAnswer.addEventListener("click", async (e) => {
                const btnID = e.currentTarget.dataset.btnId
                const currentData = formData.questions.filter(item => item.number == btnID)[0];

                buttonQuestion = "";
                for (let soalData of formData.questions) {
                    if (btnID == soalData.number) {
                        buttonQuestion += `<button disabled class="gfs-btn btn-answer" data-btn-id="${soalData.number}"><i class="fa-solid fa-spinner animate-spin"></i></button>`
                    } else {
                        buttonQuestion += `<button disabled class="gfs-btn btn-answer" data-btn-id="${soalData.number}">${soalData.number}</button>`
                    }
                }

                ui.innerHTML = `
                    ${HEADER_TEMPLATE}

                    <div class="gfs-answer" style="color: black; margin-bottom: 10px;">Tunggu sebentar...</div>

                    <div class="gfs-actions">
                        ${buttonQuestion}
                    </div>
                `;

                moveOverlay(ui, true)

                let response = undefined;
                while (response == undefined) {
                    response = await getAnswerAIAgent(currentData)
                }
                console.log(response)

                ui.innerHTML = `
                    ${HEADER_TEMPLATE}

                    <div class="gfs-question" style="margin-bottom: 8px; opacity: 0.9; margin-top: 8px;">${currentData.question}</div>
                    <div class="gfs-answer" style="color: black; margin-bottom: 5px;">Jawaban dariku:</div>
                    
                    <div class="gfs-body">
                        <div class="gfs-answer" style="margin-bottom: 5px;">${response.answer_point.split("|") && response.answer_point.split("|").length != 0 ? response.answer_point.split("|").join("</br>").trim() : response.answer_point.trim()}</div>
                        <div class="gfs-question" style="opacity: 0.6; font-size: 10px;">${response.reason.trim()}</div>
                    </div>
                    
                    <div style="margin-top: 10px;">
                        <button class="gfs-btn btn-answer" id="btn-back" style="padding-left: 10px; padding-right: 10px;"><i class="fa-solid fa-backward"></i> Jawab pertanyaan lain</button>
                    </div>
                `;

                document.getElementById("btn-back").addEventListener("click", () => {
                    openMenu()
                }, { once: true });

                moveOverlay(ui, true)
            })
        }

        moveOverlay(ui, false)
    }

}

function extractFormData() {
    const formData = {
        title: '',
        description: '',
        questions: []
    };

    // Ekstrak judul dan deskripsi form
    const titleElement = document.querySelector('.F9yp7e.ikZYwf.LgNcQe');
    const descElement = document.querySelector('.cBGGJ.OIC90c');

    formData.title = titleElement ? titleElement.textContent.trim() : 'Tanpa Judul';
    formData.description = descElement ? descElement.textContent.trim() : '';

    // Ekstrak semua pertanyaan
    const questionBlocks = document.querySelectorAll('[jsmodel="CP1oW"]');

    questionBlocks.forEach((block, index) => {
        const question = {
            number: index + 1,
            question: '',
            type: '',
            required: false,
            options: [],
            hasImage: false,
            imageUrl: ''
        };

        // Ekstrak teks pertanyaan
        const questionText = block.querySelector('.M7eMe');
        if (questionText) {
            question.question = questionText.textContent.trim();
        }

        // Cek apakah pertanyaan wajib diisi
        const requiredIndicator = block.querySelector('.vnumgf');
        question.required = requiredIndicator !== null;

        // Cek apakah ada gambar
        const imageElement = block.querySelector('.HxhGpf');
        if (imageElement) {
            question.hasImage = true;
            question.imageUrl = imageElement.src || '';
        }

        // Deteksi tipe pertanyaan dan ekstrak opsi jawaban
        // Radio button (pilihan ganda)
        const radioOptions = block.querySelectorAll('[role="radio"]');
        if (radioOptions.length > 0) {
            question.type = 'multiple_choice';
            radioOptions.forEach(radio => {
                const label = radio.getAttribute('aria-label');
                const value = radio.getAttribute('data-value');

                // Cari gambar dalam opsi (jika ada)
                const optionContainer = radio.closest('.docssharedWizToggleLabeledContainer');
                const optionImage = optionContainer ? optionContainer.querySelector('.QU5LQc') : null;

                const optionData = {
                    text: label || value,
                    hasImage: false,
                    imageUrl: ''
                };

                if (optionImage) {
                    optionData.hasImage = true;
                    optionData.imageUrl = optionImage.src || '';
                }

                question.options.push(optionData);
            });
        }

        // Checkbox (pilihan ganda dengan multiple selection)
        const checkboxOptions = block.querySelectorAll('[role="checkbox"]');
        if (checkboxOptions.length > 0) {
            question.type = 'checkbox';
            checkboxOptions.forEach(checkbox => {
                const label = checkbox.getAttribute('aria-label');
                const value = checkbox.getAttribute('data-answer-value');

                // Cari gambar dalam opsi (jika ada)
                const optionContainer = checkbox.closest('.docssharedWizToggleLabeledContainer');
                const optionImage = optionContainer ? optionContainer.querySelector('.QU5LQc') : null;

                const optionData = {
                    text: label || value,
                    hasImage: false,
                    imageUrl: ''
                };

                if (optionImage) {
                    optionData.hasImage = true;
                    optionData.imageUrl = optionImage.src || '';
                }

                question.options.push(optionData);
            });
        }

        // Text input (jawaban singkat)
        const textInput = block.querySelector('input[type="text"]');
        if (textInput && question.type === '') {
            question.type = 'short_answer';
        }

        // Textarea (paragraf)
        const textArea = block.querySelector('textarea');
        if (textArea && question.type === '') {
            question.type = 'paragraph';
        }

        formData.questions.push(question);
    });

    return formData;
}

async function getAnswerAIAgent(data) {
    return new Promise(async resolve => {
        chrome.runtime.sendMessage({
            type: "fetch-ootaizumi",
            data: data
        }, response => {
            resolve(response)
        });
    })
}