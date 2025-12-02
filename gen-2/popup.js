document.getElementById("close-popup").addEventListener("click", () => {
    chrome.action.setPopup({ popup: "" });
    window.close();
});

document.getElementById("open-menu").addEventListener("click", async () => {
    const [tab] = await chrome.tabs.query({
        active: true,
        currentWindow: true
    });

    chrome.tabs.sendMessage(tab.id, { action: "open-menu" }, async (response) => {
        if (chrome.runtime.lastError) {
            console.error("Error:", chrome.runtime.lastError.message);
            showIOSAlert("Kegagalan!", "Gagal mengambil data, coba reload ulang halaman")
        } else {
            if (response.action == "close-popup") {
                chrome.action.setPopup({ popup: "" });
                window.close();
            }
        }
    });
});

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