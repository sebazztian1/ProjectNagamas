export interface ProvinceItem {
  code: string
  name: string
}

export interface RegencyItem {
  code: string
  province_code: string
  name: string
}

export interface DistrictItem {
  code: string
  regency_code: string
  name: string
}

export interface VillageItem {
  code: string
  district_code: string
  name: string
  postal_code: string | null
}

export const PROVINCES: ProvinceItem[] = [
  { code: '11', name: 'Aceh' },
  { code: '12', name: 'Sumatera Utara' },
  { code: '13', name: 'Sumatera Barat' },
  { code: '14', name: 'Riau' },
  { code: '15', name: 'Jambi' },
  { code: '16', name: 'Sumatera Selatan' },
  { code: '17', name: 'Bengkulu' },
  { code: '18', name: 'Lampung' },
  { code: '19', name: 'Kepulauan Bangka Belitung' },
  { code: '21', name: 'Kepulauan Riau' },
  { code: '31', name: 'DKI Jakarta' },
  { code: '32', name: 'Jawa Barat' },
  { code: '33', name: 'Jawa Tengah' },
  { code: '34', name: 'DI Yogyakarta' },
  { code: '35', name: 'Jawa Timur' },
  { code: '36', name: 'Banten' },
  { code: '51', name: 'Bali' },
  { code: '52', name: 'Nusa Tenggara Barat' },
  { code: '53', name: 'Nusa Tenggara Timur' },
  { code: '61', name: 'Kalimantan Barat' },
  { code: '62', name: 'Kalimantan Tengah' },
  { code: '63', name: 'Kalimantan Selatan' },
  { code: '64', name: 'Kalimantan Timur' },
  { code: '65', name: 'Kalimantan Utara' },
  { code: '71', name: 'Sulawesi Utara' },
  { code: '72', name: 'Sulawesi Tengah' },
  { code: '73', name: 'Sulawesi Selatan' },
  { code: '74', name: 'Sulawesi Tenggara' },
  { code: '75', name: 'Gorontalo' },
  { code: '76', name: 'Sulawesi Barat' },
  { code: '81', name: 'Maluku' },
  { code: '82', name: 'Maluku Utara' },
  { code: '91', name: 'Papua' },
  { code: '92', name: 'Papua Barat' },
  { code: '93', name: 'Papua Selatan' },
  { code: '94', name: 'Papua Tengah' },
  { code: '95', name: 'Papua Pegunungan' },
  { code: '96', name: 'Papua Barat Daya' }
]

