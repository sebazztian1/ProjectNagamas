# Mengoperasikan retensi audit log

Pembacaan daftar, detail, pencarian, pagination, dan ekspor memakai cutoff UTC dari server. Baris tepat pada cutoff tetap tersedia. Durasi default 60 × 24 jam. Tanggal pada filter dan laporan memakai Asia/Jakarta. File yang sebelumnya sudah diunduh berada di luar kendali retensi aplikasi.

## Instalasi

1. Gunakan MySQL InnoDB. Pastikan timestamp historis memang UTC dan jam server tersinkron. Periksa `SHOW CREATE TABLE audit_logs`, `SHOW INDEX FROM audit_logs`, trigger DELETE dan foreign key masuk menggunakan akun DBA yang dapat melihat metadata seluruh skema terkait. Belum ada tabel review Owner di skema aplikasi. Jika ada relasi tambahan pada hosting, tinjau sebelum aktivasi. Job menolak relasi masuk atau trigger DELETE yang terlihat olehnya.
2. Jalankan SQL versi ini sekali, dengan akun migrasi, sebelum merilis aplikasi. Repositori ini belum memiliki rantai Prisma Migrate. Pada klien MySQL yang tersambung ke database tujuan, gunakan `SOURCE prisma/sql/audit-retention.sql`. Untuk rollback, nonaktifkan cron dan jalankan `SOURCE prisma/sql/audit-retention.rollback.sql`. Rollback mengarsipkan tabel history. Tinjau hasil setiap DDL karena MySQL melakukan implicit commit. Pada instalasi lama yang sudah memiliki index setara, verifikasi dan sesuaikan langkah index bersama DBA.
3. Build seperti biasa dengan `npm run build`. Instal CLI di lingkungan server dengan Node yang mendukung `--env-file-if-exists`, dependensi proyek termasuk `tsx`, dan Prisma Client hasil generate. Deploy source CLI dan helper bersama scheduler. Hosting yang hanya menyajikan frontend membutuhkan worker terpisah yang dapat menjangkau MySQL.
4. Terapkan hak minimum melalui DBA. Proses web perlu SELECT/INSERT pada audit_logs, SELECT pada history. Akun CLI perlu SELECT/DELETE pada audit_logs serta SELECT/INSERT/UPDATE pada history. Jangan wariskan grant tingkat database yang lebih luas. Pasang `AUDIT_LOG_PURGE_DATABASE_URL` khusus pada worker. Jika kosongkan dengan menghapus variabelnya, CLI memakai DATABASE_URL. Periksa hak efektif dan visibilitas metadata di staging. Kredensial migrasi dikelola terpisah.
5. Admin aktif adalah Owner pada aplikasi ini. Panel read-only tersedia di halaman Audit Log. Staff hanya mendapat data audit biasa. Periksa riwayat lengkap melalui akun operasional dengan SELECT pada audit_log_purge_history, urutkan started_at menurun. Tidak ada pemicu purge melalui HTTP.

## Aktivasi bertahap

Nilai kerja aman ada pada `.env.example`. Salin hanya kunci AUDIT_LOG yang diperlukan. Selaraskan konfigurasi hari retensi dan mode antara proses web dan worker. Untuk status awal gunakan ENABLED=false, DRY_RUN=true (nama lengkap kedua variabel adalah AUDIT_LOG_PURGE_ENABLED dan AUDIT_LOG_PURGE_DRY_RUN). Menjalankan CLI pada mode ini hanya mencatat SKIPPED.

Untuk simulasi, set ENABLED=true dan DRY_RUN=true lalu jalankan `npm run audit:purge`. Hasil JSON berisi cutoff, eligible, estimate dan jumlah terhapus. Bandingkan cutoff menggunakan parameter DATETIME UTC yang sama persis:

```sql
SELECT COUNT(*) FROM audit_logs WHERE created_at < ?;
SELECT COUNT(*) FROM audit_logs WHERE created_at >= ?;
EXPLAIN SELECT id FROM audit_logs WHERE created_at < ?
ORDER BY created_at, id LIMIT 1000;
```

Sebelum mengizinkan penghapusan, verifikasi cutoff, jumlah kandidat, kebijakan durasi, rencana eksekusi, beban database dan uji restore backup ke instance staging. Salinan backup/snapshot memiliki kebijakan retensi sendiri. Job hanya bekerja di database utama. Pemulihan memerlukan restore backup atau point-in-time recovery ke database terpisah dan rekonsiliasi oleh DBA. Aplikasi tidak menyediakan undo.

Setelah persetujuan eksplisit, gunakan ENABLED=true dan DRY_RUN=false. Catat waktu aktivasi dalam `AUDIT_LOG_PURGE_ACTIVATED_AT` (ISO UTC) agar monitoring memberikan masa awal 48 jam. Jika waktu ini tidak tersedia, panel langsung memperingatkan saat belum ada riwayat sukses yang cukup baru.

## Scheduler dan penghentian

Pasang cron di server dengan zona waktu UTC. Contoh berikut mengasumsikan aplikasi terpasang di /srv/nagamas dan npm tersedia pada PATH cron:

```cron
0 20 * * * cd /srv/nagamas && npm run audit:purge
```

Jika scheduler memakai Asia/Jakarta, gunakan `0 3 * * *`. Instal satu jadwal. CLI mengambil konfigurasi baru setiap eksekusi. Muat ulang proses web setelah mengubah environment agar panel dan cutoff mengikuti konfigurasi yang sama. Pantau exit code, status PARTIAL/FAILED serta RUNNING yang kedaluwarsa. Kegagalan koneksi sebelum pencatatan history memerlukan pemantauan log scheduler.

Untuk penghentian darurat, nonaktifkan jadwal dan kembalikan ENABLED=false, DRY_RUN=true. Kirim SIGTERM ke proses Node CLI aktif agar berhenti sebelum batch berikutnya. Batch yang sedang berlangsung menyelesaikan transaksinya. Jika proses crash, MySQL melepaskan advisory lock saat koneksi putus dan me-rollback transaksi yang belum commit. Hasil batch yang sudah commit tercatat secara atomik. Untuk proses web yang sudah memuat konfigurasi, lakukan restart melalui pengelola layanan hosting.

Batch default 1.000, jeda 200 ms, batas 100.000 baris dan 600 detik. Timeout transaksi dibatasi hingga 30 detik dan sisa waktu batch. Penghitungan akhir dan pelepasan lock dapat selesai setelah batas waktu memulai batch. Data yang masih menunggu diproses pada jadwal berikutnya.
