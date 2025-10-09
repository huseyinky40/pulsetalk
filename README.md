This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## IndexedDB'deki Kullanıcı Kayıtlarını Adım Adım İnceleme

Aşağıdaki adımlar Google Chrome ve Chromium tabanlı tarayıcılar (Brave, Edge vb.) ile uyumludur. Firefox kullanıyorsan "Storage" panelindeki `Indexed DB` bölümünü takip edebilirsin; menü isimleri küçük farklılık gösterebilir.

1. **PulseTalk uygulamasını aç:** Geliştirme sunucusunu (`npm run dev`) çalıştırdıktan sonra [http://localhost:3000](http://localhost:3000) adresine git.
2. **Geliştirici araçlarını başlat:** Klavyeden `F12` tuşuna bas ya da sayfaya sağ tıklayıp **İncele** seçeneğini seç.
3. **Application/Depolama paneline geç:** Açılan geliştirici araçlarında üst menüden `Application` (Türkçe tarayıcılarda `Depolama`) sekmesini tıkla.
4. **IndexedDB bölümünü aç:** Sol taraftaki menüde `Storage` → `IndexedDB` ağacını genişlet.
5. **Veritabanını seç:** `pulsetalk-auth` isimli veritabanını bulup altındaki `users` nesne deposuna (object store) tıkla.
6. **Kayıtları görüntüle:** Sağ tarafta listelenen satırlar (Records) kayıt olmuş kullanıcıların verilerini gösterir. Buradan her kullanıcının kullanıcı adını, e‑posta adresini ve şifresini doğrulayabilirsin.

Bu adımlar sayesinde kayıt akışının IndexedDB üzerinde nasıl veri yazdığını ve giriş ekranının hangi kayıtları kullandığını gözlemleyebilirsin.