export const REGENCIES: RegencyItem[] = [
  // 11 Aceh
  { code: '1171', province_code: '11', name: 'Kota Banda Aceh' },
  { code: '1173', province_code: '11', name: 'Kota Lhokseumawe' },
  { code: '1106', province_code: '11', name: 'Kab. Aceh Besar' },
  // 12 Sumatera Utara
  { code: '1271', province_code: '12', name: 'Kota Medan' },
  { code: '1272', province_code: '12', name: 'Kota Pematangsiantar' },
  { code: '1275', province_code: '12', name: 'Kota Binjai' },
  { code: '1207', province_code: '12', name: 'Kab. Deli Serdang' },
  // 13 Sumatera Barat
  { code: '1371', province_code: '13', name: 'Kota Padang' },
  { code: '1375', province_code: '13', name: 'Kota Bukittinggi' },
  { code: '1376', province_code: '13', name: 'Kota Payakumbuh' },
  // 14 Riau
  { code: '1471', province_code: '14', name: 'Kota Pekanbaru' },
  { code: '1472', province_code: '14', name: 'Kota Dumai' },
  { code: '1401', province_code: '14', name: 'Kab. Kampar' },
  { code: '1403', province_code: '14', name: 'Kab. Bengkalis' },
  // 15 Jambi
  { code: '1571', province_code: '15', name: 'Kota Jambi' },
  { code: '1505', province_code: '15', name: 'Kab. Muaro Jambi' },
  // 16 Sumatera Selatan
  { code: '1671', province_code: '16', name: 'Kota Palembang' },
  { code: '1674', province_code: '16', name: 'Kota Prabumulih' },
  { code: '1607', province_code: '16', name: 'Kab. Banyuasin' },
  // 17 Bengkulu
  { code: '1771', province_code: '17', name: 'Kota Bengkulu' },
  { code: '1701', province_code: '17', name: 'Kab. Bengkulu Selatan' },
  // 18 Lampung
  { code: '1871', province_code: '18', name: 'Kota Bandar Lampung' },
  { code: '1872', province_code: '18', name: 'Kota Metro' },
  { code: '1801', province_code: '18', name: 'Kab. Lampung Selatan' },
  // 19 Bangka Belitung
  { code: '1971', province_code: '19', name: 'Kota Pangkalpinang' },
  { code: '1901', province_code: '19', name: 'Kab. Bangka' },
  { code: '1902', province_code: '19', name: 'Kab. Belitung' },
  // 21 Kepulauan Riau
  { code: '2171', province_code: '21', name: 'Kota Batam' },
  { code: '2172', province_code: '21', name: 'Kota Tanjungpinang' },
  { code: '2101', province_code: '21', name: 'Kab. Bintan' },
  { code: '2102', province_code: '21', name: 'Kab. Karimun' },
  // 31 DKI Jakarta
  { code: '3171', province_code: '31', name: 'Kota Adm. Jakarta Pusat' },
  { code: '3172', province_code: '31', name: 'Kota Adm. Jakarta Utara' },
  { code: '3173', province_code: '31', name: 'Kota Adm. Jakarta Barat' },
  { code: '3174', province_code: '31', name: 'Kota Adm. Jakarta Selatan' },
  { code: '3175', province_code: '31', name: 'Kota Adm. Jakarta Timur' },
  { code: '3101', province_code: '31', name: 'Kab. Adm. Kepulauan Seribu' },
  // 32 Jawa Barat
  { code: '3273', province_code: '32', name: 'Kota Bandung' },
  { code: '3275', province_code: '32', name: 'Kota Bekasi' },
  { code: '3276', province_code: '32', name: 'Kota Depok' },
  { code: '3271', province_code: '32', name: 'Kota Bogor' },
  { code: '3277', province_code: '32', name: 'Kota Cimahi' },
  { code: '3274', province_code: '32', name: 'Kota Cirebon' },
  { code: '3204', province_code: '32', name: 'Kab. Bandung' },
  { code: '3201', province_code: '32', name: 'Kab. Bogor' },
  { code: '3216', province_code: '32', name: 'Kab. Bekasi' },
  // 33 Jawa Tengah
  { code: '3374', province_code: '33', name: 'Kota Semarang' },
  { code: '3372', province_code: '33', name: 'Kota Surakarta (Solo)' },
  { code: '3371', province_code: '33', name: 'Kota Magelang' },
  { code: '3302', province_code: '33', name: 'Kab. Banyumas' },
  { code: '3311', province_code: '33', name: 'Kab. Sukoharjo' },
  // 34 DI Yogyakarta
  { code: '3471', province_code: '34', name: 'Kota Yogyakarta' },
  { code: '3404', province_code: '34', name: 'Kab. Sleman' },
  { code: '3402', province_code: '34', name: 'Kab. Bantul' },
  // 35 Jawa Timur
  { code: '3578', province_code: '35', name: 'Kota Surabaya' },
  { code: '3573', province_code: '35', name: 'Kota Malang' },
  { code: '3571', province_code: '35', name: 'Kota Kediri' },
  { code: '3515', province_code: '35', name: 'Kab. Sidoarjo' },
  { code: '3525', province_code: '35', name: 'Kab. Gresik' },
  // 36 Banten
  { code: '3671', province_code: '36', name: 'Kota Tangerang' },
  { code: '3674', province_code: '36', name: 'Kota Tangerang Selatan' },
  { code: '3673', province_code: '36', name: 'Kota Serang' },
  { code: '3672', province_code: '36', name: 'Kota Cilegon' },
  { code: '3603', province_code: '36', name: 'Kab. Tangerang' },
  // 51 Bali
  { code: '5171', province_code: '51', name: 'Kota Denpasar' },
  { code: '5103', province_code: '51', name: 'Kab. Badung' },
  { code: '5104', province_code: '51', name: 'Kab. Gianyar' },
  // 52 NTB
  { code: '5271', province_code: '52', name: 'Kota Mataram' },
  { code: '5201', province_code: '52', name: 'Kab. Lombok Barat' },
  // 53 NTT
  { code: '5371', province_code: '53', name: 'Kota Kupang' },
  { code: '5315', province_code: '53', name: 'Kab. Manggarai Barat' },
  // 61 Kalimantan Barat
  { code: '6171', province_code: '61', name: 'Kota Pontianak' },
  { code: '6172', province_code: '61', name: 'Kota Singkawang' },
  { code: '6112', province_code: '61', name: 'Kab. Kubu Raya' },
  // 62 Kalimantan Tengah
  { code: '6271', province_code: '62', name: 'Kota Palangka Raya' },
  { code: '6202', province_code: '62', name: 'Kab. Kotawaringin Timur' },
  // 63 Kalimantan Selatan
  { code: '6371', province_code: '63', name: 'Kota Banjarmasin' },
  { code: '6372', province_code: '63', name: 'Kota Banjarbaru' },
  // 64 Kalimantan Timur
  { code: '6471', province_code: '64', name: 'Kota Balikpapan' },
  { code: '6472', province_code: '64', name: 'Kota Samarinda' },
  { code: '6474', province_code: '64', name: 'Kota Bontang' },
  // 65 Kalimantan Utara
  { code: '6571', province_code: '65', name: 'Kota Tarakan' },
  { code: '6501', province_code: '65', name: 'Kab. Bulungan' },
  // 71 Sulawesi Utara
  { code: '7171', province_code: '71', name: 'Kota Manado' },
  { code: '7172', province_code: '71', name: 'Kota Bitung' },
  // 72 Sulawesi Tengah
  { code: '7271', province_code: '72', name: 'Kota Palu' },
  // 73 Sulawesi Selatan
  { code: '7371', province_code: '73', name: 'Kota Makassar' },
  { code: '7372', province_code: '73', name: 'Kota Parepare' },
  { code: '7306', province_code: '73', name: 'Kab. Gowa' },
  // 74 Sulawesi Tenggara
  { code: '7471', province_code: '74', name: 'Kota Kendari' },
  // 75 Gorontalo
  { code: '7571', province_code: '75', name: 'Kota Gorontalo' },
  // 76 Sulawesi Barat
  { code: '7602', province_code: '76', name: 'Kab. Mamuju' },
  // 81 Maluku
  { code: '8171', province_code: '81', name: 'Kota Ambon' },
  // 82 Maluku Utara
  { code: '8271', province_code: '82', name: 'Kota Ternate' },
  // 91-96 Papua
  { code: '9171', province_code: '91', name: 'Kota Jayapura' },
  { code: '9202', province_code: '92', name: 'Kab. Manokwari' },
  { code: '9301', province_code: '93', name: 'Kab. Merauke' },
  { code: '9404', province_code: '94', name: 'Kab. Mimika' },
  { code: '9501', province_code: '95', name: 'Kab. Jayawijaya' },
  { code: '9671', province_code: '96', name: 'Kota Sorong' }
]

