# Setup ABR

## Buka Terminal CMD

## Instalasi

```bash
git clone https://github.com/Bilsyp/ndn-public.git
```

```bash
npm i atau pnpm i
```

Install NDN Dependencies Manual jika terjadi error sebelumnya
bash

```bash
"@ndn/autoconfig": "https://ndnts-nightly.ndn.today/autoconfig.tgz",
"@ndn/endpoint": "https://ndnts-nightly.ndn.today/endpoint.tgz",
"@ndn/fileserver": "https://ndnts-nightly.ndn.today/fileserver.tgz",
"@ndn/fw": "https://ndnts-nightly.ndn.today/fw.tgz",
"@ndn/packet": "https://ndnts-nightly.ndn.today/packet.tgz",
"@ndn/quic-transport": "https://ndnts-nightly.ndn.today/quic-transport.tgz",
"@ndn/rdr": "https://ndnts-nightly.ndn.today/rdr.tgz",
"@ndn/segmented-object": "https://ndnts-nightly.ndn.today/segmented-object.tgz",
"@ndn/util": "https://ndnts-nightly.ndn.today/util.tgz",
"@ndn/ws-transport": "https://ndnts-nightly.ndn.today/ws-transport.tgz",
```

Install satu persatu berdasarkan URL

```bash
 npm i https://ndnts-nightly.ndn.today/autoconfig.tgz,
```

Setelah itu

```bash
npm i
```

## Buka VSCODE Pada Terminal tadi

```bash
code .
```

## Source file abr

**ndn-public/src/abr**

```bash

buffer.js
hybrid.js
rate.js
Throughput : /node-modules/shaka-player/lib/abr/simple_abr_manager.js


```

## Set Abr pada player

Directory : /src/components/player.jsx

```javascript
const handleSetConfig = async () => {
  clear();
  switch (config) {
    case "Rate Base":
      player.configure("abrFactory", () => new Rate());
      player.configure({
        streaming: {
          bufferBehind: 30,
          bufferingGoal: 40,
        },
      });
      break;
    case "Buffer Base":
      player.configure(
        "abrFactory",
        () => new Buffers(() => player?.getBufferFullness())
      );
      player.configure(bufferConfig);
      break;
    case "Hybrid Base":
      player.configure(
        "abrFactory",
        () => new Hybrid(() => player?.getBufferFullness())
      );
      player.configure({
        streaming: {
          bufferBehind: 30,
          bufferingGoal: 20,
        },
      });
      break;
    case "Throughput Base":
      // player.configure("abrFactory", () => new shaka.abr.SimpleAbrManager());
      player.resetConfiguration();

      break;
  }
};
```
