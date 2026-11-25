// Alur dari FR-08 & DEC-002. Jam operasional, SLA, dan garansi masih TBD: jangan ditambah.
export interface ServiceStep {
  title: string;
  summary: string;
  customer: string;
  provider: string;
}

export const SERVICE_STEPS: ServiceStep[] = [
  {
    title: "Konsultasi via WhatsApp",
    summary: "Ceritakan jenis device dan keluhannya. Device belum perlu dikirim.",
    customer:
      "Hubungi WhatsApp admin atau isi form konsultasi di beranda. Sebutkan tipe device, keluhan, dan kapan masalah mulai muncul.",
    provider:
      "Membaca keluhan, menanyakan hal yang perlu dipastikan, lalu menyampaikan apakah kendala itu bisa ditangani.",
  },
  {
    title: "Kesepakatan harga",
    summary: "Harga final ditetapkan setelah kendala dipahami.",
    customer: "Sampaikan pertimbangan biaya Anda sebelum setuju.",
    provider:
      "Menetapkan harga final setelah kendala dipahami. Nominalnya hanya disampaikan lewat WhatsApp, tidak dipajang di website.",
  },
  {
    title: "Perjanjian",
    summary: "Waktu dan cara penyerahan device disepakati lebih dulu.",
    customer: "Sepakati waktu dan cara penyerahan device sebelum pengerjaan.",
    provider: "Menyiapkan waktu pengerjaan dan memastikan device diterima sesuai perjanjian.",
  },
  {
    title: "Penyerahan device",
    summary: "Pelanggan offline cukup membawa kabel USB sesuai device.",
    customer:
      "Serahkan device beserta kabel USB yang sesuai. Untuk pengerjaan jarak jauh, perangkat Anda perlu memenuhi syarat yang dibicarakan saat konsultasi.",
    provider: "Mengerjakan servis lalu mengembalikan device melalui cara yang disepakati.",
  },
];