export const DISTRICTS: DistrictItem[] = [
  // Jakarta Pusat (3171)
  { code: '317101', regency_code: '3171', name: 'Gambir' },
  { code: '317102', regency_code: '3171', name: 'Sawah Besar' },
  { code: '317103', regency_code: '3171', name: 'Kemayoran' },
  { code: '317104', regency_code: '3171', name: 'Senen' },
  { code: '317105', regency_code: '3171', name: 'Cempaka Putih' },
  { code: '317106', regency_code: '3171', name: 'Menteng' },
  { code: '317107', regency_code: '3171', name: 'Tanah Abang' },
  { code: '317108', regency_code: '3171', name: 'Johar Baru' },
  // Jakarta Utara (3172)
  { code: '317201', regency_code: '3172', name: 'Penjaringan' },
  { code: '317202', regency_code: '3172', name: 'Tanjung Priok' },
  { code: '317203', regency_code: '3172', name: 'Koja' },
  { code: '317204', regency_code: '3172', name: 'Cilincing' },
  { code: '317205', regency_code: '3172', name: 'Pademangan' },
  { code: '317206', regency_code: '3172', name: 'Kelapa Gading' },
  // Jakarta Barat (3173)
  { code: '317301', regency_code: '3173', name: 'Cengkareng' },
  { code: '317302', regency_code: '3173', name: 'Grogol Petamburan' },
  { code: '317303', regency_code: '3173', name: 'Taman Sari' },
  { code: '317304', regency_code: '3173', name: 'Tambora' },
  { code: '317305', regency_code: '3173', name: 'Kebon Jeruk' },
  { code: '317306', regency_code: '3173', name: 'Kalideres' },
  { code: '317307', regency_code: '3173', name: 'Palmerah' },
  { code: '317308', regency_code: '3173', name: 'Kembangan' },
  // Jakarta Selatan (3174)
  { code: '317401', regency_code: '3174', name: 'Tebet' },
  { code: '317402', regency_code: '3174', name: 'Setiabudi' },
  { code: '317403', regency_code: '3174', name: 'Mampang Prapatan' },
  { code: '317404', regency_code: '3174', name: 'Pasar Minggu' },
  { code: '317405', regency_code: '3174', name: 'Kebayoran Lama' },
  { code: '317406', regency_code: '3174', name: 'Cilandak' },
  { code: '317407', regency_code: '3174', name: 'Kebayoran Baru' },
  { code: '317408', regency_code: '3174', name: 'Pancoran' },
  { code: '317409', regency_code: '3174', name: 'Jagakarsa' },
  { code: '317410', regency_code: '3174', name: 'Pesanggrahan' },
  // Jakarta Timur (3175)
  { code: '317501', regency_code: '3175', name: 'Matraman' },
  { code: '317502', regency_code: '3175', name: 'Pulogadung' },
  { code: '317503', regency_code: '3175', name: 'Jatinegara' },
  { code: '317504', regency_code: '3175', name: 'Kramat Jati' },
  { code: '317505', regency_code: '3175', name: 'Pasar Rebo' },
  { code: '317506', regency_code: '3175', name: 'Cakung' },
  { code: '317507', regency_code: '3175', name: 'Duren Sawit' },
  { code: '317508', regency_code: '3175', name: 'Makasar' },
  { code: '317509', regency_code: '3175', name: 'Ciracas' },
  { code: '317510', regency_code: '3175', name: 'Cipayung' },
  // Kota Surabaya (3578)
  { code: '357801', regency_code: '3578', name: 'Tegalsari' },
  { code: '357802', regency_code: '3578', name: 'Genteng' },
  { code: '357803', regency_code: '3578', name: 'Gubeng' },
  { code: '357804', regency_code: '3578', name: 'Sukolilo' },
  { code: '357805', regency_code: '3578', name: 'Wonokromo' },
  { code: '357806', regency_code: '3578', name: 'Rungkut' },
  { code: '357807', regency_code: '3578', name: 'Sawahan' },
  // Kota Bandung (3273)
  { code: '327301', regency_code: '3273', name: 'Coblong' },
  { code: '327302', regency_code: '3273', name: 'Sumur Bandung' },
  { code: '327303', regency_code: '3273', name: 'Bandung Wetan' },
  { code: '327304', regency_code: '3273', name: 'Cicendo' },
  { code: '327305', regency_code: '3273', name: 'Sukajadi' },
  { code: '327306', regency_code: '3273', name: 'Buahbatu' },
  // Kota Bekasi (3275)
  { code: '327501', regency_code: '3275', name: 'Bekasi Timur' },
  { code: '327502', regency_code: '3275', name: 'Bekasi Barat' },
  { code: '327503', regency_code: '3275', name: 'Bekasi Selatan' },
  { code: '327504', regency_code: '3275', name: 'Bekasi Utara' },
  { code: '327505', regency_code: '3275', name: 'Pondokgede' },
  // Kota Depok (3276)
  { code: '327601', regency_code: '3276', name: 'Pancoran Mas' },
  { code: '327602', regency_code: '3276', name: 'Cimanggis' },
  { code: '327603', regency_code: '3276', name: 'Beji' },
  { code: '327604', regency_code: '3276', name: 'Sukmajaya' },
  { code: '327605', regency_code: '3276', name: 'Cinere' },
  // Kota Tangerang (3671) & Tangsel (3674)
  { code: '367101', regency_code: '3671', name: 'Tangerang' },
  { code: '367102', regency_code: '3671', name: 'Karawaci' },
  { code: '367103', regency_code: '3671', name: 'Cipondoh' },
  { code: '367104', regency_code: '3671', name: 'Ciledug' },
  { code: '367401', regency_code: '3674', name: 'Serpong' },
  { code: '367402', regency_code: '3674', name: 'Serpong Utara' },
  { code: '367403', regency_code: '3674', name: 'Pondok Aren' },
  { code: '367404', regency_code: '3674', name: 'Ciputat' },
  { code: '367405', regency_code: '3674', name: 'Pamulang' },
  // Kota Batam (2171) & Tanjungpinang (2172)
  { code: '217101', regency_code: '2171', name: 'Batam Kota' },
  { code: '217102', regency_code: '2171', name: 'Lubuk Baja' },
  { code: '217103', regency_code: '2171', name: 'Batu Ampar' },
  { code: '217104', regency_code: '2171', name: 'Sekupang' },
  { code: '217105', regency_code: '2171', name: 'Bengkong' },
  { code: '217106', regency_code: '2171', name: 'Nongsa' },
  { code: '217201', regency_code: '2172', name: 'Tanjungpinang Barat' },
  { code: '217202', regency_code: '2172', name: 'Tanjungpinang Timur' },
  { code: '217203', regency_code: '2172', name: 'Tanjungpinang Kota' },
  { code: '217204', regency_code: '2172', name: 'Bukit Bestari' },
  // Kota Pekanbaru (1471)
  { code: '147101', regency_code: '1471', name: 'Sukajadi' },
  { code: '147102', regency_code: '1471', name: 'Pekanbaru Kota' },
  { code: '147103', regency_code: '1471', name: 'Sail' },
  { code: '147104', regency_code: '1471', name: 'Lima Puluh' },
  { code: '147105', regency_code: '1471', name: 'Senapelan' },
  { code: '147106', regency_code: '1471', name: 'Marpoyan Damai' },
  { code: '147107', regency_code: '1471', name: 'Bukit Raya' },
  { code: '147108', regency_code: '1471', name: 'Tampan (Tuah Madani)' },
  { code: '147109', regency_code: '1471', name: 'Payung Sekaki' },
  // Kota Medan (1271)
  { code: '127101', regency_code: '1271', name: 'Medan Kota' },
  { code: '127102', regency_code: '1271', name: 'Medan Baru' },
  { code: '127103', regency_code: '1271', name: 'Medan Petisah' },
  { code: '127104', regency_code: '1271', name: 'Medan Sunggal' },
  { code: '127105', regency_code: '1271', name: 'Medan Polonia' },
  // Kota Semarang (3374)
  { code: '337401', regency_code: '3374', name: 'Semarang Tengah' },
  { code: '337402', regency_code: '3374', name: 'Semarang Selatan' },
  { code: '337403', regency_code: '3374', name: 'Banyumanik' },
  { code: '337404', regency_code: '3374', name: 'Pedurungan' },
  // Kota Yogyakarta (3471) & Sleman (3404)
  { code: '347101', regency_code: '3471', name: 'Gondokusuman' },
  { code: '347102', regency_code: '3471', name: 'Jetis' },
  { code: '347103', regency_code: '3471', name: 'Malioboro / Gedongtengen' },
  { code: '347104', regency_code: '3471', name: 'Umbulharjo' },
  { code: '340401', regency_code: '3404', name: 'Depok' },
  { code: '340402', regency_code: '3404', name: 'Mlati' },
  { code: '340403', regency_code: '3404', name: 'Ngaglik' },
  // Kota Denpasar (5171) & Badung (5103)
  { code: '517101', regency_code: '5171', name: 'Denpasar Selatan' },
  { code: '517102', regency_code: '5171', name: 'Denpasar Timur' },
  { code: '517103', regency_code: '5171', name: 'Denpasar Barat' },
  { code: '517104', regency_code: '5171', name: 'Denpasar Utara' },
  { code: '510301', regency_code: '5103', name: 'Kuta' },
  { code: '510302', regency_code: '5103', name: 'Kuta Utara' },
  { code: '510303', regency_code: '5103', name: 'Kuta Selatan' },
  // Kota Makassar (7371)
  { code: '737101', regency_code: '7371', name: 'Panakkukang' },
  { code: '737102', regency_code: '7371', name: 'Rappocini' },
  { code: '737103', regency_code: '7371', name: 'Ujung Pandang' },
  { code: '737104', regency_code: '7371', name: 'Tamalanrea' }
]

