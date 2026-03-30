/** @type {import('tailwindcss').Config} */
export default {
	content: ['./src/**/*.{html,js,svelte,ts}'],
	theme: {
		extend: {
			colors: {
				primary: {
					50: '#ecfdf5',
					100: '#d1fae5',
					200: '#a7f3d0',
					300: '#6ee7b7',
					400: '#34d399',
					500: '#10b981',
					600: '#059669',
					700: '#047857',
					800: '#065f46',
					900: '#064e3b',
					950: '#022c22'
				},
				glass: {
					white: 'rgba(255, 255, 255, 0.1)',
					'white-5': 'rgba(255, 255, 255, 0.05)',
					'white-10': 'rgba(255, 255, 255, 0.10)',
					'white-20': 'rgba(255, 255, 255, 0.20)',
					'white-30': 'rgba(255, 255, 255, 0.30)',
					'white-70': 'rgba(255, 255, 255, 0.70)'
				}
			},
			fontFamily: {
				sans: ['Inter', 'system-ui', 'sans-serif'],
				display: ['Outfit', 'sans-serif']
			},
			backgroundImage: {
				'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))'
			}
		}
	},
	plugins: []
};