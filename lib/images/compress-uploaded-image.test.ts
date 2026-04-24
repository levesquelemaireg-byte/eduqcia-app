import { describe, expect, it } from "vitest";
import sharp from "sharp";
import {
  CompressUploadedImageError,
  compressUploadedImage,
} from "@/lib/images/compress-uploaded-image";

describe("compressUploadedImage", () => {
  it("conserve les dimensions d'une petite image PNG (pas de compression)", async () => {
    const buf = await sharp({
      create: {
        width: 10,
        height: 10,
        channels: 3,
        background: { r: 200, g: 10, b: 10 },
      },
    })
      .png()
      .toBuffer();
    const r = await compressUploadedImage(buf, "image/png");
    expect(r.width).toBe(10);
    expect(r.height).toBe(10);
    expect(r.wasCompressed).toBe(false);
    expect(r.contentType).toBe("image/png");
    expect(r.fileSizeBytes).toBeGreaterThan(0);
  });

  it("conserve les dimensions originales d'une grande image (plus de resize)", async () => {
    const buf = await sharp({
      create: {
        width: 2000,
        height: 200,
        channels: 3,
        background: { r: 10, g: 100, b: 200 },
      },
    })
      .jpeg()
      .toBuffer();
    const r = await compressUploadedImage(buf, "image/jpeg");
    expect(r.width).toBe(2000);
    expect(r.height).toBe(200);
    expect(r.wasCompressed).toBe(false);
    expect(r.contentType).toBe("image/jpeg");
  });

  it("rejette un format non accepté", async () => {
    await expect(compressUploadedImage(Buffer.from("x"), "image/gif")).rejects.toMatchObject({
      code: "FORMAT_NOT_ACCEPTED",
    });
  });

  it("rejette un buffer non image", async () => {
    await expect(
      compressUploadedImage(Buffer.from("not an image"), "image/png"),
    ).rejects.toMatchObject({
      code: "IMAGE_UNREADABLE",
    });
  });

  it("accepte le WebP et conserve ses dimensions", async () => {
    const buf = await sharp({
      create: {
        width: 8,
        height: 8,
        channels: 3,
        background: { r: 1, g: 2, b: 3 },
      },
    })
      .webp()
      .toBuffer();
    const r = await compressUploadedImage(buf, "image/webp");
    expect(r.contentType).toBe("image/webp");
    expect(r.width).toBe(8);
    expect(r.height).toBe(8);
    expect(r.wasCompressed).toBe(false);
  });
});

describe("CompressUploadedImageError", () => {
  it("expose le code", () => {
    const e = new CompressUploadedImageError("FORMAT_NOT_ACCEPTED");
    expect(e).toBeInstanceOf(Error);
    expect(e.code).toBe("FORMAT_NOT_ACCEPTED");
  });
});
