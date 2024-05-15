export const parameter = [
  {
    content: "width",
    descripsi:
      "Lebar trek video saat ini. Jika tidak ada yang dimuat atau kontennya hanya audio, NaN",
  },
  {
    content: "height",
    descripsi:
      "Ketinggian trek video saat ini. Jika tidak ada yang dimuat atau kontennya hanya audio, NaN.",
  },
  {
    content: "loadLatency",
    descripsi:
      "ini adalah jumlah detik yang diperlukan elemen video untuk memiliki cukup data untuk mulai diputar. Hal ini diukur dari waktu load() dipanggil hingga saat peristiwa 'loadeddata' diaktifkan oleh elemen media. Jika tidak ada yang dimuat, NaN.",
  },
  {
    content: "streamBandwidth",
    descripsi:
      "Bandwidth yang diperlukan untuk streaming saat ini (total, dalam bit/detik). Ini memperhitungkan kecepatan pemutaran. Jika tidak ada yang dimuat, NaN.",
  },
  {
    content: "estimatedBandwidth",
    descripsi:
      "Perkiraan bandwidth jaringan saat ini (dalam bit/detik). Jika tidak ada perkiraan yang tersedia, NaN",
  },
  {
    content: "decodedFrames",
    descripsi:
      "Jumlah total frame yang didekodekan oleh Players. Jika tidak dilaporkan oleh browser, NaN",
  },
  {
    content: "droppedFrames",
    descripsi:
      "Jumlah total frame yang dijatuhkan oleh Pemain. Jika tidak dilaporkan oleh browser, NaN",
  },
  {
    content: "bufferingTime",
    descripsi:
      "Total waktu yang dihabiskan dalam keadaan buffering dalam hitungan detik. Jika tidak ada yang dimuat,NaN.",
  },
  {
    content: "playTime",
    descripsi:
      " Total waktu yang dihabiskan dalam keadaan play dalam hitungan detik. Jika tidak ada yang dimuat, NaN.",
  },
  {
    content: "pauseTime",
    descripsi:
      " Total waktu yang dihabiskan dalam keadaan dijeda dalam hitungan detik. Jika tidak ada yang dimuat, NaN.",
  },
  {
    content: "corruptedFrames",
    descripsi:
      "Jumlah total frame rusak yang dibuang oleh browser. Jika tidak dilaporkan oleh browser, NaN.",
  },
  {
    content: "rtt",
    descripsi:
      "RTT (Round Trip Time) adalah total waktu yang dibutuhkan oleh permintaan untuk melakukan perjalanan melalui jaringan dan waktu yang dibutuhkan respons untuk melakukan perjalanan kembali ke asalnya. ",
  },
  {
    content: "rto",
    descripsi:
      "Request Time Out atau RTO adalah kondisi di mana server tidak memberikan respon terhadap permintaan koneksi dalam jangka waktu yang relatif lama. ",
  },
  {
    content: "manifestTimeSeconds",
    descripsi:
      "Jumlah waktu yang diperlukan untuk mengunduh dan menguraikan manifes. Jika tidak ada yang dimuat, NaN",
  },
];
