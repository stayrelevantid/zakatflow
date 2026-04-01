<script lang="ts">
	import type { TransaksiZakat } from '$lib/types/zakat';

	interface Props {
		data: TransaksiZakat[];
		onToggleStatus: (transaksi: TransaksiZakat) => void;
		onDelete: (id: string) => void;
		formatCurrency: (value: number) => string;
		formatDate: (dateStr: string) => string;
	}

	let { data, onToggleStatus, onDelete, formatCurrency, formatDate }: Props = $props();

	// Pagination
	let currentPage = $state(1);
	let itemsPerPage = $state(10);
	let itemsPerPageOptions = [5, 10, 25, 50, 100];

	// Sorting
	type SortColumn = 'tanggal' | 'kategori' | 'nilaiHarta' | 'zakatWajib' | 'status';
	type SortDirection = 'asc' | 'desc';
	let sortColumn = $state<SortColumn>('tanggal');
	let sortDirection = $state<SortDirection>('desc');

	// Column filters
	let columnFilters = $state({
		kategori: '',
		status: '',
		tanggalStart: '',
		tanggalEnd: ''
	});

	// Global search
	let globalSearch = $state('');

	// Derived: filtered and sorted data
	let processedData = $derived(() => {
		let result = [...data];

		// Global search
		if (globalSearch) {
			const query = globalSearch.toLowerCase();
			result = result.filter(
				(t) =>
					t.kategori.toLowerCase().includes(query) ||
					t.metode?.toLowerCase().includes(query) ||
					t.catatan?.toLowerCase().includes(query) ||
					formatDate(t.tanggal).toLowerCase().includes(query) ||
					t.status.toLowerCase().includes(query)
			);
		}

		// Column filters
		if (columnFilters.kategori) {
			result = result.filter((t) => t.kategori === columnFilters.kategori);
		}
		if (columnFilters.status) {
			result = result.filter((t) => t.status === columnFilters.status);
		}
		if (columnFilters.tanggalStart) {
			result = result.filter((t) => new Date(t.tanggal) >= new Date(columnFilters.tanggalStart));
		}
		if (columnFilters.tanggalEnd) {
			result = result.filter((t) => new Date(t.tanggal) <= new Date(columnFilters.tanggalEnd));
		}

		// Sorting
		result.sort((a, b) => {
			let aVal: any, bVal: any;

			switch (sortColumn) {
				case 'tanggal':
					aVal = new Date(a.tanggal).getTime();
					bVal = new Date(b.tanggal).getTime();
					break;
				case 'kategori':
					aVal = a.kategori;
					bVal = b.kategori;
					break;
				case 'nilaiHarta':
					aVal = a.nilaiHarta;
					bVal = b.nilaiHarta;
					break;
				case 'zakatWajib':
					aVal = a.zakatWajib;
					bVal = b.zakatWajib;
					break;
				case 'status':
					aVal = a.status;
					bVal = b.status;
					break;
				default:
					return 0;
			}

			if (aVal < bVal) return sortDirection === 'asc' ? -1 : 1;
			if (aVal > bVal) return sortDirection === 'asc' ? 1 : -1;
			return 0;
		});

		return result;
	});

	// Derived: paginated data
	let paginatedData = $derived(() => {
		const filtered = processedData();
		const start = (currentPage - 1) * itemsPerPage;
		const end = start + itemsPerPage;
		return filtered.slice(start, end);
	});

	// Derived: total pages
	let totalPages = $derived(() => Math.ceil(processedData().length / itemsPerPage));

	// Derived: showing info
	let showingInfo = $derived(() => {
		const filtered = processedData().length;
		const start = filtered === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1;
		const end = Math.min(currentPage * itemsPerPage, filtered);
		return { start, end, total: data.length, filtered };
	});

	// Toggle sort
	function toggleSort(column: SortColumn) {
		if (sortColumn === column) {
			sortDirection = sortDirection === 'asc' ? 'desc' : 'asc';
		} else {
			sortColumn = column;
			sortDirection = 'asc';
		}
		currentPage = 1;
	}

	// Reset filters
	function resetFilters() {
		columnFilters = { kategori: '', status: '', tanggalStart: '', tanggalEnd: '' };
		globalSearch = '';
		currentPage = 1;
		sortColumn = 'tanggal';
		sortDirection = 'desc';
	}

	// Export to CSV
	function exportCSV() {
		const filtered = processedData();
		const headers = [
			'Tanggal',
			'Kategori',
			'Nilai Harta',
			'Zakat Wajib',
			'Status',
			'Metode',
			'Catatan'
		];
		const rows = filtered.map((t) => [
			formatDate(t.tanggal),
			t.kategori,
			t.nilaiHarta,
			t.zakatWajib,
			t.status,
			t.metode || '',
			t.catatan || ''
		]);

		const csv = [headers, ...rows].map((row) => row.join(',')).join('\n');
		const blob = new Blob([csv], { type: 'text/csv' });
		const url = window.URL.createObjectURL(blob);
		const a = document.createElement('a');
		a.href = url;
		a.download = `zakatflow-riwayat-${new Date().toISOString().split('T')[0]}.csv`;
		a.click();
		window.URL.revokeObjectURL(url);
	}

	// Get sort icon
	function getSortIcon(column: SortColumn) {
		if (sortColumn !== column) return '⇅';
		return sortDirection === 'asc' ? '↑' : '↓';
	}

	const kategoriOptions = [
		'Zakat Fitrah',
		'Zakat Emas',
		'Zakat Perak',
		'Zakat Penghasilan',
		'Zakat Perdagangan',
		'Zakat Pertanian',
		'Zakat Peternakan',
		'Zakat Perikanan'
	];
