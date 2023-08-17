export default function Footer() {
    return (
        <footer className=''>

            <div className="py-2 flex justify-center text-center ">
                <ul className="flex flex-col md:flex-row justify-center items-center">
                    <li className="mx-2 md:mb-0">Epost: post@melbygaard.no</li>
                    <li className="mx-2 md:mb-0">
                        Tlf:&nbsp;<a href="tel:+493804446">938 04 446</a>
                    </li>
                    <li className="mx-2 md:mb-0">Adresse: Sundbyveien 1, 1407 Vinterbro</li>
                </ul>
            </div>
        </footer>

    );
}