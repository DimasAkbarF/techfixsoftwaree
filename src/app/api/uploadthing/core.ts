import { createUploadthing, type FileRouter } from "uploadthing/next";
import { getAdminSession } from "@/lib/admin-auth";
import { UploadThingError } from "uploadthing/server";

const f = createUploadthing();

export const ourFileRouter = {
  imageUploader: f(
    {
      image: {
        maxFileSize: "4MB",
        maxFileCount: 1,
      },
    },
    // Klien tidak perlu menunggu callback server; URL file sudah dikembalikan saat upload selesai.
    // Ini juga membuat unggah tetap jalan saat callback ke localhost tidak bisa dijangkau.
    { awaitServerData: false }
  )
    .middleware(async () => {
      const session = await getAdminSession();
      if (!session?.user) {
        throw new UploadThingError("Akses ditolak: Hanya admin yang dapat mengunggah media.");
      }
      return { userId: session.user.id };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      return {
        uploadedBy: metadata.userId,
        url: file.ufsUrl || file.url,
      };
    }),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;
