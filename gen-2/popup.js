document.getElementById("close-popup").addEventListener("click", () => {
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
            // alert("Gagal mengambil data, coba reload ulang halaman")
        } else {
            if (response.action == "close-popup") {
                window.close();
            }
        }
    });
});