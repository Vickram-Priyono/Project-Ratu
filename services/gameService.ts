import type { GameDataItem } from '../types';
import { ItemTypes } from '../types';
import { WitnessIcon, EvidenceIcon, LocationIcon, ForensicsIcon } from '../components/icons/StaticIcons';

// This acts as a database of all scannable items in the game.
// The key is the string that the QR code will contain.
const gameData: Record<string, Omit<GameDataItem, 'id'>> = {
  'MAHESA_ANDI_D': {
    type: ItemTypes.WITNESS,
    title: 'Mahesa Andi D.',
    subtitle: 'Teman Kerja',
    imageUrl: '/mahesa_andi_d.png?v=2',
    content: 'Andi mengonfirmasi bahwa setelah menyelesaikan urusan dinas, mereka berdua singgah di rumah kedua milik Helda, yang biasa digunakan untuk kebutuhan dinas. Andi menyatakan, pada malam 9 November 2011, sekitar pukul 23.00 WIB, terjadi pertengkaran hebat antara dirinya dan Helda di rumah tersebut. Pertengkaran itu dipicu oleh janji Helda untuk meninggalkan suaminya yang tak kunjung ditepati, yang membuat Sdr. Andi sangat emosi dan lelah. Namun, Andi bersumpah bahwa ia tidak mungkin sekeji itu menghabisi Helda.\n\nSekitar pukul 23.30 WIB, ia meninggalkan Helda sendirian di rumah tersebut karena kesal dan frustasi, lalu langsung pulang ke kediamannya di Pancoran. Ia tiba pukul 00.30 WIB dini hari, 10 November 2011, dan dapat menunjukkan riwayat tol serta bukti e-toll perjalanannya dari Jakarta Utara menuju Pancoran.',
    icon: WitnessIcon,
  },
  'ARIEF_M': {
    type: ItemTypes.WITNESS,
    title: 'Arief M.',
    subtitle: 'Tukang Rumput',
    imageUrl: '/arief_m.png?v=2',
    content: 'Arief menegaskan bahwa ia tidak bekerja atau mengunjungi rumah kedua Helda dan Dimas pada hari Rabu, 9 November 2011 dan mengaku menghabiskan malam itu di rumahnya bersama keluarganya. Beberapa hari setelah penemuan jasad Ibu Helda diberitakan, Pak Dimas menelepon Arief dan memintanya untuk segera membersihkan rumput di halaman rumah. Meskipun ada rasa takut karena tragedi yang menimpa Helda, Mas Arief tetap datang.\n\nSaat bekerja di halaman depan rumah pada siang hari tanggal 15 November 2011, Mas Arief dapat mencium bau pewangi samar yang datang dari dalam rumah. Ia tidak berpikir aneh, tapi itu menjadi detail yang ingin ia sampaikan kepada penyidik.',
    icon: WitnessIcon,
  },
  'DIMAS_PRAKASA': {
    type: ItemTypes.WITNESS,
    title: 'Dimas Prakasa',
    subtitle: 'Suami',
    imageUrl: '/dimas_prakasa.png?v=2',
    content: 'Dimas menyatakan bahwa pada hari Rabu, 9 November 2011, Sdr. Helda berpamitan kepadanya untuk dinas di daerah Pluit, Jakarta Utara. Helda mengabarkan tidak akan pulang malam itu karena keesokan paginya masih harus kembali ke tempat dinas. Helda berencana menginap di rumah kedua milik mereka yang berlokasi dekat dengan tempat dinasnya di Pluit. Setelah dikabarkan oleh Helda, Dimas melanjutkan harinya dengan pergi ke tempat kerja. Ia pulang ke rumah pada pukul 18.00 WIB.\n\nSelama periode malam Rabu hingga Kamis pagi (9-10 November 2011), Dimas mengaku menghabiskan waktunya di kediaman utama mereka di Cakung. Dimas menunjukkan call log telepon terakhir dengan Helda pada pukul 21.00 WIB tanggal 9 November 2011, di mana Helda mengabarkan sudah sampai di rumah kedua. Sisa malamnya ia habiskan di rumah dan ia pergi tidur pada pukul 22.00 WIB.',
    icon: WitnessIcon,
  },
  'EVIDENCE_001': {
    type: ItemTypes.EVIDENCE,
    title: 'Ponsel Milik Helda',
    subtitle: 'Barang Bukti #001',
    imageUrl: '/evidence_phone.png',
    content: 'Ponsel ditemukan di dalam tas tangan Helda. Log panggilan terakhir menunjukkan panggilan masuk dari "Mahesa Andi D." pada pukul 22.45 WIB, 9 November 2011, yang tidak terjawab. Tidak ada pesan teks atau aktivitas mencurigakan lainnya setelah waktu itu.',
    icon: EvidenceIcon,
  },
  'LOCATION_PLUIT': {
    type: ItemTypes.LOCATION,
    title: 'Rumah Kedua di Pluit',
    subtitle: 'Tempat Kejadian Perkara',
    imageUrl: '/location_pluit.png',
    content: 'Rumah dua lantai yang terawat baik di area perumahan yang tenang. Tidak ada tanda-tanda masuk paksa. Tim forensik menemukan jejak pembersih lantai dengan aroma lemon yang kuat di area ruang tamu, tidak sesuai dengan produk pembersih yang biasa digunakan oleh asisten rumah tangga keluarga.',
    icon: LocationIcon,
  },
  'FORENSICS_REPORT_A': {
    type: ItemTypes.FORENSICS,
    title: 'Laporan Forensik Awal',
    subtitle: 'Lab Kriminalistik Jakarta',
    imageUrl: '/forensics_report.png',
    content: 'Korban, Helda, ditemukan meninggal akibat trauma benda tumpul di kepala bagian belakang. Waktu kematian diperkirakan antara pukul 23.00 WIB, 9 November dan 02.00 WIB, 10 November. Ditemukan juga sedikit residu tanah liat merah di bawah kuku korban yang tidak cocok dengan tanah di sekitar properti Pluit.',
    icon: ForensicsIcon,
  },
};

export const getGameData = (qrCode: string): GameDataItem | null => {
  const data = gameData[qrCode];
  if (!data) return null;
  return { id: qrCode, ...data };
};