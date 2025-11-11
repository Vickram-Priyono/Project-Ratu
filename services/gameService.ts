import type { GameDataItem } from "../types";
import {
  WitnessIcon,
  EvidenceIcon,
  // LocationIcon,
  ForensicsIcon,
} from "../components/icons/StaticIcons";

// This acts as a database of all scannable items in the game.
// The key is the string that the QR code will contain.
const gameData: Record<string, Omit<GameDataItem, "id">> = {
  MAHESA_ANDI_D: {
    type: "Saksi",
    title: "Mahesa Andi D.",
    subtitle: "Teman Kerja",
    imageUrl: "/C001.webp",
    content:
      "Andi mengonfirmasi bahwa setelah menyelesaikan urusan dinas, mereka berdua singgah di rumah kedua milik Helda, yang biasa digunakan untuk kebutuhan dinas. Andi menyatakan, pada malam 9 November 2011, sekitar pukul 23.00 WIB, terjadi pertengkaran hebat antara dirinya dan Helda di rumah tersebut. Pertengkaran itu dipicu oleh janji Helda untuk meninggalkan suaminya yang tak kunjung ditepati, yang membuat Sdr. Andi sangat emosi dan lelah. Namun, Andi bersumpah bahwa ia tidak mungkin sekeji itu menghabisi Helda.\n\nSekitar pukul 23.30 WIB, ia meninggalkan Helda sendirian di rumah tersebut karena kesal dan frustasi, lalu langsung pulang ke kediamannya di Pancoran. Ia tiba pukul 00.30 WIB dini hari, 10 November 2011, dan dapat menunjukkan riwayat tol serta bukti e-toll perjalanannya dari Jakarta Utara menuju Pancoran.",
    icon: WitnessIcon,
  },
  ARIEF_M: {
    type: "Tukang Rumput",
    title: "Arief M.",
    subtitle: "Pekerja Kebun",
    imageUrl: "/C002.webp",
    content:
      "Arief menegaskan bahwa ia tidak bekerja atau mengunjungi rumah kedua Helda dan Dimas pada hari Rabu, 9 November 2011 dan mengaku menghabiskan malam itu di rumahnya bersama keluarganya. Beberapa hari setelah penemuan jasad Ibu Helda diberitakan, Pak Dimas menelepon Arief dan memintanya untuk segera membersihkan rumput di halaman rumah. Meskipun ada rasa takut karena tragedi yang menimpa Helda, Mas Arief tetap datang.\n\nSaat bekerja di halaman depan rumah pada siang hari tanggal 15 November 2011, Mas Arief dapat mencium bau pewangi samar yang datang dari dalam rumah. Ia tidak berpikir aneh, tapi itu menjadi detail yang ingin ia sampaikan kepada penyidik.",
    icon: WitnessIcon,
  },
  DIMAS_PRAKASA: {
    type: "Suami",
    title: "Dimas Prakasa",
    subtitle: "Suami",
    imageUrl: "/C003.webp",
    content: "",
    icon: WitnessIcon,
  },
  ARIEF_M_2: {
    type: "Tetangga",
    title: "Arief M",
    subtitle: "Suami",
    imageUrl: "/C004.webp",
    content: "",
    icon: WitnessIcon,
  },
  DIMAS_PRAKASA_2: {
    type: "Suami",
    title: "Dimas Prakasa",
    subtitle: "Suami",
    imageUrl: "/C005.webp",
    content: "",
    icon: WitnessIcon,
  },
  Larasati: {
    type: "ART Keluarga",
    title: "Larasati",
    subtitle: "ART Keluarga",
    imageUrl: "/C007.webp",
    content: "",
    icon: WitnessIcon,
  },
  Ibu_Lastri: {
    type: "Tetangga",
    title: "Ibu Lastri",
    subtitle: "Tetangga",
    imageUrl: "/C008.webp",
    content: "",
    icon: WitnessIcon,
  },
  Risa: {
    type: "Istri Arief",
    title: "Risa",
    subtitle: "Istri Arief",
    imageUrl: "/C009.webp",
    content: "",
    icon: WitnessIcon,
  },
  CCTV: {
    type: "CCTV",
    title: "CCTV",
    subtitle: "CCTV",
    imageUrl: "/C006.webp",
    content:
      "Rumah dua lantai yang terawat baik di area perumahan yang tenang. Tidak ada tanda-tanda masuk paksa. Tim forensik menemukan jejak pembersih lantai dengan aroma lemon yang kuat di area ruang tamu, tidak sesuai dengan produk pembersih yang biasa digunakan oleh asisten rumah tangga keluarga.",
    icon: EvidenceIcon,
  },
  FORENSICS_REPORT_A: {
    type: "Forensik",
    title: "Laporan Forensik Awal",
    subtitle: "Lab Kriminalistik Jakarta",
    imageUrl: "/forensics_report.png",
    content:
      "Korban, Helda, ditemukan meninggal akibat trauma benda tumpul di kepala bagian belakang. Waktu kematian diperkirakan antara pukul 23.00 WIB, 9 November dan 02.00 WIB, 10 November. Ditemukan juga sedikit residu tanah liat merah di bawah kuku korban yang tidak cocok dengan tanah di sekitar properti Pluit.",
    icon: ForensicsIcon,
  },
};

export const getGameData = (qrCode: string): GameDataItem | null => {
  const data = gameData[qrCode];
  if (!data) return null;
  return { id: qrCode, ...data };
};
