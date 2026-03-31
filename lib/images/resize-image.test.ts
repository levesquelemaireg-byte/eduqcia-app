import { describe, expect, it } from "vitest";
import sharp from "sharp";
import { ResizeImageError, resizeImage } from "@/lib/images/resize-image";
import { computeFinalDimensionsForUploadBox } from "@/lib/images/upload-image-max-box";

describe("resizeImage", () => {
  it("ne grossit pas une petite image PNG", async () => {
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
    const r = await resizeImage(buf, "image/png");
    expect(r.width).toBe(10);
    expect(r.height).toBe(10);
    expect(r.wasResized).toBe(false);
    expect(r.contentType).toBe("image/png");
    expect(r.fileSizeBytes).toBeGreaterThan(0);
  });

  it("réduit une grande image et aligne les dimensions sur la formule boîte max", async () => {
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
    const r = await resizeImage(buf, "image/jpeg");
    const expected = computeFinalDimensionsForUploadBox(2000, 200);
    expect(r.width).toBe(expected.width);
    expect(r.height).toBe(expected.height);
    expect(r.width).toBeLessThanOrEqual(660);
    expect(r.height).toBeLessThanOrEqual(400);
    expect(r.wasResized).toBe(true);
    expect(r.contentType).toBe("image/jpeg");
  });

  it("rejette un format non accepté", async () => {
    await expect(resizeImage(Buffer.from("x"), "image/gif")).rejects.toMatchObject({
      code: "FORMAT_NOT_ACCEPTED",
    });
  });

  it("rejette un buffer non image", async () => {
    await expect(resizeImage(Buffer.from("not an image"), "image/png")).rejects.toMatchObject({
      code: "IMAGE_UNREADABLE",
    });
  });

  it("accepte le WebP", async () => {
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
    const r = await resizeImage(buf, "image/webp");
    expect(r.contentType).toBe("image/webp");
    expect(r.wasResized).toBe(false);
  });
});

describe("ResizeImageError", () => {
  it("expose le code", () => {
    const e = new ResizeImageError("FORMAT_NOT_ACCEPTED");
    expect(e).toBeInstanceOf(Error);
    expect(e.code).toBe("FORMAT_NOT_ACCEPTED");
  });
});