export const VILLAGES: VillageItem[] = [
  // Sawah Besar (317102) - Pasar Baru area!
  { code: '3171021001', district_code: '317102', name: 'Pasar Baru', postal_code: '10710' },
  { code: '3171021002', district_code: '317102', name: 'Gunung Sahari Utara', postal_code: '10720' },
  { code: '3171021003', district_code: '317102', name: 'Mangga Dua Selatan', postal_code: '10730' },
  { code: '3171021004', district_code: '317102', name: 'Karang Anyar', postal_code: '10740' },
  { code: '3171021005', district_code: '317102', name: 'Kartini', postal_code: '10750' },
  // Gambir (317101)
  { code: '3171011001', district_code: '317101', name: 'Gambir', postal_code: '10110' },
  { code: '3171011002', district_code: '317101', name: 'Cideng', postal_code: '10150' },
  { code: '3171011003', district_code: '317101', name: 'Petojo Utara', postal_code: '10130' },
  { code: '3171011004', district_code: '317101', name: 'Petojo Selatan', postal_code: '10160' },
  { code: '3171011005', district_code: '317101', name: 'Kebon Kelapa', postal_code: '10120' },
  // Menteng (317106)
  { code: '3171061001', district_code: '317106', name: 'Menteng', postal_code: '10310' },
  { code: '3171061002', district_code: '317106', name: 'Pegangsaan', postal_code: '10320' },
  { code: '3171061003', district_code: '317106', name: 'Cikini', postal_code: '10330' },
  { code: '3171061004', district_code: '317106', name: 'Gondangdia', postal_code: '10350' },
  // Tanah Abang (317107)
  { code: '3171071001', district_code: '317107', name: 'Bendungan Hilir', postal_code: '10210' },
  { code: '3171071002', district_code: '317107', name: 'Karet Tengsin', postal_code: '10220' },
  { code: '3171071003', district_code: '317107', name: 'Kebon Melati', postal_code: '10230' },
  { code: '3171071004', district_code: '317107', name: 'Kampung Bali', postal_code: '10250' },
  // Kelapa Gading (317206)
  { code: '3172061001', district_code: '317206', name: 'Kelapa Gading Timur', postal_code: '14240' },
  { code: '3172061002', district_code: '317206', name: 'Kelapa Gading Barat', postal_code: '14240' },
  { code: '3172061003', district_code: '317206', name: 'Pegangsaan Dua', postal_code: '14250' },
  // Penjaringan (317201)
  { code: '3172011001', district_code: '317201', name: 'Pluit', postal_code: '14450' },
  { code: '3172011002', district_code: '317201', name: 'Kapuk Muara', postal_code: '14460' },
  { code: '3172011003', district_code: '317201', name: 'Pejagalan', postal_code: '14450' },
  // Kebayoran Baru (317407)
  { code: '3174071001', district_code: '317407', name: 'Senayan', postal_code: '12190' },
  { code: '3174071002', district_code: '317407', name: 'Melawai', postal_code: '12160' },
  { code: '3174071003', district_code: '317407', name: 'Gunung', postal_code: '12120' },
  { code: '3174071004', district_code: '317407', name: 'Cipete Utara', postal_code: '12150' },
  // Tebet (317401)
  { code: '3174011001', district_code: '317401', name: 'Tebet Timur', postal_code: '12820' },
  { code: '3174011002', district_code: '317401', name: 'Tebet Barat', postal_code: '12810' },
  { code: '3174011003', district_code: '317401', name: 'Manggarai', postal_code: '12850' },
  // Tegalsari Surabaya (357801)
  { code: '3578011001', district_code: '357801', name: 'Tegalsari', postal_code: '60262' },
  { code: '3578011002', district_code: '357801', name: 'Keputran', postal_code: '60265' },
  { code: '3578011003', district_code: '357801', name: 'Dr. Soetomo', postal_code: '60264' },
  { code: '3578011004', district_code: '357801', name: 'Kedungdoro', postal_code: '60261' },
  { code: '3578011005', district_code: '357801', name: 'Wonorejo', postal_code: '60263' },
  // Gubeng Surabaya (357803)
  { code: '3578031001', district_code: '357803', name: 'Gubeng', postal_code: '60281' },
  { code: '3578031002', district_code: '357803', name: 'Airlangga', postal_code: '60286' },
  { code: '3578031003', district_code: '357803', name: 'Kertajaya', postal_code: '60282' },
  // Coblong Bandung (327301)
  { code: '3273011001', district_code: '327301', name: 'Dago', postal_code: '40135' },
  { code: '3273011002', district_code: '327301', name: 'Lebakgede', postal_code: '40132' },
  { code: '3273011003', district_code: '327301', name: 'Cipaganti', postal_code: '40131' },
  // Batam Kota (217101) & Lubuk Baja (217102)
  { code: '2171011001', district_code: '217101', name: 'Teluk Tering', postal_code: '29461' },
  { code: '2171011002', district_code: '217101', name: 'Baloi Permai', postal_code: '29463' },
  { code: '2171011003', district_code: '217101', name: 'Taman Baloi', postal_code: '29432' },
  { code: '2171011004', district_code: '217101', name: 'Sukajadi', postal_code: '29432' },
  { code: '2171021001', district_code: '217102', name: 'Lubuk Baja Kota', postal_code: '29444' },
  { code: '2171021002', district_code: '217102', name: 'Kampung Pelita', postal_code: '29443' },
  { code: '2171021003', district_code: '217102', name: 'Baloi Indah', postal_code: '29442' },
  // Pekanbaru (147101, 147106)
  { code: '1471011001', district_code: '147101', name: 'Jadirejo', postal_code: '28121' },
  { code: '1471011002', district_code: '147101', name: 'Kampung Melayu', postal_code: '28124' },
  { code: '1471061001', district_code: '147106', name: 'Tangkerang Tengah', postal_code: '28282' },
  { code: '1471061002', district_code: '147106', name: 'Tangkerang Barat', postal_code: '28282' },
  { code: '1471061003', district_code: '147106', name: 'Sidomulyo Timur', postal_code: '28289' }
]

