import Layout from '../components/layout'
import './styles.css'; // Make sure the path is correct

export default function MyApp({ Component, pageProps }) {
    return (
        <Layout>
            <Component {...pageProps} />
        </Layout>
    )
}