</script>

<div class="space-y-4">
	<!-- Toolbar -->
	<div
		class="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between bg-white/5 p-4 rounded-lg"
	>
		<!-- Global Search -->
		<div class="flex-1 w-full md:w-auto">
			<div class="relative">
				<input
					type="text"
					bind:value={globalSearch}
					placeholder="Cari transaksi..."
					class="glass-input w-full pl-10 pr-4 py-2 rounded-lg"
				/>
				<span class="absolute left-3 top-1/2 -translate-y-1/2 text-white/50">🔍</span>
			</div>
		</div>

		<!-- Actions -->
		<div class="flex gap-2">
			<button
				onclick={resetFilters}
				class="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg text-sm transition-colors"
			>
				🔄 Reset Filter
			</button>
			<button
				onclick={exportCSV}
				class="px-4 py-2 bg-primary-500/20 hover:bg-primary-500/30 text-primary-400 rounded-lg text-sm transition-colors"
			>
				📥 Export CSV
			</button>
		</div>
	</div>

	<!-- Column Filters -->
	<div class="grid grid-cols-2 md:grid-cols-4 gap-3 bg-white/5 p-4 rounded-lg">
		<div>
			<label class="text-white/60 text-xs block mb-1">Kategori</label>
			<select
				bind:value={columnFilters.kategori}
				class="glass-input w-full px-3 py-2 rounded-lg text-sm"
			>
				<option value="">Semua</option>
				{#each kategoriOptions as k}
					<option value={k}>{k}</option>
				{/each}
			</select>
		</div>

		<div>
			<label class="text-white/60 text-xs block mb-1">Status</label>
			<select
				bind:value={columnFilters.status}
				class="glass-input w-full px-3 py-2 rounded-lg text-sm"
			>
				<option value="">Semua</option>
				<option value="Sudah Bayar">Sudah Bayar</option>
				<option value="Belum Bayar">Belum Bayar</option>
			</select>
		</div>

		<div>
			<label class="text-white/60 text-xs block mb-1">Dari Tanggal</label>
			<input
				type="date"
				bind:value={columnFilters.tanggalStart}
				class="glass-input w-full px-3 py-2 rounded-lg text-sm"
			/>
		</div>

		<div>
			<label class="text-white/60 text-xs block mb-1">Sampai Tanggal</label>
			<input
				type="date"
				bind:value={columnFilters.tanggalEnd}
				class="glass-input w-full px-3 py-2 rounded-lg text-sm"
			/>
		</div>
	</div>

	<!-- Info Bar -->
	<div class="flex justify-between items-center text-sm">
		<span class="text-white/60">
			Menampilkan {showingInfo().start}-{showingInfo().end} dari {showingInfo().filtered} data
			{#if showingInfo().filtered !== showingInfo().total}
				(filtered dari {showingInfo().total} total)
			{/if}
		</span>
		<div class="flex items-center gap-2">
			<span class="text-white/60">Baris per halaman:</span>
			<select bind:value={itemsPerPage} class="glass-input px-2 py-1 rounded text-sm">
				{#each itemsPerPageOptions as opt}
					<option value={opt}>{opt}</option>
				{/each}
			</select>
		</div>
	</div>

	<!-- Table -->
	<div class="overflow-x-auto rounded-lg border border-white/10">
		<table class="w-full">
			<thead class="bg-white/10">
				<tr>
					<th
						class="px-4 py-3 text-left text-white/80 text-sm font-medium cursor-pointer hover:bg-white/5 transition-colors"
						onclick={() => toggleSort('tanggal')}
					>
						<div class="flex items-center gap-1">
							Tanggal {getSortIcon('tanggal')}
						</div>
					</th>
					<th
						class="px-4 py-3 text-left text-white/80 text-sm font-medium cursor-pointer hover:bg-white/5 transition-colors"
						onclick={() => toggleSort('kategori')}
					>
						<div class="flex items-center gap-1">
							Kategori {getSortIcon('kategori')}
						</div>
					</th>
					<th
						class="px-4 py-3 text-right text-white/80 text-sm font-medium cursor-pointer hover:bg-white/5 transition-colors"
						onclick={() => toggleSort('nilaiHarta')}
					>
						<div class="flex items-center justify-end gap-1">
							Nilai Harta {getSortIcon('nilaiHarta')}
						</div>
					</th>
					<th
						class="px-4 py-3 text-right text-white/80 text-sm font-medium cursor-pointer hover:bg-white/5 transition-colors"
						onclick={() => toggleSort('zakatWajib')}
					>
						<div class="flex items-center justify-end gap-1">
							Zakat Wajib {getSortIcon('zakatWajib')}
						</div>
					</th>
					<th
						class="px-4 py-3 text-left text-white/80 text-sm font-medium cursor-pointer hover:bg-white/5 transition-colors"
						onclick={() => toggleSort('status')}
					>
						<div class="flex items-center gap-1">
							Status {getSortIcon('status')}
						</div>
					</th>
					<th class="px-4 py-3 text-left text-white/80 text-sm font-medium">Aksi</th>
				</tr>
			</thead>
			<tbody>
				{#if paginatedData().length === 0}
					<tr>
						<td colspan="6" class="px-4 py-8 text-center text-white/50">
							<p class="text-4xl mb-2">📭</p>
							<p>Tidak ada data yang sesuai filter</p>
						</td>
					</tr>
				{:else}
					{#each paginatedData() as transaksi}
						<tr class="border-t border-white/5 hover:bg-white/5 transition-colors">
							<td class="px-4 py-3 text-white text-sm">{formatDate(transaksi.tanggal)}</td>
							<td class="px-4 py-3 text-white text-sm">{transaksi.kategori}</td>
							<td class="px-4 py-3 text-white font-mono text-sm text-right"
								>{formatCurrency(transaksi.nilaiHarta)}</td
							>
							<td class="px-4 py-3 text-primary-400 font-mono text-sm text-right"
								>{formatCurrency(transaksi.zakatWajib)}</td
							>
							<td class="px-4 py-3">
								<span
									class="px-2 py-1 rounded-full text-xs {transaksi.status === 'Sudah Bayar'
										? 'bg-green-500/20 text-green-400'
										: 'bg-yellow-500/20 text-yellow-400'}"
								>
									{transaksi.status}
								</span>
							</td>
							<td class="px-4 py-3">
								<div class="flex gap-2">
									<button
										onclick={() => onToggleStatus(transaksi)}
										class="text-primary-400 hover:text-primary-300 text-sm transition-colors"
									>
										{transaksi.status === 'Sudah Bayar' ? 'Tandai Belum' : 'Tandai Sudah'}
									</button>
									<button
										onclick={() => onDelete(transaksi.id)}
										class="text-red-400 hover:text-red-300 text-sm transition-colors"
									>
										Hapus
									</button>
								</div>
							</td>
						</tr>
						{#if transaksi.metode || transaksi.catatan}
							<tr class="border-b border-white/5 bg-white/[0.02]">
								<td colspan="6" class="px-4 py-2 text-sm">
									{#if transaksi.metode}
										<p class="text-white/70">
											<span class="text-white/50">Detail:</span>
											{transaksi.metode}
										</p>
									{/if}
									{#if transaksi.catatan}
										<p class="text-white/50 text-xs mt-1">{transaksi.catatan}</p>
									{/if}
								</td>
							</tr>
						{/if}
					{/each}
				{/if}
			</tbody>
		</table>
	</div>

	<!-- Pagination -->
	{#if totalPages() > 1}
		<div class="flex justify-center items-center gap-2">
			<button
				onclick={() => (currentPage = 1)}
				disabled={currentPage === 1}
				class="px-3 py-1 rounded bg-white/10 text-white text-sm disabled:opacity-50 hover:bg-white/20 transition-colors"
			>
				«
			</button>
			<button
				onclick={() => currentPage--}
				disabled={currentPage === 1}
				class="px-3 py-1 rounded bg-white/10 text-white text-sm disabled:opacity-50 hover:bg-white/20 transition-colors"
			>
				‹
			</button>

			{#each Array(totalPages()) as _, i}
				{#if i + 1 === 1 || i + 1 === totalPages() || (i + 1 >= currentPage - 2 && i + 1 <= currentPage + 2)}
					<button
						onclick={() => (currentPage = i + 1)}
						class="px-3 py-1 rounded text-sm transition-colors {currentPage === i + 1
							? 'bg-primary-500 text-white'
							: 'bg-white/10 text-white hover:bg-white/20'}"
					>
						{i + 1}
					</button>
				{:else if i + 1 === currentPage - 3 || i + 1 === currentPage + 3}
					<span class="text-white/50">...</span>
				{/if}
			{/each}

			<button
				onclick={() => currentPage++}
				disabled={currentPage === totalPages()}
				class="px-3 py-1 rounded bg-white/10 text-white text-sm disabled:opacity-50 hover:bg-white/20 transition-colors"
			>
				›
			</button>
			<button
				onclick={() => (currentPage = totalPages())}
				disabled={currentPage === totalPages()}
				class="px-3 py-1 rounded bg-white/10 text-white text-sm disabled:opacity-50 hover:bg-white/20 transition-colors"
			>
				»
			</button>
		</div>
	{/if}
</div>
