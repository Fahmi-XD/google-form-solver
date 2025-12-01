chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
    console.log("Pesan diterima di content.js:", msg);

    if (msg.action === "extract") {
        // Google Forms Question & Answer Extractor
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

        // Fungsi untuk mengekspor ke JSON
        function exportToJSON(data) {
            const jsonStr = JSON.stringify(data, null, 2);
            const blob = new Blob([jsonStr], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `google-forms-${Date.now()}.json`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        }

        // Fungsi untuk mengekspor ke CSV
        function exportToCSV(data) {
            let csv = 'No,Pertanyaan,Tipe,Wajib,Opsi Teks,Opsi Memiliki Gambar,Opsi URL Gambar\n';

            data.questions.forEach(q => {
                if (q.options.length > 0) {
                    q.options.forEach((opt, idx) => {
                        const optText = typeof opt === 'object' ? opt.text : opt;
                        const hasImg = typeof opt === 'object' ? (opt.hasImage ? 'Ya' : 'Tidak') : 'Tidak';
                        const imgUrl = typeof opt === 'object' ? opt.imageUrl : '';

                        const row = [
                            idx === 0 ? q.number : '',
                            idx === 0 ? `"${q.question.replace(/"/g, '""')}"` : '',
                            idx === 0 ? q.type : '',
                            idx === 0 ? (q.required ? 'Ya' : 'Tidak') : '',
                            `"${optText.replace(/"/g, '""')}"`,
                            hasImg,
                            `"${imgUrl.replace(/"/g, '""')}"`
                        ].join(',');
                        csv += row + '\n';
                    });
                } else {
                    const row = [
                        q.number,
                        `"${q.question.replace(/"/g, '""')}"`,
                        q.type,
                        q.required ? 'Ya' : 'Tidak',
                        '',
                        '',
                        ''
                    ].join(',');
                    csv += row + '\n';
                }
            });

            const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `google-forms-${Date.now()}.csv`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        }

        // Fungsi untuk menampilkan hasil ekstraksi di console
        function displayResults(data) {
            console.clear();
            console.log('='.repeat(60));
            console.log('GOOGLE FORMS DATA EXTRACTION');
            console.log('='.repeat(60));
            console.log('\n📋 Judul Form:', data.title);
            console.log('📝 Deskripsi:', data.description);
            console.log('📊 Total Pertanyaan:', data.questions.length);
            console.log('\n' + '='.repeat(60));

            data.questions.forEach(q => {
                console.log(`\n❓ Pertanyaan ${q.number}:`);
                console.log(`   Teks: ${q.question}`);
                console.log(`   Tipe: ${q.type}`);
                console.log(`   Wajib: ${q.required ? 'Ya' : 'Tidak'}`);
                if (q.hasImage) {
                    console.log(`   🖼️ Ada Gambar: ${q.imageUrl.substring(0, 50)}...`);
                }
                if (q.options.length > 0) {
                    console.log('   Opsi Jawaban:');
                    q.options.forEach((opt, i) => {
                        if (typeof opt === 'object') {
                            console.log(`      ${i + 1}. ${opt.text}`);
                            if (opt.hasImage) {
                                console.log(`         🖼️ Gambar Opsi: ${opt.imageUrl.substring(0, 60)}...`);
                            }
                        } else {
                            console.log(`      ${i + 1}. ${opt}`);
                        }
                    });
                }
                console.log('   ' + '-'.repeat(58));
            });

            console.log('\n' + '='.repeat(60));
            console.log('💡 Data telah diekstrak! Gunakan tombol untuk ekspor.');
            console.log('='.repeat(60));

            return data;
        }

        // Buat UI Panel
        function createUI() {
            // Cek apakah panel sudah ada
            if (document.getElementById('formExtractorPanel')) {
                return;
            }

            const panel = document.createElement('div');
            panel.id = 'formExtractorPanel';
            panel.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            z-index: 10000;
            background: white;
            border: 2px solid #673ab7;
            border-radius: 8px;
            padding: 10px;
            box-shadow: 0 4px 8px rgba(0,0,0,0.2);
            font-family: Arial, sans-serif;
        `;

            const questionCount = document.querySelectorAll('[jsmodel="CP1oW"]').length;

            panel.innerHTML = `
            <h3 style="margin: 0 0 10px 0; color: #673ab7;">Ekstraktor Google Forms</h3>
            <div style="display: flex; flex-direction: column; gap: 8px;">
                <button id="extractBtn" style="padding: 8px; background: #673ab7; color: white; border: none; border-radius: 4px; cursor: pointer;">
                    Ekstrak Data
                </button>
                <button id="exportJsonBtn" style="padding: 8px; background: #4CAF50; color: white; border: none; border-radius: 4px; cursor: pointer;">
                    Ekspor JSON
                </button>
                <button id="exportCsvBtn" style="padding: 8px; background: #2196F3; color: white; border: none; border-radius: 4px; cursor: pointer;">
                    Ekspor CSV
                </button>
                <button id="closeBtn" style="padding: 8px; background: #f44336; color: white; border: none; border-radius: 4px; cursor: pointer;">
                    Tutup
                </button>
            </div>
            <p style="font-size: 12px; margin: 10px 0 0 0; color: #666;">
                ${questionCount} pertanyaan ditemukan
            </p>
        `;

            document.body.appendChild(panel);

            // Variable untuk menyimpan data yang diekstrak
            let extractedData = null;

            // Event listeners
            document.getElementById('extractBtn').addEventListener('click', () => {
                extractedData = extractFormData();
                displayResults(extractedData);
                alert('Data berhasil diekstrak! Lihat console untuk detailnya.');
            });

            document.getElementById('exportJsonBtn').addEventListener('click', () => {
                if (!extractedData) {
                    extractedData = extractFormData();
                }
                exportToJSON(extractedData);
                alert('File JSON berhasil diunduh!');
            });

            document.getElementById('exportCsvBtn').addEventListener('click', () => {
                if (!extractedData) {
                    extractedData = extractFormData();
                }
                exportToCSV(extractedData);
                alert('File CSV berhasil diunduh!');
            });

            document.getElementById('closeBtn').addEventListener('click', () => {
                panel.remove();
            });
        }

        // Jalankan UI
        // createUI();

        // Ekspor fungsi ke window agar bisa diakses dari console
        window.FormExtractor = {
            extract: extractFormData,
            display: displayResults,
            exportJSON: exportToJSON,
            exportCSV: exportToCSV
        };

        // console.log('✅ Google Forms Extractor siap digunakan!');
        // console.log('💡 Gunakan FormExtractor.extract() untuk ekstrak data');
        // console.log('💡 Atau klik tombol "Ekstrak Data" pada panel di kanan atas');

        sendResponse(extractFormData());
    }
});
