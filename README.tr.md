# bkmrX

[English](README.md) | **Türkçe**

X (eski adıyla Twitter) yer işaretlerinizi incelemek, düzenlemek, dışa aktarmak ve temizlemek için gizlilik odaklı yerel bir web uygulaması.

İçe aktardığınız veriler bilgisayarınızdaki bir SQLite veritabanında kalır. bkmrX; kullanıcı hesabı, analiz servisi, bulut veritabanı veya X oturum çerezleri gerektirmez.

## Neler yapar?

- Açık X sekmenizde çalıştırılan bir tarayıcı konsolu betiğiyle yer işaretlerinizi dışa aktarır
- Oluşturulan JSON dosyasını ve uyumlu ZIP, JS ve CSV dosyalarını içe aktarır
- Klavye kısayollarıyla hızlı inceleme sunar: sakla, silme listesine ekle, dışa aktar veya sonra karar ver
- Yer işaretlerini yazarlara göre gruplandırır ve tüm inceleme kararlarını yerel olarak saklar
- Seçilen öğeleri Raindrop.io ile uyumlu CSV dosyasına aktarır
- Silme listesine eklenen yer işaretlerini X'ten kaldırmak için isteğe bağlı bir tarayıcı konsolu betiği oluşturur
- Türkçe ve İngilizce dil seçenekleriyle açık ve koyu temaları destekler

Bir yer işaretini **Sil** olarak işaretlemek yalnızca yerel silme listesine ekler. Silme betiğini ayrıca oluşturup `x.com` hesabınız açıkken çalıştırmadığınız sürece X'ten hiçbir şey silinmez.

## Gereksinimler

- Node.js 20.9 veya daha yeni bir sürüm
- npm

## Hızlı kurulum (Terminal gerektirmez)

bkmrX'i çalıştırmanın en kolay yolu, projeyle birlikte gelen başlatıcı dosyaları kullanmaktır. Bilgisayarınızda sadece [Node.js](https://nodejs.org/) (LTS versiyonu) yüklü olması yeterlidir.

**Windows için:**
1. Projeyi indirin (ZIP olarak veya git clone ile) ve klasöre çıkartın.
2. Klasörün içindeki `start-windows.bat` dosyasına çift tıklayın.
3. Betik otomatik olarak gerekli paketleri yükleyecek, veritabanını hazırlayacak ve uygulamayı tarayıcınızda açacaktır.

**macOS için:**
1. Projeyi indirin.
2. Klasörün içindeki `start-mac.command` dosyasına çift tıklayın (veya terminale sürükleyip Enter'a basın).
3. Gerisini sistem halledecek ve tarayıcınızı otomatik açacaktır.

*(Not: Uygulamayı kullanırken arka planda açılan siyah terminal penceresini lütfen kapatmayın. İşiniz bitince çarpıdan kapatabilirsiniz.)*

### Alternatif: Manuel kurulum
Eğer işlemleri terminal üzerinden kendiniz yapmak isterseniz:

```bash
git clone https://github.com/mervanseyda/bkmrX.git
cd bkmrX
npm install
npm run db:push
npm run dev
```

Tarayıcıda [http://localhost:3000](http://localhost:3000) adresini açın.

Üretim sürümünü oluşturmak için:

```bash
npm run build
npm start
```

## Yer işaretlerini içe aktarma

1. bkmrX'i başlatın ve **Veri İçe Aktar** sayfasını açın.
2. X hesabınız açıkken [x.com/i/bookmarks](https://x.com/i/bookmarks) adresine gidin.
3. Geliştirici Araçları'nı (`F12`) açıp **Console** sekmesine geçin.
4. bkmrX'teki çıkarma betiğini kopyalayıp Console'a yapıştırın ve işlem tamamlanana kadar sekmeyi açık tutun.
5. İndirilen `bkmrx-bookmarks.json` dosyasını bkmrX'e yükleyin.

Betik, yer işaretleri sayfasında ilerleyerek gönderi kimliğini, bağlantıyı, görünen metni, yazarı ve tarihi toplar. Yalnızca tarayıcınızda çalışır ve verileri başka bir sunucuya göndermez. Uyumlu ZIP, `bookmarks.js`, JSON ve CSV dosyaları alternatif içe aktarma biçimleri olarak desteklenir.

### Başka bir X hesabına geçme

Bir hesapla işiniz bittiğinde gerekli dışa aktarmaları indirin ve gerekiyorsa X silme betiğini çalıştırın. Ardından **Veri İçe Aktar → Başka bir X hesabına geç** seçeneğiyle uygulamadaki yerel verileri temizleyip diğer hesabı içe aktarın. Bu sıfırlama yalnızca bkmrX'in yerel SQLite verilerini temizler; X hesabınızdan hiçbir şeyi silmez.

## İnceleme kısayolları

| Tuş | İşlem |
| --- | --- |
| `K` | Sakla |
| `D` | Silme listesine ekle |
| `E` | Raindrop dışa aktarma listesine ekle |
| `U` | Sonra karar ver |
| `O` | Geçerli yer işaretini aç |
| `←` / `→` | Önceki / sonraki |

## Veri ve gizlilik

- Uygulama verileri proje klasöründeki `local.db` dosyasında tutulur.
- `local.db`, SQLite yan dosyaları, ortam dosyaları, bağımlılıklar ve derleme çıktıları Git'e dahil edilmez.
- İçe aktarılan ham veriler özel bilgiler içerebilir. İhtiyacınıza göre `local.db` dosyasını yedekleyin veya silin.
- İsteğe bağlı silme betiği, açık `x.com` sekmenizdeki mevcut oturumu kullanır. bkmrX, X çerezlerinizi saklamaz.

## Silme betiği uyarısı

Toplu silme yardımcısı X'in belgelenmemiş web API'sini kullanır. X bu API'yi haber vermeden değiştirebilir ve betik çalışmaz hâle gelebilir. Çalıştırmadan önce oluşturulan kodu ve silme listesindeki öğe sayısını kontrol edin. Kullanım sorumluluğu size aittir ve X'in koşullarına uymanız gerekir.

## Geliştirme

```bash
npm run lint
npm test
npm run build
```

Veritabanı komutları:

```bash
npm run db:migrate  # local.db dosyasını oluşturur veya günceller
npm run db:seed     # isteğe bağlı örnek verileri ekler
```

Ana klasörler:

```text
src/app/       Next.js sayfaları ve sunucu işlemleri
src/components Yeniden kullanılabilir arayüz bileşenleri
src/db/        SQLite şeması, migration dosyaları ve örnek veriler
src/lib/       İçe aktarma ayrıştırıcıları ve yerel analiz yardımcıları
drizzle/       Sürümlendirilmiş veritabanı migration dosyaları
```

## Yasal uyarı

bkmrX bağımsız bir projedir; X Corp. veya Raindrop.io ile bağlantılı değildir ve bu kuruluşlar tarafından desteklenmez ya da finanse edilmez. X ve Twitter ilgili sahiplerinin ticari markalarıdır.

## Lisans

[MIT](LICENSE)
