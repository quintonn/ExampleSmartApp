module.exports = {
    plugins: [
        require('tailwindcss'),
        require('autoprefixer'),
        require('cssnano')({
            preset: ['default', {
                discardComments: {
                    removeAll: true,
                },
            }]
        }),
        process.env.NODE_ENV === "production" && require('@fullhuman/postcss-purgecss')({
            content: [
                './src/scripts/**/*.html',
                './src/scripts/index.html'
            ],
            defaultExtractor: content => content.match(/[A-Za-z0-9-_:/]+/g) || []
        })
    ]
}