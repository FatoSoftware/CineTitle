/**
 * CineTitle 3D Studio - Native Pure-TypeScript GIF89a Animated Encoder
 * Zero external dependencies. Generates valid looping GIF files from Canvas frames.
 */

export interface GifFrameOptions {
  delayMs: number; // Duration of this frame in milliseconds (e.g., 50ms for 20fps)
  transparentColor?: number | null; // Optional transparent palette index
}

// Simple color quantizer to create 128-color or 256-color palette
function quantizeFrameColors(imageData: ImageData, maxColors: number = 256): {
  palette: number[][]; // [[r,g,b], ...]
  indexedPixels: Uint8Array;
} {
  const data = imageData.data;
  const pixelCount = imageData.width * imageData.height;
  const indexedPixels = new Uint8Array(pixelCount);

  // Sample unique colors and build histogram
  const colorMap = new Map<number, number>();
  for (let i = 0; i < data.length; i += 4) {
    const a = data[i + 3];
    if (a < 128) {
      // Treat low alpha as index 0 (black/transparent)
      continue;
    }
    // Reduce color depth to 5-5-5 bits for fast clustering
    const r = (data[i] >> 3) << 3;
    const g = (data[i + 1] >> 3) << 3;
    const b = (data[i + 2] >> 3) << 3;
    const key = (r << 16) | (g << 8) | b;
    colorMap.set(key, (colorMap.get(key) || 0) + 1);
  }

  // Sort by frequency
  const sortedColors = Array.from(colorMap.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, maxColors - 1);

  const palette: number[][] = [];
  palette.push([0, 0, 0]); // Reserved index 0

  const keyToIndex = new Map<number, number>();
  keyToIndex.set(0, 0);

  sortedColors.forEach(([key], idx) => {
    const r = (key >> 16) & 0xff;
    const g = (key >> 8) & 0xff;
    const b = key & 0xff;
    palette.push([r, g, b]);
    keyToIndex.set(key, idx + 1);
  });

  // Map each pixel to nearest palette index
  for (let i = 0, p = 0; i < data.length; i += 4, p++) {
    const a = data[i + 3];
    if (a < 128) {
      indexedPixels[p] = 0;
      continue;
    }
    const r = (data[i] >> 3) << 3;
    const g = (data[i + 1] >> 3) << 3;
    const b = (data[i + 2] >> 3) << 3;
    const key = (r << 16) | (g << 8) | b;

    const directIdx = keyToIndex.get(key);
    if (directIdx !== undefined) {
      indexedPixels[p] = directIdx;
    } else {
      // Nearest euclidean color match
      let bestDist = Infinity;
      let bestIdx = 0;
      for (let c = 0; c < palette.length; c++) {
        const pr = palette[c][0];
        const pg = palette[c][1];
        const pb = palette[c][2];
        const dist = (r - pr) * (r - pr) + (g - pg) * (g - pg) + (b - pb) * (b - pb);
        if (dist < bestDist) {
          bestDist = dist;
          bestIdx = c;
        }
      }
      indexedPixels[p] = bestIdx;
    }
  }

  // Pad palette to power of 2 (min 2, max 256)
  let targetSize = 2;
  while (targetSize < palette.length && targetSize < 256) {
    targetSize <<= 1;
  }
  while (palette.length < targetSize) {
    palette.push([0, 0, 0]);
  }

  return { palette, indexedPixels };
}

// LZW Compression for GIF
function lzwCompress(minCodeSize: number, indexedPixels: Uint8Array): Uint8Array {
  const clearCode = 1 << minCodeSize;
  const eoiCode = clearCode + 1;

  let codeSize = minCodeSize + 1;
  let nextCode = eoiCode + 1;
  const maxCode = 4096;

  // Dictionary: string of codes -> output code
  let table = new Map<string, number>();

  function resetTable() {
    table.clear();
    for (let i = 0; i < clearCode; i++) {
      table.set(String(i), i);
    }
    codeSize = minCodeSize + 1;
    nextCode = eoiCode + 1;
  }

  const outputBits: number[] = [];
  let curBitLength = 0;
  let curAccumulator = 0;

  function writeBits(val: number, length: number) {
    curAccumulator |= val << curBitLength;
    curBitLength += length;
    while (curBitLength >= 8) {
      outputBits.push(curAccumulator & 0xff);
      curAccumulator >>= 8;
      curBitLength -= 8;
    }
  }

  resetTable();
  writeBits(clearCode, codeSize);

  let curPrefix = '';

  for (let i = 0; i < indexedPixels.length; i++) {
    const k = indexedPixels[i];
    const candidate = curPrefix === '' ? String(k) : `${curPrefix},${k}`;

    if (table.has(candidate)) {
      curPrefix = candidate;
    } else {
      writeBits(table.get(curPrefix)!, codeSize);

      if (nextCode < maxCode) {
        table.set(candidate, nextCode++);
        if (nextCode > (1 << codeSize) && codeSize < 12) {
          codeSize++;
        }
      } else {
        // Table full, emit clear code
        writeBits(clearCode, codeSize);
        resetTable();
      }

      curPrefix = String(k);
    }
  }

  if (curPrefix !== '') {
    writeBits(table.get(curPrefix)!, codeSize);
  }

  writeBits(eoiCode, codeSize);

  // Flush remaining bits
  if (curBitLength > 0) {
    outputBits.push(curAccumulator & 0xff);
  }

  // Package into GIF data sub-blocks (max 255 bytes per sub-block)
  const bytes: number[] = [];
  let pos = 0;
  while (pos < outputBits.length) {
    const chunkSize = Math.min(255, outputBits.length - pos);
    bytes.push(chunkSize);
    for (let c = 0; c < chunkSize; c++) {
      bytes.push(outputBits[pos + c]);
    }
    pos += chunkSize;
  }
  bytes.push(0x00); // Block terminator

  return new Uint8Array(bytes);
}

