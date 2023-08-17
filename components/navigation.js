import Link from 'next/link';

export default function Navigation() {
    return (
        <navigation className=''>
            <ul>
                <li><Link href="/">Home</Link></li>
            </ul>
        </navigation>

    );
}