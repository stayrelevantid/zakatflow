<script lang="ts">
	import { Card } from '$lib/components/ui';
	import { fly, fade } from 'svelte/transition';
</script>

<svelte:head>
	<title>Bantuan - ZakatFlow</title>
	<meta
		name="description"
		content="Panduan penggunaan ZakatFlow - FAQ dan cara menggunakan aplikasi kalkulator zakat"
	/>
</svelte:head>

<div class="max-w-4xl mx-auto" transition:fade={{ duration: 400 }}>
	<div class="mb-8" transition:fly={{ y: -20, duration: 600 }}>
		<h1 class="text-4xl font-display font-bold text-white mb-2">❓ Pusat Bantuan</h1>
		<p class="text-white/60 text-lg">Panduan lengkap penggunaan ZakatFlow</p>
	</div>

	<div class="space-y-6" transition:fly={{ y: 20, delay: 100, duration: 500 }}>
		<!-- FAQ Section -->
		<Card class="p-8">
			<div class="flex items-center gap-4 mb-6">
				<div class="text-5xl">💡</div>
				<div>
					<h2 class="text-2xl font-semibold text-white">Pertanyaan Umum (FAQ)</h2>
					<p class="text-white/60">Jawaban untuk pertanyaan yang sering diajukan</p>
				</div>
			</div>

			<div class="space-y-4">
				<div class="bg-white/5 rounded-lg p-4">
					<h3 class="font-semibold text-white mb-2 flex items-center gap-2">
						<span class="text-primary-400">Q:</span>
						Bagaimana cara menghitung zakat?
					</h3>
					<p class="text-white/70 text-sm pl-6">
						Pilih jenis zakat di menu sidebar, masukkan data yang diminta (misalnya jumlah emas,
						penghasilan, dll), lalu klik "Hitung Zakat". Aplikasi akan otomatis menghitung zakat
						wajib Anda berdasarkan nisab dan kadar yang berlaku.
					</p>
				</div>

				<div class="bg-white/5 rounded-lg p-4">
					<h3 class="font-semibold text-white mb-2 flex items-center gap-2">
						<span class="text-primary-400">Q:</span>
						Apa itu nisab dan bagaimana penentuannya?
					</h3>
					<p class="text-white/70 text-sm pl-6">
						Nisab adalah batas minimum kepemilikan harta yang wajib dizakati. Setiap jenis zakat
						memiliki nisab berbeda:
					</p>
					<ul class="text-white/70 text-sm pl-6 mt-2 space-y-1">
						<li>• Zakat Emas: 85 gram</li>
						<li>• Zakat Perak: 595 gram</li>
						<li>• Zakat Penghasilan: setara 85 gram emas/tahun</li>
						<li>• Zakat Pertanian: 653 kg gabah</li>
						<li>• Zakat Peternakan: 30 ekor sapi, 40 ekor kambing, atau 5 ekor unta</li>
					</ul>
				</div>

				<div class="bg-white/5 rounded-lg p-4">
					<h3 class="font-semibold text-white mb-2 flex items-center gap-2">
						<span class="text-primary-400">Q:</span>
						Bagaimana cara mengubah status pembayaran?
					</h3>
					<p class="text-white/70 text-sm pl-6">
						Buka halaman <strong>Riwayat</strong>, cari transaksi yang ingin diubah, lalu klik
						tombol "Tandai Sudah" atau "Tandai Belum" sesuai status pembayaran Anda.
					</p>
				</div>

				<div class="bg-white/5 rounded-lg p-4">
					<h3 class="font-semibold text-white mb-2 flex items-center gap-2">
						<span class="text-primary-400">Q:</span>
						Apakah data saya aman?
					</h3>
					<p class="text-white/70 text-sm pl-6">
						Ya, data Anda disimpan di Google Sheets dengan keamanan yang terjamin. Kami tidak
						menyimpan data pribadi sensitif, hanya data transaksi zakat Anda.
					</p>
				</div>

				<div class="bg-white/5 rounded-lg p-4">
					<h3 class="font-semibold text-white mb-2 flex items-center gap-2">
						<span class="text-primary-400">Q:</span>
						Bagaimana cara membersihkan data yang rusak?
					</h3>
					<p class="text-white/70 text-sm pl-6">
						Di halaman <strong>Riwayat</strong>, scroll ke bagian bawah dan gunakan fitur "Perbaikan
						Data". Klik "Periksa Data" untuk analisis, kemudian "Bersihkan Data" untuk menghapus
						duplikat dan data kosong.
					</p>
				</div>
			</div>
		</Card>

		<!-- Quick Guide -->
		<Card class="p-8">
			<div class="flex items-center gap-4 mb-6">
				<div class="text-5xl">📚</div>
				<div>
					<h2 class="text-2xl font-semibold text-white">Panduan Cepat</h2>
					<p class="text-white/60">Langkah-langkah penggunaan dasar</p>
				</div>
			</div>

			<div class="grid grid-cols-1 md:grid-cols-3 gap-4">
				<div class="bg-white/5 rounded-lg p-4 text-center">
					<div class="text-3xl mb-3">1️⃣</div>
					<h3 class="font-semibold text-white mb-2">Hitung Zakat</h3>
					<p class="text-white/60 text-sm">
						Pilih jenis zakat di sidebar, isi data, dan klik "Hitung Zakat"
					</p>
				</div>

				<div class="bg-white/5 rounded-lg p-4 text-center">
					<div class="text-3xl mb-3">2️⃣</div>
					<h3 class="font-semibold text-white mb-2">Simpan Transaksi</h3>
					<p class="text-white/60 text-sm">
						Klik "Simpan Transaksi" dan data akan tersimpan otomatis
					</p>
				</div>

				<div class="bg-white/5 rounded-lg p-4 text-center">
					<div class="text-3xl mb-3">3️⃣</div>
					<h3 class="font-semibold text-white mb-2">Pantau & Update</h3>
					<p class="text-white/60 text-sm">
						Lihat riwayat di dashboard dan update status pembayaran
					</p>
				</div>
			</div>
		</Card>

		<!-- Tips Section -->
		<Card class="p-8">
			<div class="flex items-center gap-4 mb-6">
				<div class="text-5xl">✨</div>
				<div>
					<h2 class="text-2xl font-semibold text-white">Tips & Trik</h2>
					<p class="text-white/60">Optimalkan penggunaan ZakatFlow</p>
				</div>
			</div>

			<div class="space-y-4">
				<div
					class="flex items-start gap-4 bg-primary-500/10 rounded-lg p-4 border border-primary-500/20"
				>
					<span class="text-2xl">💡</span>
					<div>
						<h3 class="font-semibold text-white mb-1">Update Harga Referensi</h3>
						<p class="text-white/70 text-sm">
							Sesuaikan harga emas, perak, dan beras di halaman Referensi agar perhitungan zakat
							selalu akurat sesuai harga pasar terkini.
						</p>
					</div>
				</div>

				<div
					class="flex items-start gap-4 bg-primary-500/10 rounded-lg p-4 border border-primary-500/20"
				>
					<span class="text-2xl">🔍</span>
					<div>
						<h3 class="font-semibold text-white mb-1">Gunakan Filter Pencarian</h3>
						<p class="text-white/70 text-sm">
							Di halaman Riwayat, gunakan kolom pencarian untuk mencari transaksi berdasarkan
							kategori, tanggal, atau keterangan.
						</p>
					</div>
				</div>

				<div
					class="flex items-start gap-4 bg-primary-500/10 rounded-lg p-4 border border-primary-500/20"
				>
					<span class="text-2xl">📊</span>
					<div>
						<h3 class="font-semibold text-white mb-1">Pantau Dashboard</h3>
						<p class="text-white/70 text-sm">
							Cek dashboard secara rutin untuk melihat ringkasan zakat yang sudah dibayar dan yang
							masih menunggak.
						</p>
					</div>
				</div>

				<div
					class="flex items-start gap-4 bg-primary-500/10 rounded-lg p-4 border border-primary-500/20"
				>
					<span class="text-2xl">🔄</span>
					<div>
						<h3 class="font-semibold text-white mb-1">Perhitungan Berkala</h3>
						<p class="text-white/70 text-sm">
							Untuk zakat penghasilan, lakukan perhitungan setiap bulan atau tahun sesuai periode
							yang Anda pilih.
						</p>
					</div>
				</div>
			</div>
		</Card>

		<!-- Video Tutorial Placeholder -->
		<Card class="p-8">
			<div class="flex items-center gap-4 mb-6">
				<div class="text-5xl">🎥</div>
				<div>
					<h2 class="text-2xl font-semibold text-white">Video Tutorial</h2>
					<p class="text-white/60">Pelajari melalui video panduan</p>
				</div>
			</div>

			<div class="bg-white/5 rounded-lg p-8 text-center">
				<div class="text-6xl mb-4">🎬</div>
				<h3 class="text-white font-semibold mb-2">Tutorial Penggunaan ZakatFlow</h3>
				<p class="text-white/60 text-sm mb-4">
					Video panduan lengkap dari awal hingga mahir menggunakan ZakatFlow
				</p>
				<p class="text-white/40 text-xs italic">(Coming Soon)</p>
			</div>
		</Card>
	</div>
</div>