export class GifEncoder {
  private width: number;
  private height: number;
  private bytes: number[] = [];
  private hasWrittenHeader: boolean = false;

  constructor(width: number, height: number) {
    this.width = Math.floor(width);
    this.height = Math.floor(height);
  }

  private writeHeader() {
    // GIF89a Header
    const sig = [0x47, 0x49, 0x46, 0x38, 0x39, 0x61]; // "GIF89a"
    this.bytes.push(...sig);

    // Logical Screen Descriptor
    this.writeShort(this.width);
    this.writeShort(this.height);
    // Packed fields: Global Color Table Flag = 0 (we use Local Color Tables for higher quality)
    this.bytes.push(0x70); // 1110000 -> 8 bits color resolution, no GCT
    this.bytes.push(0x00); // Background color index
    this.bytes.push(0x00); // Pixel aspect ratio

    // Netscape 2.0 Loop Extension (Infinite Loop)
    this.bytes.push(0x21, 0xff, 0x0b);
    for (const ch of 'NETSCAPE2.0') {
      this.bytes.push(ch.charCodeAt(0));
    }
    this.bytes.push(0x03, 0x01, 0x00, 0x00, 0x00); // sub-block length 3, loop count 0 (infinite), terminator
    this.hasWrittenHeader = true;
  }

  private writeShort(val: number) {
    this.bytes.push(val & 0xff, (val >> 8) & 0xff);
  }

  public addFrame(ctx: CanvasRenderingContext2D, options: GifFrameOptions) {
    if (!this.hasWrittenHeader) {
      this.writeHeader();
    }

    const imageData = ctx.getImageData(0, 0, this.width, this.height);
    const { palette, indexedPixels } = quantizeFrameColors(imageData, 256);

    // Color table size power (e.g. 256 colors -> power 7)
    let palettePow = 1;
    while ((1 << (palettePow + 1)) < palette.length && palettePow < 7) {
      palettePow++;
    }

    // Graphic Control Extension
    const delayHundredths = Math.max(2, Math.round(options.delayMs / 10)); // hundredths of a second
    this.bytes.push(0x21, 0xf9, 0x04);
    // Packed field: Disposal Method = 2 (restore to background), Transparent color flag = 0
    this.bytes.push(0x08);
    this.writeShort(delayHundredths);
    this.bytes.push(0x00); // Transparent color index
    this.bytes.push(0x00); // Block terminator

    // Image Descriptor
    this.bytes.push(0x2c); // Image separator
    this.writeShort(0); // Left
    this.writeShort(0); // Top
    this.writeShort(this.width);
    this.writeShort(this.height);

    // Packed field: Local Color Table Flag (1), Interlace (0), Sort (0), Size of LCT (palettePow)
    const packedLct = 0x80 | (palettePow & 0x07);
    this.bytes.push(packedLct);

    // Local Color Table
    const lctSize = 1 << (palettePow + 1);
    for (let i = 0; i < lctSize; i++) {
      if (i < palette.length) {
        this.bytes.push(palette[i][0], palette[i][1], palette[i][2]);
      } else {
        this.bytes.push(0, 0, 0);
      }
    }

    // LZW Min Code Size
    const minCodeSize = Math.max(2, palettePow + 1);
    this.bytes.push(minCodeSize);

    // Compressed Image Data
    const compressed = lzwCompress(minCodeSize, indexedPixels);
    for (let b = 0; b < compressed.length; b++) {
      this.bytes.push(compressed[b]);
    }
  }

  public finish(): Blob {
    // GIF Trailer
    this.bytes.push(0x3b);
    return new Blob([new Uint8Array(this.bytes)], { type: 'image/gif' });
  }
}
