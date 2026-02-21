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
            <body>
                {children}
            </body>
        </html>
    )
}
