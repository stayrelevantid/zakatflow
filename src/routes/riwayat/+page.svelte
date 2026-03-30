<script lang="ts">
	import { Card } from '$lib/components/ui';
	import { fly, fade } from 'svelte/transition';
</script>

<svelte:head>
	<title>Riwayat Pembayaran - ZakatFlow</title>
</svelte:head>

<div class="max-w-7xl mx-auto" transition:fade={{ duration: 400 }}>
	<div class="mb-8" transition:fly={{ y: -20, duration: 600 }}>
		<h1 class="text-4xl font-display font-bold text-white mb-2">📋 Riwayat Pembayaran</h1>
		<p class="text-white/60 text-lg">Daftar transaksi zakat yang telah tercatat</p>
	</div>

	<div class="glass-card rounded-xl overflow-hidden" transition:fly={{ y: 20, duration: 500 }}>
		<div class="p-4 border-b border-white/10">
			<div class="flex flex-col md:flex-row gap-4">
				<div class="flex-1">
					<input
						type="text"
						placeholder="Cari transaksi..."
						class="glass-input w-full px-4 py-2 rounded-lg"
					/>
				</div>
				<div class="flex gap-2">
					<select class="glass-input px-4 py-2 rounded-lg">
						<option>Semua Kategori</option>
						<option>Zakat Fitrah</option>
						<option>Zakat Emas/Perak</option>
						<option>Zakat Penghasilan</option>
						<option>Zakat Perdagangan</option>
						<option>Zakat Pertanian</option>
						<option>Zakat Kebun/Ikan</option>
					</select>
					<select class="glass-input px-4 py-2 rounded-lg">
						<option>Semua Status</option>
						<option>Sudah Bayar</option>
						<option>Belum Bayar</option>
					</select>
				</div>
			</div>
		</div>

		<div class="overflow-x-auto">
			<table class="w-full">
				<thead class="bg-white/5">
					<tr>
						<th class="px-4 py-3 text-left text-white/60 text-sm font-medium">Tanggal</th>
						<th class="px-4 py-3 text-left text-white/60 text-sm font-medium">Kategori</th>
						<th class="px-4 py-3 text-left text-white/60 text-sm font-medium">Nilai Harta</th>
						<th class="px-4 py-3 text-left text-white/60 text-sm font-medium">Zakat Wajib</th>
						<th class="px-4 py-3 text-left text-white/60 text-sm font-medium">Status</th>
						<th class="px-4 py-3 text-left text-white/60 text-sm font-medium">Aksi</th>
					</tr>
				</thead>
				<tbody>
					<tr class="border-t border-white/5">
						<td colspan="6" class="px-4 py-12 text-center">
							<div class="text-white/40">
								<p class="text-4xl mb-2">📭</p>
								<p>Belum ada transaksi tercatat</p>
								<p class="text-sm mt-2">Silakan hitung dan simpan zakat Anda</p>
							</div>
						</td>
					</tr>
				</tbody>
			</table>
		</div>
	</div>
</div>