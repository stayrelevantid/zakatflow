<script lang="ts">
	import { Card } from '$lib/components/ui';
	import { fly, fade } from 'svelte/transition';
</script>

<svelte:head>
	<title>Tentang - ZakatFlow</title>
	<meta
		name="description"
		content="Tentang ZakatFlow - Aplikasi pencatatan dan kalkulator zakat personal"
	/>
</svelte:head>

<div class="max-w-4xl mx-auto" transition:fade={{ duration: 400 }}>
	<div class="mb-8" transition:fly={{ y: -20, duration: 600 }}>
		<h1 class="text-4xl font-display font-bold text-white mb-2">🕌 Tentang ZakatFlow</h1>
		<p class="text-white/60 text-lg">Mengenal lebih dekat aplikasi pencatatan zakat Anda</p>
	</div>

	<div class="space-y-6" transition:fly={{ y: 20, delay: 100, duration: 500 }}>
		<Card class="p-8">
			<div class="flex items-center gap-4 mb-6">
				<div class="text-5xl">🎯</div>
				<div>
					<h2 class="text-2xl font-semibold text-white">Visi & Misi</h2>
					<p class="text-white/60">Mempermudah umat Muslim dalam menunaikan zakat</p>
				</div>
			</div>

			<div class="prose prose-invert max-w-none">
				<p class="text-white/80 leading-relaxed">
					ZakatFlow adalah aplikasi pencatatan dan kalkulator zakat personal yang dirancang untuk
					membantu umat Muslim dalam menghitung, mencatat, dan mengelola pembayaran zakat dengan
					mudah dan sesuai syariah.
				</p>

				<h3 class="text-xl font-semibold text-white mt-6 mb-3">Misi Kami:</h3>
				<ul class="space-y-2 text-white/80">
					<li class="flex items-start gap-3">
						<span class="text-primary-400">✓</span>
						<span>Menyediakan perhitungan zakat yang akurat sesuai ketentuan syariah Islam</span>
					</li>
					<li class="flex items-start gap-3">
						<span class="text-primary-400">✓</span>
						<span>Memudahkan pencatatan dan pelacakan pembayaran zakat</span>
					</li>
					<li class="flex items-start gap-3">
						<span class="text-primary-400">✓</span>
						<span>Meningkatkan kesadaran dan kepatuhan berzakat</span>
					</li>
					<li class="flex items-start gap-3">
						<span class="text-primary-400">✓</span>
						<span>Memberikan transparansi dalam pengelolaan zakat pribadi</span>
					</li>
				</ul>
			</div>
		</Card>

		<Card class="p-8">
			<div class="flex items-center gap-4 mb-6">
				<div class="text-5xl">📖</div>
				<div>
					<h2 class="text-2xl font-semibold text-white">Dasar Hukum</h2>
					<p class="text-white/60">Berdasarkan Al-Quran dan Hadits</p>
				</div>
			</div>

			<div class="space-y-4 text-white/80">
				<div class="bg-white/5 rounded-lg p-4 border-l-4 border-primary-500">
					<p class="italic mb-2">
						"Ambillah zakat dari sebagian harta mereka, dengan zakat itu kamu membersihkan dan
						mensucikan mereka..."
					</p>
					<p class="text-white/60 text-sm">- QS. At-Taubah: 103</p>
				</div>

				<div class="bg-white/5 rounded-lg p-4 border-l-4 border-primary-500">
					<p class="italic mb-2">
						"Islam dibangun di atas lima perkara: bersaksi bahwa tiada Tuhan selain Allah dan
						Muhammad adalah utusan Allah, mendirikan shalat, menunaikan zakat, berhaji ke Baitullah,
						dan puasa di bulan Ramadhan."
					</p>
					<p class="text-white/60 text-sm">- Hadits Shahih (HR. Bukhari & Muslim)</p>
				</div>
			</div>
		</Card>

		<Card class="p-8">
			<div class="flex items-center gap-4 mb-6">
				<div class="text-5xl">💎</div>
				<div>
					<h2 class="text-2xl font-semibold text-white">Fitur Unggulan</h2>
					<p class="text-white/60">Apa yang membuat ZakatFlow berbeda</p>
				</div>
			</div>

			<div class="grid grid-cols-1 md:grid-cols-2 gap-4">
				<div class="bg-white/5 rounded-lg p-4">
					<div class="text-2xl mb-2">🧮</div>
					<h3 class="font-semibold text-white mb-1">Kalkulator Lengkap</h3>
					<p class="text-white/60 text-sm">
						Mendukung 7 jenis zakat: Fitrah, Emas, Penghasilan, Perdagangan, Pertanian, Peternakan,
						dan Perikanan
					</p>
				</div>

				<div class="bg-white/5 rounded-lg p-4">
					<div class="text-2xl mb-2">📊</div>
					<h3 class="font-semibold text-white mb-1">Dashboard Intuitif</h3>
					<p class="text-white/60 text-sm">
						Pantau total zakat, status pembayaran, dan riwayat transaksi dalam satu tampilan
					</p>
				</div>

				<div class="bg-white/5 rounded-lg p-4">
					<div class="text-2xl mb-2">📱</div>
					<h3 class="font-semibold text-white mb-1">Responsif & Modern</h3>
					<p class="text-white/60 text-sm">
						Desain glassmorphism yang elegan dan responsif di semua perangkat
					</p>
				</div>

				<div class="bg-white/5 rounded-lg p-4">
					<div class="text-2xl mb-2">☁️</div>
					<h3 class="font-semibold text-white mb-1">Penyimpanan Aman</h3>
					<p class="text-white/60 text-sm">
						Data tersimpan di Google Sheets dengan keamanan terjamin
					</p>
				</div>
			</div>
		</Card>

		<Card class="p-8">
			<div class="flex items-center gap-4 mb-6">
				<div class="text-5xl">👨‍💻</div>
				<div>
					<h2 class="text-2xl font-semibold text-white">Developer</h2>
					<p class="text-white/60">Dibuat dengan cinta untuk umat</p>
				</div>
			</div>

			<div class="text-white/80">
				<p class="mb-4">
					ZakatFlow dikembangkan oleh <strong>Paino</strong>, seorang DevOps/SRE yang berkomitmen
					untuk membuat teknologi bermanfaat bagi umat Muslim.
				</p>

				<p class="text-white/60 text-sm">
					Tech Stack: SvelteKit 5, Tailwind CSS, TypeScript, Google Sheets API
				</p>

				<div class="mt-6 flex gap-4">
					<a
						href="https://github.com/stayrelevantid"
						target="_blank"
						rel="noopener noreferrer"
						class="inline-flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-white text-sm transition-colors"
					>
						<svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"
							><path
								d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"
							/></svg
						>
						GitHub
					</a>
				</div>
			</div>
		</Card>

		<div class="text-center py-8">
			<p class="text-white/60 italic">"Dibuat dengan ❤️ untuk Muslims worldwide"</p>
		</div>
	</div>
</div>
