import sharp from "sharp";
import { readFile, writeFile } from "node:fs/promises";
const base = new URL("../public/brand/", import.meta.url);
for (const size of [192, 512])
  await sharp(new URL("veyra-icon.svg", base).pathname.replace(/^\/(.:)/, "$1"))
    .resize(size, size)
    .png()
    .toFile(
      new URL(`veyra-icon-${size}.png`, base).pathname.replace(/^\/(.:)/, "$1"),
    );
const icon = await readFile(new URL("veyra-icon.svg", base));
await sharp(icon)
  .resize(180, 180)
  .png()
  .toFile(
    new URL("veyra-apple-icon.png", base).pathname.replace(/^\/(.:)/, "$1"),
  );
await sharp(await readFile(new URL("veyra-social.svg", base)))
  .png()
  .toFile(new URL("veyra-social.png", base).pathname.replace(/^\/(.:)/, "$1"));
const mark = (await readFile(new URL("veyra-mark.svg", base), "utf8"))
  .replace('color="#163D34"', 'color="#F8F5EF"')
  .replace("<svg ", '<svg width="290" height="300" ');
await sharp({
  create: { width: 512, height: 512, channels: 4, background: "#163D34" },
})
  .composite([{ input: Buffer.from(mark), gravity: "center" }])
  .png()
  .toFile(
    new URL("veyra-maskable-512.png", base).pathname.replace(/^\/(.:)/, "$1"),
  );
const png = await sharp(icon).resize(32, 32).png().toBuffer();
const header = Buffer.alloc(22);
header.writeUInt16LE(1, 2);
header.writeUInt16LE(1, 4);
header[6] = 32;
header[7] = 32;
header.writeUInt16LE(1, 10);
header.writeUInt16LE(32, 12);
header.writeUInt32LE(png.length, 14);
header.writeUInt32LE(22, 18);
await writeFile(new URL("../favicon.ico", base), Buffer.concat([header, png]));