export function getProvinces(): ProvinceItem[] {
  return PROVINCES
}

export function getRegenciesByProvince(provinceCode: string): RegencyItem[] {
  const code = String(provinceCode || '').trim()
  const list = REGENCIES.filter((r) => r.province_code === code)
  if (list.length > 0) return list

  const prov = PROVINCES.find((p) => p.code === code)
  if (!prov) return []
  return [
    { code: `${code}71`, province_code: code, name: `Kota ${prov.name}` },
    { code: `${code}01`, province_code: code, name: `Kab. ${prov.name}` }
  ]
}

export function getDistrictsByRegency(regencyCode: string): DistrictItem[] {
  const code = String(regencyCode || '').trim()
  const list = DISTRICTS.filter((d) => d.regency_code === code)
  if (list.length > 0) return list

  // Find regency (either from REGENCIES or generated)
  const provCode = code.slice(0, 2)
  const regencies = getRegenciesByProvince(provCode)
  const reg = regencies.find((r) => r.code === code)
  if (!reg) return []

  const baseName = reg.name.replace(/^(Kota Adm\.|Kab\. Adm\.|Kota|Kab\.)\s+/i, '')
  return [
    { code: `${code}01`, regency_code: code, name: `${baseName} Pusat` },
    { code: `${code}02`, regency_code: code, name: `${baseName} Utara` },
    { code: `${code}03`, regency_code: code, name: `${baseName} Selatan` },
    { code: `${code}04`, regency_code: code, name: `${baseName} Barat` },
    { code: `${code}05`, regency_code: code, name: `${baseName} Timur` }
  ]
}

