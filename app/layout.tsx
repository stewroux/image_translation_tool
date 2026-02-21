import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
    title: '画像日本語翻訳ツール / Image Japanese Translator',
    description: 'AIを用いて画像内の日本語を英語に翻訳し、レイアウトを保ったまま合成・保存するツール。',
}

export default function RootLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <html lang="ja">
            <head>
                <link href="https://fonts.googleapis.com/css2?family=Noto+Sans+JP:wght@400;500;700;900&display=swap" rel="stylesheet" />
                <link href="https://fonts.googleapis.com/icon?family=Material+Icons+Outlined" rel="stylesheet" />
            </head>
            <body>
                {children}
            </body>
        </html>
    )
}
