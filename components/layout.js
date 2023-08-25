import Head from 'next/head';
import Navigation from './navigation'
import Footer from './footer'

export default function Layout({ children }) {
    return (
        <>
            <Head>
                <meta name="viewport" content="width=device-width, initial-scale=1.0" />
            </Head>
            <main>{children}</main>
        </>
    )
}