export function getVillagesByDistrict(districtCode: string): VillageItem[] {
  const code = String(districtCode || '').trim()
  const list = VILLAGES.filter((v) => v.district_code === code)
  if (list.length > 0) return list

  const regCode = code.slice(0, 4)
  const districts = getDistrictsByRegency(regCode)
  const dist = districts.find((d) => d.code === code)
  if (!dist) return []

  // Deterministic 5-digit postal code based on districtCode
  const numericPrefix = code.replace(/\D/g, '').slice(0, 3).padEnd(3, '1')
  return [
    { code: `${code}1001`, district_code: code, name: `${dist.name} I`, postal_code: `${numericPrefix}11` },
    { code: `${code}1002`, district_code: code, name: `${dist.name} II`, postal_code: `${numericPrefix}12` },
    { code: `${code}1003`, district_code: code, name: `${dist.name} III`, postal_code: `${numericPrefix}13` }
  ]
}

export interface RegionSearchResult {
  province_code: string
  province_name: string
  regency_code: string
  regency_name: string
  district_code: string
  district_name: string
  village_code: string | null
  village_name: string | null
  postal_code: string | null
  label: string
}

export function searchRegions(query: string): RegionSearchResult[] {
  const q = String(query || '').trim().toLowerCase()
  if (q.length < 3) return []

  const results: RegionSearchResult[] = []
  const provMap = new Map(PROVINCES.map((p) => [p.code, p]))
  const regMap = new Map(REGENCIES.map((r) => [r.code, r]))
  const distMap = new Map(DISTRICTS.map((d) => [d.code, d]))

  // 1. Search villages first
  for (const v of VILLAGES) {
    if (results.length >= 10) break
    const dist = distMap.get(v.district_code)
    if (!dist) continue
    const reg = regMap.get(dist.regency_code)
    if (!reg) continue
    const prov = provMap.get(reg.province_code)
    if (!prov) continue

    const combined = `${v.name} ${dist.name} ${reg.name} ${prov.name}`.toLowerCase()
    if (combined.includes(q)) {
      results.push({
        province_code: prov.code,
        province_name: prov.name,
        regency_code: reg.code,
        regency_name: reg.name,
        district_code: dist.code,
        district_name: dist.name,
        village_code: v.code,
        village_name: v.name,
        postal_code: v.postal_code,
        label: `${v.name}, ${dist.name}, ${reg.name}, ${prov.name}`
      })
    }
  }

  // 2. Search districts
  for (const dist of DISTRICTS) {
    if (results.length >= 10) break
    const reg = regMap.get(dist.regency_code)
    if (!reg) continue
    const prov = provMap.get(reg.province_code)
    if (!prov) continue

    const combined = `${dist.name} ${reg.name} ${prov.name}`.toLowerCase()
    if (combined.includes(q) && !results.some((r) => r.district_code === dist.code && !r.village_code)) {
      const firstVillage = getVillagesByDistrict(dist.code)[0]
      results.push({
        province_code: prov.code,
        province_name: prov.name,
        regency_code: reg.code,
        regency_name: reg.name,
        district_code: dist.code,
        district_name: dist.name,
        village_code: null,
        village_name: null,
        postal_code: firstVillage?.postal_code || null,
        label: `${dist.name}, ${reg.name}, ${prov.name}`
      })
    }
  }

  return results.slice(0, 10)
}

/**
 * Normalize Indonesian phone number (`08...`, `628...`, `+628...`) -> `628...`
 * Returns null if invalid according to `^(\+62|62|0)8[1-9][0-9]{6,11}$`
 */
export function normalizeIndonesianPhone(raw: string): string | null {
  const cleaned = String(raw || '').replace(/[\s\-().]/g, '')
  if (!/^(\+62|62|0)8[1-9][0-9]{6,11}$/.test(cleaned)) {
    return null
  }
  if (cleaned.startsWith('+62')) {
    return cleaned.slice(1)
  }
  if (cleaned.startsWith('0')) {
    return '62' + cleaned.slice(1)
  }
  return cleaned
}

