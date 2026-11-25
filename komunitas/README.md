# Folder Komunitas

Semua yang perlu diubah untuk direktori komunitas di website ada di folder ini. Kode tampilan (`assets/communities.js`) tidak perlu disentuh.

Isi folder:

1. `daftar.js`: data semua komunitas. Satu blok `{ ... }` untuk satu komunitas, urutan blok sama dengan urutan tampil di website.
2. `logo/`: logo tiap komunitas (wajib). Sebaiknya persegi, format WebP atau PNG, sekitar 160 x 160 piksel.
3. `logo-polos/`: logo tanpa latar untuk pita logo mitra yang bergeser (opsional). Nama berkasnya harus sama dengan di `logo/`. Kalau tidak ada, pita memakai logo dari `logo/`.
4. `sampul/`: foto sampul kartu (opsional). Kalau tidak ada, sampul dibuat otomatis dari logo yang dikaburkan. Buat foldernya saat pertama kali butuh.

## Menambah komunitas

1. Simpan logonya di `logo/`, misalnya `komunitas-baru.webp`.
2. Buka `daftar.js`, salin satu blok yang sudah ada, tempel di bawah kanal yang sesuai, lalu ganti isinya. Pastikan ada koma di antara blok.
3. Bangun dan rilis situs seperti biasa. Perubahan baru tayang setelah situs dibangun ulang dan diterbitkan ke branch `gh-pages`; push ke `main` saja belum mengubah website.

Yang ikut berubah sendiri: angka jumlah komunitas di tombol hero dan judul bagian Community, hitungan per kanal di tombol saringan, logo per sektor di bagian Industries, pita logo mitra, dan halaman detail komunitas.

## Isi tiap blok

1. `nama` (wajib): nama komunitas.
2. `slug` (opsional): alamat halaman detail, jadi `catalystsociety.id/?k=slug`. Pakai huruf kecil, angka, dan tanda hubung. Kalau dikosongkan, slug dibuat otomatis dari nama. Jangan ubah slug komunitas lama, karena tautan yang sudah dibagikan akan mati.
3. `kanal` (wajib): salah satu dari `investments`, `ai_technology`, `business`, `builders`, `social_impact`.
4. `kategori` (opsional): label kecil di halaman detail, misalnya `"Trading"` atau `"Programming"`.
5. `logo` (wajib): nama berkas di `logo/`.
6. `topik`: daftar kata, misalnya `["Crypto", "Trading", "Community"]`.
7. `anggota`: `"free"`, `"premium"`, atau `"selective"`, boleh lebih dari satu, misalnya `["free", "premium"]`.
8. `web`, `wa`, `ig`, `discord`, `tiktok` (opsional): tautan resmi. Yang tidak diisi tidak ditampilkan. Tombol Gabung memakai tautan pertama yang ada dengan urutan WhatsApp, Discord, Website, Instagram, TikTok.
9. `sampul` (opsional): nama berkas foto di `sampul/`.
10. `deskripsi` (opsional): teks halaman detail dalam tiga bahasa, `{ id: "...", en: "...", zh: "..." }`. Boleh hanya `id`; bahasa yang kosong memakai teks Inggris, lalu Indonesia.

Contoh paling sederhana:

```js
  {
    nama: "Komunitas Baru",
    kanal: "business",
    logo: "komunitas-baru.webp",
    topik: ["Startup", "Meet Up"],
    anggota: ["free"],
    ig: "https://www.instagram.com/komunitasbaru"
  },
```

## Mengubah atau menghapus

Ubah isi bloknya, atau hapus seluruh blok beserta komanya. Hapus juga berkas logonya kalau sudah tidak dipakai.

## Kalau ada yang salah

1. Blok dengan nama, logo, atau kanal yang salah tidak ditampilkan, dan muncul peringatan di Console browser (F12).
2. Kalau seluruh direktori kosong, biasanya ada koma atau tanda kutip yang hilang di `daftar.js`. Console browser menunjukkan barisnya.

## Yang belum ikut otomatis

1. CS AI (Tanya Catalyst) membaca `assets/cs/pengetahuan.md`. Tambahkan satu baris tentang komunitas baru di bagian "Komunitas mitra" supaya CS bisa menjawab tentangnya.
2. Passport (folder `platform/`) masih memakai daftar komunitasnya sendiri di `platform/src/lib/data/communities.ts`.
