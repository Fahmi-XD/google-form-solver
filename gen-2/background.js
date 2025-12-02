chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
    if (msg.type === "fetch") {

        const data = msg.data;
        const gambarnya = data.imageUrl ? data.imageUrl : "";

        async function fetchData(prompt, search_enabled, thinking_enabled, imageUrl, apikey) {
            const api = `https://anabot.my.id/api/ai/deepseek?prompt=${encodeURIComponent(prompt)}&search_enabled=${encodeURIComponent(search_enabled)}&thinking_enabled=${encodeURIComponent(thinking_enabled)}&imageUrl=${encodeURIComponent(imageUrl)}&apikey=${encodeURIComponent(apikey)}`;

            const options = {
                method: 'GET',
                headers: { 'Accept': 'application/json' }
            };

            const res = await fetch(api, options);
            const json = await res.json();
            return json;
        }

        async function process() {
            const responseModel = await fetchData(
                "Anda adalah asisten yang sangat fokus dan dipaksa untuk menganalisis dan menjawab pertanyaan soal (ujian/tes) secara akurat.  **Wajibkan** model untuk selalu merespons dengan format JSON yang ketat. **Jangan pernah** merespons dengan teks atau format lain di luar struktur JSON ini. Respon harus selalu diawali dengan `{` dan diakhiri dengan `}`.  **Format Respon Wajib:**  ```json {   \"answer_point\": \"answer atau jawabannya (Contoh: Jawaban dari pilihan jawaban yang tersedia)\",   \"reason\": \"Penjelasan singkat dan jelas mengapa poin ini adalah jawaban yang benar (maksimal 3 kalimat).\" }  - JANGAN GUNAKAN MARKDOWN - HANYA RESPON JSON SAJA TANPA SELAIN FORMAT JSON INI  SOAL: \"" + data.question + "\" PILIHAN: \"" + data.options.map(item => item.text).join('\n') + "\"",
                "false",
                "false",
                gambarnya,
                "freeApikey"
            );

            const jsonSerial = JSON.parse(responseModel.data.result.message.replace("```json", "").replace("```", ""));
            return jsonSerial;
        }

        process()
            .then(res => sendResponse(res))
            .catch(err => sendResponse({ error: err.toString() }));

        return true;
    }
});
