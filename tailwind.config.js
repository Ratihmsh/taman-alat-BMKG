import defaultTheme from 'tailwindcss/defaultTheme';
import forms from '@tailwindcss/forms';

/** @type {import('tailwindcss').Config} */
export default {
    content: [
        './vendor/laravel/framework/src/Illuminate/Pagination/resources/views/*.blade.php',
        './storage/framework/views/*.php',
        './resources/views/**/*.blade.php',
        './resources/js/**/*.jsx',
    ],

    theme: {
        extend: {
            fontFamily: {
                sans: ['Figtree', ...defaultTheme.fontFamily.sans],
            },
            colors: {
                blue: {
                    500: '#0f172a',
                    600: '#0f172a',
                    700: '#0f172a',
                    800: '#0f172a',
                    900: '#0f172a',
                },
                indigo: {
                    700: '#0f172a',
                    900: '#0f172a',
                },
            },
        },
    },

    plugins: [forms],
};
