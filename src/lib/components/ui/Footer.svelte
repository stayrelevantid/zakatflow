<script lang="ts">
	let uniqueId = $state('input-' + Math.random().toString(36).slice(2, 11));
</script>

<footer class="fixed bottom-0 left-0 right-0 glass-card border-t border-white/10 py-4 px-6 z-40">
	<div class="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
		<div class="flex items-center gap-2 text-white/50 text-sm">
			<span>🕌</span>
			<span>ZakatFlow &copy; 2026</span>
		</div>
		<div class="text-white/50 text-sm">
			<span>Sesuai Syariah • Mudah • Aman</span>
		</div>
		<div class="flex items-center gap-4">
			<a href="/tentang" class="text-white/50 hover:text-white text-sm transition-colors">Tentang</a
			>
			<a href="/bantuan" class="text-white/50 hover:text-white text-sm transition-colors">Bantuan</a
			>
		</div>
	</div>
</footer>
