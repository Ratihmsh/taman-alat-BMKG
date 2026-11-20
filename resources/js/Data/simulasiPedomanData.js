// resources/js/Data/simulasiPedomanData.js
// Data panduan lengkap alur kerja, mekanisme fisika, dan petunjuk interaktif simulasi instrumen BMKG

export const simulasiPedomanData = {
    'sangkar meteorologi': {
        judul: 'Simulasi Terpadu Sangkar Meteorologi (Stevenson Screen)',
        kategori: 'Klimatologi & Suhu Udara',
        badgeColor: 'blue',
        ringkasan: 'Sangkar Meteorologi berfungsi melindungi rangkaian termometer dari paparan radiasi sinar matahari langsung, radiasi pantulan bumi, serta terpaan hujan angin kencang, sambil tetap mempertahankan sirkulasi udara alami melalui kisi-kisi jalusi ganda.',
        prinsipKerja: 'Prinsip Termodinamika & Ventilasi Alami: Kisi-kisi kayu dicat putih mengkilap untuk memberikan daya pantul albedo > 85%. Pintu menghadap ke utara/selatan agar saat observer membuka pintu memeriksa instrumen, sinar matahari tidak langsung menyinari bola termometer. Aliran angin bebas menembus celah kisi-kisi sehingga suhu di dalam sangkar mencerminkan suhu udara ambien sebenarnya tanpa distorsi efek rumah kaca.',
        alurSimulasi: [
            {
                langkah: '1. Atur Posisi Sangkar (Proteksi vs Terpapar)',
                uraian: 'Uji tombol "Di Dalam Sangkar" dan "Di Luar Sangkar". Amati bagaimana bola termometer yang terpapar matahari langsung mengalami lonjakan panas buatan (efek pemanasan langsung tabung kaca), membuktikan krusialnya fungsi sangkar meteorologi.'
            },
            {
                langkah: '2. Geser Slider Jam Pengamatan (Siklus Diurnal 24 Jam)',
                uraian: 'Geser rentang waktu dari jam 00:00 hingga 24:00 atau gunakan tombol pintas jam sinoptik (05:00, 07:00, 13:00, 18:00 WIB). Perhatikan kurva perubahan suhu terendah di waktu subuh dan tertinggi di siang hari.'
            },
            {
                langkah: '3. Buka Pintu Sangkar & Pilih Instrumen',
                uraian: 'Klik "Buka & Intip Dalam" untuk melihat 4 instrumen terpasang: Termometer Bola Kering, Bola Basah, Maksimum (leher kapiler sempit penyimpan rekor terpanas), dan Minimum (indeks halter alkohol penyimpan rekor terdingin).'
            },
            {
                langkah: '4. Amati Mekanisme Jarum Indeks Ekstrem',
                uraian: 'Geser waktu ke jam 14:00 (suhu puncak) lalu mundurkan ke jam 19:00. Indeks Termometer Maksimum akan tetap tertinggal di titik rekor terpanas hari itu, menunjukkan mengapa observer BMKG tidak perlu memantau alat setiap menit.'
            }
        ],
        parameterUtama: [
            { nama: 'Suhu Ambien Aktual', satuan: '°C', keterangan: 'Suhu udara atmosfer sebenarnya yang netral dari radiasi langsung.' },
            { nama: 'Depresi Bola Basah', satuan: '°C', keterangan: 'Penurunan suhu akibat penguapan air pada kain kasa basah.' },
            { nama: 'Rekor Suhu Maksimum', satuan: '°C', keterangan: 'Puncak suhu tertinggi harian yang terekam leher konstriksi raksa.' },
            { nama: 'Rekor Suhu Minimum', satuan: '°C', keterangan: 'Titik terendah suhu subuh yang ditarik indeks halter alkohol.' }
        ],
        tipsObserver: 'Pastikan kain kasa bola basah selalu bersih dan terendam air murni (akuades). Gantilah kain kasa minimal seminggu sekali atau bila tampak kotor berdebu.'
    },

    'psychrometer': {
        judul: 'Simulasi Psikrometer Standar BMKG (Bola Kering & Bola Basah)',
        kategori: 'Kelembapan Udara (RH) & Titik Embun',
        badgeColor: 'indigo',
        ringkasan: 'Psikrometer standar terdiri atas dua termometer identik (Bola Kering dan Bola Basah) yang bekerja berdampingan untuk menentukan kelembapan relatif (RH) dan titik embun atmosfer secara presisi.',
        prinsipKerja: 'Prinsip Pendinginan Evaporatif (Evaporative Cooling): Reservoir termometer bola basah dibungkus kain katun kasa yang terus dibasahi akuades. Bila udara di sekitarnya kering, molekul air akan menguap dengan cepat, menyerap kalor laten dari reservoir raksa sehingga suhunya turun lebih dingin dibanding bola kering. Selisih suhu inilah (Depresi Bola Basah) yang dikonversi menjadi kelembapan relatif menggunakan Tabel Psikrometrik BMKG.',
        alurSimulasi: [
            {
                langkah: '1. Eksplorasi Slider Suhu & Kelembapan Relatif',
                uraian: 'Ubah slider Kelembapan Relatif (RH) dari kondisi sangat kering (30%) hingga kondisi jenuh mendekati kabut/hujan (95%).'
            },
            {
                langkah: '2. Perhatikan Depresi Bola Basah (ΔT)',
                uraian: 'Lihat bagaimana selisih antara Termometer Kering dan Termometer Basah membesar saat udara kering dan mengecil hingga hampir 0°C saat udara jenuh air.'
            },
            {
                langkah: '3. Uji Kecepatan Ventilasi Udara',
                uraian: 'Aktifkan ventilasi hembusan angin untuk melihat pengaruh laju pertukaran massa udara pada stabilitas pembacaan bola basah.'
            },
            {
                langkah: '4. Pembacaan Tabel Matriks Psikrometrik Resmi',
                uraian: 'Gunakan tabel matriks interaktif di bagian bawah: cocokkan baris Suhu Bola Kering dengan kolom Depresi (ΔT) untuk memverifikasi nilai RH standar observasi BMKG.'
            }
        ],
        parameterUtama: [
            { nama: 'Bola Kering (Dry Bulb / T)', satuan: '°C', keterangan: 'Suhu termodinamika udara ambien.' },
            { nama: 'Bola Basah (Wet Bulb / Tw)', satuan: '°C', keterangan: 'Suhu terendah yang dicapai akibat pendinginan evaporasi air.' },
            { nama: 'Depresi Bola Basah (ΔT)', satuan: '°C', keterangan: 'Selisih T - Tw yang berbanding terbalik dengan kelembapan.' },
            { nama: 'Titik Embun (Dew Point / Td)', satuan: '°C', keterangan: 'Temperatur di mana uap air mulai mengembun menjadi tetes air.' }
        ],
        tipsObserver: 'Jangan membaca termometer sambil menghembuskan nafas ke arah sensor, dan gunakan kaca pembesar agar garis skala meniskus terbaca tepat tegak lurus (menghindari paralaks).'
    },

    'high volume': {
        judul: 'Simulasi High Volume Air Sampler (HV Sampler / HVAS)',
        kategori: 'Kualitas Udara & Partikulat Partikel',
        badgeColor: 'emerald',
        ringkasan: 'HV Sampler menyedot volume udara bebas dalam jumlah besar melalui motor hisap vakum bertenaga tinggi melewati filter membran khusus selama 24 jam untuk menangkap debu partikulat (TSP, PM10, atau PM2.5).',
        prinsipKerja: 'Prinsip Gravimetri & Filtrasi Impaksi Aerodinamis: Udara ditarik dengan laju alir terkalibrasi (sekitar 1.1 - 1.7 m³/menit). Partikel yang lolos selektor fraksi akan terperangkap pada serat kuarsa filter. Massa konsentrasi debu dihitung dari selisih berat filter sebelum dan sesudah sampling dibagi total volume udara yang dihisap.',
        alurSimulasi: [
            {
                langkah: '1. Pilihan Kondisi Lingkungan Sampling',
                uraian: 'Pilih skenario udara: "Udara Bersih Pegunungan", "Perkotaan Sedang", atau "Kabut Asap / Kebakaran Hutan".'
            },
            {
                langkah: '2. Nyalakan Pompa & Aliran Udara HV Sampler',
                uraian: 'Tekan tombol ON pada motor hisap, amati pergerakan pelampung manometer/flow recorder yang memonitor laju alir (flow rate).'
            },
            {
                langkah: '3. Simulasi Waktu Sampling 24 Jam',
                uraian: 'Jalankan timer sampling untuk melihat perubahan warna kertas filter dari putih bersih menjadi abu-abu gelap atau hitam pekat sesuai akumulasi massa polutan.'
            },
            {
                langkah: '4. Timbang Filter & Hitung Konsentrasi Debu (µg/m³)',
                uraian: 'Gunakan neraca analitik virtual untuk menghitung konsentrasi gravimetri dan mengecek ambang batas baku mutu udara PP RI No. 22/2021.'
            }
        ],
        parameterUtama: [
            { nama: 'Laju Alir Udara (Flow Rate)', satuan: 'm³/menit', keterangan: 'Kecepatan hisap standar 1.13 - 1.70 m³/menit.' },
            { nama: 'Volume Total Udara', satuan: 'm³', keterangan: 'Hasil kali laju alir rata-rata dengan durasi sampling 24 jam.' },
            { nama: 'Berat Filter Awal & Akhir', satuan: 'gram', keterangan: 'Penimbangan dengan neraca analitik ketelitian 0.1 mg.' },
            { nama: 'Konsentrasi Partikulat', satuan: 'µg/m³', keterangan: 'Indeks polutan udara per satuan meter kubik atmosfer.' }
        ],
        tipsObserver: 'Filter wajib dikondisikan dalam desikator bersuhu 20-25°C dan RH 40-50% selama 24 jam sebelum dan sesudah sampling agar kelembapan udara tidak menambah bobot semu.'
    },

    'hv sampler': {
        judul: 'Simulasi High Volume Air Sampler (HV Sampler / HVAS)',
        kategori: 'Kualitas Udara & Partikulat Partikel',
        badgeColor: 'emerald',
        ringkasan: 'HV Sampler menyedot volume udara bebas dalam jumlah besar melalui motor hisap vakum bertenaga tinggi melewati filter membran khusus selama 24 jam untuk menangkap debu partikulat (TSP, PM10, atau PM2.5).',
        prinsipKerja: 'Prinsip Gravimetri & Filtrasi Impaksi Aerodinamis: Udara ditarik dengan laju alir terkalibrasi (sekitar 1.1 - 1.7 m³/menit). Partikel yang lolos selektor fraksi akan terperangkap pada serat kuarsa filter. Massa konsentrasi debu dihitung dari selisih berat filter sebelum dan sesudah sampling dibagi total volume udara yang dihisap.',
        alurSimulasi: [
            {
                langkah: '1. Pilihan Kondisi Lingkungan Sampling',
                uraian: 'Pilih skenario udara: "Udara Bersih Pegunungan", "Perkotaan Sedang", atau "Kabut Asap / Kebakaran Hutan".'
            },
            {
                langkah: '2. Nyalakan Pompa & Aliran Udara HV Sampler',
                uraian: 'Tekan tombol ON pada motor hisap, amati pergerakan pelampung manometer/flow recorder yang memonitor laju alir (flow rate).'
            },
            {
                langkah: '3. Simulasi Waktu Sampling 24 Jam',
                uraian: 'Jalankan timer sampling untuk melihat perubahan warna kertas filter dari putih bersih menjadi abu-abu gelap atau hitam pekat sesuai akumulasi massa polutan.'
            },
            {
                langkah: '4. Timbang Filter & Hitung Konsentrasi Debu (µg/m³)',
                uraian: 'Gunakan neraca analitik virtual untuk menghitung konsentrasi gravimetri dan mengecek ambang batas baku mutu udara PP RI No. 22/2021.'
            }
        ],
        parameterUtama: [
            { nama: 'Laju Alir Udara (Flow Rate)', satuan: 'm³/menit', keterangan: 'Kecepatan hisap standar 1.13 - 1.70 m³/menit.' },
            { nama: 'Volume Total Udara', satuan: 'm³', keterangan: 'Hasil kali laju alir rata-rata dengan durasi sampling 24 jam.' },
            { nama: 'Berat Filter Awal & Akhir', satuan: 'gram', keterangan: 'Penimbangan dengan neraca analitik ketelitian 0.1 mg.' },
            { nama: 'Konsentrasi Partikulat', satuan: 'µg/m³', keterangan: 'Indeks polutan udara per satuan meter kubik atmosfer.' }
        ],
        tipsObserver: 'Filter wajib dikondisikan dalam desikator bersuhu 20-25°C dan RH 40-50% selama 24 jam sebelum dan sesudah sampling agar kelembapan udara tidak menambah bobot semu.'
    },

    'pyranometer': {
        judul: 'Simulasi Sensor Pyranometer (Radiasi Matahari Global)',
        kategori: 'Radiasi Matahari & Energi Surya',
        badgeColor: 'amber',
        ringkasan: 'Pyranometer mengukur kerapatan fluks radiasi matahari global (langsung dan hamburan langit) yang jatuh pada bidang datar horizontal dalam rentang panjang gelombang 300 hingga 2800 nanometer.',
        prinsipKerja: 'Prinsip Termoelektrik (Thermopile Effect): Sinar matahari menembus kubah kaca ganda (optical dome) dan diserap oleh lapisan permukaan hitam pejal. Selisih temperatur antara sambungan panas (pelat hitam) dan sambungan dingin (badan logam berpenyerap panas) menghasilkan beda potensial listrik mikrovolt (µV) berkat efek Seebeck yang linier terhadap intensitas radiasi matahari (W/m²).',
        alurSimulasi: [
            {
                langkah: '1. Simulasi Dinamika Sudut Elevasi Matahari & Tutupan Awan',
                uraian: 'Atur posisi matahari (pagi, siang terik, sore) dan variasikan intensitas awan (langit cerah tanpa awan vs mendung tebal).'
            },
            {
                langkah: '2. Amati Respons Tegangan Termopile (Mikrovolt)',
                uraian: 'Perhatikan konversi tegangan listrik mikrovolt (µV) yang dihasilkan sensor secara real-time mengikuti fluks radiasi sinar surya.'
            },
            {
                langkah: '3. Uji Kebersihan Kubah Kaca (Desiccant & Dust Control)',
                uraian: 'Coba simulasi kubah berdebu atau silika gel jenuh untuk melihat penurunan akurasi akibat hamburan radiasi abnormal.'
            },
            {
                langkah: '4. Baca Indikator Radiasi Global (W/m² & MJ/m²)',
                uraian: 'Periksa integrasi energi harian yang terekam pada datalogger penakar radiasi otomatis BMKG.'
            }
        ],
        parameterUtama: [
            { nama: 'Iradiansi Global (GHI)', satuan: 'W/m²', keterangan: 'Daya radiasi surya instan per satuan luas permukaan datar.' },
            { nama: 'Tegangan Output Termopile', satuan: 'µV / mV', keterangan: 'Sinyal listrik berbanding lurus dengan konstanta kalibrasi sensor.' },
            { nama: 'Akumulasi Energi Harian', satuan: 'MJ/m² atau kWh/m²', keterangan: 'Total energi matahari yang terkumpul selama 1 hari penuh.' },
            { nama: 'Sensitivitas Kalibrasi', satuan: 'µV / (W/m²)', keterangan: 'Faktor konversi unik yang tertera pada sertifikat kalibrasi pabrik.' }
        ],
        tipsObserver: 'Periksa butiran silika gel di dalam tabung pengering (desiccant). Jika warnanya telah berubah dari jingga/biru menjadi merah muda/pucat, segera ganti dengan silika gel baru yang kering.'
    },

    'panci penguapan': {
        judul: 'Simulasi Panci Penguapan Kelas A (Open Pan Evaporimeter)',
        kategori: 'Hidrometeorologi & Evaporasi Terbuka',
        badgeColor: 'cyan',
        ringkasan: 'Panci Penguapan Kelas A (diameter 120.7 cm, tinggi 25.4 cm) digunakan untuk mengukur jumlah penguapan air bebas harian di alam terbuka yang dipengaruhi oleh radiasi matahari, suhu air, angin, dan kelembapan udara.',
        prinsipKerja: 'Prinsip Neraca Air (Water Balance Equation): Penguapan dihitung berdasarkan selisih ketinggian permukaan air antara kemarin pukul 07:00 WIB (P0) dan hari ini pukul 07:00 WIB (P1), yang dikoreksi dengan curah hujan (CH) dari penakar hujan di dekatnya. Rumus baku BMKG: E = (P0 - P1) + CH. Pengukuran kedalaman air dilakukan secara sangat teliti menggunakan Mikrometer Hook Gauge di dalam bejana peredam riak (stilling well).',
        alurSimulasi: [
            {
                langkah: '1. Pilih Skenario Cuaca (Kemarau Terik vs Hari Hujan)',
                uraian: 'Ganti kondisi antara "Kemarau Terik Berangin" (evaporasi tinggi, air menyusut) dan "Hari Berawan Hujan Lebat" (air panci bertambah akibat presipitasi).'
            },
            {
                langkah: '2. Operasikan Mikrometer Hook Gauge (Kail Pengukur)',
                uraian: 'Putar sekrup mikrometer naik-turun hingga ujung runcing kail tepat menyentuh permukaan air (meniskus air terbentuk tanda ujung kail menyentuh permukaan tanpa tenggelam).'
            },
            {
                langkah: '3. Cek Instrumen Pendukung (Anemometer 0.5m & Termometer Apung)',
                uraian: 'Amati kecepatan angin pada elevasi 50 cm serta suhu maksimum-minimum air panci yang dicatat termometer Six-Bellani apung.'
            },
            {
                langkah: '4. Hitung Neraca Penguapan Bersih Harian',
                uraian: 'Lihat formulasi matematis otomatis BMKG yang menghitung nilai evaporasi bersih dalam milimeter (mm).'
            }
        ],
        parameterUtama: [
            { nama: 'Tinggi Air Awal (P0)', satuan: 'mm', keterangan: 'Tinggi permukaan air kemarin pukul 07:00 WIB (standar 200 mm).' },
            { nama: 'Tinggi Air Akhir (P1)', satuan: 'mm', keterangan: 'Tinggi permukaan air hari ini pukul 07:00 WIB terukur kail.' },
            { nama: 'Curah Hujan (CH)', satuan: 'mm', keterangan: 'Presipitasi yang masuk ke dalam panci dari penakar hujan OBS/Hellmann.' },
            { nama: 'Laju Evaporasi Bersih (E)', satuan: 'mm', keterangan: 'Hasil hitung neraca air: E = (P0 - P1) + CH.' }
        ],
        tipsObserver: 'Ketinggian air dalam panci harus selalu dijaga antara 2.5 cm hingga 5 cm di bawah bibir panci. Bersihkan daun gugur, debu, atau lumut di dasar panci agar daya serap panas air tidak terganggu.'
    },

    'anemometer': {
        judul: 'Simulasi Anemometer & Wind Vane (Kecepatan & Arah Angin)',
        kategori: 'Dinamika Atmosfer & Pengukuran Angin',
        badgeColor: 'sky',
        ringkasan: 'Anemometer mangkuk (Cup Anemometer) mengukur kecepatan aliran udara secara horizontal, sedangkan sirip angin (Wind Vane) menentukan arah dari mana angin bertiup pada ketinggian standar 10 meter di atas permukaan tanah.',
        prinsipKerja: 'Prinsip Tekanan Aerodinamis & Pulsa Optoelektronik: Cekungan mangkuk memiliki koefisien seret lebih besar dibanding punggung mangkuk, sehingga hembusan angin selalu memutar poros vertikal ke satu arah. Putaran poros menggerakkan pencacah pulsa elektronik (pada sistem digital) atau roda gigi mekanis (pada counter manual). Kecepatan putaran mangkuk berbanding lurus dengan kecepatan angin atmosfer.',
        alurSimulasi: [
            {
                langkah: '1. Atur Tingkat Kecepatan Angin (Skala Beaufort)',
                uraian: 'Gerakkan slider dari angin tenang (Calm / 0 knot), sepoi-sepoi (Breeze), hingga badai kencang (Gale / Storm > 35 knot).'
            },
            {
                langkah: '2. Tentukan Arah Angin (Derajat Azimuth / 16 Penjuru Angin)',
                uraian: 'Putar roda kompas atau ketik sudut derajat (0° Utara, 90° Timur, 180° Selatan, 270° Barat) dan amati orientasi sirip penunjuk angin.'
            },
            {
                langkah: '3. Amati Kecepatan Putaran Animasi Mangkuk',
                uraian: 'Perhatikan animasi mangkuk 3-cup yang berputar semakin kencang sebanding dengan pembacaan sensor dalam knot, m/s, dan km/jam.'
            },
            {
                langkah: '4. Baca Kode METAR / Rekapitulasi Sinoptik',
                uraian: 'Pelajari bagaimana data arah dan kecepatan angin diformat menjadi sandi cuaca penerbangan internasional BMKG.'
            }
        ],
        parameterUtama: [
            { nama: 'Kecepatan Angin (Wind Speed)', satuan: 'Knot / (m/s)', keterangan: 'Besaran skalar kecepatan gerak massa udara (1 knot ≈ 0.514 m/s).' },
            { nama: 'Arah Datang Angin (Wind Direction)', satuan: 'Derajat (°)', keterangan: 'Arah asal datangnya angin dari 0° s.d. 360° searah jarum jam.' },
            { nama: 'Skala Beaufort', satuan: 'Nomor 0 - 12', keterangan: 'Klasifikasi empiris dampak hembusan angin pada benda di daratan.' },
            { nama: 'Gust (Kecepatan Angin Maksimum)', satuan: 'Knot', keterangan: 'Hembusan mendadak terkuat dalam rentang interval waktu observasi.' }
        ],
        tipsObserver: 'Untuk stasiun sinoptik penerbangan dan klimatologi standar WMO, tiang penopang anemometer wajib ditempatkan di lapangan terbuka bebas hambatan dengan tinggi 10 meter (jarak bebas minimal 10 kali tinggi rintangan terdekat).'
    },

    'campbell stokes': {
        judul: 'Simulasi Campbell Stokes (Penakar Durasi Penyinaran Matahari)',
        kategori: 'Radiasi Surya & Fotometrik Matahari',
        badgeColor: 'amber',
        ringkasan: 'Campbell Stokes menggunakan bola kaca pejal berdaya bias fokus tinggi sebagai lensa pembakar untuk merekam lama waktu matahari bersinar terang pada kertas pias karton khusus berskala jam.',
        prinsipKerja: 'Prinsip Pembiasan Sinar & Pembakaran Ambang Batas (120 W/m²): Bola kaca memfokuskan sinar matahari paralel menjadi satu titik api kecil di atas permukaan kertas pias. Apabila intensitas radiasi matahari langsung melampaui batas ambang baku WMO (≥ 120 W/m²), titik fokus tersebut akan membakar dan menghanguskan permukaan kertas pias meninggalkan jejak garis gosong. Panjang total garis gosong diukur untuk menentukan durasi sinar matahari dalam jam dan desimal.',
        alurSimulasi: [
            {
                langkah: '1. Pemilihan Jenis Kertas Pias Musiman',
                uraian: 'Pilih tipe kertas pias sesuai posisi lintang & deklinasi matahari: Pias Lurus (Ekuinoks Maret/September), Pias Lengkung Pendek (Musim Dingin), atau Pias Lengkung Panjang (Musim Panas).'
            },
            {
                langkah: '2. Atur Perjalanan Matahari dari Pagi hingga Petang',
                uraian: 'Geser slider waktu matahari terbit (06:00) hingga terbenam (18:00). Amati titik api fokus bergerak melintasi garis skala jam pada pias.'
            },
            {
                langkah: '3. Variasikan Tutupan Awan (Sela-sela Mendung)',
                uraian: 'Munculkan awan melintas untuk melihat jeda pada garis gosong (menunjukkan matahari tertutup awan sehingga intensitas di bawah 120 W/m²).'
            },
            {
                langkah: '4. Pengukuran Panjang Jejak Gosong',
                uraian: 'Hitung total durasi penyinaran nyata (actual sunshine hours) dan bandingkan dengan panjang siang hari teoritis untuk menghitung persentase penyinaran harian.'
            }
        ],
        parameterUtama: [
            { nama: 'Ambang Pembakaran WMO', satuan: '≥ 120 W/m²', keterangan: 'Intensitas sinar matahari langsung minimal yang sanggup membakar pias.' },
            { nama: 'Lama Penyinaran Aktual', satuan: 'Jam (Hours)', keterangan: 'Total akumulasi durasi garis gosong yang terbentuk sepanjang hari.' },
            { nama: 'Lama Penyinaran Relatif', satuan: '%', keterangan: 'Rasio durasi nyata dibanding durasi matahari berada di atas ufuk.' },
            { nama: 'Jenis Kertas Pias', satuan: 'Tipe Pias', keterangan: 'Karton pias khusus yang telah diberi zat penghambat perambatan nyala api.' }
        ],
        tipsObserver: 'Kertas pias harus dipasang sebelum matahari terbit (biasanya pukul 06:00 waktu setempat) dan diambil setelah matahari terbenam (pukul 18:00) agar seluruh siklus penyinaran terekam utuh.'
    },

    'automatic rain gauge': {
        judul: 'Simulasi Automatic Rain Gauge (ARG / Penakar Hujan Otomatis)',
        kategori: 'Curah Hujan & Presipitasi Otomatis',
        badgeColor: 'blue',
        ringkasan: 'ARG menakar volume, akumulasi, dan intensitas curah hujan secara kontinu dan mandiri menggunakan sistem sepasang mangkuk jungkitan presisi (Tipping Bucket) yang terhubung ke sensor pulsa magnetik/reed switch.',
        prinsipKerja: 'Prinsip Tipping Bucket & Pulsa Magnetik: Air hujan masuk melalui corong penangkap berdiameter 200 mm dan dialirkan ke dalam salah satu wadah mangkuk seimbang. Begitu wadah terisi air setara volume 0.2 mm atau 0.5 mm presipitasi, titik beratnya bergeser sehingga mangkuk terjungkit tumpah dan wadah sebelahnya berganti menampung air. Setiap jungkitan menggerakkan magnet melintasi sakelar buluh (reed switch), menghasilkan satu pulsa digital yang dihitung oleh datalogger.',
        alurSimulasi: [
            {
                langkah: '1. Atur Intensitas Curah Hujan (Gerimis hingga Badai Tropis)',
                uraian: 'Pilih skenario curah hujan: "Gerimis Ringan (< 1 mm/jam)", "Hujan Sedang", atau "Hujan Sangat Lebat Ekstrem (> 20 mm/jam)".'
            },
            {
                langkah: '2. Saksikan Gerak Jungkitan Mangkuk Kembar (Tipping Action)',
                uraian: 'Perhatikan animasi wadah mangkuk yang terisi tetes air demi tetes air lalu terjungkit otomatis membuang air lewat saluran drainase bawah.'
            },
            {
                langkah: '3. Monitor Penghitung Pulsa & Akumulasi Data Logger',
                uraian: 'Lihat bagaimana setiap jungkitan (0.2 mm) menambah grafik akumulasi curah hujan harian secara real-time.'
            },
            {
                langkah: '4. Deteksi Peringatan Dini Banjir & Longsor',
                uraian: 'Amati status peringatan BMKG berubah warna dari Hijau (Normal), Kuning (Waspada), hingga Merah (Siaga Ekstrem) jika intensitas hujan melampaui batas bahaya.'
            }
        ],
        parameterUtama: [
            { nama: 'Kapasitas Tip Mangkuk', satuan: '0.2 mm / tip', keterangan: 'Volume presipitasi per satu kali siklus jungkitan mangkuk.' },
            { nama: 'Intensitas Curah Hujan', satuan: 'mm/jam', keterangan: 'Kecepatan laju turunnya hujan per satuan waktu jam.' },
            { nama: 'Akumulasi Hujan Harian', satuan: 'mm', keterangan: 'Total volume air hujan yang terkumpul dalam periode 24 jam.' },
            { nama: 'Diameter Corong Kolektor', satuan: '200 mm', keterangan: 'Standar luas penampang tangkapan air hujan sesuai rekomendasi WMO.' }
        ],
        tipsObserver: 'Rutin bersihkan corong saringan dari kotoran daun, ranting, dan kotoran burung, serta pastikan kaki penyangga waterpass tetap berada pada posisi gelembung tepat di tengah (horizontal sempurna).'
    },

    'automatic weather station': {
        judul: 'Simulasi Automatic Weather Station (AWS / Stasiun Cuaca Otomatis)',
        kategori: 'Multi-Sensor Terpadu & Telemetri Real-Time',
        badgeColor: 'indigo',
        ringkasan: 'AWS adalah sistem terintegrasi multi-sensor yang dipasang pada menara baja untuk mengukur seluruh unsur cuaca (suhu, kelembapan, angin, tekanan, radiasi surya, curah hujan) secara otomatis, menyimpan data di datalogger, dan mengirimkannya ke Server BMKG via modul seluler 4G/Satelit.',
        prinsipKerja: 'Prinsip Akuisisi Data Terpusat & Telemetri GSM/Satelit: Berbagai sensor mengirimkan sinyal digital (RS-485 / SDI-12) dan analog (mikrovolt / pulsa) ke Datalogger pusat yang berperan sebagai CPU. Datalogger melakukan sampling data setiap beberapa detik, mengolah rata-rata 10 menit, memformat paket data baku (format SYNOP / JSON / BUFR), lalu memancarkannya secara terjadwal atau saat terjadi lonjakan cuaca ekstrem.',
        alurSimulasi: [
            {
                langkah: '1. Pilih Kondisi Atmosfer (Cerah Normal vs Badai Ekstrem)',
                uraian: 'Aktifkan skenario cuaca badai konvektif untuk melihat respons serentak sensor angin kencang, lonjakan curah hujan, dan penurunan tekanan udara drastis.'
            },
            {
                langkah: '2. Inspeksi Sensor Interaktif pada Tiang Menara (10 Meter)',
                uraian: 'Klik masing-masing titik sensor pada gambar menara (Ultrasonic Anemometer, Pyranometer, Thermo-Hygrometer Pt100, Barometer, Tipping Bucket, Penangkal Petir).'
            },
            {
                langkah: '3. Simulasi Transmisi Telemetri 4G & Buffer Penyimpanan Offline',
                uraian: 'Uji sakelar sinyal jaringan: saat sinyal mati (blank spot), datalogger secara otomatis menyimpan data ke memori internal (buffer lokal) dan mengirimkannya kembali saat sinyal pulih.'
            },
            {
                langkah: '4. Uji Proteksi Penangkal Petir & Daya Panel Surya',
                uraian: 'Pelajari peran resistansi grounding (harus ≤ 5 Ohm) agar komponen sensitif datalogger tidak rusak saat petir menyambar puncak menara.'
            }
        ],
        parameterUtama: [
            { nama: 'Interval Pengiriman Data', satuan: '10 Menit', keterangan: 'Siklus pengiriman paket data sinoptik terstandar BMKG.' },
            { nama: 'Catu Daya Surya & Baterai', satuan: '12V DC / 65W', keterangan: 'Sistem mandiri panel surya dengan cadangan aki kering tahan cuaca.' },
            { nama: 'Konektivitas Transmisi', satuan: '4G LTE / GPRS / Satelit', keterangan: 'Protokol pengiriman data dua arah ke server pusat BMKG.' },
            { nama: 'Proteksi Penangkal Petir', satuan: '≤ 5.0 Ohm', keterangan: 'Tahanan pentanahan (grounding) untuk melindungi sirkuit internal.' }
        ],
        tipsObserver: 'Periksa level tegangan baterai aki kering pada datalogger. Jika pada siang hari tegangan tidak mencapai minimal 13.5V saat matahari terik, periksa kebersihan kaca panel surya dan kondisi kabel konektornya.'
    },

    'ombrometer': {
        judul: 'Simulasi Ombrometer Manual Tipe Observatorium (OBS)',
        kategori: 'Curah Hujan & Presipitasi Manual',
        badgeColor: 'cyan',
        ringkasan: 'Ombrometer Observatorium (OBS) adalah penakar hujan manual terstandar BMKG yang digunakan sebagai instrumen acuan kalibrasi utama untuk mengukur jumlah curah hujan harian dengan gelas ukur berskala khusus.',
        prinsipKerja: 'Prinsip Penampungan Volumetrik & Gelas Ukur Berskala: Corong seluas 100 cm² menangkap air hujan dan mengalirkannya ke tabung penampung logam berleher sempit untuk meminimalkan penguapan. Air yang terkumpul kemudian dituang ke dalam gelas ukur berskala milimeter (di mana 1 mm curah hujan setara dengan 1 liter air pada luasan 1 meter persegi, atau 10 ml air pada corong penakar seluas 100 cm²).',
        alurSimulasi: [
            {
                langkah: '1. Atur Jumlah Air Hujan yang Tertampung',
                uraian: 'Tentukan volume air yang masuk ke dalam tabung penakar (dari gerimis tipis 2.5 mm hingga hujan lebat 65 mm).'
            },
            {
                langkah: '2. Tuang Air ke Gelas Ukur Khusus OBS BMKG',
                uraian: 'Tekan tombol "Buka Kran / Tuang Air" untuk mengalirkan air dari bejana penampung ke dalam silinder gelas ukur berskala presisi.'
            },
            {
                langkah: '3. Pembacaan Meniskus Air Sejajar Garis Mata',
                uraian: 'Gunakan panduan garis horizontal: baca angka skala tepat pada garis lengkungan meniskus bawah air untuk menghindari kesalahan sudut paralaks.'
            },
            {
                langkah: '4. Pencatatan ke Buku Register Pengamatan Harian',
                uraian: 'Pahami klasifikasi curah hujan BMKG: Hujan Sangat Ringan (< 5 mm/hari), Hujan Sedang (20-50 mm/hari), Hujan Lebat (50-100 mm/hari), atau Ekstrem (> 150 mm/hari).'
            }
        ],
        parameterUtama: [
            { nama: 'Luas Corong Penangkap', satuan: '100 cm²', keterangan: 'Luas baku bibir kuningan corong penampung air hujan standar BMKG.' },
            { nama: 'Ketinggian Mulut Corong', satuan: '120 cm (1.2 m)', keterangan: 'Tinggi bibir penakar di atas permukaan tanah agar terhindar percikan.' },
            { nama: 'Kapasitas Gelas Ukur', satuan: '25 mm (250 ml)', keterangan: 'Jika air melebihi 25 mm, pengukuran dilakukan secara bertahap.' },
            { nama: 'Waktu Pengamatan Resmi', satuan: '07:00 WIB', keterangan: 'Waktu baku pencatatan curah hujan 24 jam terakhir di seluruh stasiun BMKG.' }
        ],
        tipsObserver: 'Pegang gelas ukur tegak lurus pada bagian leher atasnya, dan posisikan mata tepat sejajar dengan permukaan air. Baca selalu dasar meniskus cekung air, bukan dinding tepi yang merambat naik.'
    }
};

// Helper function untuk mengambil data pedoman berdasarkan nama instrumen
export function getPedomanAlat(name = '') {
    const cleanName = (name || '').toLowerCase();
    for (const key of Object.keys(simulasiPedomanData)) {
        if (cleanName.includes(key)) {
            return simulasiPedomanData[key];
        }
    }
    // Default fallback
    return simulasiPedomanData['sangkar meteorologi'];
}
